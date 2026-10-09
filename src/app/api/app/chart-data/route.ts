/**
 * POST /api/app/chart-data
 * Drawing data for the T3D app's natal wheel and bodygraph.
 *
 * Body: { leadId: number, email: string }
 *
 * Same access rule as /api/app/today: the lead id must be paired with the
 * email on that lead, and a wrong id and a wrong email get the identical 404.
 * Nothing is recalculated — this reads the chart already stored on the lead.
 */

import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { leads } from '@/server/db/schema';
import { buildChartDrawingData } from '@/server/engines/chartData';
import type { AstrologyResult, HumanDesignResult } from '@/server/engines/types';

interface ChartDataRequest {
  leadId?: unknown;
  email?: unknown;
}

const NOT_FOUND = { success: false, error: 'We could not find that chart. Please recalculate it.' };

export async function POST(request: Request): Promise<NextResponse> {
  try {
    let body: ChartDataRequest;
    try {
      body = (await request.json()) as ChartDataRequest;
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

    const rows = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    const lead = rows[0];
    if (!lead || lead.email.toLowerCase().trim() !== email) {
      return NextResponse.json(NOT_FOUND, { status: 404 });
    }

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
