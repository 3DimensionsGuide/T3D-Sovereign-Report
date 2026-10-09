import test from 'node:test';
import assert from 'node:assert/strict';
import { buildNatalAspects, buildNodes } from '../../src/lib/app/natalExtras';
import { buildYearAhead } from '../../src/lib/app/yearAhead';
import type { ChartData } from '../../src/server/engines/types';
import type { TimelineResult } from '../../src/server/engines/timeline';

const SIGN_NAMES = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const pos = (longitude: number) => ({
  longitude, sign: SIGN_NAMES[Math.floor(longitude / 30) % 12]!, formatted: `${longitude}`, retrograde: false,
});

function chart(over: Record<string, number>, asc = 100): ChartData {
  const base: Record<string, number> = {
    sun: 10, moon: 200, mercury: 40, venus: 70, mars: 130, jupiter: 160, saturn: 250,
    uranus: 300, neptune: 330, pluto: 350, northNode: 95, southNode: 275,
  };
  const all = { ...base, ...over };
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(all)) out[k] = pos(all[k]!);
  out.houses = { cusps: [], ascendant: asc, mc: 0, system: 'Whole Sign' };
  return out as unknown as ChartData;
}

test('nodes: sign text follows the North Node, and the house follows the Ascendant', () => {
  // North Node 95 = Cancer. Ascendant 100 = Cancer too, so the North Node is in the 1st house.
  const r = buildNodes(chart({}), true)!;
  assert.equal(r.north.sign, 'Cancer');
  assert.equal(r.south.sign, 'Capricorn');
  assert.equal(r.north.house, 1);
  assert.equal(r.south.house, 7);
  assert.match(r.growth, /emotional openness/);
  assert.match(r.familiar, /discipline/);
  assert.ok(r.houseGrowth);
  assert.equal(r.note, null);
});

test('nodes: without a birth time the houses are left out and a note says why', () => {
  const r = buildNodes(chart({}), false)!;
  assert.equal(r.north.house, null);
  assert.equal(r.houseGrowth, null);
  assert.equal(r.houseFamiliar, null);
  assert.ok(r.note);
});

test('aspects: a trine within 3 degrees is easy, a square is challenging, tight is within 1 degree', () => {
  // Sun 10, Mars 130.5 -> trine (120) with 0.5 orb. Sun 10 vs Mercury 100 -> square, 0 orb.
  const r = buildNatalAspects(chart({ mars: 130.5, mercury: 100, moon: 255 }), true);
  const trine = r.items.find((i) => i.line === 'Sun trine Mars')!;
  assert.ok(trine);
  assert.equal(trine.feel, 'easy');
  assert.equal(trine.tight, true);
  const square = r.items.find((i) => i.line === 'Sun square Mercury')!;
  assert.equal(square.feel, 'challenging');
  assert.ok(r.items.every((i) => i.orb <= 3));
  // Sorted tightest first.
  for (let i = 1; i < r.items.length; i += 1) assert.ok(r.items[i - 1]!.orb <= r.items[i]!.orb);
});

test('aspects: an angle wider than 3 degrees is not listed', () => {
  const r = buildNatalAspects(chart({ mars: 134 }), true); // 4 degrees off the Sun trine
  assert.equal(r.items.some((i) => i.line === 'Sun trine Mars'), false);
});

test('aspects: the Moon is left out when the birth time is not known', () => {
  const r = buildNatalAspects(chart({ moon: 10 }), false); // conjunct the Sun, if it counted
  assert.equal(r.items.some((i) => i.line.includes('Moon')), false);
  assert.ok(r.note);
  const withTime = buildNatalAspects(chart({ moon: 10 }), true);
  assert.equal(withTime.items.some((i) => i.line === 'Sun conjunct Moon'), true);
});

function timelineAt(age: number): TimelineResult {
  return {
    from: '2026-10-09', to: '2026-12-08', events: [], seasons: [],
    profection: { age, house: (age % 12) + 1, sign: 'Cancer', lord: 'moon', startsOn: '2026-05-01', endsOn: '2027-04-30' },
    universalYear: 1,
    personal: [{ date: '2026-10-09', year: 4, month: 5, day: 7 }],
    pinnacle: {} as never, challenge: {} as never,
    numberMeanings: { 4: { word: 'Foundations', line: 'Steady work builds something that lasts.' } },
  } as unknown as TimelineResult;
}

test('year ahead: the Saturn return window is found at age 29, and flagged as coming up at 26', () => {
  const at29 = buildYearAhead(timelineAt(29));
  assert.equal(at29.chapter.items.some((i) => i.name === 'Saturn return' && i.when === 'now'), true);
  const at26 = buildYearAhead(timelineAt(26));
  assert.equal(at26.chapter.items.some((i) => i.name === 'Saturn return' && i.when === 'next'), true);
  assert.equal(at26.chapter.items.some((i) => i.when === 'now'), false);
});

test('year ahead: joins the house topic, the Lord of the Year and the Personal Year', () => {
  const r = buildYearAhead(timelineAt(31));
  assert.equal(r.topic.lord, 'Moon');
  assert.equal(r.pace.personalYear, 4);
  assert.match(r.summary, /Lord of the Year/);
  assert.match(r.summary, /Personal Year 4/);
  assert.equal(r.startsOn, '2026-05-01');
});

test('year ahead: ages with no long cycle say so instead of listing nothing', () => {
  const r = buildYearAhead(timelineAt(33));
  assert.equal(r.chapter.items.length, 0);
  assert.ok(r.chapter.none.length > 10);
});
