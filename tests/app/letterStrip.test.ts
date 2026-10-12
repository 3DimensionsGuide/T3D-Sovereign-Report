import assert from 'node:assert/strict';
import { test } from 'node:test';
import { LETTER_ITEM, letterAt } from '../../mobile/src/lib/letterStrip';

test('a touch lands on the letter under the finger', () => {
  assert.equal(letterAt(0, 5), 0);
  assert.equal(letterAt(LETTER_ITEM - 1, 5), 0);
  assert.equal(letterAt(LETTER_ITEM, 5), 1);
  assert.equal(letterAt(LETTER_ITEM * 3 + 5, 5), 3);
});

test('sliding past either end sticks to the first or last letter', () => {
  assert.equal(letterAt(-40, 5), 0);
  assert.equal(letterAt(9999, 5), 4);
});

test('no letters means no jump', () => {
  assert.equal(letterAt(10, 0), -1);
});
