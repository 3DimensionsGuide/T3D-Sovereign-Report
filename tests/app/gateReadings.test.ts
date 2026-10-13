import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GATE_READINGS } from '../../src/lib/app/gateReadings';

test('every one of the 64 gates has a theme, a shadow and guidance', () => {
  for (let g = 1; g <= 64; g++) {
    const r = GATE_READINGS[g];
    assert.ok(r, `gate ${g} missing`);
    assert.ok(r.theme.length > 20 && r.shadow.length > 20 && r.guidance.length > 20, `gate ${g} too thin`);
  }
  assert.equal(Object.keys(GATE_READINGS).length, 64);
});

test('readings name their own gate and stay distinct', () => {
  const themes = new Set<string>();
  for (let g = 1; g <= 64; g++) {
    const r = GATE_READINGS[g]!;
    assert.match(r.theme, new RegExp(`Gate ${g}\\b`), `gate ${g} theme names a different gate`);
    themes.add(r.theme);
  }
  assert.equal(themes.size, 64);
});

test('the Vehicle card shows the gate reading and the cache was bumped for the new field', () => {
  const ui = readFileSync('mobile/src/components/VehicleToday.tsx', 'utf8');
  assert.match(ui, /g\.reading\.theme/);
  assert.match(ui, /g\.reading\.shadow/);
  assert.match(ui, /g\.reading\.guidance/);
  assert.match(readFileSync('mobile/src/lib/useTimeline.ts', 'utf8'), /CACHE_VERSION = 5/);
});

import { gateReadingForDay } from '../../mobile/src/lib/gateDay';

test('a chosen day gets its own gate reading, today keeps the anchor, a missing day has none', () => {
  const g = (gate: number) => ({ gate });
  const data = {
    gateToday: { gates: [g(32)], strategy: 'S', authority: 'A' },
    gateDays: [{ dayIndex: 2, gates: [g(50)] }],
  };
  assert.equal(gateReadingForDay(data, 0)!.gates[0]!.gate, 32);
  const d2 = gateReadingForDay(data, 2)!;
  assert.equal(d2.gates[0]!.gate, 50);
  assert.equal(d2.strategy, 'S');
  assert.equal(gateReadingForDay(data, 3), null);
  assert.equal(gateReadingForDay({ gateDays: [] }, 0), null);
});

test('the Timeline locks future gate readings and follows the ribbon', () => {
  const s = readFileSync('mobile/src/app/(tabs)/timeline.tsx', 'utf8');
  assert.match(s, /onSelectDay=\{setSelectedDay\}/);
  assert.match(s, /selectedDay > 0/);
  assert.match(s, /<VehicleDayBlock data=\{data\} selectedDay=\{selectedDay\} premium=\{premium\}/);
  const b = readFileSync('mobile/src/components/DayLenses.tsx', 'utf8');
  assert.match(b, /if \(!premium\) \{\s*return \(\s*<PremiumGate\s+title=\{`The gates on/);
});
