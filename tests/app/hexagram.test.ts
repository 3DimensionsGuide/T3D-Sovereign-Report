import test from 'node:test';
import assert from 'node:assert/strict';
import { hexagramLines, hexagramSpoken } from '../../mobile/src/lib/hexagram';

const all = Array.from({ length: 64 }, (_, i) => hexagramLines(i + 1)!);
const key = (l: boolean[]) => l.map((x) => (x ? '1' : '0')).join('');

test('every gate from 1 to 64 has six lines and no two look alike', () => {
  for (const l of all) assert.equal(l.length, 6);
  assert.equal(new Set(all.map(key)).size, 64);
});

test('the first and last pairs in King Wen order are the known ones', () => {
  assert.equal(key(all[0]), '111111');   // 1 The Creative
  assert.equal(key(all[1]), '000000');   // 2 The Receptive
  assert.equal(key(all[10]), '111000');  // 11 Peace: earth above heaven
  assert.equal(key(all[11]), '000111');  // 12 Standstill
  assert.equal(key(all[62]), '101010');  // 63 After Completion
  assert.equal(key(all[63]), '010101');  // 64 Before Completion
});

test('King Wen pairs are each the reverse or the inverse of one another', () => {
  for (let n = 0; n < 64; n += 2) {
    const a = all[n];
    const b = all[n + 1];
    const reversed = [...a].reverse();
    const inverted = a.map((x) => !x);
    const ok = key(b) === key(reversed) || key(b) === key(inverted);
    assert.ok(ok, `gate ${n + 1} and ${n + 2} are not a King Wen pair`);
  }
});

test('anything that is not a gate gives nothing', () => {
  assert.equal(hexagramLines(0), null);
  assert.equal(hexagramLines(65), null);
  assert.equal(hexagramLines(1.5), null);
  assert.equal(hexagramSpoken(99), '');
  assert.match(hexagramSpoken(1), /six|solid/);
});
