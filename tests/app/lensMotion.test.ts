import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LENS_HAPTIC, LENS_MOTION } from '../../mobile/src/lib/lensMotion';

const read = (p: string) => readFileSync(p, 'utf8');

test('each lens has its own movement: Vehicle pulses, Road slides forward, Stoplight blinks', () => {
  assert.equal(LENS_MOTION.vehicle.kind, 'pulse');
  assert.equal(LENS_MOTION.road.kind, 'slide');
  assert.equal(LENS_MOTION.stoplight.kind, 'blink');
  assert.equal(new Set(Object.values(LENS_MOTION).map((m) => m.kind)).size, 3, 'no two lenses share a movement');
});

test('the movements mean energy, progress and timing', () => {
  assert.equal(LENS_MOTION.vehicle.meaning, 'energy');
  assert.equal(LENS_MOTION.road.meaning, 'progress');
  assert.equal(LENS_MOTION.stoplight.meaning, 'timing');
});

test('each lens has its own haptic, matching its movement', () => {
  assert.deepEqual(LENS_HAPTIC, { vehicle: 'soft', road: 'steps', stoplight: 'click' });
  assert.match(read('mobile/src/lib/haptics.ts'), /export function lensTap/);
});

test('lens movement only animates opacity and transforms, and respects Reduce Motion', () => {
  const src = read('mobile/src/components/LensMotion.tsx');
  assert.match(src, /isReduceMotionEnabled/);
  assert.match(src, /useNativeDriver: true/);
  assert.doesNotMatch(src, /useNativeDriver: false/);
  assert.match(src, /replayKey/, 'the Stoplight blink plays again when the signal changes');
});

test('the seal fills only the lenses a person has data for, and stays still in share images', () => {
  const seal = read('mobile/src/components/TriadSeal.tsx');
  assert.match(seal, /lenses\?: Partial<Record<LensName, boolean>>/);
  assert.match(seal, /outline=\{!has\(l\)\}/, 'a lens with no data is drawn hollow');
  assert.match(seal, /animate = false/, 'still by default');
  for (const f of ['StoryShareCard', 'TodayShareCard', 'ProfileShareCard']) {
    assert.doesNotMatch(read(`mobile/src/components/${f}.tsx`), /<TriadSeal[^>]*animate/, `${f} stays a still image`);
  }
});

test('the lens movement is used where lenses appear', () => {
  assert.match(read('mobile/src/components/SignalLamp.tsx'), /<MotionLensIcon lens=\{lens\}/);
  assert.match(read('mobile/src/components/SignalLamp.tsx'), /lensTap\(lens\)/);
  assert.match(read('mobile/src/components/RoadStrip.tsx'), /lensTap\('road'\)/);
  assert.match(read('mobile/src/components/TriadTodayCard.tsx'), /<MotionLensIcon/);
  assert.match(read('mobile/src/app/(tabs)/today.tsx'), /<TriadSeal\s+size=\{36\}/);
  assert.match(read('mobile/src/app/welcome.tsx'), /logo-t3d\.png/);
});
