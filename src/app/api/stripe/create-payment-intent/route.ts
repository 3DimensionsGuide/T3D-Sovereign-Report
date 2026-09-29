/**
 * POST /api/stripe/create-payment-intent
 *
 * Creates a Stripe PaymentIntent for a product, looked up by slug (default
 * 'sovereign-report' so existing callers that don't send one yet keep
 * working). Also opens the `orders` row that ties the lead to the product
 * through this PaymentIntent, so the webhook has something to mark 'paid'
 * and the generation routes have something to check instead of the old
 * single `leads.reportPurchased` boolean.
 *
 * Returns the clientSecret needed to confirm payment client-side, plus the
 * product's name/price/description so the checkout page can render itself
 * generically instead of hardcoding one product's copy.
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/server/db';
import { orders } from '@/server/db/schema';
import { getProductBySlug } from '@/lib/products/queries';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-07-29.dahlia',
});

const DEFAULT_PRODUCT_SLUG = 'sovereign-report';

export async function POST(request: Request) {
  try {
    const { leadId, email, name, productSlug } = await request.json() as {
      leadId:      number;
      email:       string;
      name:        string;
      productSlug?: string;
    };

    const slug = productSlug || DEFAULT_PRODUCT_SLUG;
    const product = await getProductBySlug(slug);

    if (!product || !product.active) {
      return NextResponse.json({ error: `Unknown or inactive product: ${slug}` }, { status: 404 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   product.priceCents,
      currency: 'usd',

      // Metadata ties the payment back to the lead and product in our DB.
      metadata: {
        leadId:      String(leadId ?? ''),
        email,
        product:     product.name,
        productSlug: product.slug,
      },

      // Stripe sends a receipt email automatically when provided
      receipt_email: email || undefined,
      description:   `T3D ${product.name} — ${product.description}`,

      automatic_payment_methods: { enabled: true },
    });

    await db.insert(orders).values({
      leadId,
      productId:             product.id,
      status:                'pending',
      stripePaymentIntentId: paymentIntent.id,
      amountCents:           product.priceCents,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      product: {
        slug:        product.slug,
        name:        product.name,
        description: product.description,
        priceCents:  product.priceCents,
      },
    });

  } catch (error: unknown) {
    console.error('[Stripe] PaymentIntent creation failed:', error);
    const message = error instanceof Error ? error.message : 'Payment setup failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
