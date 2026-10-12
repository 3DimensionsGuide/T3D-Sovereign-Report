import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWheelScene, sameFocus } from '../../mobile/src/charts/wheel';
import type { WheelChart } from '../../mobile/src/charts/chartTypes';

const chart: WheelChart = {
  ascendant: 0,
  midheaven: 270,
  planets: [
    { body: 'sun', longitude: 10, sign: 'Aries', formatted: "10°00' Aries", retrograde: false, house: 1 },
    { body: 'moon', longitude: 11, sign: 'Aries', formatted: "11°00' Aries", retrograde: false, house: 1 },
    { body: 'mars', longitude: 100, sign: 'Cancer', formatted: "10°00' Cancer", retrograde: false, house: 4 },
  ],
  aspects: [
    { a: 'sun', b: 'mars', aspect: 'square', orb: 0.2, peak: true },
    { a: 'moon', b: 'mars', aspect: 'square', orb: 1.2, peak: false },
  ],
};

const aspectLines = (scene: ReturnType<typeof buildWheelScene>) =>
  scene.prims.filter((p) => p.k === 'line' && (p.stroke === '#C83E3E' || p.op === 0.12 || p.op === 1)) as Array<{ op?: number; w: number }>;

test('with no focus the scene has no highlight rings', () => {
  const s = buildWheelScene(chart);
  assert.equal(s.prims.filter((p) => p.k === 'circle' && p.w === 1.8).length, 0);
});

test('a focused aspect is drawn full strength and the others fade', () => {
  const s = buildWheelScene(chart, { a: 'sun', b: 'mars' });
  const lines = s.prims.filter((p) => p.k === 'line' && (p.op === 0.12 || p.op === 1));
  assert.equal(lines.filter((l) => l.k === 'line' && l.op === 1).length, 1);
  assert.equal(lines.filter((l) => l.k === 'line' && l.op === 0.12).length, 1);
});

test('the two bodies of the focused aspect get a ring', () => {
  const s = buildWheelScene(chart, { a: 'sun', b: 'mars' });
  assert.equal(s.prims.filter((p) => p.k === 'circle' && p.w === 1.8).length, 2);
});

test('crowded glyphs that were moved get a line back to their true position', () => {
  const plain = buildWheelScene(chart);
  const withoutConnectors = buildWheelScene({ ...chart, planets: [chart.planets[0]!, chart.planets[2]!], aspects: [] });
  const goldLines = (sc: ReturnType<typeof buildWheelScene>) => sc.prims.filter((p) => p.k === 'line' && p.w === 0.9 && p.op === 0.7).length;
  assert.ok(goldLines(plain) >= 1);
  assert.equal(goldLines(withoutConnectors), 0);
});

test('sameFocus compares the pair', () => {
  assert.equal(sameFocus({ a: 'sun', b: 'mars' }, { a: 'sun', b: 'mars' }), true);
  assert.equal(sameFocus({ a: 'sun', b: 'mars' }, { a: 'moon', b: 'mars' }), false);
  assert.equal(sameFocus(null, { a: 'sun', b: 'mars' }), false);
});
