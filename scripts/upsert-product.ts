/**
 * Insert or update a single `products` row.
 *
 * Nothing in this repo seeded the `products` table before now — the
 * existing `sovereign-report` row was created by hand. This gives every
 * future product (and re-runs of this one) a repeatable, committed path
 * instead of another one-off manual insert.
 *
 * Usage:
 *   npx tsx scripts/upsert-product.ts <slug> <name> <description> <priceCents> <generatorKey> [active]
 *
 * Example (the Advanced Sovereign Report, at $97):
 *   npx tsx scripts/upsert-product.ts \
 *     advanced-sovereign-report \
 *     "Advanced Sovereign Report" \
 *     "The Vehicle, the Road, and the Stoplight — deepened. Every gate and channel, every Pinnacle and Challenge, every personal and outer planet, plus your live transits." \
 *     9700 \
 *     advanced-sovereign-report
 *
 * Idempotent: re-running with the same slug updates that row (by its
 * unique slug index) instead of erroring or duplicating it.
 *
 * Requires DATABASE_URL to be reachable — run this from wherever that's
 * true (e.g. `node --env-file=.env.local -e "require('tsx/cjs'); require('./scripts/upsert-product.ts')"`
 * if your shell doesn't already have it exported).
 */

import { db } from '../src/server/db';
import { products } from '../src/server/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const [slug, name, description, priceCentsStr, generatorKey, activeStr] = process.argv.slice(2);

  if (!slug || !name || !description || !priceCentsStr || !generatorKey) {
    console.error(
      'Usage: npx tsx scripts/upsert-product.ts <slug> <name> <description> <priceCents> <generatorKey> [active]'
    );
    process.exit(1);
  }

  const priceCents = parseInt(priceCentsStr, 10);
  if (isNaN(priceCents) || priceCents <= 0) {
    console.error(`priceCents must be a positive integer, got: "${priceCentsStr}"`);
    process.exit(1);
  }

  const active = activeStr === undefined ? true : activeStr !== 'false';

  const existing = await db.select().from(products).where(eq(products.slug, slug)).limit(1);

  if (existing[0]) {
    await db.update(products)
      .set({ name, description, priceCents, generatorKey, active, updatedAt: new Date() })
      .where(eq(products.slug, slug));
    console.log(`Updated product "${slug}" (id ${existing[0].id}): $${(priceCents / 100).toFixed(2)}, generatorKey "${generatorKey}", active=${active}`);
  } else {
    const [inserted] = await db.insert(products)
      .values({ slug, name, description, priceCents, generatorKey, active })
      .returning();
    console.log(`Inserted product "${slug}" (id ${inserted.id}): $${(priceCents / 100).toFixed(2)}, generatorKey "${generatorKey}", active=${active}`);
  }

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
