import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LENSES, signAt, slideContent, type CarouselChart } from '../../mobile/src/lib/carouselSlides';

const chart = {
  astrology: { tropicalSun: { sign: 'Libra' }, tropicalMoon: { sign: 'Aries' }, tropicalAscendant: 215 },
  numerology: { lifePath: 7, destiny: 9 },
  humanDesign: { type: 'Manifesting Generator', authority: 'Sacral', profile: '4/1 Opportunist Investigator' },
} as CarouselChart;

test('the carousel has one slide for each lens, in order', () => {
  assert.deepEqual([...LENSES], ['vehicle', 'road', 'stoplight']);
});

test('signAt finds the sign for a longitude and wraps around', () => {
  assert.equal(signAt(0), 'Aries');
  assert.equal(signAt(215), 'Scorpio');
  assert.equal(signAt(359.9), 'Pisces');
  assert.equal(signAt(-10), 'Pisces');
  assert.equal(signAt(360), 'Aries');
});

test('each slide shows its own facts', () => {
  assert.deepEqual(slideContent('vehicle', chart, true).facts.map((f) => f.value), ['Manifesting Generator', 'Sacral', '4/1']);
  assert.deepEqual(slideContent('road', chart, true).facts.map((f) => f.value), ['7', '9']);
  assert.deepEqual(slideContent('stoplight', chart, true).facts.map((f) => f.value), ['Libra', 'Aries', 'Scorpio']);
});

test('Moon and Rising are left off when the birth time is not known', () => {
  assert.deepEqual(slideContent('stoplight', chart, false).facts.map((f) => f.label), ['Sun']);
});

test('the carousel uses no private details and is offered in the share studio', () => {
  const lib = readFileSync('mobile/src/lib/carouselSlides.ts', 'utf8');
  const card = readFileSync('mobile/src/components/CarouselShareCard.tsx', 'utf8');
  const share = readFileSync('mobile/src/app/share-card.tsx', 'utf8');
  assert.doesNotMatch(lib + card, /lastName|birthDate|latitude|longitude:|email/);
  assert.match(share, /<CarouselShareCard/);
  assert.match(share, /card-carousel/);
});
