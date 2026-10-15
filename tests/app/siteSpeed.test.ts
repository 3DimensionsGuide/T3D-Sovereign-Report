import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync, existsSync } from 'node:fs';

const read = (p: string) => readFileSync(p, 'utf8');

test('the background video is small and has a still-image fallback', () => {
  assert.ok(statSync('public/videos/3dimeback.mp4').size < 2_000_000, 'background video under 2 MB');
  assert.ok(existsSync('public/videos/3dimeback-poster.jpg'));
  const src = read('src/components/VideoBackground.tsx');
  assert.match(src, /prefers-reduced-motion: reduce/);
  assert.match(src, /max-width: 767px/);
  assert.match(src, /saveData/);
});

test('the unused 3D compass and its libraries are gone', () => {
  assert.ok(!existsSync('src/components/SovereignCompassCanvas.tsx'));
  const pkg = read('package.json');
  assert.doesNotMatch(pkg, /splinetool/);
  assert.doesNotMatch(read('src/app/page.tsx'), /compassRef|useScroll|SovereignCompass/);
});

test('the intro video waits for a tap and loads only its first frame', () => {
  assert.match(read('src/app/page.tsx'), /preload="metadata"/);
});
