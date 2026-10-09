/**
 * POST /api/app/today
 * Daily sky for the T3D app's Today screen.
 *
 * Body: { leadId: number, email: string, at?: ISO date-time }
 *
 * Reads the person's saved natal chart from the database, calculates the
 * current sky against it (src/server/engines/dailySky.ts) and returns only
 * the curated result. No formulas or raw chart data leave the server.
 *
 * Access check: the lead id must be paired with the email on that lead. A
 * wrong id and a wrong email get the identical 404, so ids can't be probed.
 */

import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { leads } from '@/server/db/schema';
import { calculateDailySky, type NatalSkyPoints } from '@/server/engines/dailySky';
import type { AstrologyResult } from '@/server/engines/types';
import { parseSkyInstant } from '@/lib/app/skyDate';
import { limitRequest, noteAccessFailure } from '@/server/rateLimit';

interface TodayRequest {
  leadId?: unknown;
  email?: unknown;
  /** Optional ISO instant to read the sky for (the app's "jump to a date"). */
  at?: unknown;
}

const NOT_FOUND = { success: false, error: 'We could not find that chart. Please recalculate it.' };

const REMINDER =
  'Planetary transits are weather, not commands. Make today’s decisions through your Human Design Strategy and Inner Authority.';

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'app');
  if (limited) return limited;
  try {
    let body: TodayRequest;
    try {
      body = (await request.json()) as TodayRequest;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const leadId = Number(body.leadId);
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
    if (!Number.isInteger(leadId) || leadId < 1 || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'leadId and a valid email are required' },
        { status: 400 },
      );
    }

    const at = parseSkyInstant(body.at);
    if (!at) {
      return NextResponse.json({ success: false, error: 'That date is out of range.' }, { status: 400 });
    }

    const rows = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    const lead = rows[0];
    if (!lead || lead.email.toLowerCase().trim() !== email) {
      await noteAccessFailure(request);
      return NextResponse.json(NOT_FOUND, { status: 404 });
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

    const sky = calculateDailySky(natal, at);

    return NextResponse.json(
      {
        success: true,
        data: {
          ...sky,
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
