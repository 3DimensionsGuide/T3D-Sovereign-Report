/**
 * POST /api/app/triad-today
 * The daily Triad reading: one decision frame across the Vehicle, the Road
 * and the Stoplight.
 *
 * Body: { leadId: number, email: string, localDate: "YYYY-MM-DD" }
 *
 * Same access rule as the other app routes (id must pair with the lead's
 * email; identical 404 otherwise).
 */

import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { leads } from '@/server/db/schema';
import { buildTriadToday } from '@/lib/app/triadToday';
import { calculateDailySky, type NatalSkyPoints } from '@/server/engines/dailySky';
import { calculateDayNumerology } from '@/server/engines/dayNumerology';
import type { AstrologyResult } from '@/server/engines/types';

const NOT_FOUND = { success: false, error: 'We could not find that chart. Please recalculate it.' };

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    let body: { leadId?: unknown; email?: unknown; localDate?: unknown };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const leadId = Number(body.leadId);
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
    const localDate = typeof body.localDate === 'string' ? body.localDate : '';
    if (!Number.isInteger(leadId) || leadId < 1 || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'leadId and a valid email are required' }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate) || Number.isNaN(Date.parse(localDate))) {
      return NextResponse.json({ success: false, error: 'localDate must be YYYY-MM-DD' }, { status: 400 });
    }

    const rows = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    const lead = rows[0];
    if (!lead || lead.email.toLowerCase().trim() !== email) {
      return NextResponse.json(NOT_FOUND, { status: 404 });
    }

    const results = lead.results as unknown as {
      astrology?: AstrologyResult;
      humanDesign?: { type?: string; authority?: string };
    } | null;
    const t = results?.astrology?.tropical;
    const birthDate = (lead.birthData as { date?: string } | null)?.date;
    if (
      !t || !birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate) ||
      !isNumber(t.sun?.longitude) || !isNumber(t.moon?.longitude) || !isNumber(t.mercury?.longitude) ||
      !isNumber(t.venus?.longitude) || !isNumber(t.mars?.longitude) || !isNumber(t.jupiter?.longitude) ||
      !isNumber(t.saturn?.longitude) || !isNumber(t.houses?.ascendant) || !isNumber(t.houses?.mc)
    ) {
      return NextResponse.json(
        { success: false, error: 'This chart is missing data. Please recalculate it.' },
        { status: 422 },
      );
    }

    const natal: NatalSkyPoints = {
      sun: t.sun.longitude, moon: t.moon.longitude, mercury: t.mercury.longitude,
      venus: t.venus.longitude, mars: t.mars.longitude, jupiter: t.jupiter.longitude,
      saturn: t.saturn.longitude, ascendant: t.houses.ascendant, midheaven: t.houses.mc,
    };

    const data = buildTriadToday(
      { type: results?.humanDesign?.type ?? null, authority: results?.humanDesign?.authority ?? null },
      calculateDayNumerology(birthDate, localDate),
      calculateDailySky(natal),
    );

    return NextResponse.json({ success: true, data }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (error: unknown) {
    console.error('[T3D Triad Today Error]', error);
    return NextResponse.json(
      { success: false, error: 'Could not build today’s reading. Please try again.' },
      { status: 500 },
    );
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: { Allow: 'POST, OPTIONS' } });
}
