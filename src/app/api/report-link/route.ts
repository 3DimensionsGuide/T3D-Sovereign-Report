/**
 * POST /api/report-link
 * Body: { orderId: number, paymentIntentId: string }
 *
 * Called by the /report page right after Stripe sends the buyer back. Stripe puts the
 * PaymentIntent id (pi_...) in the return address. Only the buyer's browser has it, so
 * it proves this visitor made the payment. If it matches the order and the payment
 * went through, this returns a short-lived signed download link (15 minutes).
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getOrderById } from '@/lib/products/queries';
import { PAGE_LINK_SECONDS, reportDownloadUrl } from '@/server/reportLinks';
import { limitRequest } from '@/server/rateLimit';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-07-29.dahlia' });

const DENIED = { success: false, error: 'We could not confirm this purchase. Please use the link in your email.' };

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'reportLink');
  if (limited) return limited;
  try {
    let body: { orderId?: unknown; paymentIntentId?: unknown };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 });
    }

    const orderId = Number(body.orderId);
    const pi = typeof body.paymentIntentId === 'string' ? body.paymentIntentId : '';
    if (!Number.isInteger(orderId) || orderId < 1 || !/^pi_[A-Za-z0-9_]{8,}$/.test(pi)) {
      return NextResponse.json(DENIED, { status: 404 });
    }

    const order = await getOrderById(orderId);
    if (!order || order.stripePaymentIntentId !== pi || order.status === 'refunded' || order.status === 'failed') {
      return NextResponse.json(DENIED, { status: 404 });
    }

    // The webhook can arrive a moment after the buyer does, so also ask Stripe directly.
    if (order.status !== 'paid') {
      const intent = await stripe.paymentIntents.retrieve(pi);
      if (intent.status !== 'succeeded') {
        return NextResponse.json(
          { success: false, error: 'Your payment is still being confirmed. Please try again in a moment.' },
          { status: 409 },
        );
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const url = reportDownloadUrl(siteUrl, orderId, PAGE_LINK_SECONDS);
    if (!url) {
      console.error('[Report Link] No signing secret is configured.');
      return NextResponse.json(
        { success: false, error: 'Downloads are not available right now. Please use the link in your email.' },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { success: true, url: new URL(url).pathname + new URL(url).search },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error: unknown) {
    console.error('[Report Link Error]', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json(
      { success: false, error: 'Could not prepare your download. Please try again.' },
      { status: 500 },
    );
  }
}
