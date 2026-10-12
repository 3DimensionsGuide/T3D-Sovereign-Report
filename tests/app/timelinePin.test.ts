import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JUMP_AFTER, PIN_TAIL, pinnedMonthAt, showJumpToday, type PinSection } from '../../mobile/src/lib/timelinePin';

const sections: PinSection[] = [
  { key: '2026-10', top: 800, headHeight: 56, bottom: 1800 },
  { key: '2026-11', top: 1900, headHeight: 56, bottom: 3200 },
];

test('no month is pinned while its own header is still on screen', () => {
  assert.equal(pinnedMonthAt(sections, 0), null);
  assert.equal(pinnedMonthAt(sections, 820), null);
});

test('a month pins once its header has scrolled away and its days are still showing', () => {
  assert.equal(pinnedMonthAt(sections, 900), '2026-10');
  assert.equal(pinnedMonthAt(sections, 1700), '2026-10');
  assert.equal(pinnedMonthAt(sections, 2500), '2026-11');
});

test('the bar steps aside near the end of a block so the next header can be seen', () => {
  assert.equal(pinnedMonthAt(sections, 1800 - PIN_TAIL), null);
  assert.equal(pinnedMonthAt(sections, 1850), null);
});

test('jump to today shows only once the list start is well behind', () => {
  assert.equal(showJumpToday(900, 800), false);
  assert.equal(showJumpToday(800 + JUMP_AFTER + 1, 800), true);
  assert.equal(showJumpToday(5000, null), false);
});
