import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHANNEL_READINGS, channelKey } from '../../src/lib/app/channelReadings';

test('channelKey sorts the two gates ascending', () => {
  assert.equal(channelKey(57, 34), '34-57');
  assert.equal(channelKey(1, 8), '1-8');
});

test('every one of the 36 channels has a theme, a shadow and guidance', () => {
  const ALL = '1-8 2-14 3-60 4-63 5-15 6-59 7-31 9-52 10-20 10-34 10-57 11-56 12-22 13-33 16-48 17-62 18-58 19-49 20-34 20-57 21-45 23-43 24-61 25-51 26-44 27-50 28-38 29-46 30-41 32-54 34-57 35-36 37-40 39-55 42-53 47-64'.split(' ');
  assert.equal(ALL.length, 36);
  for (const k of ALL) {
    const r = CHANNEL_READINGS[k];
    assert.ok(r, `channel ${k} missing`);
    assert.ok(r.theme.length > 30 && r.shadow.length > 30 && r.guidance.length > 30, `${k} too thin`);
  }
  assert.equal(Object.keys(CHANNEL_READINGS).length, 36);
});

test('the server builds Moon channels per day and the app shows them', () => {
  const gt = readFileSync('src/lib/app/gateToday.ts', 'utf8');
  assert.match(gt, /export function buildMoonChannels/);
  assert.match(gt, /kind !== 'electromagnetic'/);
  assert.match(readFileSync('src/server/engines/timeline.ts', 'utf8'), /moon: g\.moon/);
  const vt = readFileSync('mobile/src/components/VehicleToday.tsx', 'utf8');
  assert.match(vt, /MoonBlock/);
  assert.match(vt, /completes your channel/);
  assert.match(readFileSync('mobile/src/lib/gateDay.ts', 'utf8'), /moon: day\.moon \?\? \[\]/);
});
