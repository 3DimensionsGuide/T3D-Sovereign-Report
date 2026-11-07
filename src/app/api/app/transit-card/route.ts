/**
 * POST /api/app/transit-card
 * Meaning card for one transit on the T3D app's Today screen.
 *
 * Body: { transiting, natal, aspect, nature, orb, peak, applying }
 *
 * Auth: an Authorization: Bearer header carrying the app's session token. See
 * src/server/appAuth.ts — there is no email address in any app request any more.
 */

import { NextResponse } from 'next/server';
import { limitRequest } from '@/server/rateLimit';
import { authenticateApp } from '@/server/appAuth';
import {
  buildTransitCard,
  TRANSIT_ASPECTS,
  TRANSIT_BODIES,
  TRANSIT_NATALS,
  TRANSIT_NATURES,
  type Aspect,
  type Body,
  type Natal,
  type Nature,
} from '@/lib/app/transitCard';

function oneOf<T extends string>(list: readonly T[], value: unknown): T | null {
  return typeof value === 'string' && (list as readonly string[]).includes(value) ? (value as T) : null;
}

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'app');
  if (limited) return limited;
  try {
    const auth = await authenticateApp(request);
    if (!auth.ok) return auth.response;
    const lead = auth.lead;

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const transiting: Body | null = oneOf(TRANSIT_BODIES, body.transiting);
    const natal: Natal | null = oneOf(TRANSIT_NATALS, body.natal);
    const aspect: Aspect | null = oneOf(TRANSIT_ASPECTS, body.aspect);
    const nature: Nature | null = oneOf(TRANSIT_NATURES, body.nature);
    const orb = typeof body.orb === 'number' && Number.isFinite(body.orb) ? Math.abs(body.orb) : null;
    if (!transiting || !natal || !aspect || !nature || orb === null || orb > 10) {
      return NextResponse.json({ success: false, error: 'That transit could not be read.' }, { status: 400 });
    }

    const hd = (lead.results as unknown as { humanDesign?: { type?: string; authority?: string } } | null)?.humanDesign;
    const card = buildTransitCard(
      {
        transiting, natal, aspect, nature, orb,
        peak: body.peak === true,
        applying: body.applying === true,
      },
      { type: hd?.type ?? null, authority: hd?.authority ?? null },
    );

    return NextResponse.json({ success: true, data: card }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (error: unknown) {
    console.error('[T3D Transit Card Error]', error);
    return NextResponse.json({ success: false, error: 'Could not load that transit. Please try again.' }, { status: 500 });
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: { Allow: 'POST, OPTIONS' } });
}
