/**
 * The engine version has to mean something.
 *
 * It is written onto every chart so that "which stored charts predate this fix?" is a lookup
 * rather than a full recomputation. That only holds if the version actually moves when the engines
 * do — a version nobody remembered to bump is worse than none, because it says a chart was
 * verified when it was not.
 *
 * So this hashes the engine sources and compares against the recorded fingerprint. Editing an
 * engine without touching src/server/engines/version.ts fails here, and the failure carries the
 * new fingerprint to paste in.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ENGINE_FINGERPRINT,
  ENGINE_SOURCES,
  ENGINE_VERSION,
  isCurrentEngine,
} from '../../src/server/engines/version';

const root = process.cwd();

function fingerprint(): string {
  const hash = createHash('sha256');
  for (const file of [...ENGINE_SOURCES].sort()) {
    hash.update(file);
    hash.update(readFileSync(join(root, file)));
  }
  return hash.digest('hex').slice(0, 16);
}

test('engine version: every source it claims to cover exists', () => {
  assert.ok(ENGINE_SOURCES.length >= 4, 'the list looks too short to cover the three engines');
  for (const file of ENGINE_SOURCES) {
    assert.ok(existsSync(join(root, file)), `${file} is listed but not there — rename or remove it`);
  }
});

test('engine version: the engines have not changed without somebody deciding about the version', () => {
  const now = fingerprint();
  assert.equal(
    now,
    ENGINE_FINGERPRINT,
    `\n\n  The calculation engines have changed since the fingerprint was recorded.\n\n` +
      `  If a stored number could now come out differently for the same birth details,\n` +
      `  bump ENGINE_VERSION in src/server/engines/version.ts (it is currently ${ENGINE_VERSION}).\n` +
      `  If the change was a comment, a rename or types only, leave the version alone.\n\n` +
      `  Either way, set ENGINE_FINGERPRINT to:\n\n      ${now}\n`,
  );
});

test('engine version: the version is a date that reads in order', () => {
  // Dated so the age of a chart's engine is legible on sight, and so versions sort.
  assert.match(ENGINE_VERSION, /^\d{4}\.\d{2}\.\d{2}$/);
  const [y, m, d] = ENGINE_VERSION.split('.').map(Number);
  assert.ok(y >= 2026 && y < 2100, 'year');
  assert.ok(m >= 1 && m <= 12, 'month');
  assert.ok(d >= 1 && d <= 31, 'day');
});

test('engine version: a chart with no version is unverified, not current', () => {
  // Every chart written before 2026-11-07 has null here. Those are not known to be wrong — but
  // they have not been shown to be right either, and must not read as current.
  assert.equal(isCurrentEngine(null), false);
  assert.equal(isCurrentEngine(undefined), false);
  assert.equal(isCurrentEngine(''), false);
  assert.equal(isCurrentEngine('2026.01.01'), false);
  assert.equal(isCurrentEngine(ENGINE_VERSION), true);
});

test('engine version: the files that are calculated fresh are deliberately left out', () => {
  // These run on every request and are never stored, so a change to one cannot make a saved chart
  // stale. Listing them would bump the version for no reason and train everyone to ignore it.
  for (const fresh of ['dailySky', 'transits', 'timeline', 'chartData', 'dayNumerology']) {
    assert.ok(
      !ENGINE_SOURCES.some((f) => f.includes(fresh)),
      `${fresh} is calculated fresh on every request and should not be in ENGINE_SOURCES`,
    );
  }
  // types.ts is imported with `import type` by all three engines, so it is erased before anything
  // runs and cannot change a number.
  assert.ok(!ENGINE_SOURCES.some((f) => f.endsWith('types.ts')));
});

test('engine version: it is written onto a chart when one is calculated', () => {
  const route = readFileSync(join(root, 'src/app/api/calculate-t3d/route.ts'), 'utf8');
  assert.match(route, /ENGINE_VERSION/, 'the calculation route does not record the version');
  // On both paths: a new lead, and an existing one being recalculated.
  assert.equal((route.match(/engineVersion: ENGINE_VERSION/g) ?? []).length, 2);
});

test('engine version: the column exists in the schema and in a migration', () => {
  assert.match(
    readFileSync(join(root, 'src/server/db/schema.ts'), 'utf8'),
    /engineVersion: text\('engine_version'\)/,
  );
  assert.match(
    readFileSync(join(root, 'drizzle/0004_engine_version.sql'), 'utf8'),
    /ADD COLUMN IF NOT EXISTS engine_version/,
  );
});
