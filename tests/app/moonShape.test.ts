import test from 'node:test';
import assert from 'node:assert/strict';
import { moonShape } from '../../mobile/src/lib/moonShape';

test('a new moon has nothing lit and a full moon is a whole disc', () => {
  assert.deepEqual(moonShape(0, true), { kind: 'none' });
  assert.deepEqual(moonShape(1, false), { kind: 'none' });
  assert.deepEqual(moonShape(100, true), { kind: 'full' });
  assert.deepEqual(moonShape(99, false), { kind: 'full' });
});

test('at a quarter the edge of the light is straight (zero width)', () => {
  const s = moonShape(50, true);
  assert.equal(s.kind, 'path');
  if (s.kind === 'path') assert.match(s.d, /A 0 20 0 0 1 24 4 Z$/);
});

test('waxing is lit on the right, waning on the left', () => {
  const waxing = moonShape(25, true);
  const waning = moonShape(25, false);
  assert.ok(waxing.kind === 'path' && waning.kind === 'path');
  if (waxing.kind === 'path' && waning.kind === 'path') {
    assert.match(waxing.d, /A 20 20 0 0 1 24 44/); // limb down the right side
    assert.match(waning.d, /A 20 20 0 0 0 24 44/); // limb down the left side
  }
});

test('a crescent edge bulges toward the lit side and a gibbous edge away from it', () => {
  const crescent = moonShape(25, true);
  const gibbous = moonShape(75, true);
  assert.ok(crescent.kind === 'path' && gibbous.kind === 'path');
  if (crescent.kind === 'path' && gibbous.kind === 'path') {
    assert.match(crescent.d, /A 10 20 0 0 0 24 4 Z$/);
    assert.match(gibbous.d, /A 10 20 0 0 1 24 4 Z$/);
  }
});
