import test from 'node:test';
import assert from 'node:assert/strict';
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
