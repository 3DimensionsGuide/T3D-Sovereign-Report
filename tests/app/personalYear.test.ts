import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateDayNumerology } from '@/server/engines/dayNumerology';
import { ageOn, personalYearBase, personalYearNumber } from '@/lib/numerology/personalYear';
import { computePersonalYear } from '@/lib/report/schema/normalize';

test('personal year base: before the birthday it is still last year', () => {
  assert.equal(personalYearBase('1990-06-15', '2026-06-14'), 2025);
  assert.equal(personalYearBase('1990-06-15', '2026-06-15'), 2026);
  assert.equal(personalYearBase('1990-06-15', '2026-12-31'), 2026);
  assert.equal(personalYearBase('1990-06-15', '2026-01-01'), 2025);
});

test('personal year changes on the birthday, not on January 1', () => {
  // 6 + 15(->6) + 9 = 21 -> 3 ; 6 + 6 + 1 = 13 -> 4
  assert.equal(personalYearNumber('1990-06-15', '2026-01-01'), 3);
  assert.equal(personalYearNumber('1990-06-15', '2026-06-14'), 3);
  assert.equal(personalYearNumber('1990-06-15', '2026-06-15'), 4);
});

test('matches the knowledge base worked examples, master numbers kept', () => {
  // Jan 9, 2026: 1 + 9 + 1 = 11 (master)
  assert.equal(personalYearNumber('1985-01-09', '2026-03-01'), 11);
  // Apr 29, 2026: 4 + 11 + 1 = 16 -> 7 ; before the birthday: 4 + 11 + 9 = 24 -> 6
  assert.equal(personalYearNumber('1985-04-29', '2026-04-29'), 7);
  assert.equal(personalYearNumber('1985-04-29', '2026-04-28'), 6);
});

test('app and PDF report give the same Personal Year', () => {
  for (const birth of ['1985-01-09', '1985-04-29', '1990-11-11', '1972-02-29', '2001-12-31', '1960-08-22']) {
    for (const on of ['2026-01-01', '2026-06-15', '2026-10-09', '2026-12-31']) {
      const report = computePersonalYear(birth, new Date(`${on}T12:00:00Z`));
      assert.equal(report, calculateDayNumerology(birth, on).personalYear, `${birth} on ${on}`);
    }
  }
});

test('age counts the birthday', () => {
  assert.equal(ageOn('1990-06-15', '2026-06-14'), 35);
  assert.equal(ageOn('1990-06-15', '2026-06-15'), 36);
});
