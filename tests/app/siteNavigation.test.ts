import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { glob } from 'node:fs/promises';

const read = (p: string) => readFileSync(p, 'utf8');
const nav = read('src/components/navigation/Nav.tsx');
const footer = read('src/components/navigation/Footer.tsx');
const css = read('src/app/globals.css');

test('the top bar points at real places: How it works, Pricing, Calculator', () => {
  assert.match(nav, /href: '\/#framework',\s+label: 'How it works'/);
  assert.match(nav, /href: '\/pricing',\s+label: 'Pricing'/);
  assert.match(nav, /href: '\/#calculator',\s+label: 'Calculator'/);
  assert.doesNotMatch(nav, /label: 'The System'/);
});

test('the bar shows where you are, with more than colour', () => {
  assert.match(nav, /aria-current=\{current \? \(l\.id === 'pricing' \? 'page' : 'location'\) : undefined\}/);
  assert.match(nav, /IntersectionObserver/);
  assert.match(nav, /borderBottom: `1px solid \$\{current \? 'var\(--crimson\)' : 'transparent'\}`/);
  assert.match(nav, /current \? '●' : '→'/);
});

test('the footer stacks on a phone, has Contact and Pricing, and no dead links', () => {
  assert.match(footer, /repeat\(auto-fit, minmax\(min\(100%, 220px\), 1fr\)\)/);
  for (const l of ["'/#framework'", "'/#calculator'", "'/pricing'", "'/privacy'", 'mailto:${CONTACT_EMAIL}']) assert.ok(footer.includes(l), l);
  assert.doesNotMatch(footer, /href: '\/report'|href: '\/calculator'/);
  assert.match(footer, /minHeight: 44/);
});

test('every colour variable the navigation uses is defined in the stylesheet', () => {
  for (const src of [nav, footer]) {
    for (const [, name] of src.matchAll(/var\((--[a-z0-9-]+)/g)) assert.ok(new RegExp(`${name}\\s*:`).test(css), `${name} is not defined`);
  }
});

test('the homepage sections the bar watches exist', async () => {
  const sources: string[] = [];
  for await (const f of glob('src/**/*.tsx')) sources.push(read(f));
  const all = sources.join('\n');
  for (const id of ['framework', 'system', 'calculator']) assert.match(all, new RegExp(`id="${id}"`), id);
});
