import test from 'node:test';
import assert from 'node:assert/strict';
import { foldFocus } from '../../mobile/src/lib/meetTriad';

const start = '2026-10-10';

test('flags the fold that matches today\'s stop of the first week', () => {
  assert.equal(foldFocus('vehicle', start, '2026-10-10', [], false), 1);
  assert.equal(foldFocus('road', start, '2026-10-10', [], false), null);
  assert.equal(foldFocus('road', start, '2026-10-11', [], false), 2);
  assert.equal(foldFocus('stoplight', start, '2026-10-12', [], false), 3);
});

test('no flag once the stop is done, before the week starts, or after it ends', () => {
  assert.equal(foldFocus('vehicle', start, '2026-10-10', [1], false), null);
  assert.equal(foldFocus('vehicle', null, '2026-10-10', [], false), null);
  assert.equal(foldFocus('vehicle', start, '2026-10-17', [], true), null);
});

test('Premium stops are flagged only for Premium, and days 5 to 7 are never flagged on Today', () => {
  assert.equal(foldFocus('stoplight', start, '2026-10-13', [], false), null);
  assert.equal(foldFocus('stoplight', start, '2026-10-13', [], true), 4);
  for (const d of ['2026-10-14', '2026-10-15', '2026-10-16']) {
    for (const lens of ['vehicle', 'road', 'stoplight'] as const) assert.equal(foldFocus(lens, start, d, [], true), null);
  }
});
