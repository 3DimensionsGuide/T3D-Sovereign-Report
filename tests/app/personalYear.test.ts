import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateDayNumerology, personalYearBase } from '@/server/engines/dayNumerology';

test('personal year base: before the birthday it is still last year', () => {
  assert.equal(personalYearBase('1990-06-15', '2026-06-14'), 2025);
  assert.equal(personalYearBase('1990-06-15', '2026-06-15'), 2026);
  assert.equal(personalYearBase('1990-06-15', '2026-12-31'), 2026);
  assert.equal(personalYearBase('1990-06-15', '2026-01-01'), 2025);
});

test('personal year changes on the birthday, not on January 1', () => {
  // 6 + 15 + (2+0+2+5=9) = 30 -> 3 ; 6 + 15 + (2+0+2+6=10 -> 1) = 22 (master)
  assert.equal(calculateDayNumerology('1990-06-15', '2026-01-01').personalYear, 3);
  assert.equal(calculateDayNumerology('1990-06-15', '2026-06-14').personalYear, 3);
  assert.equal(calculateDayNumerology('1990-06-15', '2026-06-15').personalYear, 22);
});
