/**
 * The birth moment must not depend on when the chart is calculated.
 *
 * This is the test that would have caught the bug it was written for. Luxon settles an ambiguous
 * wall-clock reading by starting from the zone's offset *at the moment you ask*, so a birth in the
 * repeated hour of a daylight-saving change resolved one way while New York was on daylight time
 * and the other way after the clocks went back. The golden snapshot was verified against Astro.com
 * and Jovian Archive on 9 October 2026 and started failing on 1 November, with nothing in the
 * repository having changed.
 *
 * So every case below is run against several simulated "now" dates, chosen either side of the
 * northern and southern clock changes. A result that moves is a failure even when it is otherwise
 * the right answer.
 *
 * These tests need no ephemeris, so they still run when the native Swiss Ephemeris module cannot
 * load — which is exactly the situation where the golden charts fall silent.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { Settings } from 'luxon';
import { resolveLocalInstant } from '../../src/server/localInstant';
import { FIXTURES } from '../golden/fixtures';

/** Dates spread across the year, either side of the usual clock changes in both hemispheres. */
const SIMULATED_NOW: readonly (readonly [number, number, number])[] = [
  [2026, 1, 15], [2026, 3, 20], [2026, 4, 10], [2026, 7, 15],
  [2026, 10, 9], [2026, 10, 28], [2026, 11, 7], [2027, 2, 1],
];

/** Runs `fn` as though today were that date, and always puts the clock back afterwards. */
function asOf<T>(year: number, month: number, day: number, fn: () => T): T {
  const saved = Settings.now;
  Settings.now = () => Date.UTC(year, month - 1, day, 12, 0, 0);
  try {
    return fn();
  } finally {
    Settings.now = saved;
  }
}

