import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { skyLook } from '../../mobile/src/lib/skyPhase';

test('the Today sky has stars at night and none at midday', () => {
  assert.equal(skyLook(0).starOpacity, 1);
  assert.ok(skyLook(2).starOpacity > 0.8, 'still a full night sky at 2 am');
  assert.equal(skyLook(23.5).starOpacity, 1);
  assert.equal(skyLook(12).starOpacity, 0);
});

test('the sun pool travels from the east at dawn to the west at dusk', () => {
  assert.ok(skyLook(6.5).glow.cx > 80, 'dawn light sits near the right edge');
  assert.ok(skyLook(12).glow.cx > 40 && skyLook(12).glow.cx < 60, 'midday light is overhead');
  assert.ok(skyLook(18).glow.cx < 20, 'dusk light sits near the left edge');
});

test('dawn is amber, dusk is red, and the change is gradual', () => {
  assert.equal(skyLook(6.5).glow.color.toLowerCase(), '#e5a93c');
  assert.equal(skyLook(18).glow.color.toLowerCase(), '#c83e3e');
  const a = skyLook(10).glow.opacity;
  const b = skyLook(10.05).glow.opacity;
  assert.ok(Math.abs(a - b) < 0.01, 'no jump from one minute to the next');
});

test('every hour of the day gives a valid colour and opacity', () => {
  for (let h = 0; h < 24; h += 0.25) {
    const l = skyLook(h);
    assert.match(l.glow.color, /^#[0-9a-f]{6}$/);
    assert.ok(l.glow.opacity >= 0 && l.glow.opacity <= 1);
    assert.ok(l.starOpacity >= 0 && l.starOpacity <= 1);
  }
});

test('only the Today room follows the clock', () => {
  assert.match(readFileSync('mobile/src/components/Screen.tsx', 'utf8'), /useSkyLook\(room === 'sky'\)/);
});
