import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contactsFor, houseFor, retrogradeNote, signStage, signOfBody, TEMPO } from '../../mobile/src/lib/planetFacts';

test('houseFor counts whole-sign houses from the Ascendant sign', () => {
  assert.equal(houseFor(195, 195), 1); // Libra on a Libra Ascendant
  assert.equal(houseFor(225, 195), 2); // Scorpio
  assert.equal(houseFor(165, 195), 12); // Virgo
  assert.equal(houseFor(5, 350), 2); // wraps past Pisces into Aries
});

test('signStage and signOfBody', () => {
  assert.equal(signStage(3), 'early in the sign');
  assert.equal(signStage(14), 'in the middle of the sign');
  assert.match(signStage(27), /close to moving on/);
  assert.equal(signOfBody(195.5), 'Libra');
});

test('every body has a tempo line', () => {
  for (const b of ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'] as const) {
    assert.ok(TEMPO[b].length > 20, b);
  }
});

test('contacts are the transit rows for that planet only', () => {
  const hit = (transiting: string, natal: string) => ({ transiting, natal, aspect: 'conjunct', orb: 1, applying: true, peak: false, nature: 'flow' });
  const list = [hit('jupiter', 'midheaven'), hit('mars', 'sun'), hit('jupiter', 'moon')] as never;
  assert.equal(contactsFor('jupiter', list).length, 2);
  assert.equal(contactsFor('venus', list).length, 0);
});

test('Sun and Moon never get a retrograde note', () => {
  assert.equal(retrogradeNote('sun'), '');
  assert.ok(retrogradeNote('mars').length > 20);
});

test('the planet sheet closes before opening another sheet, and rows and ring glyphs are tappable', () => {
  const sheet = readFileSync('mobile/src/components/PlanetSheet.tsx', 'utf8');
  assert.match(sheet, /onClose\(\);\s*setTimeout\(\(\) => open\(id\), 400\)/);
  const ring = readFileSync('mobile/src/components/SkyRing.tsx', 'utf8');
  assert.match(ring, /onPress=\{\(\) => onPick\(m\)\}/);
  assert.match(ring, /onPress=\{\(\) => onPick\?\.\(m\)\}/);
});
