/**
 * Compares a database against src/server/db/schema.ts and reports what is missing.
 *
 *   node --import tsx dev-tools/check-schema.mjs
 *   DATABASE_URL="<neon string>" node --import tsx dev-tools/check-schema.mjs
 *
 * Reads only.
 *
 * There is no migration tool here and no record of what has been applied where, so the two
 * databases drift apart quietly: the opt-in columns went onto production in October and never
 * onto the local one, and nothing said so until a route that selects every column returned a 500
 * two months later. A query naming three columns by hand keeps working the whole time.
 *
 * This asks the schema what it expects and the database what it has, and names the difference.
 * It knows nothing about column types or indexes — only whether something is there at all, which
 * is the drift that actually breaks things.
 */

import nextEnv from '@next/env';
import postgres from 'postgres';
import { getTableColumns, getTableName } from 'drizzle-orm';
import * as schema from '../src/server/db/schema.ts';

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd(), true, { info: () => {}, error: () => {} });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set. Check .env.local.');
  process.exit(1);
}

let where;
try {
  where = new URL(url);
} catch {
  console.error(`DATABASE_URL is not a connection string: ${url}`);
  process.exit(1);
}
console.log(`Database: ${where.hostname}:${where.port || 5432}/${where.pathname.replace('/', '')}\n`);

// Every pgTable the schema exports, by its real table name.
const expected = new Map();
for (const value of Object.values(schema)) {
  try {
    const name = getTableName(value);
    if (typeof name === 'string') {
      expected.set(name, Object.values(getTableColumns(value)).map((c) => c.name).sort());
    }
  } catch {
    // Not a table (a type, a helper); skip it.
  }
}

const client = postgres(url, { max: 1, onnotice: () => {} });

try {
  const rows = await client`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
  `;
  const actual = new Map();
  for (const r of rows) {
    if (!actual.has(r.table_name)) actual.set(r.table_name, new Set());
    actual.get(r.table_name).add(r.column_name);
  }

  let problems = 0;
  for (const [table, columns] of [...expected].sort()) {
    const have = actual.get(table);
    if (!have) {
      console.log(`  MISSING TABLE  ${table}`);
      console.log(`                 wants: ${columns.join(', ')}\n`);
      problems++;
      continue;
    }
    const missing = columns.filter((c) => !have.has(c));
    if (missing.length === 0) {
      console.log(`  ok             ${table}  (${columns.length} columns)`);
    } else {
      console.log(`  MISSING        ${table}: ${missing.join(', ')}`);
      problems++;
    }
  }

  // Columns the database has and the schema does not know about. Not a fault — an old column
  // nobody removed — but worth seeing.
  const extras = [];
  for (const [table, columns] of expected) {
    const have = actual.get(table);
    if (!have) continue;
    for (const c of have) if (!columns.includes(c)) extras.push(`${table}.${c}`);
  }
  if (extras.length) console.log(`\n  In the database but not in the schema: ${extras.join(', ')}`);

  // Which migration files this database says it has had. A file that has never run here is the
  // usual reason for anything above, and the usual reason a route fails on one machine only.
  try {
    const ran = new Set((await client`SELECT name FROM _migrations`).map((r) => r.name));
    const { readdirSync } = await import('node:fs');
    const onDisk = readdirSync('drizzle').filter((f) => f.endsWith('.sql')).sort();
    const never = onDisk.filter((f) => !ran.has(f));
    console.log(`\n  Migrations: ${ran.size} of ${onDisk.length} recorded as run here.`);
    if (never.length) {
      console.log(`  Never run against this database:`);
      for (const f of never) console.log(`    ${f}`);
      console.log('  (one may have been applied by hand before records were kept — running it again is safe)');
    }
  } catch {
    console.log('\n  Migrations: no _migrations table yet. It appears the first time');
    console.log('  dev-tools/run-sql.mjs applies a file to this database.');
  }

  console.log(problems === 0
    ? '\nThe database matches the schema.'
    : `\n${problems} table${problems === 1 ? '' : 's'} behind. See drizzle/ for the migration that adds them.`);
  if (problems > 0) process.exitCode = 1;
} catch (error) {
  console.error(`Failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
