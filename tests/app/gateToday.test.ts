import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildGateToday } from '../../src/lib/app/gateToday';
import { DEGREES_PER_GATE, GATE_SEQUENCE, MANDALA_START_LON, UNIQUE_CHANNELS } from '../../src/server/engines/human_design';

const START = 2461000.5;
/** A steady Sun at 1 degree a day, starting in the middle of gate index 10, so it leaves that gate after about 2.8 days. */
const lonAt = (_b: 'sun' | 'moon', jd: number): number => (MANDALA_START_LON + 10.5 * DEGREES_PER_GATE + (jd - START)) % 360;
const vehicle = { type: 'Generator', authority: 'Sacral', natalGates: [1, 2], undefinedCenters: [] as string[] };

test('a day with no gate change has one gate, already under way, with when the Sun leaves it', () => {
  const r = buildGateToday(START, vehicle, lonAt);
  assert.equal(r.gates.length, 1);
  const g = r.gates[0]!;
  assert.equal(g.gate, GATE_SEQUENCE[10]);
  assert.equal(g.from, null);
  const startMs = Date.UTC(2000, 0, 1, 12) + (START - 2451545.0) * 86_400_000;
  const stays = (Date.parse(g.until) - startMs) / 86_400_000;
  assert.ok(stays > 2.7 && stays < 2.9, `leaves after ${stays} days`);
  assert.ok(g.name.length > 0 && g.meaning.length > 0 && g.center.length > 0);
});

test('a day the Sun crosses a boundary lists the gate it leaves and the gate it enters', () => {
  const r = buildGateToday(START + 2.5, vehicle, lonAt);
  assert.equal(r.gates.length, 2);
  assert.equal(r.gates[0]!.gate, GATE_SEQUENCE[10]);
  assert.equal(r.gates[1]!.gate, GATE_SEQUENCE[11]);
  assert.equal(r.gates[0]!.from, null);
  assert.ok(r.gates[1]!.from !== null);
  assert.equal(r.gates[0]!.until, r.gates[1]!.from, 'one ends exactly as the next begins');
});

test('each gate says how it meets the chart and what to do, in terms of the contact', () => {
  const ch = UNIQUE_CHANNELS.find((c) => c.gates.includes(GATE_SEQUENCE[10]!))!.gates;
  const partner = ch[0] === GATE_SEQUENCE[10] ? ch[1] : ch[0];
  const spark = buildGateToday(START, { ...vehicle, natalGates: [partner!] }, lonAt).gates[0]!;
  assert.equal(spark.contact, 'electromagnetic');
  assert.match(spark.meets, /missing half of your Channel/);
  assert.match(spark.advice, /not .*a decision/);
  assert.ok(spark.channel);
});

test('the person’s own Strategy and Authority anchor the advice', () => {
  const r = buildGateToday(START, vehicle, lonAt);
  assert.match(r.strategy ?? '', /^Strategy \(/);
  assert.match(r.authority ?? '', /^Authority \(/);
  const none = buildGateToday(START, { type: null, authority: null, natalGates: [1], undefinedCenters: [] }, lonAt);
  assert.equal(none.strategy, null);
  assert.equal(none.authority, null);
});

test('the Timeline builds it, and the Vehicle lens shows it above the upcoming list, falling back for older saved copies', () => {
  const engine = readFileSync('src/server/engines/timeline.ts', 'utf8');
  assert.match(engine, /gateToday = buildGateToday\(/);
  const screen = readFileSync('mobile/src/app/(tabs)/timeline.tsx', 'utf8');
  assert.match(screen, /<VehicleToday data=\{data\.gateToday\}/);
  assert.match(screen, /The Sun in every new gate/, 'older saved copies still get the plain line');
});
