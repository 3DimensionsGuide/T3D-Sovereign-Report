/**
 * POST /api/app/email
 * Attaches an email address to the lead this session already belongs to.
 *
 * Body: { email: string, optIn?: boolean }
 *
 * The app shows a person their chart before it asks for an address. The lead row has to exist
 * before that reveal — a session token is only ever minted for the row a calculation writes, so
 * no row means no session and no way to read the chart back. So the row is written without an
 * address and the address arrives here afterwards.
 *
 * The address is never a way in. This endpoint authenticates with the session token and writes
 * to that token's own lead and no other: there is no request anywhere that trades an email
 * address for a chart, and moving the collection later did not change that.
 *
 * Auth: an Authorization: Bearer header carrying the app's session token. See
 * src/server/appAuth.ts.
 */

import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { leads } from '@/server/db/schema';
import { limitRequest } from '@/server/rateLimit';
import { authenticateApp } from '@/server/appAuth';
import { issueOptInCode } from '@/server/optInCode';

const noStore = { 'Cache-Control': 'no-store' };

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'app');
  if (limited) return limited;
  try {
    const auth = await authenticateApp(request);
    if (!auth.ok) return auth.response;
    const lead = auth.lead;

    let body: { email?: unknown; optIn?: unknown };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!email || !email.includes('@') || email.length > 254) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400, headers: noStore },
      );
    }

    // Already settled. The same address again is a retry — a dropped connection, a second tap —
    // and answering it the same way keeps the app from having to tell those apart.
    if (lead.email && lead.email.toLowerCase() === email) {
      return NextResponse.json(
        { success: true, data: { optInCode: 'not-requested' } },
        { headers: noStore },
      );
    }

    // This endpoint attaches an address to a lead that has none. Changing one already set is a
    // different operation with its own consequences — it would move the chart out from under the
    // dedupe rule, which matches on the address — and it does not belong on the same door.
    if (lead.email) {
      return NextResponse.json(
        { success: false, error: 'This profile already has an email address.' },
        { status: 409, headers: noStore },
      );
    }

    await db.update(leads)
      .set({ email, updatedAt: new Date() })
      .where(eq(leads.id, lead.id));

    // Consent is still only recorded when the person types the code back, exactly as it is from a
    // calculation. Ticking the box here only sends it, and it has to be sent after the address is
    // stored: issueOptInCode checks the one given against the one on the row.
    let optInCode: 'not-requested' | 'sent' | 'failed' | 'already-opted-in' = 'not-requested';
    if (body.optIn === true) {
      const issued = await issueOptInCode(lead.id, email);
      optInCode = issued === 'sent' ? 'sent' : issued === 'already-opted-in' ? 'already-opted-in' : 'failed';
    }

    return NextResponse.json({ success: true, data: { leadId: lead.id, optInCode } }, { headers: noStore });
  } catch (error) {
    console.error('[T3D Attach Email Error]', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json(
      { success: false, error: 'We could not save your email just now. Please try again.' },
      { status: 500, headers: noStore },
    );
  }
}
