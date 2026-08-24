/**
 * POST /api/stripe/webhook
 *
 * Listens for Stripe payment events and updates the corresponding lead's
 * purchase status in the database. This is the piece that actually lets
 * a paying customer access their report — without it, reportPurchased
 * never flips to true and /api/generate-report blocks everyone.
 *
 * Handles:
 *   payment_intent.succeeded      → marks lead as purchased
 *   payment_intent.payment_failed → logs the failure (no DB change)
 *
 * IMPORTANT: This route reads the raw request body (via request.text())
 * rather than request.json(), because Stripe's signature verification
 * requires the exact, unparsed byte content of the payload. If you parse
 * it as JSON first, signature verification will always fail.
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db }    from '@/server/db';
import { leads } from '@/server/db/schema';
import { eq }    from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-07-29.dahlia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Ensure this route is never statically evaluated — webhooks are always
// live, per-request calls.
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // ── 1. Read the raw body — required for signature verification ───────────
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('[Stripe Webhook] Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  if (!webhookSecret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  // ── 2. Verify the event actually came from Stripe ─────────────────────────
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Stripe Webhook] Signature verification failed:', message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // ── 3. Handle the event ───────────────────────────────────────────────────
  try {
    switch (event.type) {

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const leadIdRaw = paymentIntent.metadata?.leadId;

        if (!leadIdRaw) {
          console.warn(
            '[Stripe Webhook] payment_intent.succeeded has no leadId in metadata:',
            paymentIntent.id
          );
          break;
        }

        const leadId = parseInt(leadIdRaw, 10);
        if (isNaN(leadId)) {
          console.warn('[Stripe Webhook] leadId metadata is not a valid number:', leadIdRaw);
          break;
        }

        // Idempotent: safe to run even if Stripe sends this event more
        // than once (which it does occasionally, by design).
        await db.update(leads)
          .set({ reportPurchased: true })
          .where(eq(leads.id, leadId));

        console.log(
          `[Stripe Webhook] ✓ Lead ${leadId} marked as purchased ` +
          `(PaymentIntent ${paymentIntent.id}, $${(paymentIntent.amount / 100).toFixed(2)})`
        );
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.warn(
          `[Stripe Webhook] ✗ Payment failed for PaymentIntent ${paymentIntent.id}: ` +
          `${paymentIntent.last_payment_error?.message ?? 'no error message'}`
        );
        // No DB change — reportPurchased stays false, customer can retry checkout.
        break;
      }

      default: {
        // Any other event type Stripe sends — acknowledge but take no action.
        // Uncomment to see what else Stripe is sending during testing:
        // console.log('[Stripe Webhook] Unhandled event type:', event.type);
        break;
      }
    }

    // ── 4. Acknowledge receipt ────────────────────────────────────────────
    // Must return 200 quickly — Stripe retries on non-2xx or timeout.
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: unknown) {
    // If OUR handling failed (e.g. DB was down), return 500 so Stripe
    // retries this same event later rather than silently losing it.
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Stripe Webhook] Handler error:', message);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

// Webhooks are POST-only.
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed — this endpoint is POST only' }, { status: 405 });
}
