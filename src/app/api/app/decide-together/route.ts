/**
 * POST /api/app/decide-together
 * Builds the "decide together" frame for you and one other person.
 *
 * Body: {
 *   leadId, email,               // your chart (same access rule as the other app routes)
 *   localDate: "YYYY-MM-DD",
 *   youTimeKnown?: boolean,
 *   partner: { label, birthDate, birthTime: "HH:MM" | null, latitude, longitude, timezone }
 * }
 *
 * Also returns channel connections, a numerology pair and sky connections.
 * The other person's details are used to calculate and are then discarded:
 * nothing about them is written to the database or to the logs.
 */

import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { db } from '@/server/db';
import { leads } from '@/server/db/schema';
import { computeTogether } from '@/server/togetherCompute';
import { limitRequest, noteAccessFailure } from '@/server/rateLimit';

const NOT_FOUND = { success: false, error: 'We could not find that chart. Please recalculate it.' };
const BAD_PARTNER = { success: false, error: 'Please check the other person’s birth details and try again.' };

const isDate = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const isNum = (v: unknown, min: number, max: number): v is number => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;

function cleanLabel(value: unknown): string {
  const raw = typeof value === 'string' ? value : '';
  const cleaned = raw.replace(/[^\p{L}\p{M} '’-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 24);
  return cleaned || 'Them';
}

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'app');
  if (limited) return limited;
  try {
    let body: {
      leadId?: unknown; email?: unknown; localDate?: unknown; youTimeKnown?: unknown;
      partner?: { label?: unknown; birthDate?: unknown; birthTime?: unknown; latitude?: unknown; longitude?: unknown; timezone?: unknown };
    };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const leadId = Number(body.leadId);
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
    const localDate = body.localDate;
    if (!Number.isInteger(leadId) || leadId < 1 || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'leadId and a valid email are required' }, { status: 400 });
    }
    if (!isDate(localDate)) {
      return NextResponse.json({ success: false, error: 'localDate must be YYYY-MM-DD' }, { status: 400 });
    }

    const p = body.partner;
    const timeOk = p?.birthTime === null || (typeof p?.birthTime === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(p.birthTime));
    if (
      !p || !isDate(p.birthDate) || p.birthDate < '1900-01-01' || p.birthDate > localDate ||
      !timeOk || !isNum(p.latitude, -90, 90) || !isNum(p.longitude, -180, 180) ||
      typeof p.timezone !== 'string' || !DateTime.local().setZone(p.timezone).isValid
    ) {
      return NextResponse.json(BAD_PARTNER, { status: 400 });
    }

    const rows = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    const lead = rows[0];
    if (!lead || lead.email.toLowerCase().trim() !== email) {
      await noteAccessFailure(request);
      return NextResponse.json(NOT_FOUND, { status: 404 });
    }

    const results = lead.results as unknown as { humanDesign?: { type?: string; authority?: string } } | null;
    const birth = lead.birthData as {
      date?: string; time?: string;
      place?: { latitude?: number; longitude?: number; timezone?: string };
    } | null;
    if (!birth?.date || !isDate(birth.date)) {
      return NextResponse.json(
        { success: false, error: 'This chart is missing data. Please recalculate it.' },
        { status: 422 },
      );
    }

    const pl = birth.place;
    const yourPlace = pl && isNum(pl.latitude, -90, 90) && isNum(pl.longitude, -180, 180) && typeof pl.timezone === 'string'
      ? { latitude: pl.latitude, longitude: pl.longitude, timezone: pl.timezone }
      : null;
    const youTimeKnown = body.youTimeKnown !== false;
    const yourTime = youTimeKnown && typeof birth.time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(birth.time) ? birth.time : null;

    const data = computeTogether(
      {
        label: 'You',
        birthDate: birth.date,
        birthTime: yourTime,
        place: yourPlace,
        saved: { type: results?.humanDesign?.type ?? null, authority: results?.humanDesign?.authority ?? null },
      },
      {
        label: cleanLabel(p.label),
        birthDate: p.birthDate,
        birthTime: typeof p.birthTime === 'string' ? p.birthTime : null,
        place: { latitude: p.latitude, longitude: p.longitude, timezone: p.timezone },
      },
      localDate,
    );

    return NextResponse.json(
      { success: true, data },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error: unknown) {
    // Deliberately logs only the error, never the request body (it holds another person's birth details).
    console.error('[T3D Decide Together Error]', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json(
      { success: false, error: 'Could not build your reading. Please try again.' },
      { status: 500 },
    );
  }
}
