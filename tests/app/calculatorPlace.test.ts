/**
 * The website calculator must not decide which city you meant.
 *
 * It used to. Someone typed a birth city, the form sent the name alone, and the server searched
 * for it — "Harbor City, United States" finding Benton Harbor, Michigan, 2,000 miles and three
 * time zones away, with nothing shown to the person at any point. The app had solved this long
 * before, with a confirm-your-place step; the website simply never adopted it.
 *
 * Two things close it. A city picked from Google's list now carries its coordinates, so there is
 * nothing to decide. A city typed by hand is looked up and the person is shown what was found.
 *
 * These read the component's source. Rendering it would need the Google Maps script, a live
 * lookup and a browser; what is worth holding in place here is the shape of the flow, and the
 * holes in it are the sort that stay closed only if something is watching.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
const form = read('src/components/calculator/CalculatorForm.tsx');
/** The source with comments taken out, so prose about a rule does not read as a breach of it. */
const code = form.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

// ─── when the place is already known ─────────────────────────────────────────

test('calculator: a place picked from the list is not looked up again', () => {
  // placeAt is only ever set from Google's own geometry, so its presence means "already certain".
  assert.match(code, /if \(!data\.placeAt && !placeNote\) \{\s*void confirmPlace\(\);/);
});

test('calculator: the suggestions include places that are not cities', () => {
  // (cities) leaves out anywhere that is not incorporated, which is where a great many people
  // are born. Typing "Harbor City" was answered with "Harbor Springs MI" — a different place
  // two thousand miles off, offered as the suggestion.
  assert.match(code, /types: \['\(regions\)'\]/);
  assert.ok(!/types: \['\(cities\)'\]/.test(code), 'the city-only filter is back');
});

test('calculator: a dead end and a warning are told apart', () => {
  // A place nobody can find, or one the person says is none of the options, has to change before
  // going on. A lookup that is merely down is ours to fix and must not stop them.
  assert.match(code, /if \(placeOptions \|\| placeBlocked\) return;/);
  assert.match(code, /CHANGE THE PLACE ABOVE/);
  assert.match(code, /CONTINUE ANYWAY/);
  const fail = code.slice(code.indexOf('async function confirmPlace'), code.indexOf('} finally {'));
  assert.match(fail, /setPlaceBlocked\(true\);/,  'a place that cannot be found should block');
  assert.match(fail, /setPlaceBlocked\(false\);/, 'a lookup that is down should not');
});

test('calculator: being unable to find a place says what usually fixes it', () => {
  assert.match(form, /add the state or region, or try the nearest larger town/);
  assert.match(form, /Add the state, province or region below/);
  // The state field reaches the lookup, so that advice actually works.
  assert.match(code, /city: \[data\.city, data\.state\]\.filter\(Boolean\)\.join\(', '\)\.trim\(\)/);
});

test('calculator: a picked place is stated back, not left to be assumed', () => {
  assert.match(code, /Using the exact location of/);
});

// ─── when it was typed by hand ───────────────────────────────────────────────

test('calculator: a typed city is checked before the form goes on', () => {
  assert.match(code, /async function confirmPlace\(\)/);
  assert.match(code, /'\/api\/app\/place-check'/);
  // The birth date goes too, so the offset shown is the one in force when they were born.
  assert.match(code, /birthDate: buildDate\(data\.birthMonth, data\.birthDay, data\.birthYear\)/);
});

test('calculator: the offset is shown, which is what makes a wrong place obvious', () => {
  // Harbor City and Benton Harbor read as UTC−8 and UTC−5. The names look alike; the offsets do not.
  assert.match(code, /option\.utcOffset/);
  assert.match(form, /time zone decides your rising sign/i);
});

test('calculator: Continue cannot step past the question it just asked', () => {
  // With a list on screen the only ways on are picking one or editing the city. Without this,
  // pressing Continue twice walked straight through the confirmation.
  assert.match(code, /disabled=\{placeBusy \|\| !!placeOptions \|\| placeBlocked\}/);
  assert.match(code, /CHOOSE A PLACE ABOVE/);
});

test('calculator: editing the city starts the question over', () => {
  // Options and the note both belong to the old spelling. Leaving either would attach one place's
  // answer to another place's name.
  const setter = code.slice(code.indexOf('function set<K extends FKey>'), code.indexOf('function touch('));
  assert.match(setter, /next\.placeAt = null;/);
  assert.match(setter, /setPlaceOptions\(null\);/);
  assert.match(setter, /setPlaceNote\(null\);/);
  assert.match(setter, /setPlaceBlocked\(false\);/);
});

test('calculator: choosing a place writes the name it actually belongs to', () => {
  // "Habor City" becomes "Harbor City, California", so the report names where they were born
  // rather than what they typed. One write, because set() would drop the coordinates.
  const choose = code.slice(code.indexOf('function choosePlace'), code.indexOf('async function confirmPlace'));
  assert.match(choose, /setData\(prev => \(\{/);
  assert.match(choose, /placeAt: \{ latitude: option\.latitude, longitude: option\.longitude \}/);
  assert.equal((choose.match(/setData\(/g) ?? []).length, 1, 'the name and the coordinates must move together');
});

test('calculator: a lookup that is down does not trap anyone', () => {
  // The server no longer invents a place it cannot find, so the worst case is a clear failure at
  // the end rather than a wrong chart. Blocking sign-ups on a GeoNames outage would be worse.
  assert.match(code, /CONTINUE ANYWAY/);
  assert.match(form, /You can continue, and we will try again/);
});

test('calculator: there is a way out when none of the places are right', () => {
  assert.match(code, /None of these/);
  assert.match(code, /cityRef\.current\?\.focus\(\)/);
});

// ─── the panel itself ────────────────────────────────────────────────────────

test('calculator: the panel announces itself and is reachable by keyboard', () => {
  assert.match(code, /aria-live="polite"/);
  assert.match(code, /role="group" aria-labelledby="place-pick-label"/);
  assert.match(code, /id="place-pick-label"/);
  // Every choice is a real button, so tab and enter work without anything being added.
  const panel = code.slice(code.indexOf('placeOptions.map'), code.indexOf('None of these'));
  assert.match(panel, /<button/);
  assert.match(panel, /type="button"/);
});

test('calculator: every tap target in the panel clears 44px', () => {
  const panel = code.slice(code.indexOf('placeOptions ? ('), code.indexOf('placeNote ? ('));
  const heights = [...panel.matchAll(/minHeight:(\d+)/g)].map(m => Number(m[1]));
  assert.ok(heights.length >= 2, `found ${heights.length} sized targets`);
  for (const h of heights) assert.ok(h >= 44, `a target is ${h}px`);
});

test('calculator: the panel uses the palette rather than inventing colours', () => {
  const panel = code.slice(code.indexOf('aria-live="polite"'), code.indexOf('className="calc-2col"', code.indexOf('aria-live="polite"')));
  const colours = [...panel.matchAll(/(?:color|background|borderColor|border):\s*'([^']+)'/g)].map(m => m[1]);
  for (const c of colours) {
    assert.ok(
      c.includes('var(--') || c === 'transparent' || c === 'none' || c.startsWith('rgba(255,255,255') || c.startsWith('1px solid var('),
      `${c} is not from the palette`,
    );
  }
});
