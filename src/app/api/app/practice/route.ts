/**
 * POST /api/app/practice
 * Wording for the app's Practice tab: the Decision Protocol for the person's
 * Authority and the Seven-Day Experiment for their Type. The person's own
 * answers never leave their phone.
 *
 * Body: { leadId: number, email: string, localDate?: "YYYY-MM-DD" }
 *
 * Same access rule as the other app routes (id must pair with the lead's
 * email; identical 404 otherwise).
 */

import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { leads } from '@/server/db/schema';
import { buildPractice } from '@/lib/app/practice';
import { calculateDayNumerology } from '@/server/engines/dayNumerology';

const NOT_FOUND = { success: false, error: 'We could not find that chart. Please recalculate it.' };

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
    if (!Number.isInteger(leadId) || leadId < 1 || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'leadId and a valid email are required' }, { status: 400 });
    }
    const localDate =
      typeof body.localDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.localDate) && !Number.isNaN(Date.parse(body.localDate))
        ? body.localDate
        : null;

    const rows = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    const lead = rows[0];
    if (!lead || lead.email.toLowerCase().trim() !== email) {
      return NextResponse.json(NOT_FOUND, { status: 404 });
    }

    const results = lead.results as unknown as {
      humanDesign?: { type?: string; authority?: string };
      numerology?: { lifePath?: number };
      astrology?: { tropical?: { sun?: { sign?: string } } };
    } | null;
    const birthDate = (lead.birthData as { date?: string } | null)?.date;

    let personalYear: number | null = null;
    if (localDate && birthDate && /^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      personalYear = calculateDayNumerology(birthDate, localDate).personalYear;
    }

    const lifePath = results?.numerology?.lifePath;
    const data = buildPractice(
      { type: results?.humanDesign?.type ?? null, authority: results?.humanDesign?.authority ?? null },
      {
        lifePath: typeof lifePath === 'number' && Number.isFinite(lifePath) ? lifePath : null,
        personalYear,
        sunSign: results?.astrology?.tropical?.sun?.sign ?? null,
      },
    );

    return NextResponse.json({ success: true, data }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (error: unknown) {
    console.error('[T3D Practice Error]', error);
    return NextResponse.json(
      { success: false, error: 'Could not load your practice. Please try again.' },
      { status: 500 },
    );
  }
}
