import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p: string) => readFileSync(p, 'utf8');

test('opened screens slide in from the right and can be swiped back, with a fade for Reduce Motion', () => {
  const layout = read('mobile/src/app/_layout.tsx');
  assert.match(layout, /reduceMotion \? 'fade' : 'slide_from_right'/);
  assert.match(layout, /fullScreenGestureEnabled: true/);
  assert.match(layout, /<Stack\.Screen name="\(tabs\)" options=\{\{ animation: 'fade', gestureEnabled: false \}\} \/>/);
});

test('switching tabs cross-fades, and not at all with Reduce Motion', () => {
  assert.match(read('mobile/src/app/(tabs)/_layout.tsx'), /animation: reduceMotion \? 'none' : 'fade'/);
});
