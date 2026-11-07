import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p: string) => readFileSync(p, 'utf8');

test('every page has a skip link target and the link comes first', () => {
  assert.match(read('src/app/layout.tsx'), /<body[^>]*>\s*<a href="#main" className="skip-link">Skip to main content<\/a>/);
  for (const f of ['page', 'pricing/page', 'privacy/page', 'checkout/page', 'library/page', 'report/page', 'update-time/page']) {
    const src = read(f === 'page' ? 'src/app/page.tsx' : `src/app/${f}.tsx`);
    assert.match(src, /<main id="main" tabIndex=\{-1\}/, f);
  }
});

test('keyboard focus is a clear two-pixel outline', () => {
  assert.match(read('src/app/globals.css'), /:focus-visible \{ outline: 2px solid var\(--parchment\)/);
});

test('there is no pause button over the background', () => {
  assert.doesNotMatch(read('src/components/VideoBackground.tsx'), /bg-pause|Pause background/);
});

test('pricing helps people choose and keeps its facts plain', () => {
  const src = read('src/app/pricing/page.tsx');
  assert.match(src, /Which one is right for you\?/);
  assert.match(src, /t3d-triad-rule/);
  assert.doesNotMatch(src, /\[HOW THE TIERS/);
});
