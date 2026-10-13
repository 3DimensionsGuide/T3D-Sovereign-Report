import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p: string) => readFileSync(p, 'utf8');

test('gate cards, tabs and chips no longer use the purple surface', () => {
  for (const f of [
    'VehicleToday', 'Segmented', 'Explain', 'ReadingBlocks', 'TimeSpine', 'TimeNote', 'TransitSheet', 'LetterStrip', 'SignalRibbon', 'ChartPanels', 'RoadToday',
  ]) {
    assert.doesNotMatch(read(`mobile/src/components/${f}.tsx`), /colors\.(amethyst|purple)/, f);
  }
  assert.doesNotMatch(read('mobile/src/app/(tabs)/timeline.tsx'), /colors\.(amethyst|purple)/);
});

test('luxury surface tokens exist and the gate card uses them', () => {
  const t = read('mobile/src/theme/tokens.ts');
  for (const k of ['surface', 'surfaceRaised', 'goldWash', 'goldEdge']) assert.match(t, new RegExp(`\\b${k}:`));
  assert.match(read('mobile/src/components/VehicleToday.tsx'), /backgroundColor: colors\.surface/);
  assert.match(read('mobile/src/components/ChartPanels.tsx'), /aspectChipOn: \{[^}]*gold/);
});
