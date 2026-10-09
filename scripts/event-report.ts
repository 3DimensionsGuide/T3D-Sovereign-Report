/**
 * Prints how often each app screen was opened over the last 14 days.
 *
 *   npx tsx --env-file=.env.local scripts/event-report.ts
 */

import { gte } from 'drizzle-orm';
import { db } from '../src/server/db';
import { appEvents } from '../src/server/db/schema';

async function main(): Promise<void> {
  const since = new Date(Date.now() - 14 * 86_400_000).toISOString().slice(0, 10);
  const rows = await db.select().from(appEvents).where(gte(appEvents.day, since));
  if (rows.length === 0) {
    console.log('No screen counts yet in the last 14 days.');
    process.exit(0);
  }
  const totals = new Map<string, number>();
  for (const r of rows) totals.set(r.event, (totals.get(r.event) ?? 0) + r.count);
  console.log(`Screen opens since ${since}:`);
  for (const [event, n] of [...totals.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${event.replace('screen_', '').padEnd(14)} ${n}`);
  }
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
