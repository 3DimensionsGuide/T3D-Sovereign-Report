import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MOON_SIGNS, MOON_SIGN_READINGS, buildMoonDay } from '../../src/lib/app/moonDay';

// A Moon that moves 13 degrees a day, starting 5 degrees into Aries at jd 2461000.
const lonAt = (jd: number) => 5 + (jd - 2461000) * 13;

test('every sign has a theme, a shadow and guidance', () => {
  assert.equal(MOON_SIGNS.length, 12);
  for (const s of MOON_SIGNS) {
    const r = MOON_SIGN_READINGS[s];
    assert.ok(r.theme.length > 30 && r.shadow.length > 30 && r.guidance.length > 30, `${s} too thin`);
  }
});

test('a day inside one sign has one stretch, with the house counted from the Rising sign', () => {
  const day = buildMoonDay(2461000, 95, lonAt); // Rising 5 degrees Cancer; Moon in Aries
  assert.equal(day.length, 1);
  assert.equal(day[0]!.sign, 'Aries');
  assert.equal(day[0]!.from, null);
  assert.equal(day[0]!.house, 10); // Aries is the 10th whole sign from Cancer
  assert.ok(new Date(day[0]!.until).getTime() > (2461000 + 1 - 2440587.5) * 86400000);
});

test('a day that crosses a sign boundary has two stretches that meet at the change', () => {
  const day = buildMoonDay(2461001, 0, lonAt); // 18 degrees to 31 degrees: Aries into Taurus
  assert.equal(day.length, 2);
  assert.deepEqual(day.map((d) => d.sign), ['Aries', 'Taurus']);
  assert.equal(day[0]!.until, day[1]!.from);
  assert.equal(day[1]!.house, 2);
  const changeJd = 2461000 + 25 / 13;
  assert.ok(Math.abs(new Date(day[0]!.until).getTime() - (changeJd - 2440587.5) * 86400000) < 2000);
});

test('the server builds Moon days and the Stoplight lens shows them', () => {
  assert.match(readFileSync('src/server/engines/timeline.ts', 'utf8'), /moonDays\.push\(/);
  assert.match(readFileSync('mobile/src/components/DayLenses.tsx', 'utf8'), /export function StoplightDayBlock/);
  assert.match(readFileSync('mobile/src/app/(tabs)/timeline.tsx', 'utf8'), /lens === 'all' \|\| lens === 'stoplight'[\s\S]{0,80}StoplightDayBlock/);
  assert.match(readFileSync('mobile/src/lib/useTimeline.ts', 'utf8'), /CACHE_VERSION = 7/);
});
