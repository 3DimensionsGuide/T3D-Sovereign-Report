/**
 * T3D Database Connection — Drizzle ORM + postgres.js driver
 *
 * Exports a singleton `db` instance for use in server-side code only.
 * Never import this in client components.
 *
 * Required env var: DATABASE_URL
 *   e.g. postgresql://postgres:password@localhost:5432/t3d_db
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

/**
 * postgres.js client.
 * In serverless environments (Vercel, Netlify) use `max: 1` to prevent
 * connection exhaustion across lambda invocations.
 */
const client = postgres(process.env.DATABASE_URL, {
  max: process.env.NODE_ENV === 'production' ? 10 : 5,
  idle_timeout: 30,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
