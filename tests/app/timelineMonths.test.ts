import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { monthOf, splitCurrentMonth } from '../../mobile/src/lib/timelineMonths';

const g = (day: string): [string, string[]] => [day, ['e']];

test('days up to the end of this month stay, later months move behind the button', () => {
  const r = splitCurrentMonth([g('2026-10-11'), g('2026-10-31'), g('2026-11-01'), g('2026-12-05')], '2026-10-11');
  assert.deepEqual(r.now.map(([d]) => d), ['2026-10-11', '2026-10-31']);
  assert.deepEqual(r.later.map(([d]) => d), ['2026-11-01', '2026-12-05']);
  assert.deepEqual(r.laterMonths, ['2026-11', '2026-12']);
});

test('nothing later gives an empty later list, so no button is needed', () => {
  const r = splitCurrentMonth([g('2026-10-11'), g('2026-10-20')], '2026-10-11');
  assert.equal(r.later.length, 0);
  assert.deepEqual(r.laterMonths, []);
});

test('a month with no events yet still leaves the later days behind the button', () => {
  const r = splitCurrentMonth([g('2026-11-02')], '2026-10-30');
  assert.equal(r.now.length, 0);
  assert.equal(r.later.length, 1);
});

test('the year rolls over correctly', () => {
  const r = splitCurrentMonth([g('2026-12-30'), g('2027-01-02')], '2026-12-28');
  assert.deepEqual(r.now.map(([d]) => d), ['2026-12-30']);
  assert.deepEqual(r.laterMonths, ['2027-01']);
});

test('monthOf takes the year and month', () => {
  assert.equal(monthOf('2026-10-11'), '2026-10');
});

import { addDaysKey, splitWeek } from '../../mobile/src/lib/timelineMonths';

test('addDaysKey crosses month and year ends', () => {
  assert.equal(addDaysKey('2026-10-13', 7), '2026-10-20');
  assert.equal(addDaysKey('2026-10-28', 7), '2026-11-04');
  assert.equal(addDaysKey('2026-12-29', 7), '2027-01-05');
});

test('the week is today and the next six days, the rest of the month follows', () => {
  const days = ['2026-10-13', '2026-10-15', '2026-10-19', '2026-10-20', '2026-10-31'].map(g);
  const r = splitWeek(days, '2026-10-13');
  assert.deepEqual(r.week.map(([d]) => d), ['2026-10-13', '2026-10-15', '2026-10-19']);
  assert.deepEqual(r.rest.map(([d]) => d), ['2026-10-20', '2026-10-31']);
});

test('an empty week leaves everything in the rest', () => {
  const r = splitWeek([g('2026-10-25')], '2026-10-13');
  assert.equal(r.week.length, 0);
  assert.equal(r.rest.length, 1);
});

test('Timeline shows the week first and the rest of the month behind Show more', () => {
  const src = readFileSync('mobile/src/app/(tabs)/timeline.tsx', 'utf8');
  assert.match(src, /const visibleGroups = weekSplit\.week;/);
  assert.match(src, /showMore && restDays > 0/);
  assert.match(src, /Rest of \{monthTitle\(nowMonthKey\)\}/);
});
