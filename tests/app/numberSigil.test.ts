import test from 'node:test';
import assert from 'node:assert/strict';
import { polygonPoints, sigilNumber, sigilShape } from '../../mobile/src/lib/numberSigil';

test('numbers 1 to 9 each get their own shape', () => {
  assert.deepEqual(sigilShape(1), { kind: 'point', master: false });
  assert.deepEqual(sigilShape(2), { kind: 'vesica', master: false });
  for (let n = 3; n <= 9; n++) assert.deepEqual(sigilShape(n), { kind: 'polygon', sides: n, master: false });
});

test('master numbers draw their base shape with a second ring', () => {
  assert.deepEqual(sigilShape(11), { kind: 'vesica', master: true });
  assert.deepEqual(sigilShape(22), { kind: 'polygon', sides: 4, master: true });
  assert.deepEqual(sigilShape(33), { kind: 'polygon', sides: 6, master: true });
});

test('anything else has no sigil', () => {
  for (const n of [0, 10, 12, 44, -1, 2.5]) assert.equal(sigilShape(n), null);
});

test('the number is read from the start of a label', () => {
  assert.equal(sigilNumber('5'), 5);
  assert.equal(sigilNumber('11/2'), 11);
  assert.equal(sigilNumber(' 22/4'), 22);
  assert.equal(sigilNumber('Peace'), null);
  assert.equal(sigilNumber('44'), null);
  assert.equal(sigilNumber('0'), null);
});

test('a polygon has one point per side and the first corner is straight up', () => {
  for (let s = 3; s <= 9; s++) assert.equal(polygonPoints(s, 28, 28, 19).split(' ').length, s);
  assert.equal(polygonPoints(4, 28, 28, 10).split(' ')[0], '28,18');
});
