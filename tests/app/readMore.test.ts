import test from 'node:test';
import assert from 'node:assert/strict';
import { readMoreSplit } from '../../mobile/src/lib/readMore';
import { houseLabel } from '../../mobile/src/lib/houseNames';

const LONG =
  'Uranus, Neptune, and Pluto move so slowly that their sign is shared by your whole generation. What is personal is the house. Uranus is disruption. Neptune is dissolution. Pluto is transformation and power, the place you face the deepest change.';

test('a short note is left whole', () => {
  assert.deepEqual(readMoreSplit('One short sentence.'), { short: 'One short sentence.', rest: null });
});

test('a long note is cut at a sentence end and nothing is lost', () => {
  const r = readMoreSplit(LONG, 120);
  assert.ok(r.rest);
  assert.match(r.short, /[.!?]$/);
  assert.equal(`${r.short} ${r.rest}`, LONG);
});

test('the opening always has at least one whole sentence, even a long one', () => {
  const one = 'A'.repeat(300) + '. Then a second sentence that is short.';
  const r = readMoreSplit(one, 100);
  assert.equal(r.short, 'A'.repeat(300) + '.');
  assert.equal(r.rest, 'Then a second sentence that is short.');
});

test('houseLabel names the arena and the number, or says nothing with no house', () => {
  assert.equal(houseLabel(2), 'Resources & Values (house 2)');
  assert.equal(houseLabel(null), null);
  assert.equal(houseLabel(40), 'house 40');
});
