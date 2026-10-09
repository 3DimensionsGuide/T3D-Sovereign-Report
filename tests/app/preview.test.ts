import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBirthPreview } from '../../src/lib/app/preview';

test('every Life Path and sign produces a preview with real text', () => {
  for (const lp of [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]) {
    for (let sign = 0; sign < 12; sign++) {
      const p = buildBirthPreview(lp, sign * 30 + 15);
      assert.ok(p, `${lp}/${sign}`);
      assert.ok(p!.lifePath.plain.length > 20 && p!.sun.orientation.length > 20, `${lp}/${sign}`);
      assert.ok(!/undefined|null/.test(JSON.stringify(p)), `${lp}/${sign}`);
    }
  }
});

test('the Sun sign follows the longitude', () => {
  assert.equal(buildBirthPreview(1, 5)!.sun.sign, 'Aries');
  assert.equal(buildBirthPreview(1, 125)!.sun.sign, 'Leo');
  assert.equal(buildBirthPreview(1, 359)!.sun.sign, 'Pisces');
  assert.equal(buildBirthPreview(1, -10)!.sun.sign, 'Pisces');
});

test('days next to a sign change are flagged as a cusp', () => {
  assert.equal(buildBirthPreview(1, 30.4)!.sun.cusp, true);
  assert.equal(buildBirthPreview(1, 59.5)!.sun.cusp, true);
  assert.equal(buildBirthPreview(1, 45)!.sun.cusp, false);
});

test('unknown Life Path numbers give no preview rather than broken text', () => {
  assert.equal(buildBirthPreview(99, 10), null);
});

test('it lists what the full chart adds', () => {
  const p = buildBirthPreview(3, 100)!;
  assert.ok(p.locked.length >= 4);
});
