/**
 * Small DB helpers shared by the checkout/Stripe/generation routes so
 * none of them hand-roll their own products lookup.
 */

import { db } from '@/server/db';
import { products, orders, type Product, type Order } from '@/server/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getProductById(id: number): Promise<Product | null> {
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return rows[0] ?? null;
}

// Active products, cheapest first — the authoritative (DB) side of the
// pricing page. Pairs with PRODUCT_DISPLAY (src/lib/products/catalog.ts)
// for the marketing copy each row doesn't carry.
export async function getActiveProducts(): Promise<Product[]> {
  return db.select().from(products).where(eq(products.active, true)).orderBy(asc(products.priceCents));
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
