import assert from 'node:assert/strict';
import { test } from 'node:test';
import { activationCertainty, alsoReads, profileReading } from '../../src/lib/app/chartCertainty';
import { longitudeToGate, MANDALA_START_LON, DEGREES_PER_GATE } from '../../src/server/engines/mandala';

const DEGREES_PER_LINE = DEGREES_PER_GATE / 6;

/** A longitude sitting `lines` lines into the gate that starts `gates` gates past the mandala origin. */
const at = (gates: number, lines: number) =>
  MANDALA_START_LON + gates * DEGREES_PER_GATE + lines * DEGREES_PER_LINE;

const sun = (epoch: 'personality' | 'design', longitude: number) => ({
  planet: 'sun',
  epoch,
  longitude,
  line: longitudeToGate(longitude).line,
});

test('a known birth time leaves every activation certain', () => {
  const c = activationCertainty({ planet: 'moon', longitude: at(3, 0) }, true);
  assert.equal(c.gate.certain, true);
  assert.equal(c.line.certain, true);
});

test('the Moon is never certain without a birth time, and Saturn always is', () => {
  const moon = activationCertainty({ planet: 'moon', longitude: at(3, 2.5) }, false);
  assert.equal(moon.gate.certain, false);
  assert.ok(moon.gate.alternatives.length >= 2);
  // Real gate numbers from the mandala, not indexes.
  assert.ok(moon.gate.alternatives.every((g) => g >= 1 && g <= 64));

  const saturn = activationCertainty({ planet: 'saturn', longitude: at(3, 2.5) }, false);
  assert.equal(saturn.gate.certain, true);
  assert.equal(saturn.line.certain, true);
});

test('a known birth time gives a Profile of one', () => {
  const reading = profileReading([sun('personality', at(0, 3.5)), sun('design', at(9, 0.5))], '4/1', true);
  assert.equal(reading.certain, true);
  assert.deepEqual(reading.options, ['4/1']);
  assert.equal(alsoReads(reading), null);
});

/**
 * The finding this is all for. Both halves of a Profile are Sun lines and the Sun crosses more
 * than one whole line a day, so with no birth time the Profile is a short list.
 */
test('without a birth time a Profile becomes a short list, the calculated one first', () => {
  // Both Suns mid-line, so each drifts into exactly one neighbour.
  const reading = profileReading([sun('personality', at(0, 3.5)), sun('design', at(9, 0.5))], '4/1', false);
  assert.equal(reading.certain, false);
  assert.equal(reading.options[0], '4/1', 'the calculated Profile has to stay first');
  assert.ok(reading.options.length >= 2, `only ${reading.options.join(', ')}`);
  assert.ok(reading.options.length <= 4, `too many: ${reading.options.join(', ')}`);
  // Every option is a Profile, not a stray number.
  for (const o of reading.options) assert.match(o, /^[1-6]\/[1-6]$/, o);
});

test('two possibilities read as a sentence, more than two do not', () => {
  assert.equal(alsoReads({ value: '4/1', certain: false, options: ['4/1', '4/2'] }), '4/1 or 4/2');
  // Past two, the list belongs in the explanation rather than crammed beside the value.
  assert.equal(alsoReads({ value: '4/1', certain: false, options: ['4/1', '4/2', '3/1', '3/2'] }), null);
  assert.equal(alsoReads({ value: '4/1', certain: true, options: ['4/1'] }), null);
});

test('a chart missing its Suns is still not certain, it just has nothing to offer', () => {
  const reading = profileReading([], '4/1', false);
  assert.equal(reading.certain, false, 'a missing Sun does not make the arithmetic go away');
  assert.deepEqual(reading.options, ['4/1']);
  assert.equal(alsoReads(reading), null);
});

test('the calculated Profile is never dropped from its own list', () => {
  for (let gates = 0; gates < 8; gates++) {
    for (let lines = 0.25; lines < 6; lines += 1.5) {
      const conscious = sun('personality', at(gates, lines));
      const design = sun('design', at(gates + 3, 6 - lines));
      const calculated = `${conscious.line}/${design.line}`;
      const reading = profileReading([conscious, design], calculated, false);
      assert.equal(reading.options[0], calculated, `at ${gates}/${lines}`);
      assert.equal(new Set(reading.options).size, reading.options.length, 'duplicates in the list');
    }
  }
});
