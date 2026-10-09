/**
 * Golden-chart test: every one of the 20 reference charts must still produce
 * exactly the numbers saved in snapshot.json. If a code change moves any
 * planet, gate, Type or number, this fails and says which one.
 *
 * snapshot.json is created by `npm run golden:update`. Only refresh it when
 * you KNOW the new numbers are right (see tests/golden/README.md).
 */

import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FIXTURES } from './fixtures';
import { summarize } from './summarize';

const DIR = __dirname;
const SNAPSHOT = join(DIR, 'snapshot.json');
const VERIFICATION = join(DIR, 'verification.json');
const TOLERANCE = 0.002; // degrees

function compare(path: string, want: unknown, got: unknown, out: string[]): void {
  if (typeof want === 'number' && typeof got === 'number') {
    const d = Math.abs(want - got);
    const wrapped = Math.min(d, Math.abs(d - 360));
    if (wrapped > TOLERANCE) out.push(`${path}: expected ${want}, got ${got}`);
    return;
  }
  if (Array.isArray(want) && Array.isArray(got)) {
    if (want.length !== got.length) out.push(`${path}: expected ${want.length} items, got ${got.length} (${JSON.stringify(want)} vs ${JSON.stringify(got)})`);
    else want.forEach((w, i) => compare(`${path}[${i}]`, w, got[i], out));
    return;
  }
  if (want && got && typeof want === 'object' && typeof got === 'object') {
    for (const k of new Set([...Object.keys(want), ...Object.keys(got)])) {
      compare(`${path}.${k}`, (want as Record<string, unknown>)[k], (got as Record<string, unknown>)[k], out);
    }
    return;
  }
  if (want !== got) out.push(`${path}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`);
}

describe('golden charts', () => {
  if (!existsSync(SNAPSHOT)) {
    test('snapshot.json exists', () => {
      assert.fail('No snapshot yet. Run: npm run golden:update');
    });
    return;
  }
  const snapshot = JSON.parse(readFileSync(SNAPSHOT, 'utf8')) as { charts: Record<string, unknown> };

  for (const f of FIXTURES) {
    test(f.label, () => {
      const want = snapshot.charts[f.id];
      assert.ok(want, `${f.id} is missing from snapshot.json. Run: npm run golden:update`);
      const diffs: string[] = [];
      compare(f.id, want, JSON.parse(JSON.stringify(summarize(f))), diffs);
      assert.deepEqual(diffs, [], `\n${diffs.join('\n')}`);
    });
  }

  test('how many charts have been checked against Astro.com and Jovian Archive', (t) => {
    if (!existsSync(VERIFICATION)) {
      t.diagnostic('verification.json not found');
      return;
    }
    const v = JSON.parse(readFileSync(VERIFICATION, 'utf8')) as Record<string, { astroCom: string; jovian: string }>;
    const ok = (s: string): boolean => s === 'match';
    const astro = FIXTURES.filter((f) => ok(v[f.id]?.astroCom ?? '')).length;
    const jovian = FIXTURES.filter((f) => ok(v[f.id]?.jovian ?? '')).length;
    t.diagnostic(`Verified against Astro.com: ${astro}/${FIXTURES.length}. Against Jovian Archive: ${jovian}/${FIXTURES.length}.`);
    const mismatched = FIXTURES.filter((f) => v[f.id]?.astroCom === 'mismatch' || v[f.id]?.jovian === 'mismatch').map((f) => f.id);
    assert.deepEqual(mismatched, [], `These charts were marked "mismatch" in verification.json: ${mismatched.join(', ')}`);
  });
});
