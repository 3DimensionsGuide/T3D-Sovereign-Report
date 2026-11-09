import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  DEGREES_PER_GATE,
  DEGREES_PER_LINE,
  gateCertainty,
  halfDayArc,
  lineCertainty,
  profileCertain,
  timeUnknownNote,
} from '../../src/lib/app/timeCertainty';

/**
 * Stand-ins for the engine's mandala ordering. The real one starts at 302° and runs in the
 * I Ching's sequence; none of that changes how far a body drifts in twelve hours, so these
 * number the bands from 0° in order and keep the test about the arithmetic under test.
 */
const ORIGIN = 302;
const wrap = (d: number) => ((d % 360) + 360) % 360;
const gateAt = (lon: number) => Math.floor(wrap(lon - ORIGIN) / DEGREES_PER_GATE) + 1;
const lineAt = (lon: number) => Math.floor((wrap(lon - ORIGIN) % DEGREES_PER_GATE) / DEGREES_PER_LINE) + 1;

/** The middle of gate 1's line 1, where nothing is near a boundary. */
const SAFE = ORIGIN + DEGREES_PER_LINE / 2;

test('the bands are the sizes the system actually uses', () => {
  assert.equal(DEGREES_PER_GATE, 5.625);
  assert.equal(DEGREES_PER_LINE, 0.9375);
});

test('a known birth time settles everything', () => {
  // Even the Moon, even sitting exactly on a boundary.
  assert.deepEqual(gateCertainty('moon', ORIGIN, true, gateAt), { certain: true, alternatives: [] });
  assert.deepEqual(lineCertainty('moon', ORIGIN, true, lineAt), { certain: true, alternatives: [] });
  assert.equal(profileCertain(true), true);
  assert.equal(timeUnknownNote(true), null);
});

test('the slow planets are certain even with no birth time', () => {
  for (const planet of ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto']) {
    const g = gateCertainty(planet, SAFE, false, gateAt);
    assert.equal(g.certain, true, `${planet} gate`);
    const l = lineCertainty(planet, SAFE, false, lineAt);
    assert.equal(l.certain, true, `${planet} line`);
  }
});

test('an unknown body is treated as slow, which is the safe end for anything past Mars', () => {
  assert.equal(halfDayArc('somethingNew'), 0.03);
  assert.equal(gateCertainty('somethingNew', SAFE, false, gateAt).certain, true);
});

/**
 * The finding that drove this module. The Sun covers 1.02° in a day against a line of 0.9375°,
 * so with no birth time its line is never settled — wherever in the line it happens to sit.
 */
test('the Sun’s line is never certain without a birth time', () => {
  for (let offset = 0.05; offset < DEGREES_PER_LINE; offset += 0.1) {
    const l = lineCertainty('sun', ORIGIN + offset, false, lineAt);
    assert.equal(l.certain, false, `the Sun at ${offset.toFixed(2)}° into a line came back certain`);
    assert.ok(l.alternatives.length >= 1, 'no alternative line was named');
  }
});

test('the Sun’s gate is an edge case, not a certainty and not a coin toss', () => {
  // Mid-gate it is safe: ±0.51° cannot reach a boundary 2.8° away.
  assert.equal(gateCertainty('sun', ORIGIN + DEGREES_PER_GATE / 2, false, gateAt).certain, true);
  // A third of a degree from the next boundary, it is not.
  const near = gateCertainty('sun', ORIGIN + DEGREES_PER_GATE - 0.3, false, gateAt);
  assert.equal(near.certain, false);
  assert.deepEqual(near.alternatives, [2]);
});

/**
 * The Moon travels further in twelve hours than a gate is wide, so its gate is never settled
 * wherever it sits, and its line is not worth naming candidates for.
 */
test('the Moon’s gate is never certain without a birth time, wherever it sits', () => {
  for (let offset = 0; offset < DEGREES_PER_GATE; offset += 0.5) {
    const g = gateCertainty('moon', ORIGIN + offset, false, gateAt);
    assert.equal(g.certain, false, `the Moon at ${offset.toFixed(2)}° into a gate came back certain`);
    assert.ok(g.alternatives.length >= 2, `only ${g.alternatives.length} alternative gates`);
  }
});

