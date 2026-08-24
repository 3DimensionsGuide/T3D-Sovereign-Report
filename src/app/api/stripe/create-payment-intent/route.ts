/**
 * POST /api/stripe/create-payment-intent
 *
 * Creates a Stripe PaymentIntent for the $97 Sovereign Report.
 * Called by the checkout page on mount.
 * Returns the clientSecret needed to confirm payment client-side.
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
});

// $44.00 in cents
const REPORT_PRICE_CENTS = 4400;

export async function POST(request: Request) {
  try {
    const { leadId, email, name } = await request.json() as {
      leadId: number;
      email:  string;
      name:   string;
    };

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   REPORT_PRICE_CENTS,
      currency: 'usd',

      // Metadata ties the payment back to the lead in your database
      metadata: {
        leadId:  String(leadId ?? ''),
        email,
        product: 'Sovereign Report',
      },

      // Stripe sends a receipt email automatically when provided
      receipt_email: email || undefined,
      description:   'T3D Sovereign Report — Complete Natal Analysis (100 pages)',

      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error: unknown) {
    console.error('[Stripe] PaymentIntent creation failed:', error);
    const message = error instanceof Error ? error.message : 'Payment setup failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
