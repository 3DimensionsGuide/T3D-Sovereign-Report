import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (p: string) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');

test('the portrait corners are buttons that open their reading and say so', () => {
  const portrait = read('mobile/src/components/TriadPortrait.tsx');
  assert.equal((portrait.match(/<Pressable \{\.\.\.open\(/g) ?? []).length, 3);
  assert.match(portrait, /Opens your \$\{LENS_LABEL\[lens\]\} reading/);
  assert.match(portrait, /minHeight: 48/);
});

test('My Chart opens the chosen lens on Readings, and Readings listens for it', () => {
  const chart = read('mobile/src/app/(tabs)/chart.tsx');
  assert.match(chart, /pathname: '\/readings', params: \{ lens, t: String\(Date\.now\(\)\) \}/);
  const readings = read('mobile/src/app/(tabs)/readings.tsx');
  assert.match(readings, /useLocalSearchParams<\{ lens\?: string; t\?: string \}>/);
  assert.match(readings, /requestedLens === 'vehicle' \|\| requestedLens === 'road' \|\| requestedLens === 'stoplight'/);
});

test('each lens card keeps its headline facts and puts the rest behind a tap', () => {
  const chart = read('mobile/src/app/(tabs)/chart.tsx');
  assert.equal((chart.match(/<TriadCard/g) ?? []).length, 3);
  assert.match(chart, /moreLabel="More numbers"/);
  assert.match(chart, /moreLabel="Sidereal lens"/);
  const card = read('mobile/src/components/TriadCard.tsx');
  assert.match(card, /accessibilityState=\{\{ expanded: more \}\}/);
});

test('birth details, the reminder and Edit sit together in one More section', () => {
  const chart = read('mobile/src/app/(tabs)/chart.tsx');
  const start = chart.indexOf('<Disclosure label="Birth details, reminder and settings">');
  assert.ok(start > 0);
  const block = chart.slice(start, chart.indexOf('</Disclosure>', start));
  for (const piece of ['<BirthDataCard', '<ReminderCard', 'Edit birth details']) assert.ok(block.includes(piece), piece);
});

test('the page says once which zodiac leads', () => {
  const chart = read('mobile/src/app/(tabs)/chart.tsx');
  assert.match(chart, /Tropical leads here/);
});
