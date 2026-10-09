/**
 * POST /api/app/transit-card
 * Meaning card for one transit on the T3D app's Today screen.
 *
 * Body: { leadId, email, transiting, natal, aspect, nature, orb, peak, applying }
 *
 * Access check: the lead id must be paired with the email on that lead. A
 * wrong id and a wrong email get the identical 404. Every transit field is
 * checked against a fixed list before use.
 */

import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { leads } from '@/server/db/schema';
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

const NOT_FOUND = { success: false, error: 'We could not find that chart. Please recalculate it.' };

function oneOf<T extends string>(list: readonly T[], value: unknown): T | null {
  return typeof value === 'string' && (list as readonly string[]).includes(value) ? (value as T) : null;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const leadId = Number(body.leadId);
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
    if (!Number.isInteger(leadId) || leadId < 1 || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'leadId and a valid email are required' }, { status: 400 });
    }

    const transiting: Body | null = oneOf(TRANSIT_BODIES, body.transiting);
    const natal: Natal | null = oneOf(TRANSIT_NATALS, body.natal);
    const aspect: Aspect | null = oneOf(TRANSIT_ASPECTS, body.aspect);
    const nature: Nature | null = oneOf(TRANSIT_NATURES, body.nature);
    const orb = typeof body.orb === 'number' && Number.isFinite(body.orb) ? Math.abs(body.orb) : null;
    if (!transiting || !natal || !aspect || !nature || orb === null || orb > 10) {
      return NextResponse.json({ success: false, error: 'That transit could not be read.' }, { status: 400 });
    }

    const rows = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    const lead = rows[0];
    if (!lead || lead.email.toLowerCase().trim() !== email) {
      return NextResponse.json(NOT_FOUND, { status: 404 });
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
