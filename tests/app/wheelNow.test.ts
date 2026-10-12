import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWheelScene, NOW_SCALE, WHEEL_SIZE } from '../../mobile/src/charts/wheel';
import { formatPlace, nowPlanets, nowRows, zodiacShift } from '../../mobile/src/lib/wheelNow';
import type { WheelChart } from '../../mobile/src/charts/chartTypes';

const tropical: WheelChart = {
  ascendant: 200, // 20° Libra
  midheaven: 110,
  planets: [
    { body: 'sun', longitude: 195, sign: 'Libra', formatted: '', retrograde: false, house: 1 },
    { body: 'moon', longitude: 10, sign: 'Aries', formatted: '', retrograde: false, house: 7 },
  ],
  aspects: [],
};
const sidereal: WheelChart = {
  ...tropical,
  planets: [
    { body: 'sun', longitude: 171, sign: 'Virgo', formatted: '', retrograde: false, house: 12 },
    { body: 'moon', longitude: 346, sign: 'Pisces', formatted: '', retrograde: false, house: 6 },
  ],
};

test('places read as degrees, minutes and sign', () => {
  assert.equal(formatPlace(0), "0°00' Aries");
  assert.equal(formatPlace(129.5), "9°30' Leo");
  assert.equal(formatPlace(-10), "20°00' Pisces");
});

test('the sidereal shift is the same for every point and keeps today in the right zodiac', () => {
  const shift = zodiacShift(tropical, sidereal);
  assert.equal(shift, 336);
  const planets = nowPlanets([{ body: 'sun', longitude: 200, retrograde: false }], shift);
  assert.equal(planets[0]!.longitude, 176);
  assert.equal(zodiacShift({ ...tropical, planets: [] }, sidereal), 0);
});

test('each of today\'s planets lands in a house counted from your rising sign', () => {
  const rows = nowRows(tropical, [
    { body: 'sun', longitude: 195, retrograde: false },   // Libra = house 1
    { body: 'mars', longitude: 225, retrograde: true },   // Scorpio = house 2
    { body: 'moon', longitude: 175, retrograde: false },  // Virgo = house 12
  ]);
  assert.deepEqual(rows.map((r) => r.house), [1, 2, 12]);
  assert.equal(rows[1]!.retrograde, true);
  assert.equal(rows[1]!.formatted, "15°00' Scorpio");
});

test('the wheel without today draws exactly as before', () => {
  const a = buildWheelScene(tropical);
  const b = buildWheelScene(tropical, null, null);
  assert.deepEqual(a.prims, b.prims);
});

test('with today on, every planet gets a glyph and everything stays inside the picture', () => {
  const now = [
    { body: 'sun' as const, longitude: 195, retrograde: false },
    { body: 'mercury' as const, longitude: 197, retrograde: true },
    { body: 'pluto' as const, longitude: 300, retrograde: false },
  ];
  const plain = buildWheelScene(tropical);
  const scene = buildWheelScene(tropical, null, now);
  const glyphs = (s: typeof scene) => s.prims.filter((p) => p.k === 'text' && p.fill === '#C83E3E' || p.k === 'text' && /[☉☿♇]/.test(p.s)).length;
  assert.ok(scene.prims.length > plain.prims.length);
  assert.ok(glyphs(scene) >= 3);
  for (const p of scene.prims) {
    if (p.k === 'text') {
      assert.ok(p.x > 4 && p.x < WHEEL_SIZE - 4 && p.y > 4 && p.y < WHEEL_SIZE - 4, `text ${p.s} at ${p.x},${p.y}`);
    }
  }
  assert.ok(NOW_SCALE < 1);
});
