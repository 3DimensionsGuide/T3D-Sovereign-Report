/**
 * Shared geocoding + timezone resolution for birth-place lookups.
 *
 * Used both at calculator-submission time (POST /api/calculate-t3d) and
 * by the admin repair route (GET /api/admin/recompute-human-design, the
 * `relocate=true` mode) when fixing a lead whose coordinates were wrong
 * at the time it was created. Extracted to one place so both call sites
 * stay in sync -- previously this lived only in calculate-t3d/route.ts
 * and the admin route would have had to duplicate it (and could drift).
 *
 * Geocoding and timezone resolution use GeoNames (geonames.org) -- a
 * free, no-billing-required service. When GEONAMES_USERNAME is not set,
 * this silently falls back to New York City coordinates so the pipeline
 * can still be exercised locally without an account. That fallback is
 * exactly what produced several of T3D's own early test leads with
 * wrong coordinates before GEONAMES_USERNAME was configured -- see the
 * admin route's `relocate` mode for how an already-written lead like
 * that gets repaired after the fact. Register a free username at
 * geonames.org and enable "free web services" under Manage Account
 * before relying on this in production.
 */

export interface GeoResult {
  latitude:  number;
  longitude: number;
  timezone:  string;
}

export async function resolveGeoAndTimezone(
  city: string,
  country: string,
  birthDate: string,
): Promise<GeoResult> {
  const username = process.env.GEONAMES_USERNAME;

  // ── Fallback: no username — use New York for local testing ────────────────
  if (!username) {
    console.warn(
      '[T3D] No GEONAMES_USERNAME set. Using New York defaults for local testing.\n' +
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
}

// ─── PLACE CANDIDATES (for the app's "confirm your birth place" step) ─────────

export interface PlaceCandidate {
  label:     string;
  latitude:  number;
  longitude: number;
  timezone:  string;
}

/**
 * Up to three populated-place matches for a city and country, with the
 * coordinates and IANA time zone each one would use. The app shows these back
 * to the person to confirm before anything is calculated.
 *
 * Unlike resolveGeoAndTimezone, this never falls back to New York: if the
 * lookup service isn't configured it throws PLACE_LOOKUP_UNAVAILABLE so the
 * app can say so instead of silently using the wrong place.
 */
export async function lookupPlaceCandidates(city: string, country: string): Promise<PlaceCandidate[]> {
  const username = process.env.GEONAMES_USERNAME;
  if (!username) throw new Error('PLACE_LOOKUP_UNAVAILABLE');

  const url = new URL('https://secure.geonames.org/searchJSON');
  url.searchParams.set('q', `${city}, ${country}`);
  url.searchParams.set('maxRows', '6');
  url.searchParams.set('featureClass', 'P');
  url.searchParams.set('style', 'FULL');
  url.searchParams.set('username', username);

  const res = await fetch(url.toString(), { cache: 'no-store' });
  const data = await res.json() as {
    geonames?: {
      lat: string; lng: string; name: string; adminName1?: string; countryName?: string;
      timezone?: { timeZoneId?: string };
    }[];
    status?: { message: string; value: number };
  };
  if (data.status) throw new Error('PLACE_LOOKUP_UNAVAILABLE');

  const out: PlaceCandidate[] = [];
  const seen = new Set<string>();
  for (const g of data.geonames ?? []) {
    const latitude = parseFloat(g.lat);
    const longitude = parseFloat(g.lng);
    const timezone = g.timezone?.timeZoneId;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !timezone) continue;
    const label = [g.name, g.adminName1 && g.adminName1 !== g.name ? g.adminName1 : null, g.countryName]
      .filter(Boolean)
      .join(', ');
    if (seen.has(label)) continue;
    seen.add(label);
    out.push({ label, latitude, longitude, timezone });
    if (out.length === 3) break;
  }
  return out;
}
