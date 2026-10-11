import test from 'node:test';
import assert from 'node:assert/strict';
import { baseNumber, buildRoadStrip } from '../../mobile/src/lib/roadStrip';
import type { ChallengeCard, PinnacleCard } from '../../mobile/src/lib/numerologyTypes';

const phase = (label: string, number: number, startAge: number, endAge: number | null, startsOn: string, endsOn: string | null) =>
  ({ label, number, startAge, endAge, startsOn, endsOn, current: false });

// Born 1990-05-15, Life Path 3: Pinnacles at 0, 33, 42, 51.
const PINNACLES = [
  { ...phase('First Pinnacle', 6, 0, 33, '1990-05-15', '2023-05-15'), theme: null, terrain: null, coreMandate: null, phase: null },
  { ...phase('Second Pinnacle', 7, 33, 42, '2023-05-15', '2032-05-15'), theme: null, terrain: null, coreMandate: null, phase: null },
  { ...phase('Third Pinnacle', 4, 42, 51, '2032-05-15', '2041-05-15'), theme: null, terrain: null, coreMandate: null, phase: null },
  { ...phase('Fourth Pinnacle', 22, 51, null, '2041-05-15', null), theme: null, terrain: null, coreMandate: null, phase: null },
] as PinnacleCard[];

const CHALLENGES = [
  { ...phase('First Challenge', 2, 0, 33, '1990-05-15', '2023-05-15'), terrain: null, skill: null, reframe: null, test: null, key: null },
  { ...phase('Second Challenge', 5, 33, 42, '2023-05-15', '2032-05-15'), terrain: null, skill: null, reframe: null, test: null, key: null },
  { ...phase('Third Challenge', 3, 42, 51, '2032-05-15', '2041-05-15'), terrain: null, skill: null, reframe: null, test: null, key: null },
  { ...phase('Fourth Challenge', 1, 51, null, '2041-05-15', null), terrain: null, skill: null, reframe: null, test: null, key: null },
] as ChallengeCard[];

test('the strip finds the current Pinnacle from the date being shown', () => {
  const m = buildRoadStrip(PINNACLES, CHALLENGES, '2026-10-11', null)!;
  assert.deepEqual(m.segments.map((s) => s.current), [false, true, false, false]);
  assert.deepEqual(m.segments.map((s) => s.past), [true, false, false, false]);
  assert.match(m.sentence, /Second Pinnacle, ages 33 to 42/);
  assert.match(m.sentence, /Pinnacle 7, Challenge 5/);
});

test('segment widths fill the strip and the last Pinnacle gets room', () => {
  const m = buildRoadStrip(PINNACLES, CHALLENGES, '2026-10-11', null)!;
  const total = m.segments.reduce((s, x) => s + x.widthPct, 0);
  assert.ok(Math.abs(total - 100) < 0.001, `widths add to 100, got ${total}`);
  assert.ok(m.segments[3]!.widthPct > m.segments[1]!.widthPct, 'the open-ended Pinnacle is the longest here');
});

test('the marker sits inside the current segment', () => {
  const m = buildRoadStrip(PINNACLES, CHALLENGES, '2026-10-11', null)!;
  const before = m.segments.slice(0, 1).reduce((s, x) => s + x.widthPct, 0);
  const upTo = m.segments.slice(0, 2).reduce((s, x) => s + x.widthPct, 0);
  assert.ok(m.markerPct > before && m.markerPct < upTo, `marker ${m.markerPct} between ${before} and ${upTo}`);
});

test('the last Pinnacle has no end and reads "from age"', () => {
  const m = buildRoadStrip(PINNACLES, CHALLENGES, '2045-01-01', null)!;
  assert.equal(m.segments[3]!.current, true);
  assert.match(m.sentence, /Fourth Pinnacle, from age 51/);
});

test('front of the line: a Personal Year that matches the Pinnacle or Challenge is called out', () => {
  assert.match(buildRoadStrip(PINNACLES, CHALLENGES, '2026-10-11', 7)!.match ?? '', /Personal Year 7 matches your Pinnacle 7/);
  assert.match(buildRoadStrip(PINNACLES, CHALLENGES, '2026-10-11', 5)!.match ?? '', /matches your Challenge 5/);
  assert.equal(buildRoadStrip(PINNACLES, CHALLENGES, '2026-10-11', 3)!.match, null);
  assert.equal(buildRoadStrip(PINNACLES, CHALLENGES, '2026-10-11', null)!.match, null);
});

test('master numbers match on their foundation number', () => {
  assert.equal(baseNumber(11), 2);
  assert.equal(baseNumber(22), 4);
  assert.equal(baseNumber(33), 6);
  assert.match(buildRoadStrip(PINNACLES, CHALLENGES, '2045-01-01', 4)!.match ?? '', /matches your Pinnacle 22/);
});

test('the spoken summary names every Pinnacle and Challenge and the current one', () => {
  const m = buildRoadStrip(PINNACLES, CHALLENGES, '2026-10-11', null)!;
  assert.match(m.spokenSummary, /Second Pinnacle 7, Challenge 5, current/);
  assert.match(m.spokenSummary, /Fourth Pinnacle 22, Challenge 1/);
});

test('no Pinnacles means no strip', () => {
  assert.equal(buildRoadStrip([], [], '2026-10-11', null), null);
});
