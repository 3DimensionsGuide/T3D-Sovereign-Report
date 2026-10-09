/**
 * POST /api/app/timeline
 * The Timeline for the T3D app: sky events against the person's natal chart,
 * their annual profection (Lord of the Year) and their numerology cycles.
 *
 * Body: { leadId: number, email: string, localDate: "YYYY-MM-DD",
 *         tzOffsetMinutes: number, days?: number }
 *
 * Same access rule as the other app routes: the lead id must be paired with
 * the email on that lead; a wrong id and a wrong email get the identical 404.
 * Formulas stay on the server; only the finished timeline is returned.
 */

import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { leads } from '@/server/db/schema';
import { calculateTimeline } from '@/server/engines/timeline';
import type { NatalSkyPoints } from '@/server/engines/dailySky';
import type { AstrologyResult, NumerologyCycle } from '@/server/engines/types';
import { limitRequest, noteAccessFailure } from '@/server/rateLimit';

interface TimelineRequest {
  leadId?: unknown;
  email?: unknown;
  localDate?: unknown;
  tzOffsetMinutes?: unknown;
  days?: unknown;
}

const NOT_FOUND = { success: false, error: 'We could not find that chart. Please recalculate it.' };

const REMINDER =
  'Planetary transits are weather, not commands. Make your decisions through your Human Design Strategy and Inner Authority.';

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isCycles(value: unknown): value is NumerologyCycle[] {
  return (
    Array.isArray(value) &&
    value.length >= 4 &&
    value.every((c) => c && isNumber((c as NumerologyCycle).number) && isNumber((c as NumerologyCycle).startAge))
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'app');
  if (limited) return limited;
  try {
    let body: TimelineRequest;
    try {
      body = (await request.json()) as TimelineRequest;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const leadId = Number(body.leadId);
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
    const localDate = typeof body.localDate === 'string' ? body.localDate : '';
    const tzOffsetMinutes = Number(body.tzOffsetMinutes);
    const days = body.days === undefined ? 60 : Number(body.days);

    if (!Number.isInteger(leadId) || leadId < 1 || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'leadId and a valid email are required' },
        { status: 400 },
      );
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate) || Number.isNaN(Date.parse(localDate))) {
      return NextResponse.json({ success: false, error: 'localDate must be YYYY-MM-DD' }, { status: 400 });
    }
    if (!Number.isFinite(tzOffsetMinutes) || Math.abs(tzOffsetMinutes) > 14 * 60) {
      return NextResponse.json({ success: false, error: 'tzOffsetMinutes is invalid' }, { status: 400 });
    }
    if (!Number.isFinite(days)) {
      return NextResponse.json({ success: false, error: 'days must be a number' }, { status: 400 });
    }

    const rows = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    const lead = rows[0];
    if (!lead || lead.email.toLowerCase().trim() !== email) {
      await noteAccessFailure(request);
      return NextResponse.json(NOT_FOUND, { status: 404 });
    }

    const results = lead.results as unknown as {
      astrology?: AstrologyResult;
      numerology?: { pinnacles?: unknown; challenges?: unknown };
    } | null;
    const birthDate = (lead.birthData as { date?: string } | null)?.date;
    const tropical = results?.astrology?.tropical;
    if (
      !birthDate ||
      !/^\d{4}-\d{2}-\d{2}$/.test(birthDate) ||
      !tropical ||
      !isNumber(tropical.sun?.longitude) ||
      !isNumber(tropical.moon?.longitude) ||
      !isNumber(tropical.mercury?.longitude) ||
      !isNumber(tropical.venus?.longitude) ||
      !isNumber(tropical.mars?.longitude) ||
      !isNumber(tropical.jupiter?.longitude) ||
      !isNumber(tropical.saturn?.longitude) ||
      !isNumber(tropical.houses?.ascendant) ||
      !isNumber(tropical.houses?.mc) ||
      !isCycles(results?.numerology?.pinnacles) ||
      !isCycles(results?.numerology?.challenges)
    ) {
      return NextResponse.json(
        { success: false, error: 'This chart is missing data. Please recalculate it.' },
        { status: 422 },
      );
    }

    const natal: NatalSkyPoints = {
      sun: tropical.sun.longitude,
      moon: tropical.moon.longitude,
      mercury: tropical.mercury.longitude,
      venus: tropical.venus.longitude,
      mars: tropical.mars.longitude,
      jupiter: tropical.jupiter.longitude,
      saturn: tropical.saturn.longitude,
      ascendant: tropical.houses.ascendant,
      midheaven: tropical.houses.mc,
    };

    const timeline = calculateTimeline({
      natal,
      birthDate,
      pinnacles: results.numerology.pinnacles,
      challenges: results.numerology.challenges,
      localDate,
      tzOffsetMinutes,
      days,
    });

    return NextResponse.json(
      { success: true, data: { ...timeline, reminder: REMINDER } },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error: unknown) {
    console.error('[T3D Timeline Error]', error);
    return NextResponse.json(
      { success: false, error: 'Could not build your timeline. Please try again.' },
      { status: 500 },
    );
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: { Allow: 'POST, OPTIONS' } });
}
