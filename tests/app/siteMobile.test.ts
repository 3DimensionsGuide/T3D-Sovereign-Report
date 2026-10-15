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

test('the intro video has a poster, a link near the top, and an anchor to land on', () => {
  assert.match(page, /poster="\/videos\/launchvideo-poster\.jpg"/);
  assert.match(page, /href="#intro"[\s\S]*Watch the 3-minute intro/);
  assert.match(page, /id="intro"/);
});

test('the sticky phone button hides while the calculator is on screen', () => {
  assert.match(page, /isMobile && !results && !calcInView/);
  assert.match(page, /IntersectionObserver/);
});

test('picking a date from a dropdown checks the new value, so no false "Select..." error appears', () => {
  const form = read('src/components/calculator/CalculatorForm.tsx');
  assert.match(form, /function pick</);
  for (const f of ['birthMonth', 'birthDay', 'birthYear']) assert.ok(form.includes(`pick('${f}',v)`), f);
  assert.doesNotMatch(form, /set\('birth(Month|Day|Year)',v\); touch/);
});
