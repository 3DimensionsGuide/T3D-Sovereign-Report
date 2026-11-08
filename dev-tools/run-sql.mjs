/**
 * Runs one .sql file against DATABASE_URL.
 *
 *   node dev-tools/run-sql.mjs drizzle/0001_app_session_epoch.sql
 *
 * There is no migration tool in this project yet, so this is the plain way to apply a schema change
 * by hand. It uses the same driver and the same DATABASE_URL the app itself uses, read from
 * .env.local exactly as Next.js reads it, so there is no chance of pointing at the wrong database.
 *
 * It shows the host and database it is about to touch before it touches it, prints the statements
 * it ran, and exits non-zero if anything failed.
 *
 * Each file that runs cleanly is recorded in a _migrations table, so each database says for itself
 * what it has had. That table is the point: three confusing failures in one day came from the two
 * databases having drifted since October with nothing anywhere saying so. The .sql files are still
 * written to be safe to run twice, and this still runs one that has already been recorded — it
 * just tells you it has, rather than leaving you to remember.
 */

import { readFileSync } from 'node:fs';
// @next/env is CommonJS, so it comes in as a default export rather than a named one.
import nextEnv from '@next/env';
const { loadEnvConfig } = nextEnv;
import postgres from 'postgres';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node dev-tools/run-sql.mjs <path to .sql file>');
  process.exit(1);
}

loadEnvConfig(process.cwd(), true, { info: () => {}, error: () => {} });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set. Check .env.local.');
  process.exit(1);
}

const where = new URL(url);
console.log(`Database: ${where.hostname}:${where.port || 5432}/${where.pathname.replace('/', '')}`);
console.log(`File:     ${file}\n`);

const sql = readFileSync(file, 'utf8');
const statements = sql
  .split('\n')
  .filter((line) => !line.trim().startsWith('--'))
  .join('\n')
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean);

if (statements.length === 0) {
  console.error('That file has no statements in it.');
  process.exit(1);
}

const client = postgres(url, { max: 1, onnotice: () => {} });
const name = file.split('/').pop();

try {
  await client`
    CREATE TABLE IF NOT EXISTS _migrations (
      name     text PRIMARY KEY,
      ran_at   timestamptz NOT NULL DEFAULT now()
    )
  `;
  const already = await client`SELECT ran_at FROM _migrations WHERE name = ${name}`;
  if (already.length > 0) {
    console.log(`Already recorded as run on ${already[0].ran_at.toISOString().slice(0, 16).replace('T', ' ')}.`);
    console.log('Running it again anyway — these files are written to be safe twice over.\n');
  }

  for (const statement of statements) {
    const oneLine = statement.replace(/\s+/g, ' ');
    process.stdout.write(`  ${oneLine.slice(0, 100)}${oneLine.length > 100 ? '…' : ''}\n`);
    await client.unsafe(statement);
  }
  await client`
    INSERT INTO _migrations (name) VALUES (${name})
    ON CONFLICT (name) DO UPDATE SET ran_at = now()
  `;
  console.log(`\nDone. ${statements.length} statement${statements.length === 1 ? '' : 's'} ran without error, and recorded as "${name}".`);
} catch (error) {
  console.error(`\nFailed: ${error instanceof Error ? error.message : String(error)}`);
  console.error('Nothing after the failing statement was run.');
  process.exitCode = 1;
} finally {
  await client.end();
}
