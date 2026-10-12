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

import { MAX_CONTACTS, nowContacts } from '../../mobile/src/lib/wheelNow';
import { sameContact } from '../../mobile/src/charts/wheel';

const natalFull: WheelChart = {
  ascendant: 200,
  midheaven: 110,
  planets: [
    { body: 'sun', longitude: 195, sign: 'Libra', formatted: '', retrograde: false, house: 1 },
    { body: 'moon', longitude: 10, sign: 'Aries', formatted: '', retrograde: false, house: 7 },
    { body: 'saturn', longitude: 50, sign: 'Taurus', formatted: '', retrograde: false, house: 9 },
  ],
  aspects: [],
};

test('today\'s planets are measured against the same points of your chart as the Today screen', () => {
  const contacts = nowContacts(natalFull, [
    { body: 'venus', longitude: 195.4, retrograde: false },  // conjunct natal Sun, orb 0.4
    { body: 'mars', longitude: 255, retrograde: false },     // trine natal Sun? 195->255 is 60: sextile, orb 0
    { body: 'jupiter', longitude: 47, retrograde: false },   // slow planet 3° from natal Saturn: not a contact (Saturn is not a target)
  ]);
  const venus = contacts.find((c) => c.transit === 'venus' && c.natal === 'sun');
  assert.equal(venus?.aspect, 'conjunction');
  assert.ok(Math.abs(venus!.orb - 0.4) < 1e-9);
  assert.equal(venus!.peak, true);
  assert.ok(contacts.some((c) => c.transit === 'mars' && c.natal === 'sun' && c.aspect === 'sextile'));
  assert.ok(!contacts.some((c) => c.natal === 'saturn'));
});

test('slow planets only count when nearly exact, fast ones within three degrees', () => {
  const slow = nowContacts(natalFull, [{ body: 'pluto', longitude: 197.5, retrograde: false }]);   // 2.5 from natal Sun
  const fast = nowContacts(natalFull, [{ body: 'mercury', longitude: 197.5, retrograde: false }]);
  assert.equal(slow.filter((c) => c.natal === 'sun' && c.aspect === 'conjunction').length, 0);
  assert.equal(fast.filter((c) => c.natal === 'sun' && c.aspect === 'conjunction').length, 1);
});

test('contacts come closest first and are capped', () => {
  const planets = ['sun', 'moon', 'mercury', 'venus', 'mars'].map((b, i) => ({ body: b as 'sun', longitude: 195 + i * 0.3, retrograde: false }));
  const contacts = nowContacts(natalFull, planets);
  for (let i = 1; i < contacts.length; i++) assert.ok(contacts[i - 1]!.orb <= contacts[i]!.orb);
  assert.ok(contacts.length <= MAX_CONTACTS);
});

test('the wheel draws one line and one dot per contact, and lights only the picked one', () => {
  const now = [
    { body: 'venus' as const, longitude: 195.4, retrograde: false },
    { body: 'mars' as const, longitude: 255, retrograde: false },
  ];
  const contacts = nowContacts(natalFull, now);
  const plain = buildWheelScene(natalFull, null, now);
  const withLines = buildWheelScene(natalFull, null, now, contacts);
  assert.equal(withLines.prims.filter((p) => p.k === 'line').length - plain.prims.filter((p) => p.k === 'line').length, contacts.length);
  const pick = contacts[0]!;
  assert.equal(sameContact({ transit: pick.transit, natal: pick.natal }, pick), true);
  const lit = buildWheelScene(natalFull, null, now, contacts, { transit: pick.transit, natal: pick.natal });
  const faint = lit.prims.filter((p) => p.k === 'line' && p.op === 0.12).length;
  assert.equal(faint, contacts.length - 1);
});
