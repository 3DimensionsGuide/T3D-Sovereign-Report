import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DRAWN_TERM_IDS, termDrawing } from '../../mobile/src/charts/termDrawings';
import { listEntries } from '../../src/lib/app/glossary';

test('21 concept terms have a drawing and each is a real glossary term', () => {
  assert.equal(DRAWN_TERM_IDS.length, 21);
  const ids = new Set(listEntries().map((e) => e.id));
  for (const id of DRAWN_TERM_IDS) assert.ok(ids.has(id), `${id} is not a glossary term`);
});

test('every drawing has words, a spoken label, and stays inside its frame', () => {
  for (const id of DRAWN_TERM_IDS) {
    const d = termDrawing(id)!;
    assert.ok(d.label.length > 30, `${id} needs a spoken description`);
    assert.ok(d.scene.prims.some((p) => p.k === 'text'), `${id} must carry words, not colour alone`);
    for (const p of d.scene.prims) {
      const pts: Array<[number, number]> =
        p.k === 'line' ? [[p.x1, p.y1], [p.x2, p.y2]] : p.k === 'circle' ? [[p.cx - p.r, p.cy - p.r], [p.cx + p.r, p.cy + p.r]] : p.k === 'text' ? [[p.x, p.y]] : [];
      for (const [x, y] of pts) {
        assert.ok(x >= -1 && x <= d.scene.w + 1 && y >= -1 && y <= d.scene.h + 1, `${id}: a mark sits outside the frame (${x}, ${y})`);
      }
    }
  }
});

test('text in each drawing stays inside the frame and does not run off the sides', () => {
  for (const id of DRAWN_TERM_IDS) {
    const d = termDrawing(id)!;
    for (const p of d.scene.prims) {
      if (p.k !== 'text') continue;
      const w = p.s.length * p.size * 0.52;
      const left = p.anchor === 'start' ? p.x : p.anchor === 'end' ? p.x - w : p.x - w / 2;
      assert.ok(left >= -2 && left + w <= d.scene.w + 2, `${id}: "${p.s}" runs off the edge`);
    }
  }
});

test('terms without a drawing return null', () => {
  assert.equal(termDrawing('astro:planet:sun'), null);
  assert.equal(termDrawing('hd:gate:1'), null);
});
