/**
 * POST /api/app/chart-data
 * Drawing data for the T3D app's natal wheel and bodygraph.
 *
 * Body: none.
 *
 * Auth: an Authorization: Bearer header carrying the app's session token. See
 * src/server/appAuth.ts — there is no email address in any app request any more.
 *
 * Nothing is recalculated — this reads the chart already stored on the lead.
 */

import { NextResponse } from 'next/server';
import { buildChartDrawingData } from '@/server/engines/chartData';
import type { AstrologyResult, HumanDesignResult } from '@/server/engines/types';
import { limitRequest } from '@/server/rateLimit';
import { authenticateApp } from '@/server/appAuth';

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'app');
  if (limited) return limited;
  try {
    const auth = await authenticateApp(request);
    if (!auth.ok) return auth.response;
    const lead = auth.lead;

    const results = lead.results as unknown as {
      astrology?: AstrologyResult;
      humanDesign?: HumanDesignResult;
    } | null;

    if (
      !results?.astrology?.tropical?.houses ||
      !results.astrology.sidereal?.houses ||
      !results.humanDesign?.activeChannels ||
      !results.humanDesign.activeGates
    ) {
      return NextResponse.json(
        { success: false, error: 'This chart is missing data. Please recalculate it.' },
        { status: 422 },
      );
    }

    const data = buildChartDrawingData(results.astrology, results.humanDesign);
    return NextResponse.json({ success: true, data }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (error: unknown) {
    console.error('[T3D Chart Data Error]', error);
    return NextResponse.json(
      { success: false, error: 'Could not load your chart. Please try again.' },
      { status: 500 },
    );
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: { Allow: 'POST, OPTIONS' } });
}
