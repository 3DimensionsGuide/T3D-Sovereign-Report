import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p: string) => readFileSync(p, 'utf8');

test('the day card under the ribbon opens each row into its analysis', () => {
  const ribbon = read('mobile/src/components/SignalRibbon.tsx');
  assert.match(ribbon, /<DayDetail/);
  assert.match(ribbon, /premium=\{premium\}/);
  const d = read('mobile/src/components/DayDetail.tsx');
  assert.match(d, /toggle\('personal'\)/);
  assert.match(d, /isEventLocked\(e\.kind, dayKey, todayKey, premium\)/);
  assert.match(d, /gate\.reading\.theme/);
  assert.match(d, /<RoadDayBlock/);
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
