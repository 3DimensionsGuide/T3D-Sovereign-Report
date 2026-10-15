import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = (p: string) => readFileSync(p, 'utf8');
const home = read('src/app/page.tsx');
const footer = read('src/components/navigation/Footer.tsx');
const nav = read('src/components/navigation/Nav.tsx');
const story = read('src/components/home/TriadStory.tsx');
const config = read('next.config.ts');

test('every Calculate button leads to the same calculator on the homepage', () => {
  for (const [name, src] of [['home', home], ['footer', footer], ['nav', nav], ['story', story]] as const) {
    assert.doesNotMatch(src, /href="\/calculator"|href: '\/calculator'/, name);
  }
  assert.match(home, /<Link href="\/#calculator" className="t3d-cta">\s*CALCULATE MY PROFILE/);
  assert.match(story, /href="\/#calculator"/);
  assert.match(config, /source: '\/calculator', destination: '\/#calculator', permanent: true/);
  assert.equal(existsSync('src/app/calculator/page.tsx'), false);
});

test('the hero says in one plain line what you get and what it costs', () => {
  assert.match(home, /see your Human Design Type, Life Path and birth chart\. Free, in about a minute\./);
  assert.match(home, /SEE HOW IT WORKS/);
  assert.match(home, /href="#framework"/);
});

test('no system-style labels are left on visitor-facing pages', () => {
  for (const f of ['src/app/page.tsx', 'src/components/navigation/Footer.tsx', 'src/app/checkout/page.tsx', 'src/app/report/ReportClient.tsx', 'src/app/pricing/page.tsx']) {
    const src = read(f);
    assert.doesNotMatch(src, /\[[A-Z][A-Z_.]{3,}\]/, f);
    assert.doesNotMatch(src, /MODULE 02|ALL SYSTEMS OPERATIONAL|SYSTEM\.STATUS/, f);
  }
});

test('jump links stop below the sticky navigation bar', () => {
  assert.match(read('src/app/globals.css'), /section\[id\] \{ scroll-margin-top: 64px; \}/);
});
