/**
 * POST /api/calculate-t3d
 * Secure server-side calculation endpoint for the T3D Sovereign Calculator.
 *
 * When GOOGLE_API_KEY is not set, defaults to New York coordinates so the
 * full pipeline can be tested locally. Add your key to .env.local for
 * production geocoding and precise timezone resolution.
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
  const apiKey = process.env.GOOGLE_API_KEY;

  // ── Fallback: no API key — use New York for local testing ─────────────────
  if (!apiKey) {
    console.warn(
      '[T3D] No GOOGLE_API_KEY set. Using New York defaults for local testing.\n' +
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
