import test from 'node:test';
import assert from 'node:assert/strict';
import { dialAngle, dialBase, dialSpoken, tickPoint } from '../../mobile/src/lib/dials';

test('tick 1 is straight up and each tick is 40 degrees on', () => {
  assert.equal(dialAngle(1), 0);
  assert.equal(dialAngle(2), 40);
  assert.equal(dialAngle(9), 320);
});

test('master numbers sit on their foundation tick', () => {
  assert.equal(dialBase(11), 2);
  assert.equal(dialBase(22), 4);
  assert.equal(dialBase(33), 6);
  assert.equal(dialAngle(22), dialAngle(4));
});

test('numbers outside 1 to 9 are kept on the dial', () => {
  assert.equal(dialBase(0), 1);
  assert.equal(dialBase(12), 9);
});

test('tick points go clockwise from the top', () => {
  assert.deepEqual(tickPoint(1, 10, 20, 20), { x: 20, y: 10 });
  const t4 = tickPoint(4, 10, 20, 20); // 120 degrees: lower right
  assert.ok(t4.x > 20 && t4.y > 20);
});

test('the dial is described in words', () => {
  assert.equal(dialSpoken('Month', 7), 'Personal Month 7, at tick 7 of 9');
});
