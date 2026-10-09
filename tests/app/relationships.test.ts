import test from 'node:test';
import assert from 'node:assert/strict';
import { UNIQUE_CHANNELS } from '../../src/server/engines/human_design';
import {
  buildConnections, buildNumberPair, buildSynastry, type GateKnowledge,
} from '../../src/lib/app/relationshipPieces';
import type { ChartData } from '../../src/server/engines/types';

const labels = { you: 'you', them: 'Sam' };
const known = { you: true, them: true };
const gk = (gates: number[]): GateKnowledge => ({ sure: new Set(gates), possible: new Set(gates) });
const [g1, g2] = UNIQUE_CHANNELS[0]!.gates;

test('there are 36 unique channels', () => assert.equal(UNIQUE_CHANNELS.length, 36));

test('one gate each, opposite ends: electromagnetic', () => {
  const r = buildConnections(gk([g1]), gk([g2]), labels, known);
  assert.equal(r.items.filter((i) => i.kind === 'electromagnetic').length >= 1, true);
  assert.equal(r.items[0]!.kind, 'electromagnetic');
});

test('both hold the whole channel: companionship', () => {
  const r = buildConnections(gk([g1, g2]), gk([g1, g2]), labels, known);
  assert.equal(r.items.find((i) => i.gates[0] === g1)?.kind, 'companionship');
});

test('whole channel vs neither gate: dominance', () => {
  const r = buildConnections(gk([g1, g2]), gk([]), labels, known);
  assert.equal(r.items.find((i) => i.gates[0] === g1)?.kind, 'dominance');
});

test('whole channel vs one gate: compromise', () => {
  const r = buildConnections(gk([g1, g2]), gk([g1]), labels, known);
  assert.equal(r.items.find((i) => i.gates[0] === g1)?.kind, 'compromise');
});

test('uncertain gates are counted as left out, not classified', () => {
  const maybe: GateKnowledge = { sure: new Set(), possible: new Set([g1]) };
  const r = buildConnections(gk([g1, g2]), maybe, labels, { you: true, them: false });
  assert.equal(r.items.find((i) => i.gates[0] === g1), undefined);
  assert.equal(r.leftOut >= 1, true);
  assert.ok(r.note);
});

test('no shared gates and no overlap: nothing to report', () => {
  const r = buildConnections(gk([]), gk([]), labels, known);
  assert.equal(r.items.length, 0);
});

test('number pair: same group, same root, different group', () => {
  const same = buildNumberPair({ lifePath: 5, personalYear: 3 }, { lifePath: 5, personalYear: 3 }, labels);
  const grp = buildNumberPair({ lifePath: 1, personalYear: 3 }, { lifePath: 7, personalYear: 4 }, labels);
  const diff = buildNumberPair({ lifePath: 1, personalYear: 3 }, { lifePath: 2, personalYear: 4 }, labels);
  assert.notEqual(same.lifePath.text, grp.lifePath.text);
  assert.notEqual(grp.lifePath.text, diff.lifePath.text);
});

test('master numbers display with their root and do not crash', () => {
  const r = buildNumberPair({ lifePath: 22, personalYear: 9 }, { lifePath: 4, personalYear: 1 }, labels);
  assert.match(r.youLifePath, /22/);
  assert.ok(r.lifePath.text.length > 0);
});

// ── synastry ──
const pos = (longitude: number) => ({ longitude }) as ChartData['sun'];
const chart = (over: Partial<Record<'sun' | 'moon' | 'venus' | 'mars' | 'saturn', number>>): ChartData => {
  const base = { sun: 10, moon: 200, mercury: 40, venus: 100, mars: 250, jupiter: 300, saturn: 330, ...over };
  return Object.fromEntries(Object.entries(base).map(([k, v]) => [k, pos(v)])) as unknown as ChartData;
};

test('tight Sun conjunction is found; wide gap is not', () => {
  const close = buildSynastry(chart({ sun: 10 }), chart({ sun: 12 }), labels, known);
  assert.ok(close.items.some((i) => i.aspect === 'conjunction'));
  const none = buildSynastry(chart({ sun: 10, venus: 100 }), chart({ sun: 160, venus: 205, mars: 70, moon: 20 }), labels, known);
  assert.equal(none.items.some((i) => i.aspect === 'conjunction' && i.line.includes('Sun with')), false);
});

test('a Moon with an unknown birth time is never compared, and the note says whose', () => {
  const a = chart({ moon: 50, venus: 50 });
  const b = chart({ moon: 50, venus: 50 });
  const youUnknown = buildSynastry(a, b, labels, { you: false, them: true });
  assert.equal(youUnknown.items.some((i) => /^Your Moon/.test(i.line)), false);
  assert.match(youUnknown.note ?? '', /your Moon/);
  const themUnknown = buildSynastry(a, b, labels, { you: true, them: false });
  assert.equal(themUnknown.items.some((i) => /Sam's Moon/.test(i.line)), false);
  assert.match(themUnknown.note ?? '', /their Moon/);
  const both = buildSynastry(a, b, labels, { you: false, them: false });
  assert.equal(both.items.some((i) => /Moon/.test(i.line)), false);
  assert.match(both.note ?? '', /both Moons/);
  assert.equal(buildSynastry(a, b, labels, known).note, null);
});

test('at most 8 items, each with an orb inside limits', () => {
  const r = buildSynastry(chart({}), chart({}), labels, known);
  assert.ok(r.items.length <= 8);
  for (const i of r.items) assert.ok(i.orb <= 6);
});
