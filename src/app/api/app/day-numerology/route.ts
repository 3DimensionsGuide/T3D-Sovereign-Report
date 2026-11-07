/**
 * POST /api/app/day-numerology
 * Universal Day and Personal Day numerology for the Today screen.
 *
 * Body: { localDate: 'YYYY-MM-DD' }
 *
 * Auth: an Authorization: Bearer header carrying the app's session token. See
 * src/server/appAuth.ts — there is no email address in any app request any more.
 */

import { NextResponse } from 'next/server';
import { calculateDayNumerology } from '@/server/engines/dayNumerology';
import { limitRequest } from '@/server/rateLimit';
import { authenticateApp } from '@/server/appAuth';

interface DayNumerologyRequest {
  localDate?: unknown;
}

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'app');
  if (limited) return limited;
  try {
    const auth = await authenticateApp(request);
    if (!auth.ok) return auth.response;
    const lead = auth.lead;

    let body: DayNumerologyRequest;
    try {
      body = (await request.json()) as DayNumerologyRequest;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const localDate = typeof body.localDate === 'string' ? body.localDate : '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate) || Number.isNaN(Date.parse(localDate))) {
      return NextResponse.json({ success: false, error: 'localDate must be YYYY-MM-DD' }, { status: 400 });
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
