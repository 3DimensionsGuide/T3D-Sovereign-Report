import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p: string) => readFileSync(p, 'utf8');
const page = read('src/app/page.tsx');
const css = read('src/app/globals.css');

test('the phone layout of the hero and calculator is set in CSS, so there is no jump after load', () => {
  for (const cls of ['hero-section', 'hero-col', 'calc-section', 'calc-grid']) {
    assert.ok(page.includes(cls), `${cls} used on the page`);
    assert.match(css, new RegExp(`\\.${cls}\\b`), `${cls} styled`);
  }
  assert.doesNotMatch(page, /isMobile \? 220/);
  assert.doesNotMatch(page, /isMobile \? '150vh'|height: isMobile/);
});

test('the Stoplight drawing prints the same numbers on the server and in the browser', () => {
  assert.match(read('src/components/home/TriadStory.tsx'), /Math\.round\(n \* 100\) \/ 100/);
});

test('the logo in the top bar is a full-size tap target', () => {
  assert.match(read('src/components/navigation/Nav.tsx'), /textDecoration: 'none', minHeight: 48/);
});

test('the scroll story leaves room for the sticky button on phones', () => {
  assert.match(read('src/components/home/TriadStory.tsx'), /'72px 20px 76px'/);
});
