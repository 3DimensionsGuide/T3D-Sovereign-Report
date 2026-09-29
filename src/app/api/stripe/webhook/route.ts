/**
 * POST /api/stripe/webhook
 *
 * Listens for Stripe payment events and updates the corresponding order's
 * status in the database. This is the piece that actually lets a paying
 * customer receive their product — without it, no order ever reaches
 * 'paid' and nothing gets generated or emailed.
 *
 * Handles:
 *   payment_intent.succeeded      → marks the order 'paid', triggers delivery
 *   payment_intent.payment_failed → marks the order 'failed'
 *
 * IMPORTANT: This route reads the raw request body (via request.text())
 * rather than request.json(), because Stripe's signature verification
 * requires the exact, unparsed byte content of the payload. If you parse
 * it as JSON first, signature verification will always fail.
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { waitUntil } from '@vercel/functions';
import { db }    from '@/server/db';
import { leads, orders } from '@/server/db/schema';
import { eq }    from 'drizzle-orm';
import { getOrderByPaymentIntentId, getProductById } from '@/lib/products/queries';
import { generateAndEmailReport } from '@/lib/report/generateAndEmailReport';

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

        const order = await getOrderByPaymentIntentId(paymentIntent.id);
        if (!order) {
          console.warn(
            '[Stripe Webhook] payment_intent.succeeded has no matching order:',
            paymentIntent.id
          );
          break;
        }

        // Idempotent: safe to run even if Stripe sends this event more
        // than once (which it does occasionally, by design) — re-marking
        // an already-'paid' order and re-triggering delivery is harmless
        // aside from a possible duplicate email, which is an acceptable
        // trade-off against ever missing delivery.
        await db.update(orders)
          .set({ status: 'paid', updatedAt: new Date() })
          .where(eq(orders.id, order.id));

        // Legacy mirror: rows/routes that pre-date the orders table still
        // read leads.reportPurchased directly. Only set for the Sovereign
        // Report so it keeps meaning what it always meant.
        const product = await getProductById(order.productId);
        if (product?.slug === 'sovereign-report') {
          await db.update(leads)
            .set({ reportPurchased: true })
            .where(eq(leads.id, order.leadId));
        }

        console.log(
          `[Stripe Webhook] ✓ Order ${order.id} (lead ${order.leadId}, ${product?.name ?? 'unknown product'}) marked paid ` +
          `(PaymentIntent ${paymentIntent.id}, $${(paymentIntent.amount / 100).toFixed(2)})`
        );

        // Generate the deliverable and email it, in the background — AFTER
        // this handler has already returned its response to Stripe below.
        // waitUntil() keeps the serverless function alive long enough to
        // finish this work without delaying or risking Stripe's expected
        // fast response (PDF generation + synthesis can take several
        // seconds, which would otherwise risk a timeout/retry).
        waitUntil(generateAndEmailReport(order.id));

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.warn(
          `[Stripe Webhook] ✗ Payment failed for PaymentIntent ${paymentIntent.id}: ` +
          `${paymentIntent.last_payment_error?.message ?? 'no error message'}`
        );

        const order = await getOrderByPaymentIntentId(paymentIntent.id);
        if (order) {
          await db.update(orders)
            .set({ status: 'failed', updatedAt: new Date() })
            .where(eq(orders.id, order.id));
        }
        // Customer can retry checkout, which opens a fresh order.
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
