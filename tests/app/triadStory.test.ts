import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync('src/components/home/TriadStory.tsx', 'utf8');

test('all three lenses have their own scroll drawing', () => {
  assert.match(src, /function Bodygraph\(/);
  assert.match(src, /function RoadDrawing\(/);
  assert.match(src, /function SignalDrawing\(/);
  assert.match(src, /build=\{vehicleBuild\}/);
  assert.match(src, /build=\{roadBuild\}/);
  assert.match(src, /build=\{signalBuild\}/);
});

test('each drawing is driven by its own slice of the scroll', () => {
  assert.match(src, /roadBuild = clamp01\(\(progress - 0\.34\) \/ 0\.26\)/);
  assert.match(src, /signalBuild = clamp01\(\(progress - 0\.67\) \/ 0\.26\)/);
});

test('reduced motion shows every drawing fully built', () => {
  assert.match(src, /<Bodygraph build=\{1\} dim=\{1\} \/> : i === 1 \? <RoadDrawing build=\{1\} dim=\{1\} \/> : <SignalDrawing build=\{1\} dim=\{1\} \/>/);
});

test('every drawing describes itself to screen readers', () => {
  for (const name of ['nine energy centers', 'winding road', 'zodiac wheel']) assert.match(src, new RegExp(`aria-label="[^"]*${name}`));
});

test('the signal light uses the app\'s three words in order: Pause, Slow, Go', () => {
  assert.match(src, /label: 'Pause'[\s\S]*label: 'Slow'[\s\S]*label: 'Go'/);
});

test('no layout properties are animated in the scroll story', () => {
  assert.doesNotMatch(src, /transition:[^;'`]*\b(width|height|margin|padding|top|left)\b/);
});

test('phones get the pinned scroll story too, stacked and sized to the screen', () => {
  assert.match(src, /const static_ = reduced;/);
  assert.match(src, /isMobile \? '320svh'/);
  assert.match(src, /gridTemplateColumns: isMobile \? '1fr' : '1fr 1fr'/);
});
