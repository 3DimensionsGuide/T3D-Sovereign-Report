#!/usr/bin/env python3
"""
T3D Provider Switch — Google Maps → GeoNames
================================================
Google's Geocoding + Time Zone APIs require a billing-enabled Cloud
project, and a brand-new billing account hit Google's default
project-linking quota, with resolution stuck in a multi-business-day
review queue.

GeoNames provides the same two lookups (city/country → coordinates,
coordinates → IANA timezone ID) from one free, no-billing-required
account. Its timezone lookup returns the same kind of IANA identifier
string (e.g. "America/New_York") that Google's Time Zone API returned
as its `timeZoneId` field — and it's that IANA string, not any
numeric offset, that the rest of this codebase actually depends on for
correct historical DST handling (localToJulianDay() already does its
own correct historical conversion given that string). So this is a
clean, contained swap: only resolveGeoAndTimezone()'s internals change;
its signature and return shape are identical, so nothing else in this
file — or anywhere downstream — needs to change.

Run from project root:
  python3 patch_switch_to_geonames.py
"""

import os, sys

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
path = os.path.join(
    PROJECT_ROOT, 'src', 'app', 'api', 'calculate-t3d', 'route.ts'
)

if not os.path.exists(path):
    print(f'ERROR: File not found at {path}')
    sys.exit(1)

with open(path, 'r') as f:
    content = f.read()

original = content

# ── 1. Update the file's top docstring ────────────────────────────────────────
old_doc = """/**
 * POST /api/calculate-t3d
 * Secure server-side calculation endpoint for the T3D Sovereign Calculator.
 *
 * When GOOGLE_API_KEY is not set, defaults to New York coordinates so the
 * full pipeline can be tested locally. Add your key to .env.local for
 * production geocoding and precise timezone resolution.
 */"""

new_doc = """/**
 * POST /api/calculate-t3d
 * Secure server-side calculation endpoint for the T3D Sovereign Calculator.
 *
 * Geocoding and timezone resolution use GeoNames (geonames.org) — a free,
 * no-billing-required service. When GEONAMES_USERNAME is not set, defaults
 * to New York coordinates so the full pipeline can be tested locally.
 * Register a free username at geonames.org and enable "free web services"
 * under Manage Account before using this in production.
 */"""

if old_doc in content:
    content = content.replace(old_doc, new_doc)
    print('✓ File docstring updated')
else:
    print('✗ Docstring not matched — skipping (non-critical)')

# ── 2. Replace the entire resolveGeoAndTimezone function ──────────────────────
old_function = """async function resolveGeoAndTimezone(
  city: string,
  country: string,
  birthDate: string,
): Promise<GeoResult> {
  const apiKey = process.env.GOOGLE_API_KEY;

  // ── Fallback: no API key — use New York for local testing ─────────────────
  if (!apiKey) {
    console.warn(
      '[T3D] No GOOGLE_API_KEY set. Using New York defaults for local testing.\\n' +
      '      Add your key to .env.local for accurate geocoding in production.'
    );
    return { latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' };
  }

  // ── Geocoding ─────────────────────────────────────────────────────────────
  const geoUrl = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  geoUrl.searchParams.set('address', `${city}, ${country}`);
  geoUrl.searchParams.set('key', apiKey);

  const geoRes  = await fetch(geoUrl.toString(), { cache: 'no-store' });
  const geoData = await geoRes.json() as {
    status: string;
    results: { geometry: { location: { lat: number; lng: number } } }[];
    error_message?: string;
  };

  if (geoData.status !== 'OK' || !geoData.results[0]) {
    throw new Error(`Geocoding failed (${geoData.status}): ${geoData.error_message ?? 'No results'}`);
  }

  const { lat: latitude, lng: longitude } = geoData.results[0].geometry.location;

  // ── Timezone ──────────────────────────────────────────────────────────────
  const epochSeconds = Math.floor(new Date(`${birthDate}T12:00:00Z`).getTime() / 1000);

  const tzUrl = new URL('https://maps.googleapis.com/maps/api/timezone/json');
  tzUrl.searchParams.set('location',  `${latitude},${longitude}`);
  tzUrl.searchParams.set('timestamp', String(epochSeconds));
  tzUrl.searchParams.set('key', apiKey);

  const tzRes  = await fetch(tzUrl.toString(), { cache: 'no-store' });
  const tzData = await tzRes.json() as {
    status: string;
    timeZoneId?: string;
    errorMessage?: string;
  };

  if (tzData.status !== 'OK' || !tzData.timeZoneId) {
    throw new Error(`Timezone lookup failed (${tzData.status}): ${tzData.errorMessage ?? ''}`);
  }

  return { latitude, longitude, timezone: tzData.timeZoneId };
}"""

