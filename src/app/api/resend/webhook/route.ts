/**
 * POST /api/resend/webhook
 *
 * Resend telling us what happened to the marketing list. One event matters:
 * contact.updated with unsubscribed true, which is somebody using the unsubscribe link.
 *
 * Without this the database would go on saying they want email. The column would claim a consent
 * that had been withdrawn, and the next time the list was rebuilt from it they would be put back
 * on — which is the failure that turns an unsubscribe into a complaint.
 *
 * Signed with Svix headers, like Resend's other webhooks. An unsigned or wrongly signed request
 * is refused: an endpoint that turns consent off for any address it is given is an endpoint for
 * turning other people's consent off. The checking itself is in src/server/svix.ts, where it can
 * be tested without a database connection.
 */

import { NextResponse } from 'next/server';
import { limitRequest } from '@/server/rateLimit';
import { verifySvix } from '@/server/svix';
import { recordUnsubscribe } from '@/server/audience';

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'app');
  if (limited) return limited;

  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    // Not configured is not an error anybody should be told about in detail.
    return NextResponse.json({ received: true });
  }

  // The raw body, before parsing: the signature is over the bytes that were sent.
  const body = await request.text();
  const ok = verifySvix(
    secret,
    request.headers.get('svix-id') ?? '',
    request.headers.get('svix-timestamp') ?? '',
    body,
    request.headers.get('svix-signature') ?? '',
    Math.floor(Date.now() / 1000),
  );
  if (!ok) {
    return NextResponse.json({ error: 'Bad signature' }, { status: 401 });
  }

  let event: { type?: unknown; data?: { email?: unknown; unsubscribed?: unknown } };
  try {
    event = JSON.parse(body) as typeof event;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const unsubscribed = event.data?.unsubscribed === true;
    const email = typeof event.data?.email === 'string' ? event.data.email : '';
    if (unsubscribed && email) {
      const rows = await recordUnsubscribe(email);
      // Counted, not named: a log line with an address in it is a copy of the address.
      console.log(`[T3D Resend] unsubscribe recorded on ${rows} row${rows === 1 ? '' : 's'}`);
    }
  } catch (error) {
    console.error('[T3D Resend] could not record an unsubscribe:', error instanceof Error ? error.message : 'unknown');
    // Answer 500 so Resend retries. Losing an unsubscribe is the one failure worth retrying for.
    return NextResponse.json({ error: 'Could not record it' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
