import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p: string) => readFileSync(p, 'utf8');
const stage = read('src/components/home/HeroStage.tsx');
const page = read('src/app/page.tsx');
const css = read('src/app/globals.css');

test('the hero is five planes, each travelling at its own rate', () => {
  for (const plane of ['hero-plane--glow', 'hero-plane--rings', 'hero-plane--arcs', 'hero-plane--seal', 'hero-plane--near']) {
    assert.ok(stage.includes(plane), plane);
    assert.match(css, new RegExp(`\\.${plane}\\b`), `${plane} styled`);
  }
  // The rates have to differ, or the planes are one image moving together.
  const rates = [...css.matchAll(/--sy\) \* (-?[\d.]+)px/g)].map((m) => Number(m[1]));
  assert.equal(new Set(rates).size, rates.length, `rates repeat: ${rates.join(', ')}`);
  assert.ok(Math.max(...rates.map(Math.abs)) / Math.min(...rates.map(Math.abs)) > 5, 'near and far should differ by a lot');
  // The nearest plane is blurred, because close things are out of focus.
  assert.match(css, /\.hero-plane--near \{[^}]*filter: blur/);
});

test('scroll and pointer are written once, to one element', () => {
  assert.match(stage, /stage\.style\.setProperty\('--sy'/);
  assert.match(stage, /stage\.style\.setProperty\('--mx'/);
  assert.equal((stage.match(/requestAnimationFrame/g) ?? []).length, 2);
  // Ambient rotation stops when the hero is off screen.
  assert.match(stage, /IntersectionObserver/);
  assert.match(css, /\.hero-stage\.is-still \.hero-spin \{ animation-play-state: paused; \}/);
});

test('the drawing prints the same numbers on the server and in the browser', () => {
  assert.match(stage, /Math\.round\(n \* 100\) \/ 100/);
  // A random star field would differ between the two and break hydration.
  assert.doesNotMatch(stage, /Math\.random/);
});

test('Reduce Motion keeps the composition and drops only the movement', () => {
  const guard = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'));
  assert.match(guard, /\.hero-plane \{ transform: none !important; \}/);
  assert.match(guard, /\.hero-spin \{ animation: none; \}/);
  assert.match(stage, /matchMedia\('\(prefers-reduced-motion: reduce\)'\)\.matches\) return;/);
});

test('the hero resolves inside one screen, with the headline and both calls to action on it', () => {
  assert.match(css, /\.hero-section \{[^}]*padding: 88px/);
  assert.match(css, /\.hero-h1 \{ font-size: clamp\(36px, 4\.6vw, 68px\); \}/);
  assert.match(page, /className="hero-grid"/);
  assert.match(page, /CALCULATE MY PROFILE/);
  assert.match(page, /SEE HOW IT WORKS/);
});

test('the phone gets its own composition, not a shrunken desktop one', () => {
  const phone = css.slice(css.indexOf('@media (max-width: 900px)'));
  assert.match(phone, /\.hero-grid \{ grid-template-columns: 1fr/);
  assert.match(phone, /\.hero-stage \{ max-width: min\(300px, 62vw\); order: -1/);
  // The near plane is pulled in so it cannot push the page sideways.
  assert.match(phone, /\.hero-plane--near \{ transform: translate3d\(calc\(var\(--sy\) \* -0\.2px\), 0, 0\) scale\(0\.98\); \}/);
});

test('the seal is decorative here, because its words are in the heading', () => {
  assert.match(stage, /alt=""/);
  assert.match(stage, /aria-hidden/);
  assert.match(stage, /priority/);
  assert.match(page, /Know your/);
});
