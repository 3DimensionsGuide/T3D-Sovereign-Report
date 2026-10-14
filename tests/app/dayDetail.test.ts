import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p: string) => readFileSync(p, 'utf8');

test('the day card under the ribbon opens each row into its analysis', () => {
  const ribbon = read('mobile/src/components/SignalRibbon.tsx');
  assert.match(ribbon, /<DayDetail/);
  assert.match(ribbon, /premium=\{premium\}/);
  const d = read('mobile/src/components/DayDetail.tsx');
  assert.doesNotMatch(d, /toggle\('personal'\)/, 'the Personal Day is read in its own card, not repeated here');
  assert.match(d, /isEventLocked\(e\.kind, dayKey, todayKey, premium\)/);
  assert.match(d, /gate\.reading\.theme/);
});

test('Timeline passes Premium to the ribbon', () => {
  assert.match(read('mobile/src/app/(tabs)/timeline.tsx'), /<SignalRibbon data=\{data\} onSelectDay=\{setSelectedDay\} premium=\{premium\} \/>/);
});

test('the All lens shows the Personal Day and the gate for the selected day', () => {
  const t = read('mobile/src/app/(tabs)/timeline.tsx');
  assert.match(t, /lens === 'all' \|\| lens === 'road' \? \(\s*<FadeIn><RoadDayBlock/);
  assert.match(t, /lens === 'all' \? \(\s*<FadeIn><VehicleDayBlock/);
});

test('future days stay behind Premium in the shared day blocks', () => {
  const b = read('mobile/src/components/DayLenses.tsx');
  assert.match(b, /selectedDay > 0 && !premium/);
  assert.match(b, /if \(!premium\)/);
});

test('the gate panel matches Your year, with the extra analysis under Show more', () => {
  const v = read('mobile/src/components/VehicleToday.tsx');
  assert.match(v, /<Disclosure label="Show more">/);
  assert.match(v, /styles\.panel/);
  const more = v.slice(v.indexOf('<Disclosure label="Show more">'), v.indexOf('</Disclosure>'));
  for (const t of ['Where it tips over', 'What to do with it', 'How it meets your chart']) assert.ok(more.includes(t), t);
  const before = v.slice(0, v.indexOf('<Disclosure label="Show more">'));
  assert.ok(before.includes('What the Sun brings'));
});

test('decision log: this week and anything still open first, older closed ones behind Show more', async () => {
  const { splitRecentDecisions } = await import('../../mobile/src/lib/decisionRecent');
  const now = Date.parse('2026-10-13T12:00:00Z');
  const d = (id: string, createdAt: string, closed: boolean) => ({ id, createdAt, closed });
  const s = splitRecentDecisions([
    d('new', '2026-10-12T09:00:00Z', true),
    d('openOld', '2026-08-01T09:00:00Z', false),
    d('oldClosed', '2026-09-01T09:00:00Z', true),
  ], now);
  assert.deepEqual(s.recent.map((x) => x.id), ['new', 'openOld']);
  assert.deepEqual(s.older.map((x) => x.id), ['oldClosed']);
});
