/**
 * POST /api/calculate-t3d
 * Secure server-side calculation endpoint for the T3D Sovereign Calculator.
 *
 * Geocoding and timezone resolution use GeoNames (geonames.org) — a free,
 * no-billing-required service. When GEONAMES_USERNAME is not set, defaults
 * to New York coordinates so the full pipeline can be tested locally.
 * Register a free username at geonames.org and enable "free web services"
 * under Manage Account before using this in production.
 */

import { NextResponse } from 'next/server';
import { db }    from '@/server/db';
import { leads } from '@/server/db/schema';
import { calculateNumerology }  from '@/server/engines/numerology';
import { calculateAstrology }   from '@/server/engines/astrology';
import { calculateHumanDesign } from '@/server/engines/human_design';
import type { T3DCalculatorInput } from '@/server/engines/types';

// ─── VALIDATION ───────────────────────────────────────────────────────────────
function validateInput(body: Partial<T3DCalculatorInput>): string | null {
  if (!body.firstName?.trim())  return 'firstName is required';
  if (!body.lastName?.trim())   return 'lastName is required';
  if (!body.email?.includes('@')) return 'A valid email is required';
  if (!body.birthDate?.match(/^\d{4}-\d{2}-\d{2}$/))
    return 'birthDate must be in YYYY-MM-DD format';
  if (!body.birthPlace?.city?.trim())    return 'birthPlace.city is required';
  if (!body.birthPlace?.country?.trim()) return 'birthPlace.country is required';
  return null;
}

// ─── GEOCODING ────────────────────────────────────────────────────────────────
interface GeoResult {
  latitude:  number;
  longitude: number;
  timezone:  string;
}

async function resolveGeoAndTimezone(
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

// ─── ROUTE HANDLER ────────────────────────────────────────────────────────────
export async function POST(
  request: Request,
): Promise<NextResponse> {
  try {
    // 1. Parse body
    let body: T3DCalculatorInput;
    try {
      body = await request.json() as T3DCalculatorInput;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }

    // 2. Validate
    const validationError = validateInput(body);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    // 3. Resolve coordinates — use provided values or geocode
    let latitude  = body.birthPlace.latitude;
    let longitude = body.birthPlace.longitude;
    let timezone  = body.birthPlace.timezone;

    if (!latitude || !longitude || !timezone) {
      const geo = await resolveGeoAndTimezone(
        body.birthPlace.city,
        body.birthPlace.country,
        body.birthDate,
      );
      latitude  = geo.latitude;
      longitude = geo.longitude;
      timezone  = geo.timezone;
    }

    const birthTime = body.birthTime?.trim() || '12:00';

    // 4. Run all three engines
    const numerologyResults  = calculateNumerology({
      firstName:  body.firstName.trim(),
      middleName: body.middleName?.trim(),
      lastName:   body.lastName.trim(),
      birthDate:  body.birthDate,
    });

    const astrologyResults = calculateAstrology({
      birthDate: body.birthDate,
      birthTime,
      latitude,
      longitude,
      timezone,
    });

    const humanDesignResults = calculateHumanDesign({
      birthDate: body.birthDate,
      birthTime,
      latitude,
      longitude,
      timezone,
    });

    // 5. Save lead to database
    const inserted = await db.insert(leads).values({
      email:      body.email.toLowerCase().trim(),
      firstName:  body.firstName.trim(),
      lastName:   body.lastName.trim(),
      middleName: body.middleName?.trim() ?? null,
      birthData: {
        date:  body.birthDate,
        time:  birthTime,
        place: {
          city:      body.birthPlace.city,
          country:   body.birthPlace.country,
          latitude,
          longitude,
          timezone,
        },
      },
      results: {
        astrology:   astrologyResults   as unknown as Record<string, unknown>,
        numerology:  numerologyResults  as unknown as Record<string, unknown>,
        humanDesign: humanDesignResults as unknown as Record<string, unknown>,
      },
    }).returning({ id: leads.id });

    const leadId = inserted[0]?.id;
    if (!leadId) throw new Error('Database insert returned no ID.');

    // 6. Return curated response (raw formulas stay server-side)
    return NextResponse.json({
      success: true,
      leadId,
      data: {
        astrology: {
          tropicalSun:       astrologyResults.tropical.sun,
          tropicalMoon:      astrologyResults.tropical.moon,
          tropicalAscendant: astrologyResults.tropical.houses.ascendant,
          tropicalMC:        astrologyResults.tropical.houses.mc,
          siderealSun:       astrologyResults.sidereal.sun,
          siderealAscendant: astrologyResults.sidereal.houses.ascendant,
          houseSystem:       'Whole Sign',
        },
        numerology: {
          lifePath:      numerologyResults.lifePath,
          destiny:       numerologyResults.destiny,
          personality:   numerologyResults.personality,
          soulUrge:      numerologyResults.soulUrge,
          hiddenPassion: numerologyResults.hiddenPassion,
          karmicLessons: numerologyResults.karmicLessons,
        },
        humanDesign: {
          type:      humanDesignResults.type,
          authority: humanDesignResults.authority,
          profile:   humanDesignResults.profile,
          strategy:  humanDesignResults.strategy,
        },
      },
    }, { status: 200 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    console.error('[T3D Calculation Error]', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: { 'Allow': 'POST, OPTIONS' },
  });
}
