/**
 * POST /api/app/triad-today
 * The daily Triad reading: one decision frame across the Vehicle, the Road
 * and the Stoplight.
 *
 * Body: { localDate: "YYYY-MM-DD", at?: ISO date-time }
 *
 * Auth: an Authorization: Bearer header carrying the app's session token. See
 * src/server/appAuth.ts — there is no email address in any app request any more.
 */

import { NextResponse } from 'next/server';
import { buildTriadToday } from '@/lib/app/triadToday';
import { calculateDailySky, type NatalSkyPoints } from '@/server/engines/dailySky';
import { calculateDayNumerology } from '@/server/engines/dayNumerology';
import { GATE_CENTER_MAP, UNIQUE_CHANNELS, longitudeToGate } from '@/server/engines/human_design';
import type { VehicleGateData } from '@/lib/app/signal';
import type { AstrologyResult } from '@/server/engines/types';
import { parseSkyInstant } from '@/lib/app/skyDate';
import { limitRequest } from '@/server/rateLimit';
import { authenticateApp } from '@/server/appAuth';

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

    let body: { localDate?: unknown; at?: unknown; isToday?: unknown };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const localDate = typeof body.localDate === 'string' ? body.localDate : '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate) || Number.isNaN(Date.parse(localDate))) {
      return NextResponse.json({ success: false, error: 'localDate must be YYYY-MM-DD' }, { status: 400 });
    }

    const at = parseSkyInstant(body.at);
    if (!at) {
      return NextResponse.json({ success: false, error: 'That date is out of range.' }, { status: 400 });
    }

    const results = lead.results as unknown as {
      astrology?: AstrologyResult;
      humanDesign?: {
        type?: string;
        authority?: string;
        activeGates?: Array<{ gate?: number }>;
        undefinedCenters?: string[];
      };
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

    const sky = calculateDailySky(natal, at);
    const hd = results?.humanDesign;
    const natalGates = (hd?.activeGates ?? [])
      .map((g) => g.gate)
      .filter((g): g is number => typeof g === 'number');
    // Without the person's gates there is no Vehicle lamp; the Road and Stoplight lamps still show.
    const gateData: VehicleGateData | null = natalGates.length && Array.isArray(hd?.undefinedCenters)
      ? {
          type: hd?.type ?? null,
          authority: hd?.authority ?? null,
          natalGates,
          undefinedCenters: hd?.undefinedCenters ?? [],
          transit: {
            sun: longitudeToGate(sky.skyLongitudes.sun).gate,
            moon: longitudeToGate(sky.skyLongitudes.moon).gate,
          },
          channels: UNIQUE_CHANNELS.map((c) => c.gates),
          gateCenter: GATE_CENTER_MAP,
        }
      : null;

    const data = buildTriadToday(
      { type: hd?.type ?? null, authority: hd?.authority ?? null },
      calculateDayNumerology(birthDate, localDate),
      sky,
      body.isToday === false ? 'this day' : 'today',
      gateData,
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
