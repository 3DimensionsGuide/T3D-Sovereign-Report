import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isTimingLocked } from '../../mobile/src/lib/premiumGates';

const now = new Date(2026, 9, 13, 9, 0);

test('free users can see today, and only today', () => {
  assert.equal(isTimingLocked(new Date(2026, 9, 13, 23, 59), false, now), false);
  assert.equal(isTimingLocked(new Date(2026, 9, 12, 12), false, now), true);
  assert.equal(isTimingLocked(new Date(2026, 9, 14, 12), false, now), true);
});

test('Premium users can go to any day', () => {
  assert.equal(isTimingLocked(new Date(2026, 9, 12, 12), true, now), false);
  assert.equal(isTimingLocked(new Date(2027, 0, 1, 12), true, now), false);
});

test('Practice, Year ahead and Today use the gate with the Premium flag', () => {
  const read = (p: string) => readFileSync(`mobile/src/${p}`, 'utf8');
  for (const f of ['app/(tabs)/practice.tsx', 'app/year.tsx', 'app/(tabs)/today.tsx']) {
    const s = read(f);
    assert.match(s, /usePremium\(\)/, f);
    assert.match(s, /<PremiumGate/, f);
  }
  assert.match(read('app/(tabs)/today.tsx'), /isTimingLocked\(date, premium\)/);
  assert.match(read('app/(tabs)/practice.tsx'), /premium && mode !== 'together'/);
});

test('Lunar Nodes and natal aspects sit behind the Premium flag', () => {
  const s = readFileSync('mobile/src/components/readings/StoplightReading.tsx', 'utf8');
  assert.match(s, /premium \? <NodesSection/);
  assert.match(s, /premium \? <AspectsSection/);
  assert.match(s, /<PremiumGate title="Your Lunar Nodes"/);
});
