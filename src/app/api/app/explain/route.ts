/**
 * POST /api/app/explain
 * One glossary entry ("tap any term"), with a personal "In your chart" line.
 *
 * Body: { id: string, premium?: boolean }
 *   id examples: "astro:planet:saturn", "hd:gate:41", "num:7"
 *
 * Auth: an Authorization: Bearer header carrying the app's session token. See
 * src/server/appAuth.ts — there is no email address in any app request any more.
 */

import { NextResponse } from 'next/server';
import { buildEntry, gateEntry, type ChartContext } from '@/lib/app/glossary';
import { limitRequest } from '@/server/rateLimit';
import { authenticateApp } from '@/server/appAuth';

interface ExplainRequest {
  id?: unknown;
  /** Whether the person has Premium. Without it the long explanation is not sent. */
  premium?: unknown;
}

const ID_PATTERN = /^[A-Za-z0-9:_\-/ .]{1,64}$/;

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'app');
  if (limited) return limited;
  try {
    const auth = await authenticateApp(request);
    if (!auth.ok) return auth.response;
    const lead = auth.lead;

    let body: ExplainRequest;
    try {
      body = (await request.json()) as ExplainRequest;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const id = typeof body.id === 'string' ? body.id : '';
    if (!ID_PATTERN.test(id)) {
      return NextResponse.json({ success: false, error: 'An id is required' }, { status: 400 });
    }

    const results = lead.results as unknown as {
      humanDesign?: ChartContext['hd'];
      astrology?: { tropical?: ChartContext['tropical'] };
      numerology?: ChartContext['numerology'];
    } | null;
    const ctx: ChartContext = {
      hd: results?.humanDesign ?? null,
      tropical: results?.astrology?.tropical ?? null,
      numerology: results?.numerology ?? null,
    };

    const entry = buildEntry(id, ctx);
    if (!entry) {
      return NextResponse.json({ success: false, error: 'We do not have an explanation for that term yet.' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, data: gateEntry(entry, body.premium === true) },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error: unknown) {
    console.error('[T3D Explain Error]', error);
    return NextResponse.json({ success: false, error: 'Could not load that explanation. Please try again.' }, { status: 500 });
  }
}
