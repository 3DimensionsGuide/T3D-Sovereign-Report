/**
 * POST /api/app/stoplight
 * The Stoplight (Astrology) screen: Big Three in both zodiacs, Sun-Moon
 * pattern, elements and modalities, chart ruler, Mercury to Pluto, Time Lord
 * and Lord of the Year, taken from the T3D reports.
 *
 * Body: { leadId: number, email: string, birthTimeKnown?: boolean }
 *
 * Same access rule as the other app routes (id must pair with the lead's
 * email; identical 404 otherwise). The interpretation writing never ships in
 * the app bundle, and `locked` is the single switch for gating sections
 * behind a purchase later.
 */

import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { leads } from '@/server/db/schema';
import { buildStoplight } from '@/lib/app/stoplightReading';
import type { AstrologyResult } from '@/server/engines/types';
import { limitRequest, noteAccessFailure } from '@/server/rateLimit';

const SECTIONS_LOCKED = false;

const NOT_FOUND = { success: false, error: 'We could not find that chart. Please recalculate it.' };

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'app');
  if (limited) return limited;
  try {
    let body: { leadId?: unknown; email?: unknown; birthTimeKnown?: unknown };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const leadId = Number(body.leadId);
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
    if (!Number.isInteger(leadId) || leadId < 1 || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'leadId and a valid email are required' }, { status: 400 });
    }

    const rows = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    const lead = rows[0];
    if (!lead || lead.email.toLowerCase().trim() !== email) {
      await noteAccessFailure(request);
      return NextResponse.json(NOT_FOUND, { status: 404 });
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
