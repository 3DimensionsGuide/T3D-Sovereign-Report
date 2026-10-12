import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTimeLordBar } from '../../mobile/src/lib/timeLordBar';

test('the bar fills to the share of the period already lived', () => {
  const m = buildTimeLordBar('Moon', 2024, 2033, 7, 'Saturn')!;
  assert.equal(m.total, 9);
  assert.equal(m.yearsIn, 2);
  assert.ok(Math.abs(m.fraction - 2 / 9) < 1e-9);
  assert.match(m.spoken, /After Moon comes Saturn/);
});

test('years remaining are kept inside the period', () => {
  assert.equal(buildTimeLordBar('Sun', 2000, 2010, 99, null)!.fraction, 0);
  assert.equal(buildTimeLordBar('Sun', 2000, 2010, -3, null)!.fraction, 1);
});

test('a period with no length draws nothing', () => {
  assert.equal(buildTimeLordBar('Sun', 2010, 2010, 0, null), null);
});

import { periodQuote } from '../../mobile/src/lib/timeLordBar';

test('the opening line names the real length of the period', () => {
  assert.equal(
    periodQuote('A decade ruled by the Moon — memory.', 2024, 2033),
    'A nine-year period ruled by the Moon — memory.',
  );
  assert.equal(periodQuote('A decade ruled by the Sun.', 2020, 2030), 'A decade ruled by the Sun.');
  assert.equal(periodQuote('Something else entirely.', 2024, 2033), 'Something else entirely.');
});
