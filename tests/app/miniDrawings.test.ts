import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { buildMiniRoad, buildMiniWheel, longitudeFromPlacement } from '../../mobile/src/lib/miniDrawings';
import type { RoadStripModel } from '../../mobile/src/lib/roadStrip';

const seg = (index: number, number: number, widthPct: number, current: boolean, past: boolean) => ({
  index, number, challenge: 1, startAge: 0, endAge: 10, widthPct, current, past,
});
const model: RoadStripModel = {
  segments: [seg(0, 3, 40, false, true), seg(1, 22, 20, true, false), seg(2, 7, 20, false, false), seg(3, 5, 20, false, false)],
  markerPct: 50,
  sentence: 'You are here: your Second Pinnacle.',
  match: null,
  spokenSummary: '',
};

test('longitude comes from sign, degrees and minutes', () => {
  assert.equal(longitudeFromPlacement('Aries', 0, 0), 0);
  assert.equal(longitudeFromPlacement('scorpio', 15, 30), 225.5);
  assert.equal(longitudeFromPlacement('Nope', 1), null);
});

test('mini road: four bars that fill the width, one current, marker under it', () => {
  const r = buildMiniRoad(model, 92, 44);
  assert.equal(r.bars.length, 4);
  const last = r.bars[3]!;
  assert.ok(Math.abs(last.x + last.width - 92) < 0.1);
  assert.deepEqual(r.bars.map((b) => b.state), ['past', 'current', 'future', 'future']);
  assert.ok(r.bars.every((b) => b.width >= 12));
  assert.equal(r.markerX, r.bars[1]!.x + r.bars[1]!.width / 2);
  assert.match(r.spoken, /Second Pinnacle/);
});

test('mini wheel: twelve ticks and a mark per placement, all inside the drawing', () => {
  const w = buildMiniWheel(225.5, 10, 300, { sun: 'Scorpio', moon: 'Aries', rising: 'Aquarius' });
  assert.equal(w.ticks.length, 12);
  assert.deepEqual(w.marks.map((m) => m.who), ['Sun', 'Moon', 'Rising']);
  for (const m of w.marks) for (const v of [m.x, m.y, m.x2, m.y2]) assert.ok(v >= 0 && v <= w.size);
  assert.match(w.spoken, /Sun in Scorpio, Moon in Aries, Rising in Aquarius/);
});

test('the Road and Stoplight cards carry their drawings, hidden placement is by shape and words', () => {
  const chart = readFileSync(new URL('../../mobile/src/app/(tabs)/chart.tsx', import.meta.url), 'utf8');
  assert.match(chart, /drawing=\{<MiniRoad \/>\}/);
  assert.match(chart, /drawing=\{<MiniWheel astro=\{astro\} \/>\}/);
  assert.match(readFileSync(new URL('../../mobile/src/components/MiniWheel.tsx', import.meta.url), 'utf8'), /accessibilityLabel=\{wheel\.spoken\}/);
});
