/**
 * Small DB helpers shared by the checkout/Stripe/generation routes so
 * none of them hand-roll their own products lookup.
 */

import { db } from '@/server/db';
import { products, orders, type Product, type Order } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getProductById(id: number): Promise<Product | null> {
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getOrderByPaymentIntentId(
  paymentIntentId: string
): Promise<Order | null> {
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.stripePaymentIntentId, paymentIntentId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getOrderById(orderId: number): Promise<Order | null> {
  const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return rows[0] ?? null;
}
