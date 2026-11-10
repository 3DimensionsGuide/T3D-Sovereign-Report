/**
 * Creates the Resend Segment the marketing list writes to, and records its id.
 *
 *   node --import tsx dev-tools/create-segment.mjs
 *   node --import tsx dev-tools/create-segment.mjs "Some Other Name"
 *
 * Writes RESEND_SEGMENT_ID into .env.local and prints only a masked confirmation. The id is not
 * a credential, but .env.local is where configuration lives and the habit of not printing values
 * is worth more than the exception.
 *
 * Run from your own machine. The Linux shell Claude works in reaches package registries and
 * GitHub and nothing else, so api.resend.com is unreachable from there — which is the same
 * reason production migrations are run by hand.
 *
 * Safe to run twice: it refuses rather than making a second segment, since two lists with the
 * same name is a worse problem than an error message.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import nextEnv from '@next/env';

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd(), true, { info: () => {}, error: () => {} });

const ENV_FILE = join(process.cwd(), '.env.local');
const name = process.argv[2] ?? 'T3D Insights';

const key = process.env.RESEND_API_KEY;
if (!key) {
  console.error('RESEND_API_KEY is not set in .env.local.');
  process.exit(1);
}

if (process.env.RESEND_SEGMENT_ID) {
  const id = process.env.RESEND_SEGMENT_ID;
  console.log(`RESEND_SEGMENT_ID is already set (${id.slice(0, 8)}…${id.slice(-4)}).`);
  console.log('Delete that line from .env.local first if you really want a second segment.');
  process.exit(0);
}

console.log(`Creating a Resend segment named "${name}"…\n`);

let response;
try {
  response = await fetch('https://api.resend.com/segments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
} catch (error) {
  console.error(`Could not reach api.resend.com: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

const text = await response.text();
if (!response.ok) {
  // The body can echo the request, so only the status and a short excerpt are shown.
  console.error(`Resend answered ${response.status}.`);
  console.error(text.slice(0, 200));
  process.exit(1);
}

let segment;
try {
  segment = JSON.parse(text);
} catch {
  console.error('Resend answered with something that is not JSON.');
  process.exit(1);
}

const id = typeof segment.id === 'string' ? segment.id : '';
if (!id) {
  console.error('Resend answered without a segment id.');
  process.exit(1);
}

const current = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, 'utf8') : '';
const separator = current.endsWith('\n') || current === '' ? '' : '\n';
writeFileSync(
  ENV_FILE,
  `${current}${separator}\n# The marketing list the confirmed opt-ins go onto. See src/server/marketingList.ts.\nRESEND_SEGMENT_ID=${id}\n`,
  'utf8',
);

console.log(`Created "${segment.name}".`);
console.log(`  id: ${id.slice(0, 8)}…${id.slice(-4)}  (${id.length} characters)`);
console.log('\nWritten to .env.local, which is gitignored and has never been committed.');
console.log('\nNext: copy that same line into Vercel → Settings → Environment Variables.');
console.log('Run this to see the full value when you need it:');
console.log('  grep RESEND_SEGMENT_ID .env.local');
