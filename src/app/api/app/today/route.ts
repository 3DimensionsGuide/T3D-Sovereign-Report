/**
 * POST /api/app/today
 * Daily sky for the T3D app's Today screen.
 *
 * Body: { at?: ISO date-time }
 *
 * Reads the person's saved natal chart from the database, calculates the
 * current sky against it (src/server/engines/dailySky.ts) and returns only
 * the curated result. No formulas or raw chart data leave the server.
 *
 * Auth: an Authorization: Bearer header carrying the app's session token. See
 * src/server/appAuth.ts — there is no email address in any app request any more.
 */

import { NextResponse } from 'next/server';
import { longitudeToGate } from '@/server/engines/human_design';
import { calculateDailySky, type NatalSkyPoints } from '@/server/engines/dailySky';
import type { AstrologyResult } from '@/server/engines/types';
import { parseSkyInstant } from '@/lib/app/skyDate';
import { limitRequest } from '@/server/rateLimit';
import { authenticateApp } from '@/server/appAuth';

interface TodayRequest {
  /** Optional ISO instant to read the sky for (the app's "jump to a date"). */
  at?: unknown;
}

const REMINDER =
  'Planetary transits are weather, not commands. Make today’s decisions through your Human Design Strategy and Inner Authority.';

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'app');
  if (limited) return limited;
  try {
    const auth = await authenticateApp(request);
    if (!auth.ok) return auth.response;
    const lead = auth.lead;

    let body: TodayRequest;
    try {
      body = (await request.json()) as TodayRequest;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const at = parseSkyInstant(body.at);
    if (!at) {
      return NextResponse.json({ success: false, error: 'That date is out of range.' }, { status: 400 });
    }

    const results = lead.results as unknown as {
      astrology?: AstrologyResult;
      humanDesign?: { type?: string; strategy?: string; authority?: string };
    } | null;
    const tropical = results?.astrology?.tropical;
    if (
      !tropical ||
      !isNumber(tropical.sun?.longitude) ||
      !isNumber(tropical.moon?.longitude) ||
      !isNumber(tropical.mercury?.longitude) ||
      !isNumber(tropical.venus?.longitude) ||
      !isNumber(tropical.mars?.longitude) ||
      !isNumber(tropical.jupiter?.longitude) ||
      !isNumber(tropical.saturn?.longitude) ||
      !isNumber(tropical.houses?.ascendant) ||
      !isNumber(tropical.houses?.mc)
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

    // The luminaries' raw longitudes stay on the server; only their gates leave.
    const { skyLongitudes, ...sky } = calculateDailySky(natal, at);

    return NextResponse.json(
      {
        success: true,
        data: {
          ...sky,
          // The gate and line the Sun and Moon are in: the app lights them on the bodygraph.
          gates: { sun: longitudeToGate(skyLongitudes.sun), moon: longitudeToGate(skyLongitudes.moon) },
          vehicle: {
            type: results?.humanDesign?.type ?? null,
            strategy: results?.humanDesign?.strategy ?? null,
            authority: results?.humanDesign?.authority ?? null,
          },
          reminder: REMINDER,
        },
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error: unknown) {
    console.error('[T3D Today Error]', error);
    return NextResponse.json(
      { success: false, error: 'Could not calculate today’s sky. Please try again.' },
      { status: 500 },
    );
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: { Allow: 'POST, OPTIONS' } });
}
