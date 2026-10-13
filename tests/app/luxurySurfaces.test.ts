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
  assert.match(read('mobile/src/components/VehicleToday.tsx'), /backgroundColor: T\.surface/);
  assert.match(read('mobile/src/components/ChartPanels.tsx'), /aspectChipOn: \{[^}]*gold/);
});

test('no purple left in the app palette', () => {
  for (const f of ['mobile/src/theme/tokens.ts', 'mobile/src/charts/palette.ts']) {
    const s = read(f);
    assert.doesNotMatch(s, /2E1A47|1F1235|7A4CC2/i, f);
  }
});

test('each tab has its own palette and uses it', () => {
  const t = read('mobile/src/theme/tokens.ts');
  const body = t.slice(t.indexOf('export const themes'));
  const surfaces = [...body.matchAll(/surface: '(#[0-9A-Fa-f]{6})'/g)].map((m) => m[1].toLowerCase());
  assert.equal(surfaces.length, 5);
  assert.equal(new Set(surfaces).size, 5, 'five distinct surfaces');
  for (const name of ['today', 'timeline', 'readings', 'practice', 'chart']) assert.match(body, new RegExp(`\\b${name}: \\{`));
  const uses: Record<string, string[]> = {
    timeline: ['mobile/src/app/(tabs)/timeline.tsx', 'mobile/src/components/SignalRibbon.tsx', 'mobile/src/components/VehicleToday.tsx'],
    readings: ['mobile/src/components/ReadingBlocks.tsx', 'mobile/src/components/readings/NameColumns.tsx'],
    practice: ['mobile/src/components/practice/SevenDay.tsx', 'mobile/src/components/practice/DecideFlow.tsx'],
    chart: ['mobile/src/components/ChartPanels.tsx', 'mobile/src/app/(tabs)/chart.tsx'],
  };
  for (const [name, files] of Object.entries(uses)) for (const f of files) assert.match(read(f), new RegExp(`const T = themes\\.${name};`), f);
});

test('Screen provides the room palette to shared components', () => {
  assert.match(read('mobile/src/components/Screen.tsx'), /RoomThemeContext\.Provider value=\{themes\[ROOM_THEME\[room\]\]\}/);
  assert.match(read('mobile/src/components/Segmented.tsx'), /useRoomTheme\(\)/);
  assert.match(read('mobile/src/theme/RoomTheme.tsx'), /readingStoplight: 'readings'/);
});
