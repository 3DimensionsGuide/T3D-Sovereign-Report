import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { roadDayFor } from '../../mobile/src/lib/roadDay';

const m = (n: number) => ({ number: n, root: null, label: `L${n}`, theme: 't', keyThemes: ['a'], leanIn: 'l', watchFor: 'w' });
const data = {
  personal: [
    { date: '2026-10-13', year: 1, month: 1, day: 4 },
    { date: '2026-10-14', year: 1, month: 1, day: 5 },
  ],
  dayMeanings: { 4: m(4), 5: m(5) },
};

test('roadDayFor follows the chosen day', () => {
  assert.equal(roadDayFor(data, 0)?.meaning.number, 4);
  assert.equal(roadDayFor(data, 1)?.meaning.number, 5);
  assert.equal(roadDayFor(data, 1)?.date, '2026-10-14');
});

test('roadDayFor returns null for a missing day or missing meanings', () => {
  assert.equal(roadDayFor(data, 9), null);
  assert.equal(roadDayFor({ personal: data.personal }, 0), null);
});

test('Timeline Road lens shows RoadToday, future days gated', () => {
  const src = readFileSync('mobile/src/app/(tabs)/timeline.tsx', 'utf8');
  assert.match(src, /selectedDay > 0 && !premium/);
  assert.match(src, /roadDayFor\(data, selectedDay\)/);
  assert.match(src, /<RoadToday day=\{rd\}/);
});

test('server returns a reading for every Personal Day number', () => {
  const src = readFileSync('src/server/engines/timeline.ts', 'utf8');
  assert.match(src, /dayMeanings: DAY_MEANINGS/);
  for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]) assert.ok(src.includes(String(n)));
});
