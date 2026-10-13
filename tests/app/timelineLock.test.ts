import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isTransitLocked } from '../../mobile/src/lib/timelineLock';

test('transits and returns are locked without Premium, and open with it', () => {
  assert.equal(isTransitLocked('transit', false), true);
  assert.equal(isTransitLocked('return', false), true);
  assert.equal(isTransitLocked('transit', true), false);
  assert.equal(isTransitLocked('return', true), false);
});

test('gate changes, Moon phases, eclipses, stations and sign changes stay free', () => {
  for (const kind of ['gate', 'lunation', 'eclipse', 'station', 'ingress']) {
    assert.equal(isTransitLocked(kind, false), false, kind);
  }
});

test('a locked Timeline row still lists, and says the explanation is part of Premium when opened', () => {
  const src = readFileSync('mobile/src/app/(tabs)/timeline.tsx', 'utf8');
  assert.match(src, /locked=\{isTransitLocked\(e\.kind, premium\)\}/);
  assert.match(src, /open && locked/);
  assert.match(src, /part of Premium/);
  assert.match(src, /See what Premium includes/);
  assert.match(src, /open && !locked/, 'the explanation text is not rendered at all while locked');
});

test('the Vehicle lens ignores the hidden Moon, Sky and Transits filter, so it is never emptied by it', () => {
  const src = readFileSync('mobile/src/app/(tabs)/timeline.tsx', 'utf8');
  assert.match(src, /const kinds = lens === 'vehicle' \? null : FILTER_KINDS\[filter\]/);
});
