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
 * it ran, and exits non-zero if anything failed. It does not track which migrations have been
 * applied — the .sql files are written so that running one twice is harmless.
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

try {
  for (const statement of statements) {
    const oneLine = statement.replace(/\s+/g, ' ');
    process.stdout.write(`  ${oneLine.slice(0, 100)}${oneLine.length > 100 ? '…' : ''}\n`);
    await client.unsafe(statement);
  }
  console.log(`\nDone. ${statements.length} statement${statements.length === 1 ? '' : 's'} ran without error.`);
} catch (error) {
  console.error(`\nFailed: ${error instanceof Error ? error.message : String(error)}`);
  console.error('Nothing after the failing statement was run.');
  process.exitCode = 1;
} finally {
  await client.end();
}
