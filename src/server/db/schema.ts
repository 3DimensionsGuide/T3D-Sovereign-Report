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
  text,
  timestamp,
  jsonb,
  boolean,
  index,
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
    reportPurchased: boolean('report_purchased').default(false).notNull(),

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
