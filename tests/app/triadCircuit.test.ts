import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CORE, CORE_RING, CORNERS, EDGES, SPOKES, backOf, dist, mixHex, pulseOffset, stagger, wrap01,
} from '../../mobile/src/lib/triadCircuit';

test('three edges join the corners in a loop', () => {
  assert.equal(EDGES.length, 3);
  EDGES.forEach((e, i) => {
    assert.deepEqual(e.from, CORNERS[i]);
    assert.deepEqual(e.to, CORNERS[(i + 1) % 3]);
    assert.ok(Math.abs(e.length - dist(e.from, e.to)) < 1e-9);
  });
});

test('the core and its ring sit inside the triangle, clear of every edge', () => {
  // The bottom edge is a horizontal line at the Road and Stoplight corners' height.
  assert.ok(CORE.y + CORE_RING < CORNERS[1].y - 1.5);
  // Distance from the core to each slanted edge must exceed the ring radius.
  for (const e of EDGES) {
    const { from: a, to: b } = e;
    const d = Math.abs((b.y - a.y) * CORE.x - (b.x - a.x) * CORE.y + b.x * a.y - b.y * a.x) / e.length;
    assert.ok(d > CORE_RING + 1.5, `edge clearance ${d.toFixed(1)}`);
  }
});

test('each spoke runs from the core ring toward its corner without touching either', () => {
  SPOKES.forEach((s, i) => {
    assert.ok(dist(CORE, s.from) > CORE_RING);
    assert.ok(dist(s.to, CORNERS[i]) > 6);
    assert.ok(s.length > 5);
  });
});

test('the back face sits behind and below the front', () => {
  const b = backOf(CORNERS[0]);
  assert.ok(b.x > CORNERS[0].x && b.y > CORNERS[0].y);
});

test('a pulse enters at the start of a line and leaves past its end', () => {
  assert.equal(pulseOffset(0, 50, 9), 9);
  assert.equal(pulseOffset(1, 50, 9), -50);
});

test('power-on steps light in order and all finish', () => {
  assert.equal(stagger(0, 0, 3), 0);
  assert.equal(stagger(1, 2, 3), 1);
  assert.ok(stagger(0.4, 0, 3) > stagger(0.4, 1, 3));
  assert.ok(stagger(0.4, 1, 3) >= stagger(0.4, 2, 3));
  for (const i of [0, 1, 2]) assert.equal(stagger(1, i, 3), 1);
});

test('wrap01 loops back to the start', () => {
  assert.ok(Math.abs(wrap01(1.25) - 0.25) < 1e-9);
  assert.equal(wrap01(0), 0);
});

test('mixHex blends two colours', () => {
  assert.equal(mixHex('#000000', '#ffffff', 0.5), '#808080');
  assert.equal(mixHex('#E5A93C', '#ffffff', 0), '#e5a93c');
});

import { readFileSync } from 'node:fs';
const src = (p: string) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');

test('only My Chart draws the live circuit; share images and Meet the Triad keep the still drawing', () => {
  assert.match(src('mobile/src/app/(tabs)/chart.tsx'), /<TriadPortrait chart=\{chart\} onOpenLens=\{openLens\} live \/>/);
  assert.ok(!/ live\b/.test(src('mobile/src/components/StoryShareCard.tsx').match(/<TriadPortrait[^>]*>/)![0]));
  assert.ok(!/ live\b/.test(src('mobile/src/app/meet-triad.tsx').match(/<TriadPortrait[^>]*>/)![0]));
});

test('the circuit is decorative, honours Reduce Motion, and the core stays a labelled button', () => {
  const c = src('mobile/src/components/TriadCircuit.tsx');
  assert.match(c, /accessibilityElementsHidden/);
  assert.match(c, /pointerEvents="none"/);
  assert.match(c, /const animate = !reduce/);
  assert.match(src('mobile/src/components/TriadPortrait.tsx'), /accessibilityLabel="T3D\. Tap to send a pulse through the circuit"/);
});
