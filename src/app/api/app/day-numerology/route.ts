/**
 * POST /api/app/day-numerology
 * Universal Day and Personal Day numerology for the Today screen.
 *
 * Body: { leadId: number, email: string, localDate: 'YYYY-MM-DD' }
 *
 * Access check: the lead id must be paired with the email on that lead. A
 * wrong id and a wrong email get the identical 404, so ids can't be probed.
 */

import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { leads } from '@/server/db/schema';
import { calculateDayNumerology } from '@/server/engines/dayNumerology';
import { limitRequest, noteAccessFailure } from '@/server/rateLimit';

interface DayNumerologyRequest {
  leadId?: unknown;
  email?: unknown;
  localDate?: unknown;
}

const NOT_FOUND = { success: false, error: 'We could not find that chart. Please recalculate it.' };

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'app');
  if (limited) return limited;
  try {
    let body: DayNumerologyRequest;
    try {
      body = (await request.json()) as DayNumerologyRequest;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const leadId = Number(body.leadId);
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
    const localDate = typeof body.localDate === 'string' ? body.localDate : '';
    if (!Number.isInteger(leadId) || leadId < 1 || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'leadId and a valid email are required' },
        { status: 400 },
      );
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate) || Number.isNaN(Date.parse(localDate))) {
      return NextResponse.json({ success: false, error: 'localDate must be YYYY-MM-DD' }, { status: 400 });
    }

    const rows = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    const lead = rows[0];
    if (!lead || lead.email.toLowerCase().trim() !== email) {
      await noteAccessFailure(request);
      return NextResponse.json(NOT_FOUND, { status: 404 });
    }

    const birthDate = (lead.birthData as { date?: string } | null)?.date;
    if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      return NextResponse.json(
        { success: false, error: 'This chart is missing data. Please recalculate it.' },
        { status: 422 },
      );
    }

    return NextResponse.json(
      { success: true, data: calculateDayNumerology(birthDate, localDate) },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error: unknown) {
    console.error('[T3D Day Numerology Error]', error);
    return NextResponse.json(
      { success: false, error: 'Could not calculate today’s numerology. Please try again.' },
      { status: 500 },
    );
  }
}
