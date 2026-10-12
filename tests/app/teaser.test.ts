import test from 'node:test';
import assert from 'node:assert/strict';
import { teaser, yearRangeLabel } from '../../mobile/src/lib/teaser';

test('short text is left alone', () => {
  assert.equal(teaser('Quiet and steady.'), 'Quiet and steady.');
});

test('long text is cut at a word, never in the middle of one', () => {
  const out = teaser('Whether you are skipping steps or moving too fast, this practice slows you down so that your own signal can speak first.', 60);
  assert.ok(out.endsWith('…'));
  const words = out.slice(0, -1).split(' ');
  for (const w of words) assert.ok(['Whether', 'you', 'are', 'skipping', 'steps', 'or', 'moving', 'too', 'fast', 'this', 'practice', 'slows', 'down'].includes(w.replace(/,$/, '')), w);
});

test('a trailing comma or dash is dropped before the ellipsis', () => {
  const out = teaser('alpha beta gamma, delta epsilon zeta eta theta', 17);
  assert.equal(out, 'alpha beta gamma…');
});

test('a year-long range shows its years', () => {
  const f = (d: Date, y: boolean) => `${d.getMonth() + 1}/${d.getDate()}${y ? `/${d.getFullYear()}` : ''}`;
  assert.equal(yearRangeLabel('2026-09-30', '2027-09-29', f), '9/30/2026 to 9/29/2027');
  assert.equal(yearRangeLabel('2026-10-01', '2026-10-20', f), '10/1 to 10/20');
});
