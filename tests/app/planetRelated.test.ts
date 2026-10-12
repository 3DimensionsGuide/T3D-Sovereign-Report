import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildEntry, type ChartContext } from '../../src/lib/app/glossary';

// Aries rising. Sun 10° Aries, Moon 100° (Cancer), Mars 150° (Virgo, no aspect), Jupiter 130° (Leo, trine to Sun).
const ctx = {
  tropical: {
    sun: { longitude: 10, formatted: "10°00' Aries" },
    moon: { longitude: 100, formatted: "10°00' Cancer" },
    mars: { longitude: 150, formatted: "0°00' Virgo" },
    jupiter: { longitude: 131, formatted: "10°00' Leo" },
    houses: { ascendant: 5, mc: 275 },
  },
} as unknown as ChartContext;

test('each planet lists its own house first', () => {
  assert.equal(buildEntry('astro:planet:sun', ctx)?.relatedEntries[0]?.id, 'astro:house:1');
  assert.equal(buildEntry('astro:planet:moon', ctx)?.relatedEntries[0]?.id, 'astro:house:4');
  assert.equal(buildEntry('astro:planet:mars', ctx)?.relatedEntries[0]?.id, 'astro:house:6');
});

test('aspect chips follow the tightest contacts, not a fixed conjunction', () => {
  const sun = buildEntry('astro:planet:sun', ctx)!;
  const ids = sun.relatedEntries.map((r) => r.id);
  assert.ok(ids.includes('astro:aspect:trine'));
  assert.ok(!ids.includes('astro:aspect:conjunction'));
  assert.match(sun.yours ?? '', /closest aspect is a square to Moon/);
  const moon = buildEntry('astro:planet:moon', ctx)!.relatedEntries.map((r) => r.id);
  assert.ok(moon.includes('astro:aspect:square'));
});

test('without a chart the static related terms remain', () => {
  const e = buildEntry('astro:planet:sun', {});
  assert.deepEqual(e?.relatedEntries.map((r) => r.id), ['astro:house:1', 'astro:aspect:conjunction']);
});
