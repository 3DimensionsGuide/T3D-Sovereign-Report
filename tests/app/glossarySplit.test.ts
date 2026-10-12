import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildEntry, gateEntry } from '../../src/lib/app/glossary';

const read = (p: string) => fs.readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');

test('free users keep the short line and the "In your chart" line but lose the long explanation', () => {
  const e = buildEntry('num:maturity', { numerology: { lifePath: 4, destiny: 3 } } as never)!;
  const free = gateEntry(e, false);
  assert.equal(free.locked, true);
  assert.deepEqual(free.body, []);
  assert.equal(free.summary, e.summary);
  assert.match(JSON.stringify(free), /Yours is 7/);
});

test('Premium gets the whole entry', () => {
  const e = buildEntry('num:maturity', {} as never)!;
  const full = gateEntry(e, true);
  assert.equal(full.locked, false);
  assert.deepEqual(full.body, e.body);
});

test('every entry has a long explanation to lock, so Premium is never an empty promise', () => {
  const ids = ['num:lifepath', 'num:7', 'astro:planet:saturn', 'hd:gate:41', 'hd:center:sacral', 'astro:house:9'];
  for (const id of ids) assert.ok(buildEntry(id, {} as never)!.body.length > 0, id);
});

test('the explain route reads premium from the request, and the app asks per Premium state', () => {
  assert.match(read('src/app/api/app/explain/route.ts'), /gateEntry\(entry, body\.premium === true\)/);
  const ex = read('mobile/src/components/Explain.tsx');
  assert.match(ex, /\$\{premium \? 'p' : 'f'\}/);
  assert.match(ex, /requestExplain\(leadId, email, currentId, premium\)/);
});
