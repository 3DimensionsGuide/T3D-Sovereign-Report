/**
 * Looks for stored charts that may be wrong, or that nothing has verified.
 *
 *   node --import tsx dev-tools/audit-charts.mjs
 *
 * Reads only. It changes nothing, and it prints a summary rather than a dump.
 *
 * 1. Birth times in an hour that ran twice.
 *    Until 9674b11, which of the two moments a chart used depended on whether the clocks happened
 *    to be forward or back on the day it was calculated. A chart in this list may have been built
 *    from the wrong one — an hour out, which moves the ascendant by roughly fifteen degrees and
 *    can change a Human Design gate. Recalculating it now gives the settled answer.
 *
 * 2. Coordinates that are exactly New York.
 *    Until 5a938a7, a birth place could not be looked up resolved to 40.7128, -74.0060 with only a
 *    warning in the log. A lead whose stored coordinates are those to the digit, but whose city is
 *    not New York, was written by that fallback and has the wrong place entirely.
 *
 * Both findings are repaired the same way: GET /api/admin/recompute-human-design with
 * relocate=true for the affected lead.
 *
 * 3. Charts calculated by an engine that is no longer current.
 *    Not a fault, and not a list of wrong charts — a list of ones nobody has checked since the
 *    formulas moved. Null means older than 2026-11-07, when versions started being recorded.
 *    ?scan=true on the admin route says which of them actually come out differently now.
 */

import nextEnv from '@next/env';
import postgres from 'postgres';
import { resolveLocalInstant } from '../src/server/localInstant.ts';
import { ENGINE_VERSION } from '../src/server/engines/version.ts';

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd(), true, { info: () => {}, error: () => {} });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set. Check .env.local.');
  process.exit(1);
}

/** The placeholder the old geocoding fallback used, to the digit. */
const FALLBACK_LAT = 40.7128;
const FALLBACK_LNG = -74.006;

let where;
try {
  where = new URL(url);
} catch {
  console.error(`DATABASE_URL is not a connection string: ${url}`);
  console.error('It should look like postgresql://user:password@host/database');
  console.error('If that is a placeholder in angle brackets, replace the whole thing, brackets included.');
  process.exit(1);
}
console.log(`Database: ${where.hostname}:${where.port || 5432}/${where.pathname.replace('/', '')}\n`);

const client = postgres(url, { max: 1, onnotice: () => {} });

try {
  const leads = await client`
    SELECT id, email, birth_data, created_at, engine_version
    FROM leads
    ORDER BY id
  `;
  console.log(`Checked ${leads.length} lead${leads.length === 1 ? '' : 's'}.\n`);

  const byEngine = new Map();
  const ambiguous = [];
  const nonexistent = [];
  const fallbackPlace = [];
  const unreadable = [];

  for (const lead of leads) {
    const bd = lead.birth_data ?? {};
    const place = bd.place ?? {};
    const date = bd.date;
    const time = bd.time;
    const tz = place.timezone;
    const city = place.city ?? '';
    const country = place.country ?? '';
    const who = { id: lead.id, email: lead.email, when: `${date} ${time}`, where: `${city}, ${country}`, tz };

    const version = lead.engine_version ?? null;
    byEngine.set(version, (byEngine.get(version) ?? 0) + 1);

    // 2. The old New York fallback, which is only a finding when the city is not New York.
    if (
      Number(place.latitude) === FALLBACK_LAT &&
      Number(place.longitude) === FALLBACK_LNG &&
      !/new york/i.test(city)
    ) {
      fallbackPlace.push(who);
    }

    // 1. An hour that ran twice, or one that never ran.
    if (!date || !time || !tz) {
      unreadable.push({ ...who, why: 'missing date, time or time zone' });
      continue;
    }
    try {
      const { resolution } = resolveLocalInstant(date, time, tz);
      if (resolution === 'ambiguous') ambiguous.push(who);
      else if (resolution === 'nonexistent') nonexistent.push(who);
    } catch (error) {
      unreadable.push({ ...who, why: error instanceof Error ? error.message : 'unknown' });
    }
  }

  const report = (title, rows, note) => {
    console.log(`${title}: ${rows.length}`);
    if (rows.length === 0) return;
    console.log(`  ${note}`);
    for (const r of rows) {
      console.log(`    lead ${r.id}  ${r.when}  ${r.where}  [${r.tz}]  ${r.email}${r.why ? `  — ${r.why}` : ''}`);
    }
    console.log();
  };

  report('Born in an hour that ran twice', ambiguous,
    'These may have been calculated from the wrong one of the two. Recalculate with relocate=true.');
  report('Born in an hour that never ran', nonexistent,
    'Handled the same way before and after the fix, so these are listed for completeness only.');
  report('Coordinates are exactly the old New York fallback', fallbackPlace,
    'The birth place was never looked up. These charts are wrong. Recalculate with relocate=true.');
  report('Could not be checked', unreadable,
    'Birth data missing or malformed; worth a look by hand.');

  console.log(`Engines (current is ${ENGINE_VERSION}):`);
  for (const [version, count] of [...byEngine].sort()) {
    const label = version ?? 'none recorded (written before 2026-11-07)';
    const mark = version === ENGINE_VERSION ? 'current  ' : 'unverified';
    console.log(`  ${mark}  ${String(count).padStart(4)}  ${label}`);
  }
  const stale = leads.length - (byEngine.get(ENGINE_VERSION) ?? 0);
  if (stale > 0) {
    console.log(`\n  ${stale} chart${stale === 1 ? '' : 's'} predate the current engines. To see which of them`);
    console.log('  actually come out differently now, and not merely which are old:');
    console.log('    /api/admin/recompute-human-design?scan=true&secret=$ADMIN_RECOMPUTE_SECRET');
  }
  console.log();

  const problems = ambiguous.length + fallbackPlace.length;
  console.log(problems === 0
    ? 'Nothing to repair.'
    : `${problems} chart${problems === 1 ? '' : 's'} to recalculate.`);
} catch (error) {
  console.error(`Failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
