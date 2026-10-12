import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateHiddenPassion, calculateKarmicLessons, calculateNameColumns } from '../../src/server/engines/numerology';
import { describeColumns, passionColumn } from '../../mobile/src/lib/nameColumns';

test('letters sit under their Pythagorean number, repeats kept, in name order', () => {
  const cols = calculateNameColumns('Anna', undefined, 'Jones');
  assert.deepEqual(cols[0]!.letters, ['A', 'A', 'J', 'S']); // A, J, S = 1
  assert.deepEqual(cols[4]!.letters, ['N', 'N', 'N', 'E']); // E, N, W = 5
  assert.equal(cols.reduce((n, c) => n + c.count, 0), 'AnnaJones'.length);
});

test('middle names and punctuation are handled like the other numbers', () => {
  const withMiddle = calculateNameColumns('Mary-Ann', 'Lee', "O'Neil");
  assert.equal(withMiddle.reduce((n, c) => n + c.count, 0), 'MaryAnnLeeONeil'.length);
});

test('the tallest column is the Hidden Passion and empty columns are the Karmic Lessons', () => {
  for (const [f, m, l] of [['Tyler', 'James', 'Henry'], ['Anna', undefined, 'Jones'], ['Zoe', undefined, 'Li']] as const) {
    const cols = calculateNameColumns(f, m, l);
    assert.equal(passionColumn(cols), calculateHiddenPassion(f, m, l), `${f} ${l} passion`);
    assert.deepEqual(cols.filter((c) => c.count === 0).map((c) => c.number), calculateKarmicLessons(f, m, l), `${f} ${l} karmic`);
  }
});

test('the spoken description names the passion and the empty columns', () => {
  const text = describeColumns(calculateNameColumns('Anna', undefined, 'Jones'));
  assert.match(text, /Most letters: \d, your Hidden Passion/);
  assert.match(text, /Empty: .*your Karmic Lessons?/);
});
