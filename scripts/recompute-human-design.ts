/**
 * Recompute a lead's `results.humanDesign` from their stored birthData,
 * using the CURRENT human_design.ts engine (MANDALA_START_LON = 302.0,
 * the corrected constant) — and compare it against whatever is currently
 * stored in the DB.
 *
 * Why this exists: the Advanced/Sovereign Report generator never
 * recomputes a chart at render time — it reads `lead.results.humanDesign`
 * straight out of the DB (see src/app/api/generate-report/route.ts →
 * buildReportData.ts). That value is only ever written once, at the
 * moment the calculator originally ran (src/app/api/calculate-t3d/route.ts,
 * which stores `calculateHumanDesign()`'s full return value verbatim).
 * A lead calculated before a fix to that engine landed keeps the OLD,
 * now-incorrect result forever, even though the live calculator (which
 * always runs the current code) gives the right answer for the exact
 * same birth data. This script finds and closes that gap for one lead
 * at a time, without touching astrology or numerology results.
 *
 * Usage (run from the project root, where DATABASE_URL and the native
 * swisseph build are actually reachable — i.e. your own machine, not a
 * sandboxed shell):
 *
 *   Dry run (default) — prints stored vs. freshly-computed, writes nothing:
 *     npx tsx scripts/recompute-human-design.ts --email=tylerj.henry@yahoo.com
 *     npx tsx scripts/recompute-human-design.ts --id=8
 *
 *   Apply — overwrites results.humanDesign with the fresh value for every
 *   matching lead where it actually differs (leaves identical ones alone,
 *   never touches results.astrology or results.numerology):
 *     npx tsx scripts/recompute-human-design.ts --email=tylerj.henry@yahoo.com --apply
 *
 * If your shell doesn't already export DATABASE_URL from .env.local:
 *   node --env-file=.env.local -e "require('tsx/cjs'); require('./scripts/recompute-human-design.ts')" -- --email=tylerj.henry@yahoo.com
 */
import { db } from '../src/server/db';
import { leads } from '../src/server/db/schema';
import { eq } from 'drizzle-orm';
import { calculateHumanDesign } from '../src/server/engines/human_design';

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const hit = args.find(a => a.startsWith(`--${flag}=`));
    return hit ? hit.split('=').slice(1).join('=') : undefined;
  };
  return {
    email: get('email'),
    id: get('id') ? Number(get('id')) : undefined,
    apply: args.includes('--apply'),
  };
}

type BirthData = {
  date: string;
  time: string;
  place: { city: string; country: string; latitude: number; longitude: number; timezone: string };
};

function diffObjects(oldObj: Record<string, unknown>, newObj: Record<string, unknown>): string[] {
  const lines: string[] = [];
  const keys = new Set([...Object.keys(oldObj ?? {}), ...Object.keys(newObj ?? {})]);
  for (const key of keys) {
    const a = JSON.stringify(oldObj?.[key]);
    const b = JSON.stringify(newObj?.[key]);
    if (a !== b) {
      lines.push(`  ${key}:\n    stored: ${a}\n    fresh:  ${b}`);
    }
  }
  return lines;
}

async function main() {
  const { email, id, apply } = parseArgs();
  if (!email && !id) {
    console.error('Usage: npx tsx scripts/recompute-human-design.ts --email=<email> [--apply]');
    console.error('   or: npx tsx scripts/recompute-human-design.ts --id=<leadId> [--apply]');
    process.exit(1);
  }

  const rows = id
    ? await db.select().from(leads).where(eq(leads.id, id))
    : await db.select().from(leads).where(eq(leads.email, email!.toLowerCase().trim()));

  if (rows.length === 0) {
    console.log('No matching lead rows found.');
    process.exit(0);
  }

  console.log(`Found ${rows.length} lead row(s). Mode: ${apply ? 'APPLY (will write)' : 'DRY RUN (read-only)'}\n`);

  for (const row of rows) {
    console.log(`=== Lead id=${row.id}  ${row.firstName} ${row.lastName} <${row.email}>  created=${row.createdAt} ===`);

    const bd = row.birthData as BirthData;
    if (!bd?.date || !bd?.time || !bd?.place) {
      console.log('  SKIP — birthData missing or malformed:', JSON.stringify(row.birthData));
      continue;
    }
    console.log(`  birthData: ${bd.date} ${bd.time}  ${bd.place.city}, ${bd.place.country}  (${bd.place.latitude}, ${bd.place.longitude}, ${bd.place.timezone})`);

    const results = (row.results ?? { astrology: {}, numerology: {}, humanDesign: {} }) as {
      astrology: Record<string, unknown>;
      numerology: Record<string, unknown>;
      humanDesign: Record<string, unknown>;
    };
    const storedHD = results.humanDesign ?? {};

    let freshHD: Record<string, unknown>;
    try {
      freshHD = calculateHumanDesign({
        birthDate: bd.date,
        birthTime: bd.time,
        latitude: bd.place.latitude,
        longitude: bd.place.longitude,
        timezone: bd.place.timezone,
      }) as unknown as Record<string, unknown>;
    } catch (err) {
      console.log(`  SKIP — recomputation failed: ${(err as Error).message}`);
      continue;
    }

    const diffs = diffObjects(storedHD, freshHD);
    if (diffs.length === 0) {
      console.log('  MATCH — stored results.humanDesign already agrees with the current engine. No change needed.\n');
      continue;
    }

    console.log(`  MISMATCH — ${diffs.length} field(s) differ:`);
    console.log(diffs.join('\n'));

    if (apply) {
      const newResults = { ...results, humanDesign: freshHD };
      await db.update(leads)
        .set({ results: newResults, updatedAt: new Date() })
        .where(eq(leads.id, row.id));
      console.log(`  APPLIED — results.humanDesign updated for lead id=${row.id}. astrology and numerology left untouched.\n`);
    } else {
      console.log(`  (dry run — nothing written. Re-run with --apply to update this lead.)\n`);
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
