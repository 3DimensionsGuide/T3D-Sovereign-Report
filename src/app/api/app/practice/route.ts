/**
 * POST /api/app/practice
 * Wording for the app's Practice tab: the Decision Protocol for the person's
 * Authority and the Seven-Day Experiment for their Type. The person's own
 * answers never leave their phone.
 *
 * Body: { localDate?: "YYYY-MM-DD" }
 *
 * Auth: an Authorization: Bearer header carrying the app's session token. See
 * src/server/appAuth.ts — there is no email address in any app request any more.
 */

import { NextResponse } from 'next/server';
import { buildPractice } from '@/lib/app/practice';
import { calculateDayNumerology } from '@/server/engines/dayNumerology';
import { limitRequest } from '@/server/rateLimit';
import { authenticateApp } from '@/server/appAuth';

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'app');
  if (limited) return limited;
  try {
    const auth = await authenticateApp(request);
    if (!auth.ok) return auth.response;
    const lead = auth.lead;

    let body: { localDate?: unknown };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const localDate =
      typeof body.localDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.localDate) && !Number.isNaN(Date.parse(body.localDate))
        ? body.localDate
        : null;

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
