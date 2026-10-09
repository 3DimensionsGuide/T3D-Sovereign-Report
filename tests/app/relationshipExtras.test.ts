import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCenterEffects, buildHouseOverlays, wholeSignHouseOf, type CenterKnowledge,
} from '../../src/lib/app/relationshipExtras';
import type { ChartData } from '../../src/server/engines/types';

const labels = { you: 'You', them: 'Sam' };
const known = { you: true, them: true };
const ck = (centers: string[]): CenterKnowledge => ({ sure: new Set(centers), possible: new Set(centers) });

test('defined on one side and open on the other gives one effect, for the open person', () => {
  const r = buildCenterEffects(ck(['solar_plexus']), ck([]), labels, known);
  const item = r.items.find((i) => i.center === 'Solar Plexus');
  assert.ok(item);
  assert.match(item.holders, /^You have it defined\. Sam has it open\.$/);
  assert.match(item.feels, /^Sam tends to/);
});

test('the other way round the open person is you, with matching verbs', () => {
  const r = buildCenterEffects(ck([]), ck(['sacral']), labels, known);
  const item = r.items.find((i) => i.center === 'Sacral');
  assert.ok(item);
  assert.match(item.holders, /^Sam has it defined\. You have it open\.$/);
  assert.match(item.feels, /^You tend to/);
  assert.match(item.brings, /^Sam tends to bring/);
});

test('both defined and both open are listed apart, with no effect item', () => {
  const r = buildCenterEffects(ck(['head', 'root']), ck(['head']), labels, known);
  assert.deepEqual(r.bothDefined, ['Head']);
  assert.equal(r.bothOpen.includes('Head'), false);
  assert.equal(r.items.some((i) => i.center === 'Head'), false);
  assert.equal(r.items.some((i) => i.center === 'Root'), true);
  assert.equal(r.bothOpen.includes('Ajna'), true);
});

test('a center that depends on an unknown birth time is left out, not guessed', () => {
  const maybe: CenterKnowledge = { sure: new Set(), possible: new Set(['spleen']) };
  const r = buildCenterEffects(ck(['spleen']), maybe, labels, { you: true, them: false });
  assert.equal(r.items.some((i) => i.center === 'Spleen'), false);
  assert.equal(r.bothDefined.includes('Spleen'), false);
  assert.equal(r.bothOpen.includes('Spleen'), false);
  assert.equal(r.leftOut, 1);
  assert.ok(r.note);
});

test('whole-sign house: the rising sign is house 1, the next sign house 2, and it wraps', () => {
  assert.equal(wholeSignHouseOf(95, 100), 1); // both in Cancer
  assert.equal(wholeSignHouseOf(125, 100), 2); // Leo is the next sign
  assert.equal(wholeSignHouseOf(65, 100), 12); // Gemini is the sign before
  assert.equal(wholeSignHouseOf(5, 350), 2); // Aries after Pisces
  assert.equal(wholeSignHouseOf(359.9, 0.1), 12);
});

function chart(lons: Partial<Record<string, number>>, asc: number): ChartData {
  const pos = (lon: number) => ({ longitude: lon });
  const body = (name: string) => pos(lons[name] ?? 0);
  return {
    sun: body('sun'), moon: body('moon'), venus: body('venus'), mars: body('mars'),
    jupiter: body('jupiter'), saturn: body('saturn'),
    houses: { cusps: [], ascendant: asc, mc: 0, system: 'Whole Sign' },
  } as unknown as ChartData;
}

test('house overlays place their planets by your rising sign, and yours by theirs', () => {
  const you = chart({ sun: 10 }, 100); // rising Cancer
  const them = chart({ sun: 200, venus: 215 }, 280); // rising Capricorn
  const r = buildHouseOverlays(you, them, labels, known);
  assert.equal(r.groups.length, 2);
  const theirInYours = r.groups[0]!.items.find((i) => i.line.includes('Sun'))!;
  // Their Sun at 200 (Libra) from a Cancer rising: Cancer 1, Leo 2, Virgo 3, Libra 4.
  assert.equal(theirInYours.house, 4);
  assert.match(theirInYours.line, /^Sam's Sun in your 4th house$/);
  const yoursInTheirs = r.groups[1]!.items.find((i) => i.line.includes('Sun'))!;
  // Your Sun at 10 (Aries) from a Capricorn rising: Cap 1, Aqu 2, Pis 3, Ari 4.
  assert.equal(yoursInTheirs.house, 4);
  assert.match(yoursInTheirs.line, /^Your Sun in Sam's 4th house$/);
});

test('houses are left out for a person whose birth time is not known, and the Moon of that person', () => {
  const you = chart({ sun: 10 }, 100);
  const them = chart({ sun: 200 }, 280);
  const r = buildHouseOverlays(you, them, labels, { you: true, them: false });
  assert.equal(r.groups.length, 1);
  assert.match(r.groups[0]!.title, /in your houses$/);
  // Their Moon cannot be placed without their birth time.
  assert.equal(r.groups[0]!.items.some((i) => i.line.includes('Moon')), false);
  assert.ok(r.note);
  const none = buildHouseOverlays(you, them, labels, { you: false, them: false });
  assert.equal(none.groups.length, 0);
  assert.ok(none.note);
});
