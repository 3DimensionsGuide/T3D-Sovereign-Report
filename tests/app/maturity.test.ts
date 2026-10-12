import test from 'node:test';
import assert from 'node:assert/strict';
import { MATURITY_MEANINGS, buildEntry, maturityNumber } from '../../src/lib/app/glossary';

test('Maturity is Life Path plus Destiny, reduced, keeping masters', () => {
  assert.equal(maturityNumber(4, 3), 7);
  assert.equal(maturityNumber(8, 9), 8); // 17 -> 8
  assert.equal(maturityNumber(5, 6), 11); // 11 stays
  assert.equal(maturityNumber(11, 11), 22);
  assert.equal(maturityNumber(22, 11), 33);
  assert.equal(maturityNumber(9, 9), 9); // 18 -> 9
});

test('every possible Maturity Number has a meaning', () => {
  for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]) assert.ok(MATURITY_MEANINGS[n], String(n));
});

test('the Maturity entry says "Yours" from the saved Life Path and Destiny', () => {
  const e = buildEntry('num:maturity', { numerology: { lifePath: 4, destiny: 3 } } as never);
  assert.ok(e);
  assert.match(JSON.stringify(e), /Yours is 7: your Life Path 4 plus your Destiny 3/);
});

test('Subconscious Self is 9 minus the missing digits', () => {
  const e = buildEntry('num:subconscious', { numerology: { karmicLessons: [2, 5] } } as never);
  assert.match(JSON.stringify(e), /Yours is 7: 2 digits are missing/);
  const full = buildEntry('num:subconscious', { numerology: { karmicLessons: [] } } as never);
  assert.match(JSON.stringify(full), /Yours is 9/);
});
