import test from 'node:test';
import assert from 'node:assert/strict';
import { centerPoints } from '../../mobile/src/lib/centerShape';

const IDS = ['head', 'ajna', 'throat', 'g_center', 'heart', 'sacral', 'spleen', 'solar_plexus', 'root'];

test('every Center has its own shape', () => {
  const shapes = IDS.map((id) => centerPoints(id));
  assert.ok(shapes.every((s) => typeof s === 'string'));
  assert.equal(new Set(shapes).size, 9);
});

test('triangles have three points, the G diamond and the squares have four', () => {
  const count = (id: string) => (centerPoints(id) ?? '').split(' ').length;
  for (const id of ['head', 'ajna', 'heart', 'spleen', 'solar_plexus']) assert.equal(count(id), 3, id);
  for (const id of ['throat', 'g_center', 'sacral', 'root']) assert.equal(count(id), 4, id);
});

test('every point stays inside the box', () => {
  for (const id of IDS) {
    for (const pair of (centerPoints(id, 24, 2) ?? '').split(' ')) {
      const [x, y] = pair.split(',').map(Number) as [number, number];
      assert.ok(x >= 2 && x <= 22 && y >= 2 && y <= 22, `${id} ${pair}`);
    }
  }
});

test('an unknown id gives nothing', () => {
  assert.equal(centerPoints('nope'), null);
});

import { bodyMap } from '../../mobile/src/lib/centerShape';

test('the body map has all nine Centers with exactly one active, drawn last', () => {
  const map = bodyMap('throat');
  assert.equal(map.length, 9);
  assert.equal(map.filter((s) => s.active).length, 1);
  assert.equal(map[8]?.id, 'throat');
});

test('Throat, Sacral and Root look different on the body map because they sit in different places', () => {
  const pts = (id: string) => bodyMap(id).find((s) => s.id === id)?.points;
  assert.equal(new Set([pts('throat'), pts('sacral'), pts('root')]).size, 3);
});

test('every body map point stays inside the box', () => {
  for (const s of bodyMap('head', 30, 46, 1.5)) {
    for (const pair of s.points.split(' ')) {
      const [x, y] = pair.split(',').map(Number) as [number, number];
      assert.ok(x >= 1.5 - 0.01 && x <= 28.5 + 0.01 && y >= 1.5 - 0.01 && y <= 44.5 + 0.01, `${s.id} ${pair}`);
    }
  }
});
