/**
 * POST /api/app/glossary
 * The list of every glossary term (title and one-line summary) for the
 * app's searchable Glossary screen. Detail comes from /api/app/explain.
 *
 * Body: { leadId: number, email: string }
 */

import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { leads } from '@/server/db/schema';
import { listEntries } from '@/lib/app/glossary';

interface GlossaryRequest {
  leadId?: unknown;
  email?: unknown;
}

const NOT_FOUND = { success: false, error: 'We could not find that chart. Please recalculate it.' };

export async function POST(request: Request): Promise<NextResponse> {
  try {
    let body: GlossaryRequest;
    try {
      body = (await request.json()) as GlossaryRequest;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const leadId = Number(body.leadId);
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
    if (!Number.isInteger(leadId) || leadId < 1 || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'leadId and a valid email are required' }, { status: 400 });
    }

    const rows = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    const lead = rows[0];
    if (!lead || lead.email.toLowerCase().trim() !== email) {
      return NextResponse.json(NOT_FOUND, { status: 404 });
    }

    return NextResponse.json(
      { success: true, data: { entries: listEntries() } },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error: unknown) {
    console.error('[T3D Glossary Error]', error);
    return NextResponse.json({ success: false, error: 'Could not load the glossary. Please try again.' }, { status: 500 });
  }
}
