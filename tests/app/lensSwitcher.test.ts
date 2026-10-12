import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { yourTermIds } from '../../mobile/src/lib/yourTerms';

const chart = {
  leadId: 1,
  astrology: {
    tropicalSun: { sign: 'Libra', degreeInSign: 7, minuteInSign: 32, retrograde: false, formatted: '' },
    tropicalMoon: { sign: 'Aries', degreeInSign: 6, minuteInSign: 36, retrograde: false, formatted: '' },
    tropicalAscendant: 225.03,
    tropicalMC: 120,
    siderealSun: { sign: 'Virgo', degreeInSign: 1, minuteInSign: 0, retrograde: false, formatted: '' },
    siderealAscendant: 200,
    houseSystem: 'whole',
  },
  numerology: { lifePath: 7, destiny: 9, personality: 6, soulUrge: 3, hiddenPassion: 5, karmicLessons: [4, 8] },
  humanDesign: { type: 'Manifesting Generator', authority: 'Sacral', profile: 'Profile 4/1', strategy: '' },
};
const read = (p: string) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');

test('your terms come from the saved chart alone', () => {
  const ids = yourTermIds(chart as never);
  for (const id of ['hd:type:Manifesting Generator', 'hd:authority:Sacral', 'hd:profile:4/1', 'num:7', 'num:4', 'astro:sign:Libra', 'astro:sign:Scorpio', 'astro:ascendant', 'astro:midheaven']) {
    assert.ok(ids.has(id), id);
  }
  assert.ok(!ids.has('num:2'));
  assert.ok(!ids.has('hd:type:Projector'));
});

test('drawing data adds gates, channels, centers, planets and houses', () => {
  const drawing = {
    tropical: { planets: [{ body: 'mars', sign: 'Gemini', house: 9, longitude: 70, formatted: '', retrograde: false }], aspects: [{ a: 'sun', b: 'moon', aspect: 'trine', orb: 1, peak: true }], ascendant: 225, midheaven: 120 },
    sidereal: { planets: [], aspects: [], ascendant: 0, midheaven: 0 },
    humanDesign: {
      definedCenters: ['sacral'], undefinedCenters: ['head'], gates: [{ gate: 34, line: 1, epoch: 'personality', planet: 'sun', center: 'sacral' }],
      channels: [{ gates: [34, 20], name: 'x', fromCenter: 'a', toCenter: 'b', activatedBy: 'both' }], incarnationCross: 'X',
    },
  };
  const ids = yourTermIds(chart as never, drawing as never);
  for (const id of ['hd:gate:34', 'hd:channel:34-20', 'hd:center:sacral', 'hd:center:head', 'astro:planet:mars', 'astro:house:9', 'astro:aspect:trine', 'astro:sign:Gemini']) {
    assert.ok(ids.has(id), id);
  }
});

test('Glossary offers an In your chart filter, Timeline offers Vehicle, Road and Stoplight', () => {
  const g = read('mobile/src/app/glossary.tsx');
  assert.match(g, /\['all', 'yours', \.\.\.ORDER\]/);
  assert.match(g, /yours\.has\(r\.item\.id\)/);
  const t = read('mobile/src/app/(tabs)/timeline.tsx');
  assert.match(t, /type TimelineLens = 'all' \| 'vehicle' \| 'road' \| 'stoplight'/);
  assert.match(t, /value: 'vehicle'/);
});

test('Glossary shows a sign\'s full line and renames the "None" circuitry entry', () => {
  const g = read('mobile/src/app/glossary.tsx');
  assert.match(g, /id\.startsWith\('astro:sign:'\)\) return text/);
  assert.match(g, /None Circuitry\$\/, 'No Dominant Circuitry'/);
  assert.match(read('src/lib/app/glossary.ts'), /key === 'None' \? 'No Dominant Circuitry'/);
});
