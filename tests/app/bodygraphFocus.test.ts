import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildBodygraphScene, FOCUS_DIM } from '../../mobile/src/charts/bodygraph';
import { centerFocusInfo, focusSentence } from '../../mobile/src/lib/bodygraphFocus';
import type { BodygraphData } from '../../mobile/src/charts/chartTypes';

const hd: BodygraphData = {
  type: 'Generator', authority: 'Sacral', profile: '4/1', strategy: 'Respond', notSelf: 'Frustration', incarnationCross: 'x',
  definedCenters: ['sacral', 'throat', 'g_center'],
  undefinedCenters: ['head', 'ajna', 'heart', 'spleen', 'solar_plexus', 'root'],
  channels: [
    { gates: [34, 20], name: 'Charisma', fromCenter: 'sacral', toCenter: 'throat', activatedBy: 'personality' },
    { gates: [10, 20], name: 'Awakening', fromCenter: 'g_center', toCenter: 'throat', activatedBy: 'design' },
  ],
  gates: [
    { gate: 34, line: 1, epoch: 'personality', planet: 'sun', center: 'sacral' },
    { gate: 20, line: 2, epoch: 'personality', planet: 'moon', center: 'throat' },
    { gate: 10, line: 3, epoch: 'design', planet: 'sun', center: 'g_center' },
    { gate: 14, line: 1, epoch: 'design', planet: 'mars', center: 'sacral' },
  ],
};

test('a center reports its channels and the center on the other end', () => {
  const f = centerFocusInfo(hd, 'throat');
  assert.equal(f.defined, true);
  assert.deepEqual(f.channels.map((c) => c.other).sort(), ['g_center', 'sacral']);
});

test('a gate without a partner is reported as hanging', () => {
  const f = centerFocusInfo(hd, 'sacral');
  assert.deepEqual(f.hanging, [14]);
  assert.match(focusSentence(f), /Gate 14 is active here without a partner/);
});

test('an open center says it is open and has no channels', () => {
  const f = centerFocusInfo(hd, 'root');
  assert.equal(f.defined, false);
  assert.equal(f.channels.length, 0);
  assert.match(focusSentence(f), /Root is open/);
});

test('with a focus, channels that do not touch the center fade and the center is outlined', () => {
  const plain = buildBodygraphScene(hd);
  const focused = buildBodygraphScene(hd, 'sacral');
  const faded = (sc: ReturnType<typeof buildBodygraphScene>) => sc.prims.filter((p) => 'op' in p && p.op === FOCUS_DIM).length;
  assert.equal(faded(plain), 0);
  assert.equal(faded(focused), 1); // only the G Center to Throat channel does not touch the Sacral
  assert.equal(focused.prims.filter((p) => p.k === 'path' && p.stroke === '#D4AF37' && p.w === 3.4).length, 1);
});

test('the scene offers one tap target per center', () => {
  assert.equal(buildBodygraphScene(hd).hotspots?.length, 9);
});

import { nextFocus } from '../../mobile/src/lib/bodygraphFocus';

test('the pinned mini bodygraph follows the last center opened and clears when it closes', () => {
  assert.equal(nextFocus(null, 'sacral', true), 'sacral');
  assert.equal(nextFocus('sacral', 'root', true), 'root');
  assert.equal(nextFocus('root', 'root', false), null);
  assert.equal(nextFocus('root', 'sacral', false), 'root');
});
