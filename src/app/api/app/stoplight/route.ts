/**
 * POST /api/app/stoplight
 * The Stoplight (Astrology) screen: Big Three in both zodiacs, Sun-Moon
 * pattern, elements and modalities, chart ruler, Mercury to Pluto, Time Lord
 * and Lord of the Year, taken from the T3D reports.
 *
 * Body: { birthTimeKnown?: boolean }
 *
 * The interpretation writing never ships in the app bundle, and `locked` is
 * the single switch for gating sections behind a purchase later.
 *
 * Auth: an Authorization: Bearer header carrying the app's session token. See
 * src/server/appAuth.ts — there is no email address in any app request any more.
 */

import { NextResponse } from 'next/server';
import { buildStoplight } from '@/lib/app/stoplightReading';
import type { AstrologyResult } from '@/server/engines/types';
import { limitRequest } from '@/server/rateLimit';
import { authenticateApp } from '@/server/appAuth';

const SECTIONS_LOCKED = false;

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'app');
  if (limited) return limited;
  try {
    const auth = await authenticateApp(request);
    if (!auth.ok) return auth.response;
    const lead = auth.lead;

    let body: { birthTimeKnown?: unknown };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const astro = (lead.results as unknown as { astrology?: AstrologyResult } | null)?.astrology;
    const birthDate = lead.birthData?.date;
    const detail = astro?.tropical && astro?.sidereal && typeof birthDate === 'string'
      ? buildStoplight(astro.tropical, astro.sidereal, birthDate, body.birthTimeKnown !== false, SECTIONS_LOCKED)
      : null;
    if (!detail) {
      return NextResponse.json(
        { success: false, error: 'This chart is missing data. Please recalculate it.' },
        { status: 422 },
      );
    }

    return NextResponse.json({ success: true, data: detail }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (error: unknown) {
    console.error('[T3D Stoplight Error]', error);
    return NextResponse.json(
      { success: false, error: 'Could not load your astrology reading. Please try again.' },
      { status: 500 },
    );
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: { Allow: 'POST, OPTIONS' } });
}
