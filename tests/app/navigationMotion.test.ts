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

test('the tab navigator does not animate its own screens (its fade left some tabs black)', () => {
  assert.doesNotMatch(read('mobile/src/app/(tabs)/_layout.tsx'), /animation:/);
});
