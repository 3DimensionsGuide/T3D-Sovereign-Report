/**
 * T3D Database Schema — Drizzle ORM (PostgreSQL)
 *
 * Defines the `leads` table used to persist every calculator submission.
 * Run `npx drizzle-kit push:pg` (or generate + migrate) to apply.
 *
 * Required env var: DATABASE_URL (e.g. "postgresql://user:pass@host:5432/t3d")
 *
 * npm install drizzle-orm postgres
 * npm install --save-dev drizzle-kit @types/pg
 */

import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  jsonb,
  boolean,
  doublePrecision,
  index,
  uniqueIndex,
  primaryKey,
} from 'drizzle-orm/pg-core';

// ─── LEADS TABLE ─────────────────────────────────────────────────────────────
//
// One row per calculator submission. Stores raw birth data and full results as
// JSONB so the schema is flexible as the calculation engines evolve.

export const leads = pgTable(
  'leads',
  {
    id: serial('id').primaryKey(),

    // Identity
    email:     text('email').notNull(),
    firstName: text('first_name').notNull(),
    lastName:  text('last_name').notNull(),
    middleName: text('middle_name'),

    // Birth data (serialised for reproducibility)
    birthData: jsonb('birth_data').$type<{
      date: string;       // YYYY-MM-DD
      time: string;       // HH:MM
      place: {
        city: string;
        country: string;
        latitude: number;
        longitude: number;
        timezone: string;
      };
    }>().notNull(),

    // Full calculation results (all three engines)
    results: jsonb('results').$type<{
      astrology:   Record<string, unknown>;
      numerology:  Record<string, unknown>;
      humanDesign: Record<string, unknown>;
    }>().notNull(),

    // Marketing / consent
    emailOptIn:    boolean('email_opt_in').default(false).notNull(),
    // When and where the person ticked the marketing box (null = never, or given before we recorded it)
    emailOptInAt:     timestamp('email_opt_in_at', { withTimezone: true }),
    emailOptInSource: text('email_opt_in_source'),
    // A pending one-time email code (keyed hash only, never the code itself)
    optInCodeHash:      text('opt_in_code_hash'),
    optInCodeExpiresAt: timestamp('opt_in_code_expires_at', { withTimezone: true }),
    optInCodeAttempts:  integer('opt_in_code_attempts').default(0).notNull(),
    reportPurchased: boolean('report_purchased').default(false).notNull(),

    // The lead's session number. Raising it makes every app session token already handed out for
    // this lead stop working, which is how deleting your data revokes app access without keeping a
    // list of live tokens anywhere. See src/server/appTokens.ts.
    sessionEpoch: integer('session_epoch').default(1).notNull(),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index('leads_email_idx').on(table.email),
  }),
);

export type Lead        = typeof leads.$inferSelect;
export type NewLead     = typeof leads.$inferInsert;

// ─── PRODUCTS TABLE ──────────────────────────────────────────────────────────
//
// One row per purchasable product (the Sovereign Report, Advanced Sovereign
// Report, Astrocartography, Relationship Dynamics, ...). Checkout, Stripe,
// and report generation all look products up by `slug` instead of having
// any one product hardcoded into the pipeline.

export const products = pgTable(
  'products',
  {
    id: serial('id').primaryKey(),

    // Stable identifier used in URLs, Stripe metadata, and the generator
    // registry (src/lib/products/registry.ts) — e.g. 'sovereign-report'.
    slug: text('slug').notNull(),

    // Customer-facing name and description (also used as the Stripe
    // PaymentIntent description).
    name:        text('name').notNull(),
    description: text('description').notNull(),

    priceCents: integer('price_cents').notNull(),

    // Key into PRODUCT_GENERATORS — which generator function builds this
    // product's deliverable (PDF today; could be other formats later).
    generatorKey: text('generator_key').notNull(),

    active: boolean('active').default(true).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex('products_slug_idx').on(table.slug),
  }),
);

export type Product    = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

// ─── ORDERS TABLE ────────────────────────────────────────────────────────────
//
// One row per purchase attempt, tying a lead to a product through a Stripe
// PaymentIntent. Replaces the old single `leads.reportPurchased` boolean as
// the source of truth once a lead can buy more than one product; that
// column is kept in place (and still set for Sovereign Report purchases)
// for backward compatibility with rows/routes that pre-date this table.

export const orders = pgTable(
  'orders',
  {
    id: serial('id').primaryKey(),

    leadId:    integer('lead_id').notNull().references(() => leads.id),
    productId: integer('product_id').notNull().references(() => products.id),

    // 'pending' → PaymentIntent created, not yet confirmed
    // 'paid'    → payment_intent.succeeded received
    // 'failed'  → payment_intent.payment_failed received
    // 'refunded' → manually marked after a Stripe refund
    status: text('status').$type<'pending' | 'paid' | 'failed' | 'refunded'>()
      .default('pending').notNull(),

    stripePaymentIntentId: text('stripe_payment_intent_id').notNull(),

    // Snapshot of what was actually charged, independent of the product's
    // current price (which may change after this order was placed).
    amountCents: integer('amount_cents').notNull(),

    // Set once the PDF has been generated and emailed successfully.
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    leadIdx:            index('orders_lead_idx').on(table.leadId),
    paymentIntentIdx:   uniqueIndex('orders_payment_intent_idx').on(table.stripePaymentIntentId),
  }),
);

export type Order    = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;


// ─── PLACES TABLE ────────────────────────────────────────────────────────────
//
// Birth places already looked up. Somewhere's coordinates and time zone do not change, so a place
// is asked about once and read from here afterwards. GeoNames' free tier has hourly and daily
// credit ceilings and no fallback provider behind it, and before this every single chart spent one
// — which would have run out first at exactly the moment traffic arrived.
//
// Nothing here is personal: a row is a city name and where it is. Several people born in the same
// city share one row, and a row says nothing about who asked.

export const places = pgTable(
  'places',
  {
    id: serial('id').primaryKey(),

    // The question that was asked, folded to one form: "city|country", lower case, spacing
    // collapsed. See placeCacheKey() in src/server/geocoding.ts.
    query: text('query').notNull(),

    // What GeoNames called it, for example "Paris, Île-de-France, France". Shown nowhere yet; kept
    // so a surprising cache entry can be recognised without re-querying.
    label: text('label').notNull(),

    latitude:  doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    // IANA identifier, for example "America/New_York".
    timezone:  text('timezone').notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    queryIdx: uniqueIndex('places_query_idx').on(table.query),
  }),
);

export type Place    = typeof places.$inferSelect;
export type NewPlace = typeof places.$inferInsert;

// ─── APP EVENTS TABLE ────────────────────────────────────────────────────────
// Anonymous daily counts of which app screens were opened. One row per day and
// screen, holding only a number. There is no person, device, IP address or
// chart id in it, so a row can never be traced back to anyone.

export const appEvents = pgTable(
  'app_events',
  {
    /** UTC day, YYYY-MM-DD. */
    day:   text('day').notNull(),
    /** One of APP_EVENTS, for example "screen_today". */
    event: text('event').notNull(),
    count: integer('count').notNull().default(0),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.day, table.event] }),
  }),
);
