import assert from 'node:assert/strict';
import { test } from 'node:test';
import { LETTER_ITEM, letterAt, letterTargets } from '../../mobile/src/lib/letterStrip';

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

test('letter targets point at the first term for each letter, across several lists', () => {
  const targets = letterTargets([
    ['Authority', 'Bodygraph', null, 'Channel'],
    ['Attitude', 'Birthday', 'Destiny'],
    ['Ascendant', 'Moon', '9 Not a letter'],
  ]);
  assert.deepEqual(targets, [['A', 0, 0], ['B', 0, 1], ['C', 0, 3], ['D', 1, 2], ['M', 2, 1]]);
  assert.deepEqual(letterTargets([]), []);
  assert.deepEqual(letterTargets([[null, null]]), []);
});

test('the glossary shows the letter strip under All too, but not for Yours or while searching', async () => {
  const { readFileSync } = await import('node:fs');
  const g = readFileSync(new URL('../../mobile/src/app/glossary.tsx', import.meta.url), 'utf8');
  assert.match(g, /if \(filter === 'yours' \|\| searching\) return \[\]/);
  assert.match(g, /filter === 'all' \? sections : sections\.slice\(0, 1\)/);
  assert.match(g, /sectionIndex: at\[1\], itemIndex: at\[2\]/);
});
