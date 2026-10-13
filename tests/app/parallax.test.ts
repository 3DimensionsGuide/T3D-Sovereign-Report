import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PARALLAX, parallaxShift } from '../../mobile/src/lib/parallax';

test('background layers do not move at the top or when pulled down', () => {
  assert.equal(parallaxShift(0, PARALLAX.art), 0);
  assert.equal(parallaxShift(-80, PARALLAX.art), 0);
  assert.equal(parallaxShift(Number.NaN, PARALLAX.art), 0);
});

test('background layers rise slowly as the page scrolls, and stop at the limit', () => {
  assert.equal(parallaxShift(100, 0.25), -25);
  assert.ok(Math.abs(parallaxShift(100, PARALLAX.glow)) < Math.abs(parallaxShift(100, PARALLAX.art)));
  assert.equal(parallaxShift(5000, 0.25), parallaxShift(220, 0.25));
});

test('every screen drifts its background, and Reduce Motion turns it off', () => {
  const screen = readFileSync('mobile/src/components/Screen.tsx', 'utf8');
  assert.match(screen, /<ParallaxLayer/);
  assert.match(screen, /reduce \? 0 : PARALLAX\.glow/);
  assert.match(screen, /reduce \? 0 : PARALLAX\.art/);
  const layer = readFileSync('mobile/src/components/ParallaxLayer.tsx', 'utf8');
  assert.match(layer, /pointerEvents="none"/);
  assert.match(layer, /translateY/);
});
