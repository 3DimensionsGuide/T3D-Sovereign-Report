import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGateEvents, type GateBody } from '../../src/lib/app/gateEvents';
import { DEGREES_PER_GATE, GATE_SEQUENCE, MANDALA_START_LON, UNIQUE_CHANNELS, longitudeToGate } from '../../src/server/engines/human_design';

const START = 2461000.5;
/** A steady Sun (1 degree a day) and Moon (13 degrees a day), starting in the middle of gate index 10. */
const lonAt = (b: GateBody, jd: number): number =>
  (MANDALA_START_LON + 10.5 * DEGREES_PER_GATE + (jd - START) * (b === 'sun' ? 1 : 13)) % 360;

const sunGateAt = (d: number) => longitudeToGate(lonAt('sun', START + d)).gate;

test('Sun is listed for every gate it enters, with the time it leaves', () => {
  const ev = buildGateEvents(START, START + 60, { type: 'Generator', authority: 'Sacral', natalGates: [1, 2], undefinedCenters: [] }, lonAt)
    .filter((e) => e.body === 'sun');
  assert.ok(ev.length >= 9 && ev.length <= 11);
  for (const e of ev) {
    assert.equal(e.kind, 'gate');
    assert.ok(Date.parse(e.until) > Date.parse(e.at));
    const days = (Date.parse(e.until) - Date.parse(e.at)) / 86_400_000;
    assert.ok(days > 5 && days < 6.2, `stays ${days}`);
  }
  assert.equal(ev[0]!.gate, GATE_SEQUENCE[11]);
});

test('Moon is listed only when it completes one of the person\'s channels', () => {
  const ch = UNIQUE_CHANNELS[0]!.gates;
  const natal = [ch[0]];
  const ev = buildGateEvents(START, START + 60, { type: 'Projector', authority: 'Splenic', natalGates: natal, undefinedCenters: [] }, lonAt)
    .filter((e) => e.body === 'moon');
  assert.ok(ev.length > 0);
  for (const e of ev) {
    assert.equal(e.contact, 'electromagnetic');
    assert.equal(e.gate, ch[1]);
    assert.match(e.title, /completes your Channel/);
  }
});

test('Sun entry completing a channel is tagged electromagnetic', () => {
  const target = sunGateAt(8);
  const partner = UNIQUE_CHANNELS.find((c) => c.gates.includes(target))!.gates.find((g) => g !== target)!;
  const ev = buildGateEvents(START, START + 30, { type: 'Generator', authority: 'Sacral', natalGates: [partner], undefinedCenters: [] }, lonAt)
    .find((e) => e.body === 'sun' && e.gate === target)!;
  assert.equal(ev.contact, 'electromagnetic');
  assert.ok(ev.channel);
});

test('events outside the range are not returned', () => {
  const ev = buildGateEvents(START, START + 10, { type: null, authority: null, natalGates: [1], undefinedCenters: [] }, lonAt);
  assert.ok(ev.length > 0);
  assert.ok(ev.every((e) => (Date.parse(e.at) - (Date.UTC(2000, 0, 1, 12) + (START - 2451545) * 86_400_000)) / 86_400_000 < 10));
});
