/**
 * The shared "decide together" calculation. These run the real Human Design and astrology engines, so they
 * need the same native library as the other chart tests.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { computeTogether, type TogetherSide } from '../../src/server/togetherCompute';

const austin = { latitude: 30.2672, longitude: -97.7431, timezone: 'America/Chicago' };
const full: TogetherSide = { label: 'You', birthDate: '1990-03-15', birthTime: '14:30', place: austin };
const dateOnly: TogetherSide = { label: 'Sam', birthDate: '1988-11-02', birthTime: null, place: null };
const NOW = '2026-10-14';

test('two full charts give every part of the reading', () => {
  const r = computeTogether(full, { ...full, label: 'Alex', birthDate: '1985-07-20', birthTime: '09:10' }, NOW);
  assert.equal(r.people[0].label, 'You');
  assert.equal(r.people[1].label, 'Alex');
  assert.equal(r.people[0].certainty, 'sure');
  assert.ok(r.connections && r.centers && r.numbers && r.sky);
});

test('a first look from a date alone still gives a reading and never claims more than it knows', () => {
  const r = computeTogether(full, dateOnly, NOW);
  assert.equal(r.people[1].label, 'Sam');
  assert.ok(r.numbers, 'numbers need only the date');
  const them = r.people[1];
  if (them.certainty === 'sure') assert.deepEqual(them.possibilities, []);
  else assert.ok(them.possibilities.length >= 2);
});

test('two first looks work too, and a time without a place is ignored', () => {
  const r = computeTogether({ ...dateOnly, label: 'You', birthTime: '10:00' }, dateOnly, NOW);
  assert.equal(r.people.length, 2);
});

test('the same date as a full chart and as a first look agree on the Life Path pair', () => {
  const a = computeTogether(full, { ...dateOnly, place: austin, birthTime: '12:00' }, NOW);
  const b = computeTogether(full, dateOnly, NOW);
  assert.deepEqual(a.numbers, b.numbers);
});
