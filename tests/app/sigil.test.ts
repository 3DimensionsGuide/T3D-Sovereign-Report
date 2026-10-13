import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { SigilChart } from '../../mobile/src/lib/sigil';
import { digitRoot, longitudeOf, onCircle, sigilGeometry, SIGIL_CENTER, RING_RADIUS } from '../../mobile/src/lib/sigil';

const place = (sign: string, degreeInSign: number, minuteInSign = 0) => ({ sign, degreeInSign, minuteInSign, retrograde: false, formatted: '' });

const make = (over: Partial<{ lifePath: number; destiny: number; type: string; profile: string; sun: string; moon: string; asc: number }> = {}): SigilChart => ({
  leadId: 1,
  astrology: {
    tropicalSun: place(over.sun ?? 'Libra', 7, 20),
    tropicalMoon: place(over.moon ?? 'Aries', 12),
    tropicalAscendant: over.asc ?? 215,
    tropicalMC: 120,
    siderealSun: place('Virgo', 13),
    siderealAscendant: 190,
    houseSystem: 'placidus',
  },
  numerology: { lifePath: over.lifePath ?? 7, destiny: over.destiny ?? 9, personality: 3, soulUrge: 6, hiddenPassion: 5, karmicLessons: [] },
  humanDesign: { type: over.type ?? 'Manifesting Generator', authority: 'Sacral', profile: over.profile ?? '4/1 Opportunist Investigator', strategy: 'Respond' },
} as unknown as SigilChart);

test('the same chart always gives the same Sigil', () => {
  assert.deepEqual(sigilGeometry(make(), true), sigilGeometry(make(), true));
});

test('different charts give different Sigils', () => {
  const a = JSON.stringify(sigilGeometry(make(), true));
  assert.notEqual(a, JSON.stringify(sigilGeometry(make({ lifePath: 3 }), true)));
  assert.notEqual(a, JSON.stringify(sigilGeometry(make({ sun: 'Leo' }), true)));
  assert.notEqual(a, JSON.stringify(sigilGeometry(make({ profile: '6/2 Role Model' }), true)));
  assert.notEqual(a, JSON.stringify(sigilGeometry(make({ type: 'Projector' }), true)));
});

test('the Road has one triangle per step of the Life Path, and master numbers reduce', () => {
  assert.equal(sigilGeometry(make({ lifePath: 7 }), true).triangles.length, 7);
  assert.equal(sigilGeometry(make({ lifePath: 11 }), true).triangles.length, 2);
  assert.equal(sigilGeometry(make({ lifePath: 22 }), true).triangles.length, 4);
  assert.equal(digitRoot(33), 6);
});

test('Rising only appears when the birth time is known', () => {
  assert.equal(sigilGeometry(make(), true).planets.length, 3);
  assert.equal(sigilGeometry(make(), false).planets.length, 2);
  assert.equal(sigilGeometry(make(), false).chords.length, 1);
});

test('planets sit on the ring, and the signs map to the right longitude', () => {
  assert.equal(longitudeOf(place('Libra', 7, 30)), 187.5);
  for (const p of sigilGeometry(make(), true).planets) {
    const d = Math.hypot(p.at.x - SIGIL_CENTER, p.at.y - SIGIL_CENTER);
    assert.ok(Math.abs(d - RING_RADIUS) < 0.001);
  }
  const aries = onCircle(0, RING_RADIUS);
  assert.ok(aries.x < SIGIL_CENTER, 'Aries starts on the left');
});

test('every Type has its own centre mark', () => {
  const marks = ['Generator', 'Manifesting Generator', 'Manifestor', 'Projector', 'Reflector'].map((t) => sigilGeometry(make({ type: t }), true).centre);
  assert.equal(new Set(marks).size, 5);
});

test('the Sigil uses no private details and is offered on My Chart and in the share studio', () => {
  const src = readFileSync('mobile/src/lib/sigil.ts', 'utf8');
  assert.doesNotMatch(src, /firstName|lastName|birthDate|latitude|longitude:|email/);
  assert.match(readFileSync('mobile/src/app/(tabs)/chart.tsx', 'utf8'), /<Sigil /);
  const share = readFileSync('mobile/src/app/share-card.tsx', 'utf8');
  assert.match(share, /<SigilShareCard/);
  assert.match(share, /card-sigil/);
});
