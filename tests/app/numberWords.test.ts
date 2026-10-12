import test from 'node:test';
import assert from 'node:assert/strict';
import { cycleLine, numberWord } from '../../mobile/src/lib/numberWords';

test('numberWord names 1–9 and the masters, and is empty for anything else', () => {
  assert.equal(numberWord(4), 'Foundations');
  assert.equal(numberWord(11), 'Illumination');
  assert.equal(numberWord(10), '');
});

test('cycleLine says the scope, the number, its word and what the scope means', () => {
  assert.equal(
    cycleLine('Year', 4),
    'Personal Year 4, Foundations: the theme of your whole year, about hard work, practical structure and steady effort.',
  );
  assert.match(cycleLine('Month', 5), /^Personal Month 5, Change: the tone of this month inside that year/);
});

test('cycleLine still reads for an unknown number', () => {
  assert.equal(cycleLine('Day', 99), 'Personal Day 99: how today lands inside the month.');
});
