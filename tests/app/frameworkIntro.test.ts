import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const intro = readFileSync('src/components/home/FrameworkIntro.tsx', 'utf8');
const page = readFileSync('src/app/page.tsx', 'utf8');

test('the framework section sits directly above One journey, three lenses', () => {
  assert.ok(page.indexOf('<FrameworkIntro />') > 0);
  assert.ok(page.indexOf('<FrameworkIntro />') < page.indexOf('<TriadStory />'));
});

test('it explains all three systems and what each is worth', () => {
  for (const s of ['Human Design', 'Numerology', 'Astrology', 'The Vehicle', 'The Road', 'The Stoplight']) assert.match(intro, new RegExp(s));
  assert.equal((intro.match(/what: '/g) ?? []).length, 3);
  assert.equal((intro.match(/how: '/g) ?? []).length, 3);
  assert.equal((intro.match(/value: '/g) ?? []).length, 3);
});

test('colour is never the only signal: each lens has a shape and a name', () => {
  for (const g of ['◆', '▲', '●']) assert.ok(intro.includes(`glyph: '${g}'`));
});

test('it keeps the reflection-only wording and has no scripts or motion', () => {
  assert.match(intro, /do not predict events and are not medical, legal or financial advice/);
  assert.doesNotMatch(intro, /useState|useEffect|animation|transition/);
});
