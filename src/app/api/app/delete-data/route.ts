/**
 * POST /api/app/delete-data
 * "Delete my data" in the T3D app.
 *
 * Body: { confirm: true }
 *
 * Removes every saved record for that email. Records that an order points to
 * are kept only as a blanked shell, so payment history stays intact without any
 * personal details. Stripe and Resend keep their own records under their own
 * policies; the privacy page says so.
 *
 * Auth: an Authorization: Bearer header carrying the app's session token. See
 * src/server/appAuth.ts — there is no email address in any app request any more.
 */

import { NextResponse } from 'next/server';
import { eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/server/db';
import { leads, orders } from '@/server/db/schema';
import { blankedLead, planDeletion } from '@/server/dataDeletion';
import { limitRequest } from '@/server/rateLimit';
import { authenticateApp } from '@/server/appAuth';

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'app');
  if (limited) return limited;
  try {
    const auth = await authenticateApp(request);
    if (!auth.ok) return auth.response;
    const lead = auth.lead;

    let body: { confirm?: unknown };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }

    if (body.confirm !== true) {
      return NextResponse.json({ success: false, error: 'Deleting needs confirmation.' }, { status: 400 });
    }

    const mine = await db.select({ id: leads.id }).from(leads).where(eq(leads.email, lead.email));
    const ids = mine.map((r) => r.id);
    const withOrders = ids.length
      ? await db.select({ leadId: orders.leadId }).from(orders).where(inArray(orders.leadId, ids))
      : [];
    const plan = planDeletion(ids, new Set(withOrders.map((o) => o.leadId)));

    for (const id of plan.blankIds) {
      // Raising the session number ends every app session for this lead at once: the row has to
      // stay because an order points at it, so without this a token handed out earlier would still
      // be signed correctly and would open the blanked shell. A removed lead needs no such step —
      // there is no row left to look up.
      await db.update(leads).set({
        ...blankedLead(id),
        sessionEpoch: sql`${leads.sessionEpoch} + 1`,
        updatedAt: new Date(),
      }).where(eq(leads.id, id));
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
