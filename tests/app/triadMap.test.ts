import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { triadMapGroups, type MapChart } from '../../mobile/src/lib/triadMap';

const chart = {
  astrology: { tropicalSun: { sign: 'Libra' }, tropicalMoon: { sign: 'Aries' }, tropicalAscendant: 215 },
  numerology: { lifePath: 7, destiny: 9, soulUrge: 3 },
  humanDesign: { type: 'Manifesting Generator', authority: 'Sacral', profile: '4/1 Opportunist Investigator' },
} as MapChart;

test('the map has the three lenses in order, each with its facts', () => {
  const g = triadMapGroups(chart, true);
  assert.deepEqual(g.map((x) => x.lens), ['vehicle', 'road', 'stoplight']);
  assert.deepEqual(g[0].facts.map((f) => f.value), ['Manifesting Generator', 'Sacral', '4/1']);
  assert.deepEqual(g[1].facts.map((f) => f.value), ['7', '9', '3']);
  assert.deepEqual(g[2].facts.map((f) => f.value), ['Libra', 'Aries', 'Scorpio']);
});

test('every fact links to a glossary term', () => {
  const ids = triadMapGroups(chart, true).flatMap((g) => g.facts.map((f) => f.termId));
  assert.equal(ids.length, 9);
  assert.ok(ids.every((id) => /^(hd|num|astro):/.test(id)));
  assert.ok(ids.includes('hd:type:Manifesting Generator'));
  assert.ok(ids.includes('hd:authority:Sacral'));
  assert.ok(ids.includes('hd:profile:4/1'));
  assert.ok(ids.includes('num:7'));
  // The Stoplight facts open the explanation of the sign itself, not of the planet.
  assert.deepEqual(ids.slice(6), ['astro:sign:Libra', 'astro:sign:Aries', 'astro:sign:Scorpio']);
});

test('Rising is left off when the birth time is not known', () => {
  const stoplight = triadMapGroups(chart, false)[2];
  assert.deepEqual(stoplight.facts.map((f) => f.label), ['Sun', 'Moon']);
});

test('the map uses no private details and is shown on My Chart', () => {
  const lib = readFileSync('mobile/src/lib/triadMap.ts', 'utf8');
  const view = readFileSync('mobile/src/components/TriadMap.tsx', 'utf8');
  assert.doesNotMatch(lib + view, /firstName|lastName|birthDate|latitude|longitude:|email/);
  assert.match(readFileSync('mobile/src/app/(tabs)/chart.tsx', 'utf8'), /<TriadMap /);
});
