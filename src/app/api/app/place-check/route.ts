/**
 * POST /api/app/place-check
 * Looks up a birth city so the app can show the person exactly which place,
 * coordinates and time zone will be used before anything is calculated.
 *
 * Body: { city: string, country: string, birthDate: "YYYY-MM-DD" }
 * Returns: { candidates: [{ label, latitude, longitude, timezone, utcOffset }] }
 */

import { NextResponse } from 'next/server';
import { DateTime } from 'luxon';
import { lookupPlaceCandidates } from '@/server/geocoding';
import { limitRequest } from '@/server/rateLimit';

function utcOffsetLabel(timezone: string, birthDate: string): string | null {
  const dt = DateTime.fromISO(`${birthDate}T12:00:00`, { zone: timezone });
  if (!dt.isValid) return null;
  const minutes = dt.offset;
  const sign = minutes < 0 ? '−' : '+';
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${h}${m ? `:${String(m).padStart(2, '0')}` : ''}`;
}

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'place');
  if (limited) return limited;
  try {
    let body: { city?: unknown; country?: unknown; birthDate?: unknown };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const city = typeof body.city === 'string' ? body.city.trim() : '';
    const country = typeof body.country === 'string' ? body.country.trim() : '';
    const birthDate = typeof body.birthDate === 'string' ? body.birthDate : '';
    if (!city || !country || city.length > 80 || country.length > 80) {
      return NextResponse.json({ success: false, error: 'Please enter a birth city and country.' }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      return NextResponse.json({ success: false, error: 'birthDate must be YYYY-MM-DD' }, { status: 400 });
    }

    const found = await lookupPlaceCandidates(city, country);
    if (found.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'We could not find that place. Try adding the state or region to the city, or check the spelling.',
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          candidates: found.map((c) => ({ ...c, utcOffset: utcOffsetLabel(c.timezone, birthDate) })),
        },
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error: unknown) {
    const unavailable = error instanceof Error && error.message === 'PLACE_LOOKUP_UNAVAILABLE';
    if (!unavailable) console.error('[T3D Place Check Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: unavailable
          ? 'Place lookup is unavailable right now. Please try again in a few minutes.'
          : 'Could not look up that place. Please try again.',
      },
      { status: unavailable ? 503 : 500 },
    );
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: { Allow: 'POST, OPTIONS' } });
}
