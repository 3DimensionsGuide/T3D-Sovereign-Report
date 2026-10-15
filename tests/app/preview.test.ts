import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBirthPreview } from '../../src/lib/app/preview';

test('every Life Path and sign produces a preview with real text', () => {
  for (const lp of [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]) {
    for (let sign = 0; sign < 12; sign++) {
      const p = buildBirthPreview(lp, sign * 30 + 15, { gate: 1 + sign, nearEdge: false });
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

test('the Vehicle card shows the Sun gate from the date alone', () => {
  const p = buildBirthPreview(3, 100, { gate: 32, nearEdge: false })!;
  assert.equal(p.vehicle!.gate, 32);
  assert.equal(p.vehicle!.name, 'Duration');
  assert.equal(p.vehicle!.center, 'Spleen Center');
  assert.ok(p.vehicle!.meaning.length > 20);
  assert.equal(p.vehicle!.cusp, false);
  assert.equal(buildBirthPreview(3, 100, { gate: 32, nearEdge: true })!.vehicle!.cusp, true);
});

test('every one of the 64 gates has real text for the Vehicle card', () => {
  for (let g = 1; g <= 64; g++) {
    const v = buildBirthPreview(1, 10, { gate: g, nearEdge: false })!.vehicle;
    assert.ok(v && v.name.length > 1 && v.meaning.length > 20 && /Center$/.test(v.center), `gate ${g}`);
  }
});

test('without a gate the card falls back to the list of what the full chart adds', () => {
  assert.equal(buildBirthPreview(3, 100)!.vehicle, null);
});

test('a gate boundary is detected from the longitude', async () => {
  const { isNearGateEdge, longitudeToGate } = await import('../../src/server/engines/human_design');
  assert.equal(isNearGateEdge(302.3), true);
  assert.equal(isNearGateEdge(302 + 2.8), false);
  assert.equal(longitudeToGate(302.3).gate, 41);
});
