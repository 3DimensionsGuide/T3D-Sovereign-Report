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
  assert.match(readFileSync('mobile/src/lib/useTimeline.ts', 'utf8'), /CACHE_VERSION = 3/);
});
