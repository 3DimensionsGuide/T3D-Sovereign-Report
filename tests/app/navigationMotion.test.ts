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

test('waiting states use the T3D triad loader instead of the stock spinner (only the in-button spinner stays)', () => {
  const { execSync } = require('node:child_process') as typeof import('node:child_process');
  const hits = execSync("grep -rl '<ActivityIndicator' mobile/src || true").toString().trim().split('\n').filter(Boolean);
  assert.deepEqual(hits, ['mobile/src/components/GoldButton.tsx']);
  const loader = read('mobile/src/components/TriadLoader.tsx');
  assert.match(loader, /accessibilityRole="progressbar"/);
  assert.match(loader, /useReduceMotion/);
});

test('each tab is its own room, with its own light', () => {
  const rooms: [string, string][] = [
    ['today', 'sky'], ['timeline', 'road'], ['practice', 'ritual'], ['chart', 'observatory'],
  ];
  for (const [file, room] of rooms) {
    assert.match(read(`mobile/src/app/(tabs)/${file}.tsx`), new RegExp(`<Screen room="${room}"`), `${file} is the ${room} room`);
  }
  assert.match(read('mobile/src/app/(tabs)/readings.tsx'), /<Screen room=\{READING_ROOM\[lens\]\}/);
  assert.match(read('mobile/src/components/RoomArt.tsx'), /accessibilityElementsHidden/);
});

test('the guidance voice is loaded and used under page titles; changing digits use equal-width numbers', () => {
  assert.match(read('mobile/src/app/_layout.tsx'), /CormorantGaramond_500Medium_Italic,/);
  for (const f of ['(tabs)/today', '(tabs)/timeline', '(tabs)/readings', '(tabs)/practice', 'glossary', 'year', 'method', 'meet-triad']) {
    assert.match(read(`mobile/src/app/${f}.tsx`), /style=\{guidance\}/, `${f} uses the guidance voice`);
  }
  assert.match(read('mobile/src/components/SignalRibbon.tsx'), /\.\.\.tabular/);
});

test('the first-time tour shows once, can be skipped, and can be replayed from About', () => {
  const tour = read('mobile/src/components/CoachTour.tsx');
  assert.match(tour, /label="Skip"/);
  assert.match(tour, /useReduceMotion/);
  assert.match(tour, /accessibilityViewIsModal/);
  assert.match(read('mobile/src/store/useCoachStore.ts'), /t3d-coach-v1/);
  assert.match(read('mobile/src/app/(tabs)/_layout.tsx'), /<CoachTour \/>/);
  assert.match(read('mobile/src/app/your-data.tsx'), /Replay the welcome tour/);
});
