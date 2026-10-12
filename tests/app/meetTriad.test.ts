import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  currentStop, daysBetween, FREE_DAYS, opensOn, showTodayCard, STOPS, stopStatus, statusWord, TOTAL_DAYS,
} from '../../mobile/src/lib/meetTriad';

test('there are seven stops, the first three free and the rest Premium', () => {
  assert.equal(STOPS.length, TOTAL_DAYS);
  assert.deepEqual(STOPS.map((s) => s.day), [1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(STOPS.filter((s) => s.free).map((s) => s.day), [1, 2, 3]);
  assert.equal(FREE_DAYS, 3);
  for (const s of STOPS) assert.ok(s.title && s.blurb && s.tryIt);
});

test('the first three stops show the Vehicle, Road and Stoplight in that order', () => {
  assert.deepEqual(STOPS.slice(0, 3).map((s) => s.lens), ['vehicle', 'road', 'stoplight']);
});

test('day counting crosses month and year ends', () => {
  assert.equal(daysBetween('2026-10-12', '2026-10-12'), 0);
  assert.equal(daysBetween('2026-10-30', '2026-11-02'), 3);
  assert.equal(daysBetween('2026-12-30', '2027-01-02'), 3);
  assert.equal(opensOn('2026-10-30', 4), '2026-11-02');
  assert.equal(opensOn('2026-10-12', 1), '2026-10-12');
});

test('one stop opens each day and never goes past seven', () => {
  assert.equal(currentStop('2026-10-12', '2026-10-12'), 1);
  assert.equal(currentStop('2026-10-12', '2026-10-14'), 3);
  assert.equal(currentStop('2026-10-12', '2026-11-30'), 7);
  assert.equal(currentStop('2026-10-12', '2026-10-10'), 1, 'a clock set back still shows day 1');
});

test('status: free stops open by date, done sticks, Premium stops stay locked without Premium', () => {
  const [d1, d2, , d4] = STOPS;
  assert.equal(stopStatus(d1, '2026-10-12', '2026-10-12', [], false), 'open');
  assert.equal(stopStatus(d2, '2026-10-12', '2026-10-12', [], false), 'soon');
  assert.equal(stopStatus(d1, '2026-10-12', '2026-10-12', [1], false), 'done');
  assert.equal(stopStatus(d4, '2026-10-12', '2026-10-20', [], false), 'premium', 'locked even when its day has come');
  assert.equal(stopStatus(d4, '2026-10-12', '2026-10-12', [], true), 'soon');
  assert.equal(stopStatus(d4, '2026-10-12', '2026-10-15', [], true), 'open');
});

test('every status has a written word (never colour alone)', () => {
  assert.equal(statusWord('premium'), 'Premium');
  assert.equal(statusWord('done'), 'Done');
  assert.equal(statusWord('open'), 'Open now');
  assert.equal(statusWord('soon'), 'Opens soon');
});

test('the Today card shows during the first week and hides after it', () => {
  assert.equal(showTodayCard(null, '2026-10-12', [], false), false);
  assert.equal(showTodayCard('2026-10-12', '2026-10-12', [], false), true);
  assert.equal(showTodayCard('2026-10-12', '2026-10-18', [], false), true);
  assert.equal(showTodayCard('2026-10-12', '2026-10-19', [], false), false);
});

test('the Today card hides once every free stop is done on day 3 or later', () => {
  assert.equal(showTodayCard('2026-10-12', '2026-10-14', [1, 2, 3], false), false);
  assert.equal(showTodayCard('2026-10-12', '2026-10-14', [1, 2, 3], true), true, 'Premium people still have stops to go');
  assert.equal(showTodayCard('2026-10-12', '2026-10-13', [1, 2], false), true);
});

import { readFileSync } from 'node:fs';
const read = (p: string) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');

test('Premium is a placeholder that is off for everyone, and only dev builds can flip it', () => {
  const store = read('mobile/src/store/useMeetTriadStore.ts');
  assert.match(store, /premium: false/);
  const screen = read('mobile/src/app/meet-triad.tsx');
  assert.match(screen, /__DEV__ \? \(/, 'the preview switch is dev-only');
});

test('the screen writes every state out and marks locked stops with a lock and the word Premium', () => {
  const screen = read('mobile/src/app/meet-triad.tsx');
  assert.match(screen, /statusWord\(status\)/);
  assert.match(screen, /LockIcon/);
  assert.match(screen, /accessibilityState=\{\{ expanded: open \}\}/);
  assert.match(screen, /Subscriptions are not open yet/);
});

test('the first three stops reuse the bodygraph chip, the Road dials and the signal lamp', () => {
  const screen = read('mobile/src/app/meet-triad.tsx');
  assert.match(screen, /<BodygraphChip/);
  assert.match(screen, /<DayNumerologyCard/);
  assert.match(screen, /<SignalLamp/);
  assert.match(screen, /<TransitMiniWheel/);
});

test('Today shows the first-week card only for the live day', () => {
  const today = read('mobile/src/app/(tabs)/today.tsx');
  assert.match(today, /isToday \? <MeetTriadCard \/> : null/);
});
