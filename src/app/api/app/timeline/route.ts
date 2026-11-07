/**
 * POST /api/app/timeline
 * The Timeline for the T3D app: sky events against the person's natal chart,
 * their annual profection (Lord of the Year) and their numerology cycles.
 *
 * Body: { localDate: "YYYY-MM-DD", tzOffsetMinutes: number, days?: number }
 *
 * Auth: an Authorization: Bearer header carrying the app's session token. See
 * src/server/appAuth.ts — there is no email address in any app request any more.
 *
 * Formulas stay on the server; only the finished timeline is returned.
 */

import { NextResponse } from 'next/server';
import { calculateTimeline } from '@/server/engines/timeline';
import { buildYearAhead } from '@/lib/app/yearAhead';
import type { NatalSkyPoints } from '@/server/engines/dailySky';
import type { AstrologyResult, NumerologyCycle } from '@/server/engines/types';
import { limitRequest } from '@/server/rateLimit';
import { authenticateApp } from '@/server/appAuth';

interface TimelineRequest {
  localDate?: unknown;
  tzOffsetMinutes?: unknown;
  days?: unknown;
}

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
    const auth = await authenticateApp(request);
    if (!auth.ok) return auth.response;
    const lead = auth.lead;

    let body: TimelineRequest;
    try {
      body = (await request.json()) as TimelineRequest;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const localDate = typeof body.localDate === 'string' ? body.localDate : '';
    const tzOffsetMinutes = Number(body.tzOffsetMinutes);
    const days = body.days === undefined ? 60 : Number(body.days);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate) || Number.isNaN(Date.parse(localDate))) {
      return NextResponse.json({ success: false, error: 'localDate must be YYYY-MM-DD' }, { status: 400 });
    }
    if (!Number.isFinite(tzOffsetMinutes) || Math.abs(tzOffsetMinutes) > 14 * 60) {
      return NextResponse.json({ success: false, error: 'tzOffsetMinutes is invalid' }, { status: 400 });
    }
    if (!Number.isFinite(days)) {
      return NextResponse.json({ success: false, error: 'days must be a number' }, { status: 400 });
    }

    const results = lead.results as unknown as {
      astrology?: AstrologyResult;
      numerology?: { pinnacles?: unknown; challenges?: unknown };
      humanDesign?: { type?: string; authority?: string; activeGates?: Array<{ gate?: number }>; undefinedCenters?: string[] };
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

    const hd = results?.humanDesign;
    const natalGates = (hd?.activeGates ?? [])
      .map((g) => g.gate)
      .filter((g): g is number => typeof g === 'number');
    // Without the person's gates there are no Vehicle events; everything else still builds.
    const vehicle = natalGates.length && Array.isArray(hd?.undefinedCenters)
      ? { type: hd?.type ?? null, authority: hd?.authority ?? null, natalGates, undefinedCenters: hd?.undefinedCenters ?? [] }
      : undefined;

    const timeline = calculateTimeline({
      natal,
      vehicle,
      birthDate,
      pinnacles: results.numerology.pinnacles,
      challenges: results.numerology.challenges,
      localDate,
      tzOffsetMinutes,
      days,
    });

    return NextResponse.json(
      { success: true, data: { ...timeline, yearAhead: buildYearAhead(timeline), reminder: REMINDER } },
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