/** The one answer this reading gives on every simulated date, or a failure if it gives more than one. */
function stableInstant(dateStr: string, timeStr: string, timezone: string, label: string): string {
  const seen = new Map<string, string>();
  for (const [y, m, d] of SIMULATED_NOW) {
    const got = asOf(y, m, d, () => resolveLocalInstant(dateStr, timeStr, timezone).utc.toISO()!);
    seen.set(got, `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }
  assert.equal(
    seen.size,
    1,
    `${label}: the birth moment moved with the calendar — ${[...seen].map(([iso, on]) => `${on} gave ${iso}`).join('; ')}`,
  );
  return [...seen.keys()][0]!;
}

// ─── the two readings that are not one moment ────────────────────────────────

test('an hour that ran twice resolves to the first of the two, and never moves', () => {
  // New York, 30 Oct 2005: the clocks went back from 2:00 to 1:00, so 1:30 AM happened twice.
  // tests/golden/verification.json records Astro.com and Jovian Archive both reading this as the
  // first 1:30 — daylight time, 05:30 UTC.
  const iso = stableInstant('2005-10-30', '01:30', 'America/New_York', 'nyc-ambiguous-2005');
  assert.equal(iso, '2005-10-30T05:30:00.000Z');

  const r = asOf(2026, 11, 7, () => resolveLocalInstant('2005-10-30', '01:30', 'America/New_York'));
  assert.equal(r.resolution, 'ambiguous');
  assert.equal(r.offsetMinutes, -240, 'the first 1:30 is on daylight time, UTC-4');
});

test('an hour that never ran is carried across the gap, and never moves', () => {
  // Berlin, 28 Mar 1993: the clocks jumped from 2:00 to 3:00, so 2:30 AM did not exist.
  // Reading it with the offset from before the change carries it to 3:30 local, 01:30 UTC.
  const iso = stableInstant('1993-03-28', '02:30', 'Europe/Berlin', 'berlin-dstgap-1993');
  assert.equal(iso, '1993-03-28T01:30:00.000Z');

  const r = asOf(2026, 7, 15, () => resolveLocalInstant('1993-03-28', '02:30', 'Europe/Berlin'));
  assert.equal(r.resolution, 'nonexistent');
});

test('the southern hemisphere changes its clocks too', () => {
  // Sydney, 2 Apr 2017: back from 3:00 to 2:00, so 2:30 ran twice. The first is daylight time.
  const iso = stableInstant('2017-04-02', '02:30', 'Australia/Sydney', 'sydney-ambiguous-2017');
  assert.equal(iso, '2017-04-01T15:30:00.000Z');
  const r = asOf(2026, 1, 15, () => resolveLocalInstant('2017-04-02', '02:30', 'Australia/Sydney'));
  assert.equal(r.resolution, 'ambiguous');
  assert.equal(r.offsetMinutes, 660, 'the first 2:30 is on summer time, UTC+11');
});

// ─── the ordinary readings must be untouched ─────────────────────────────────

test('every golden chart resolves to one moment, whatever the date today', () => {
  for (const f of FIXTURES) {
    const iso = stableInstant(f.birthDate, f.birthTime, f.timezone, f.id);
    assert.match(iso, /^-?\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\.000Z$/, f.id);
  }
});

test('an ordinary reading is marked exact, including the awkward offsets', () => {
  const cases: [string, string, string, string][] = [
    ['1990-11-12', '15:42', 'America/Los_Angeles', '1990-11-12T23:42:00.000Z'],
    ['2012-12-21', '11:11', 'Asia/Kathmandu',      '2012-12-21T05:26:00.000Z'], // UTC+5:45
    ['1960-03-21', '06:00', 'Asia/Kolkata',        '1960-03-21T00:30:00.000Z'], // UTC+5:30
    ['1988-12-31', '23:59', 'Asia/Tokyo',          '1988-12-31T14:59:00.000Z'],
    ['2023-04-09', '18:45', 'Asia/Dubai',          '2023-04-09T14:45:00.000Z'], // no daylight saving
  ];
  for (const [d, t, tz, want] of cases) {
    const r = asOf(2026, 11, 7, () => resolveLocalInstant(d, t, tz));
    assert.equal(r.utc.toISO(), want, `${d} ${t} ${tz}`);
    assert.equal(r.resolution, 'exact', `${d} ${t} ${tz}`);
  }
});

test('midnight and the minute before it are read on the right day', () => {
  const midnight = asOf(2026, 7, 15, () => resolveLocalInstant('1975-01-01', '00:00', 'Europe/London'));
  assert.equal(midnight.utc.toISO(), '1975-01-01T00:00:00.000Z');
  // Britain stayed on UTC+1 all through 1968-71, so a 1975 January midnight is plain UTC.
  assert.equal(midnight.offsetMinutes, 0);
});

// ─── the edges of the input ──────────────────────────────────────────────────

test('a time zone that does not exist is refused rather than guessed at', () => {
  assert.throws(() => resolveLocalInstant('1990-01-01', '12:00', 'Mars/Olympus_Mons'), /Unknown time zone/);
  assert.throws(() => resolveLocalInstant('1990-01-01', '12:00', ''), /Unknown time zone/);
});

test('a date or time that cannot be read is refused', () => {
  assert.throws(() => resolveLocalInstant('not-a-date', '12:00', 'UTC'), /Invalid date or time/);
  assert.throws(() => resolveLocalInstant('1990-01-01', '25:00', 'UTC'), /Invalid date or time/);
  assert.throws(() => resolveLocalInstant('1990-13-01', '12:00', 'UTC'), /Invalid date or time/);
});

test('UTC itself has no edges to fall off', () => {
  const r = asOf(2026, 11, 7, () => resolveLocalInstant('2000-06-15', '08:30', 'UTC'));
  assert.equal(r.utc.toISO(), '2000-06-15T08:30:00.000Z');
  assert.equal(r.offsetMinutes, 0);
  assert.equal(r.resolution, 'exact');
});

test('the clock is left as it was found', () => {
  const before = Settings.now;
  try {
    asOf(2026, 11, 7, () => resolveLocalInstant('1990-01-01', '12:00', 'UTC'));
  } catch {
    // even then
  }
  assert.equal(Settings.now, before);
});
