import test from 'node:test';
import assert from 'node:assert/strict';
import { isUnderMinimumAge } from '../../src/lib/ageGate';

const now = new Date(2026, 9, 9);
test('under 13 is blocked', () => assert.equal(isUnderMinimumAge('2015-01-01', now), true));
test('day before 13th birthday is blocked', () => assert.equal(isUnderMinimumAge('2013-10-10', now), true));
test('exactly 13 today is allowed', () => assert.equal(isUnderMinimumAge('2013-10-09', now), false));
test('adult is allowed', () => assert.equal(isUnderMinimumAge('1990-05-05', now), false));
test('malformed input is not treated as under age', () => assert.equal(isUnderMinimumAge('nope', now), false));