test('the Moon’s line is reported as unknown rather than given a shortlist', () => {
  const l = lineCertainty('moon', SAFE, false, lineAt);
  assert.equal(l.certain, false);
  // Six candidates out of six is a list pretending to be information.
  assert.deepEqual(l.alternatives, []);
});

test('alternatives are nearest first', () => {
  // Just past a boundary, so the gate behind is nearer than the one ahead.
  const g = gateCertainty('moon', ORIGIN + 0.2, false, gateAt);
  assert.equal(g.certain, false);
  assert.equal(g.alternatives[0], 64, 'the gate just behind should come first');
});

test('the bands wrap at 0 and 360 rather than running off the end', () => {
  // Gate 11 of this stand-in straddles 0°/360°, since the origin is 302.
  const straddles = 358;
  assert.doesNotThrow(() => gateCertainty('moon', straddles, false, gateAt));
  const g = gateCertainty('moon', straddles, false, gateAt);
  assert.ok(g.alternatives.every((n) => n >= 1 && n <= 64), `out of range: ${g.alternatives.join(', ')}`);
  const l = lineCertainty('sun', straddles, false, lineAt);
  assert.ok(l.alternatives.every((n) => n >= 1 && n <= 6), `out of range: ${l.alternatives.join(', ')}`);
});

test('nothing in the middle of a band is stepped over', () => {
  /**
   * Sampling only the two ends and the centre is enough for a band spanning three values, which
   * is why a coarse step can look correct. This is the case that catches it: the Moon sitting
   * exactly on a gate boundary spans four gates, and one of them is touched by neither end nor
   * centre.
   *
   * Band is ±7.7° around a boundary at 0, so it runs from -7.7 to +7.7. Gate edges sit at
   * -11.25, -5.625, 0, +5.625, +11.25 — four gates covered. The ends land in the outermost two
   * and the centre in the third. The gate from -5.625 to 0, immediately behind, is found only by
   * sampling in between.
   */
  const onBoundary = ORIGIN + DEGREES_PER_GATE * 4; // the start of gate 5
  const g = gateCertainty('moon', onBoundary, false, gateAt);
  assert.equal(g.certain, false);
  assert.equal(
    g.alternatives.length,
    3,
    `expected three other gates, got ${g.alternatives.join(', ') || 'none'}`,
  );
  // The gate immediately behind is the one a coarse step misses, and it is also the nearest,
  // so it has to come first.
  assert.equal(g.alternatives[0], 4, `the gate just behind was missed: ${g.alternatives.join(', ')}`);
  assert.deepEqual([...g.alternatives].sort((a, b) => a - b), [3, 4, 6]);
});

/**
 * Profile is the conscious Sun's line over the unconscious Sun's line. Both are Sun lines, and
 * the Sun's line is never settled without a birth time, so neither is the Profile.
 */
test('a Profile is never certain without a birth time', () => {
  assert.equal(profileCertain(false), false);
  assert.equal(profileCertain(true), true);
});

test('a chart built on noon says so', () => {
  const note = timeUnknownNote(false);
  assert.ok(note && note.includes('noon'), note ?? 'no note');
  assert.ok(note && !note.includes('undefined'));
});

test('the motion table is upper bounds, not averages', () => {
  // Averages would be 13.18 and 0.986; bounds mean the module errs toward saying "might be",
  // never toward a false "is".
  assert.ok(halfDayArc('moon') * 2 > 13.2, 'the Moon is on its mean motion');
  assert.ok(halfDayArc('sun') * 2 > 0.99, 'the Sun is on its mean motion');
  // And the Sun's bound still has to exceed a line, or the central finding stops holding.
  assert.ok(halfDayArc('sun') * 2 > DEGREES_PER_LINE);
});

test('planet names are matched however they are spelled', () => {
  assert.equal(halfDayArc('Moon'), halfDayArc('moon'));
  assert.equal(halfDayArc('northNode'), halfDayArc('northnode'));
  assert.equal(halfDayArc('North Node'), halfDayArc('northnode'));
});
