import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p: string) => readFileSync(p, 'utf8');
const src = read('src/components/home/Origins.tsx');
const css = read('src/app/globals.css');
const page = read('src/app/page.tsx');

/** Every `prefers-reduced-motion: reduce` block in the stylesheet, so a new section
    adding one of its own cannot make another section's test look at the wrong block. */
const reducedBlocks = (sheet: string) => sheet.split('@media (prefers-reduced-motion: reduce)').slice(1);
const someReducedBlock = (sheet: string, re: RegExp) => reducedBlocks(sheet).some((b) => re.test(b));


test('the primer states only what the knowledge base supports', () => {
  // Astrology: Mesopotamia and Egypt around 2000 BCE, zodiac standardised 5th century BCE,
  // earliest individual chart 410 BCE, the four-fold system at Alexandria around 100 BCE.
  assert.match(src, /Mesopotamia and Egypt, around 2000 BCE/);
  assert.match(src, /fifth century BCE/);
  assert.match(src, /410 BCE/);
  assert.match(src, /Alexandria around 100 BCE/);
  // Human Design: founder, birth name, eight days, January 1987, Ibiza.
  assert.match(src, /Ra Uru Hu, born Alan Robert Krakower/);
  assert.match(src, /eight days in January 1987 on the island of Ibiza/);
  // Its four older sources.
  for (const part of ['Western astrology', 'sixty-four hexagrams of the I Ching', 'nine-centre chakra model', 'channels of the Kabbalah']) {
    assert.ok(src.includes(part), part);
  }
});

test('the two claims the sources will not support are not made', () => {
  // The sources give no date for when modern Western numerology was codified, and the
  // component says so rather than guessing one.
  assert.match(src, /We will not put a date on when the modern system was assembled/);
  assert.doesNotMatch(src, /numerology[^.]{0,80}(1900|nineteenth|twentieth century)/i);
  // Sun-sign astrology is a twentieth-century thing, and the page says that too.
  assert.match(src, /star sign in a newspaper column is a twentieth-century invention/);
  // Human Design is not dressed up as ancient.
  assert.match(src, /It does not claim to be ancient, and neither do we/);
  assert.doesNotMatch(src, /ancient (art|wisdom) of Human Design/i);
});

test('the axis is drawn to scale from the real dates', () => {
  assert.match(src, /const AXIS_START = -2000;/);
  assert.match(src, /from: 1987/);   // Human Design
  assert.match(src, /from: -500/);   // Pythagorean Greece
  assert.match(src, /from: -2000/);  // Mesopotamia and Egypt
  // Position and length both come from the year, so the picture cannot contradict the text.
  assert.match(src, /left: `\$\{pct\(s\.from\)\}%`/);
  assert.ok(src.includes('width: `max(6px, ${100 - pct(s.from)}%)`'), 'width derives from the year too');
});

test('each tradition is tied to the metaphor it became', () => {
  for (const [lens, system] of [['The Vehicle', 'Human Design'], ['The Road', 'Numerology'], ['The Stoplight', 'Astrology']]) {
    assert.ok(src.includes(`lens: '${lens}'`), lens);
    assert.ok(src.includes(`system: '${system}'`), system);
  }
  assert.match(src, /Why it is \{s\.lens\.toLowerCase\(\)\}/);
});

test('the device fills in place: nothing travels sideways for a touch scroll to chase', () => {
  assert.match(css, /\.origins__bar \{[\s\S]*?transform: scaleX\(var\(--t\)\)/);
  assert.doesNotMatch(css, /\.origins[^{]*\{[^}]*overflow-x: auto/);
  assert.match(src, /requestAnimationFrame/);
  assert.match(src, /IntersectionObserver/);
});

test('Reduce Motion gets the axis complete and still', () => {
  assert.match(src, /matchMedia\('\(prefers-reduced-motion: reduce\)'\)\.matches\) \{\s*el\.style\.setProperty\('--t', '1'\)/);
  assert.ok(someReducedBlock(css, /\.origins__bar, \.origins__mark \{ transform: none !important; \}/), 'axis frozen complete');
});

test('it sits after the calculator, where the question actually gets asked', () => {
  assert.ok(page.indexOf('<Origins />') > page.indexOf('id="calculator"'), 'after the calculator');
  assert.ok(page.indexOf('<Origins />') < page.indexOf('<WhatsInside />'), 'before the report section');
  assert.match(src, /id="origins"/);
});
