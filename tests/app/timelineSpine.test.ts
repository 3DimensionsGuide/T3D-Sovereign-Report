import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cycleBar, dayNumber, monthTicks, progressWords, seasonBar } from '../../mobile/src/lib/timelineSpine';

const season = (windowStart: string, windowEnd: string, exactAt: string[] = []) =>
  ({ windowStart, windowEnd, exactAt, lord: false, nature: 'flow' as const });

test('a season inside the axis sits at its day and keeps its width', () => {
  // axis: Oct 1 to Oct 10, ten days
  const b = seasonBar(season('2026-10-03', '2026-10-06'), '2026-10-01', '2026-10-10');
  assert.equal(b.x, 0.2);
  assert.ok(Math.abs(b.width - 0.4) < 1e-9);
  assert.equal(b.cutLeft, false);
  assert.equal(b.cutRight, false);
});

test('a season that began earlier is cut at the left and one that ends later at the right', () => {
  const a = seasonBar(season('2026-09-20', '2026-10-03'), '2026-10-01', '2026-10-10');
  assert.equal(a.x, 0);
  assert.equal(a.cutLeft, true);
  assert.equal(a.cutRight, false);
  const b = seasonBar(season('2026-10-08', '2026-12-01'), '2026-10-01', '2026-10-10');
  assert.equal(b.cutRight, true);
  assert.equal(Math.round((b.x + b.width) * 100), 100);
});

test('exact dates inside the axis become marks, ones outside are dropped', () => {
  const b = seasonBar(season('2026-10-01', '2026-10-10', ['2026-10-02T12:00:00', '2027-01-01T12:00:00']), '2026-10-01', '2026-10-10');
  assert.equal(b.exact.length, 1);
});

test('month ticks fall on month starts inside the axis', () => {
  const t = monthTicks('2026-10-12', '2026-12-10');
  assert.deepEqual(t.map((x) => x.label), ['Nov', 'Dec']);
  assert.ok(t.every((x) => x.x > 0 && x.x < 1));
});

test('cycle bar splits by length and marks today inside the current cycle', () => {
  const m = cycleBar(
    { number: 5, startsOn: '2020-01-01', endsOn: '2030-01-01' },
    { number: 8, startsOn: '2030-01-01', endsOn: '2039-01-01' },
    '2025-01-01',
  );
  assert.equal(m.segments.length, 2);
  assert.ok(Math.abs(m.segments[0]!.width + m.segments[1]!.width - 1) < 1e-9);
  assert.ok(m.progress > 0.48 && m.progress < 0.52);
  assert.ok(m.todayX < m.segments[0]!.width);
});

test('an open-ended cycle still draws, and a missing next cycle gives one segment', () => {
  const m = cycleBar({ number: 9, startsOn: '2020-01-01', endsOn: null }, null, '2021-01-01');
  assert.equal(m.segments.length, 1);
  assert.equal(m.segments[0]!.width, 1);
});

test('progress words and day numbers', () => {
  assert.equal(progressWords(0.4), 'About 40% of the way through');
  assert.equal(progressWords(0.01), 'Just beginning');
  assert.equal(dayNumber('2026-10-02') - dayNumber('2026-10-01'), 1);
});
