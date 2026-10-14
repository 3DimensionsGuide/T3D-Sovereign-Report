import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync('mobile/src/app/(tabs)/timeline.tsx', 'utf8');

test('Timeline Personal Day rows open that day\'s reading, and later days stay behind Premium', () => {
  assert.match(src, /setOpenPersonal/);
  assert.match(src, /<RoadToday day=\{rd\}/);
  assert.match(src, /d\.date !== localKey\(new Date\(\)\) && !premium/);
});
