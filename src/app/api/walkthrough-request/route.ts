/**
 * POST /api/walkthrough-request
 *
 * Body: { leadId: number, note?: string }
 *
 * Somebody who has bought a report asking to have it walked through. This does not take payment
 * and does not promise anything: it sends the request on, and a person answers it. Payment
 * happens only once that person has agreed they can do it, which is the whole reason this is a
 * request rather than a checkout.
 *
 * The reply address comes from the lead row, never from the request body — otherwise this would
 * be a way to find out whether an address is on file, and a way to have mail sent somewhere of
 * the sender's choosing.
 */

import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';
import { db } from '@/server/db';
import { leads } from '@/server/db/schema';
import { REPORT_FROM, SUPPORT_EMAIL } from '@/lib/contact';
import { limitRequest } from '@/server/rateLimit';
import { WALKTHROUGH, walkthroughAvailable } from '@/lib/walkthrough';

const NOTE_LIMIT = 600;

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The same answer whether or not the lead exists, so nothing can be learned by guessing ids. */
const RECEIVED = {
  success: true,
  data: { received: true },
} as const;

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'app');
  if (limited) return limited;

  try {
    if (!walkthroughAvailable()) {
      return NextResponse.json(
        { success: false, error: 'Walkthroughs are not available right now.' },
        { status: 404 },
      );
    }

    let body: { leadId?: unknown; note?: unknown };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const leadId = typeof body.leadId === 'number' && Number.isInteger(body.leadId) ? body.leadId : null;
    if (!leadId || leadId < 1) {
      return NextResponse.json({ success: false, error: 'A lead id is required.' }, { status: 400 });
    }
    const note = typeof body.note === 'string' ? body.note.trim().slice(0, NOTE_LIMIT) : '';

    const [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);

    // Answered the same way whether the lead is there or not. A request that reported "no such
    // person" would be a way to walk the ids and find out who has bought something.
    if (!lead || !lead.email) return NextResponse.json(RECEIVED);

    const name = [lead.firstName, lead.lastName].filter(Boolean).join(' ') || 'Someone';
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || REPORT_FROM,
      to: SUPPORT_EMAIL,
      replyTo: lead.email,
      subject: `Walkthrough request — ${name}`,
      html: `
        <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 520px; color: #0D0D0E;">
          <p style="font-size: 15px; line-height: 1.7;">
            <strong>${escapeHtml(name)}</strong> has asked for a walkthrough of their report.
          </p>
          <p style="font-size: 14px; line-height: 1.7; color: #333;">
            Lead #${lead.id} · ${escapeHtml(lead.email)}<br />
            Offer as it stands: ${escapeHtml(WALKTHROUGH.priceLabel ?? '')},
            about ${WALKTHROUGH.minutes} minutes, ${escapeHtml(WALKTHROUGH.turnaround)}.
          </p>
          ${note ? `<p style="font-size: 14px; line-height: 1.7; color: #333;"><em>${escapeHtml(note)}</em></p>` : ''}
          <p style="font-size: 13px; line-height: 1.6; color: #888;">
            Nothing has been charged. Reply to this email to say yes and send a payment link, or to
            say you cannot take it on right now.
          </p>
        </div>
      `,
    });

    return NextResponse.json(RECEIVED);
  } catch (error) {
    console.error('[T3D Walkthrough Request Error]', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json(
      { success: false, error: 'We could not send that just now. Please try again.' },
      { status: 500 },
    );
  }
}
