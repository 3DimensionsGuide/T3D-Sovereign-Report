import test from 'node:test';
import assert from 'node:assert/strict';
import { buildReveal, firstRunLine, signOfLongitude, type RevealChart } from '../../mobile/src/lib/reveal';

const chart: RevealChart = {
  humanDesign: { type: 'Projector', authority: 'Splenic', strategy: 'Wait for the invitation' },
  numerology: { lifePath: 7, destiny: 3, soulUrge: 11 },
  astrology: { tropicalSun: { sign: 'Leo' }, tropicalMoon: { sign: 'Pisces' }, tropicalAscendant: 275.4 },
};

test('signs come from the longitude, including the edges and wraparound', () => {
  assert.equal(signOfLongitude(0), 'Aries');
  assert.equal(signOfLongitude(29.99), 'Aries');
  assert.equal(signOfLongitude(30), 'Taurus');
  assert.equal(signOfLongitude(275.4), 'Capricorn');
  assert.equal(signOfLongitude(359.9), 'Pisces');
  assert.equal(signOfLongitude(360), 'Aries');
  assert.equal(signOfLongitude(-10), 'Pisces');
});

test('the reveal has one stage per lens, in order, built from the chart', () => {
  const stages = buildReveal(chart, true);
  assert.deepEqual(stages.map((s) => s.lens), ['vehicle', 'road', 'stoplight']);
  assert.equal(stages[0].hero, 'Projector');
  assert.match(stages[0].line, /Wait for the invitation/);
  assert.match(stages[0].line, /Splenic/);
  assert.equal(stages[1].hero, 'Life Path 7');
  assert.equal(stages[2].hero, 'Sun in Leo');
  assert.equal(stages[2].line, 'Moon in Pisces · Rising Capricorn');
});

test('without a birth time the reveal never states a Moon or Rising sign', () => {
  const sky = buildReveal(chart, false)[2];
  assert.doesNotMatch(sky.line, /Pisces|Capricorn/);
  assert.match(sky.line, /birth time/);
});

test('the first-run line uses the person\'s own Type and Authority', () => {
  const line = firstRunLine(chart);
  assert.match(line, /Projector/);
  assert.match(line, /Splenic/);
  assert.match(line, /Wait for the invitation/);
});
