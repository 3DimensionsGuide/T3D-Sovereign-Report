/**
 * POST /api/app/delete-data
 * "Delete my data" in the T3D app.
 *
 * Body: { leadId: number, email: string, confirm: true }
 *
 * Removes every saved record for that email. Records that an order points to
 * are kept only as a blanked shell, so payment history stays intact without any
 * personal details. Stripe and Resend keep their own records under their own
 * policies; the privacy page says so.
 *
 * Access check: the lead id must be paired with the email on that lead. A wrong
 * id and a wrong email get the identical 404, so ids can't be probed.
 */

import { NextResponse } from 'next/server';
import { eq, inArray } from 'drizzle-orm';
import { db } from '@/server/db';
import { leads, orders } from '@/server/db/schema';
import { blankedLead, planDeletion } from '@/server/dataDeletion';
import { limitRequest, noteAccessFailure } from '@/server/rateLimit';

const NOT_FOUND = { success: false, error: 'We could not find that chart. Please recalculate it.' };

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'app');
  if (limited) return limited;
  try {
    let body: { leadId?: unknown; email?: unknown; confirm?: unknown };
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
    if (body.confirm !== true) {
      return NextResponse.json({ success: false, error: 'Deleting needs confirmation.' }, { status: 400 });
    }

    const rows = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    const lead = rows[0];
    if (!lead || lead.email.toLowerCase().trim() !== email) {
      await noteAccessFailure(request);
      return NextResponse.json(NOT_FOUND, { status: 404 });
    }

    const mine = await db.select({ id: leads.id }).from(leads).where(eq(leads.email, lead.email));
    const ids = mine.map((r) => r.id);
    const withOrders = ids.length
      ? await db.select({ leadId: orders.leadId }).from(orders).where(inArray(orders.leadId, ids))
      : [];
    const plan = planDeletion(ids, new Set(withOrders.map((o) => o.leadId)));

    for (const id of plan.blankIds) {
      await db.update(leads).set({ ...blankedLead(id), updatedAt: new Date() }).where(eq(leads.id, id));
    }
    if (plan.removeIds.length) {
      await db.delete(leads).where(inArray(leads.id, plan.removeIds));
    }

    return NextResponse.json({ success: true, data: { removed: plan.removeIds.length, blanked: plan.blankIds.length } });
  } catch (error) {
    console.error('[T3D Delete Data Error]', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json(
      { success: false, error: 'We could not delete your data right now. Please try again.' },
      { status: 500 },
    );
  }
}