new_function = """async function resolveGeoAndTimezone(
  city: string,
  country: string,
  birthDate: string,
): Promise<GeoResult> {
  const username = process.env.GEONAMES_USERNAME;

  // ── Fallback: no username — use New York for local testing ────────────────
  if (!username) {
    console.warn(
      '[T3D] No GEONAMES_USERNAME set. Using New York defaults for local testing.\\n' +
      '      Add your GeoNames username to .env.local for accurate geocoding in production.'
    );
    return { latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' };
  }

  // ── Geocoding — GeoNames search endpoint ───────────────────────────────────
  const geoUrl = new URL('https://secure.geonames.org/searchJSON');
  geoUrl.searchParams.set('q', `${city}, ${country}`);
  geoUrl.searchParams.set('maxRows', '1');
  geoUrl.searchParams.set('username', username);

  const geoRes  = await fetch(geoUrl.toString(), { cache: 'no-store' });
  const geoData = await geoRes.json() as {
    geonames?: { lat: string; lng: string; name: string }[];
    status?: { message: string; value: number };
  };

  if (geoData.status) {
    throw new Error(`GeoNames geocoding failed: ${geoData.status.message}`);
  }
  if (!geoData.geonames || geoData.geonames.length === 0) {
    throw new Error(`Geocoding failed: no results for "${city}, ${country}"`);
  }

  const latitude  = parseFloat(geoData.geonames[0].lat);
  const longitude = parseFloat(geoData.geonames[0].lng);

  // ── Timezone — GeoNames timezoneJSON endpoint ──────────────────────────────
  // Returns the IANA timezone ID (e.g. "America/New_York") for this
  // coordinate. The IANA string is what downstream code actually needs —
  // localToJulianDay() uses it to correctly resolve the historically
  // accurate UTC offset for the specific birth date, exactly as it did
  // with Google's timeZoneId field previously. birthDate is accepted here
  // for interface parity but the IANA identifier itself is date-independent.
  void birthDate;

  const tzUrl = new URL('https://secure.geonames.org/timezoneJSON');
  tzUrl.searchParams.set('lat', String(latitude));
  tzUrl.searchParams.set('lng', String(longitude));
  tzUrl.searchParams.set('username', username);

  const tzRes  = await fetch(tzUrl.toString(), { cache: 'no-store' });
  const tzData = await tzRes.json() as {
    timezoneId?: string;
    status?: { message: string; value: number };
  };

  if (tzData.status) {
    throw new Error(`GeoNames timezone lookup failed: ${tzData.status.message}`);
  }
  if (!tzData.timezoneId) {
    throw new Error('Timezone lookup failed: no timezoneId returned');
  }

  return { latitude, longitude, timezone: tzData.timezoneId };
}"""

if old_function in content:
    content = content.replace(old_function, new_function)
    print('✓ resolveGeoAndTimezone() replaced with GeoNames implementation')
else:
    print('✗ Function body not matched exactly — no changes made to this part')
    print('  This can happen if the file has been edited since. Paste the')
    print('  current file content and I will give you a precise patch.')

with open(path, 'w') as f:
    f.write(content)

print(); print("─" * 60)
if content == original:
    print('⚠ NO CHANGES WERE MADE.')
else:
    print('✓ route.ts updated successfully')
    print()
    print('Next steps:')
    print('  1. Add your GeoNames username locally:')
    print('     echo "GEONAMES_USERNAME=your_username" >> .env.local')
    print('  2. rm -rf .next && npm run dev  (test locally first)')
    print('  3. Add GEONAMES_USERNAME in Vercel → Environments → Production')
    print('  4. npm run build, git add -A, git commit, git push')
