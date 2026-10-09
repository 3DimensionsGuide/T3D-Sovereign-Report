/**
 * POST /api/app/explain
 * One glossary entry ("tap any term"), with a personal "In your chart" line.
 *
 * Body: { leadId: number, email: string, id: string }
 *   id examples: "astro:planet:saturn", "hd:gate:41", "num:7"
 *
 * Same access rule as the other app routes.
 */

import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { leads } from '@/server/db/schema';
import { buildEntry, type ChartContext } from '@/lib/app/glossary';

interface ExplainRequest {
  leadId?: unknown;
  email?: unknown;
  id?: unknown;
}

const NOT_FOUND = { success: false, error: 'We could not find that chart. Please recalculate it.' };
const ID_PATTERN = /^[A-Za-z0-9:_\-/ .]{1,64}$/;

export async function POST(request: Request): Promise<NextResponse> {
  try {
    let body: ExplainRequest;
    try {
      body = (await request.json()) as ExplainRequest;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const leadId = Number(body.leadId);
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
    const id = typeof body.id === 'string' ? body.id : '';
    if (!Number.isInteger(leadId) || leadId < 1 || !email.includes('@') || !ID_PATTERN.test(id)) {
      return NextResponse.json({ success: false, error: 'leadId, a valid email and an id are required' }, { status: 400 });
    }

    const rows = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    const lead = rows[0];
    if (!lead || lead.email.toLowerCase().trim() !== email) {
      return NextResponse.json(NOT_FOUND, { status: 404 });
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
      { success: true, data: entry },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error: unknown) {
    console.error('[T3D Explain Error]', error);
    return NextResponse.json({ success: false, error: 'Could not load that explanation. Please try again.' }, { status: 500 });
  }
}
