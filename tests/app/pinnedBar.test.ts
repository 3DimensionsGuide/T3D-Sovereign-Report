import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextOpenCard, pinnedLine, roadPin, wheelPin } from '../../mobile/src/lib/pinnedBar';
import type { RoadStripModel } from '../../mobile/src/lib/roadStrip';

const model = (currentIdx: number | null): RoadStripModel => ({
  segments: [4, 7, 2, 9].map((number, index) => ({
    index, number, challenge: 1, startAge: index * 9, endAge: index === 3 ? null : index * 9 + 9, widthPct: 25,
    current: index === currentIdx, past: currentIdx !== null && index < currentIdx,
  })),
  markerPct: 30, sentence: 's', match: null, spokenSummary: 's',
});

test('the bar shows the opened card, otherwise the summary', () => {
  assert.equal(pinnedLine('Soul Urge', 'x'), 'Reading: Soul Urge');
  assert.equal(pinnedLine(null, 'Rising Leo'), 'Rising Leo');
});

test('the last card opened wins, and closing another one changes nothing', () => {
  let cur: string | null = null;
  cur = nextOpenCard(cur, 'Birthday Number', true);
  cur = nextOpenCard(cur, 'Soul Urge', true);
  assert.equal(cur, 'Soul Urge');
  assert.equal(nextOpenCard(cur, 'Birthday Number', false), 'Soul Urge');
  assert.equal(nextOpenCard(cur, 'Soul Urge', false), null);
});

test('Road bar names the Life Path and the Pinnacle you are in', () => {
  assert.deepEqual(roadPin('7', model(1)), { title: 'Life Path 7', summary: 'Pinnacle 2 of 4 is a 7' });
  assert.equal(roadPin('11/2', model(null)).summary, '4 Pinnacles along your life');
  assert.equal(roadPin(null, null).title, 'Your Road');
});

test('Stoplight bar names Sun and Moon, and says Rising needs a birth time when there is none', () => {
  assert.deepEqual(wheelPin('Leo', 'Pisces', 'Virgo'), { title: 'Sun Leo · Moon Pisces', summary: 'Rising Virgo' });
  assert.equal(wheelPin('Leo', 'Pisces', null).summary, 'Rising needs a birth time');
});

test('cards that start open only fill an empty bar, first one wins', () => {
  let cur: string | null = null;
  cur = nextOpenCard(cur, 'Life Path', true, true);
  cur = nextOpenCard(cur, 'Third Pinnacle', true, true);
  assert.equal(cur, 'Life Path');
  assert.equal(nextOpenCard(cur, 'Soul Urge', true), 'Soul Urge');
});
