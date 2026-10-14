import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSkyRing, signAt } from '../../mobile/src/lib/skyRing';
import type { SkyPosition } from '../../mobile/src/lib/api';

const pos = (body: SkyPosition['body'], longitude: number, retrograde = false): SkyPosition => ({ body, longitude, retrograde });

test('signAt maps longitudes to signs', () => {
  assert.equal(signAt(0), 'Aries');
  assert.equal(signAt(195.5), 'Libra');
  assert.equal(signAt(359), 'Pisces');
});

test('every body is drawn and named, with its sign and retrograde state', () => {
  const ring = buildSkyRing([pos('sun', 200), pos('moon', 250), pos('mercury', 215, true)]);
  assert.equal(ring.marks.length, 3);
  const mercury = ring.marks.find((m) => m.body === 'mercury')!;
  assert.equal(mercury.sign, 'Scorpio');
  assert.equal(mercury.degree, 5);
  assert.ok(mercury.retrograde);
  assert.match(ring.spoken, /Mercury in Scorpio retrograde/);
});

test('bodies close together are moved to different distances so they do not overlap', () => {
  const ring = buildSkyRing([pos('sun', 200), pos('mercury', 203), pos('venus', 206), pos('mars', 209)]);
  for (let i = 0; i < ring.marks.length; i++) {
    for (let j = i + 1; j < ring.marks.length; j++) {
      const a = ring.marks[i]!, b = ring.marks[j]!;
      assert.ok(Math.hypot(a.x - b.x, a.y - b.y) > 18, `${a.body} and ${b.body} are apart`);
    }
  }
});

test('twelve sign ticks and glyph spots', () => {
  const ring = buildSkyRing([pos('sun', 10)]);
  assert.equal(ring.ticks.length, 12);
  assert.equal(ring.signs.length, 12);
});
