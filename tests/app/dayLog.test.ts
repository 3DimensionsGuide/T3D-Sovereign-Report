import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addDaysTo, findPatterns, weeklyRecap, monthlyCounts, daysToPatterns, MIN_FOR_PATTERNS,
  type DayLog, type Feeling,
} from '../../mobile/src/lib/dayLog';

const ctx = (pd: number | null, signal: 'go' | 'slow' | 'pause' | null = null, moon: string | null = null) => ({ personalDay: pd, signal, moonSign: moon });
const e = (feeling: Feeling, pd: number | null = null, signal: 'go' | 'slow' | 'pause' | null = null, moon: string | null = null) => ({ feeling, ctx: ctx(pd, signal, moon) });

test('addDaysTo crosses month and year edges', () => {
  assert.equal(addDaysTo('2026-01-01', -1), '2025-12-31');
  assert.equal(addDaysTo('2026-02-28', 1), '2026-03-01');
});

test('no patterns below the minimum number of notes', () => {
  const log: DayLog = {};
  for (let i = 0; i < MIN_FOR_PATTERNS - 1; i++) log[addDaysTo('2026-03-01', i)] = e('clear', 5);
  assert.deepEqual(findPatterns(log), []);
  assert.equal(daysToPatterns(log), 1);
});

test('finds a clearer pattern with counts, and ignores groups that are too small', () => {
  const log: DayLog = {};
  let i = 0;
  const add = (x: ReturnType<typeof e>) => { log[addDaysTo('2026-03-01', i++)] = x; };
  for (let k = 0; k < 4; k++) add(e('clear', 5));
  for (let k = 0; k < 10; k++) add(e(k < 3 ? 'clear' : 'heavy', 2));
  add(e('heavy', 8)); add(e('heavy', 8)); // only 2 days: never compared
  const found = findPatterns(log);
  const p5 = found.find((p) => p.id === 'personalDay:5');
  assert.ok(p5);
  assert.equal(p5!.lean, 'clearer');
  assert.equal(p5!.clearIn, 4);
  assert.equal(p5!.total, 4);
  assert.match(p5!.text, /Personal Day 5: you marked Clear on 4 of 4, against 3 of 12/);
  assert.ok(!found.some((p) => p.id === 'personalDay:8'));
});

test('a flat history reports nothing', () => {
  const log: DayLog = {};
  for (let i = 0; i < 20; i++) log[addDaysTo('2026-03-01', i)] = e(i % 2 ? 'clear' : 'heavy', (Math.floor(i / 2) % 4) + 1, Math.floor(i / 2) % 2 ? 'go' : 'slow', Math.floor(i / 4) % 2 ? 'Aries' : 'Leo');
  assert.deepEqual(findPatterns(log), []);
});

test('weekly recap needs three logged days in the last seven', () => {
  const today = '2026-03-10';
  const log: DayLog = { '2026-03-09': e('clear'), '2026-03-08': e('mixed') };
  assert.equal(weeklyRecap(log, today).kind, 'none');
  log['2026-03-04'] = e('heavy');
  const r = weeklyRecap(log, today);
  assert.equal(r.kind, 'week');
  assert.equal(r.line, 'This week you logged 3 of 7 days: 1 clear, 1 mixed, 1 heavy.');
  log['2026-03-02'] = e('clear'); // outside the last seven
  assert.equal(weeklyRecap(log, today).logged, 3);
  assert.equal(monthlyCounts(log, today).logged, 4);
});
