import test from 'node:test';
import assert from 'node:assert/strict';
import { signOfLongitude } from '../../src/lib/app/skyNow';

test('signOfLongitude maps degrees to signs, including wraparound', () => {
  assert.equal(signOfLongitude(0), 'Aries');
  assert.equal(signOfLongitude(29.99), 'Aries');
  assert.equal(signOfLongitude(30), 'Taurus');
  assert.equal(signOfLongitude(359.9), 'Pisces');
  assert.equal(signOfLongitude(360), 'Aries');
  assert.equal(signOfLongitude(-1), 'Pisces');
});
