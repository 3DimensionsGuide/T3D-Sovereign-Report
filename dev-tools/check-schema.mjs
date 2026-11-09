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
 * It knows nothing about column types or indexes, but it does check whether each column is
 * nullable, because that drift breaks things just as quietly as a missing column and in a worse
 * place: a column the schema thinks is optional and the database still has NOT NULL takes the
 * insert down at the end of a flow, after the work is already done. drizzle/0005 drops a NOT NULL
 * and nothing else here would have noticed it had not been applied.
 */

import nextEnv from '@next/env';
import postgres from 'postgres';
import { getTableColumns, getTableName } from 'drizzle-orm';
import * as schema from '../src/server/db/schema.ts';
import { diffTable, describeNullability } from './schemaDiff.mjs';

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd(), true, { info: () => {}, error: () => {} });

// --prod reads NEON_DATABASE_URL from .env.local instead, so the production connection string is
// pasted once and never again. Only the read-only tools accept it. run-sql.mjs deliberately does
// not: writing to production should stay deliberate and slightly awkward.
const useProd = process.argv.includes('--prod');
const url = useProd ? process.env.NEON_DATABASE_URL : process.env.DATABASE_URL;
if (!url) {
  if (useProd) {
    console.error('NEON_DATABASE_URL is not set in .env.local.');
    console.error('Add it as one line: NEON_DATABASE_URL=postgresql://...  (Neon console, green Connect button)');
  } else {
    console.error('DATABASE_URL is not set. Check .env.local.');
  }
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
      const cols = Object.values(getTableColumns(value))
        .map((c) => ({ name: c.name, notNull: c.notNull === true }))
        .sort((a, b) => a.name.localeCompare(b.name));
      expected.set(name, cols);
    }
  } catch {
    // Not a table (a type, a helper); skip it.
  }
}

const client = postgres(url, { max: 1, onnotice: () => {} });

try {
  const rows = await client`
    SELECT table_name, column_name, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
  `;
  const actual = new Map();
  for (const r of rows) {
    if (!actual.has(r.table_name)) actual.set(r.table_name, new Map());
    actual.get(r.table_name).set(r.column_name, { notNull: r.is_nullable === 'NO' });
  }

  let problems = 0;
  const extras = [];
  for (const [table, columns] of [...expected].sort()) {
    const diff = diffTable(columns, actual.get(table) ?? null);
    extras.push(...diff.extras.map((c) => `${table}.${c}`));

    if (diff.missingTable) {
      console.log(`  MISSING TABLE  ${table}`);
      console.log(`                 wants: ${columns.map((c) => c.name).join(', ')}\n`);
      problems++;
      continue;
    }
    if (diff.missing.length === 0 && diff.nullability.length === 0) {
      console.log(`  ok             ${table}  (${columns.length} columns)`);
      continue;
    }
    if (diff.missing.length) console.log(`  MISSING        ${table}: ${diff.missing.join(', ')}`);
    for (const n of diff.nullability) console.log(`  NULLABILITY    ${describeNullability(table, n)}`);
    problems++;
  }

  // In the database and not in the schema: an old column nobody removed. Not a fault, but worth
  // seeing, so it does not count toward `problems`.
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
    : `\n${problems} table${problems === 1 ? '' : 's'} out of step. See drizzle/ for the migration that fixes it.`);
  if (problems > 0) process.exitCode = 1;
} catch (error) {
  console.error(`Failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
