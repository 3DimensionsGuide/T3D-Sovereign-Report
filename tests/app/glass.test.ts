import test from 'node:test';
import assert from 'node:assert/strict';
import { GLASS_ALPHA, GLASS_BASE, GLASS_RAISED_ALPHA, blend, contrastRatio, glassFill, type Rgb } from '../../mobile/src/lib/glass';

const PARCHMENT: Rgb = { r: 245, g: 245, b: 243 };
// Secondary text is parchment at 72% opacity, so it is blended over the glass too.
const muted = (glass: Rgb): Rgb => blend(PARCHMENT, 0.72, glass);

// What can sit behind a card: black sky, the bronze pool, and the brightest daytime sun glow.
const BEHIND: Record<string, Rgb> = {
  obsidian: { r: 11, g: 11, b: 12 },
  bronze: { r: 90, g: 70, b: 25 },
  sun: { r: 150, g: 115, b: 40 },
};

test('the glass is see-through but mostly solid', () => {
  assert.ok(GLASS_ALPHA < 1 && GLASS_ALPHA >= 0.8);
  assert.ok(GLASS_RAISED_ALPHA > GLASS_ALPHA && GLASS_RAISED_ALPHA < 1);
  assert.equal(glassFill(), 'rgba(23,22,26,0.86)');
});

for (const [name, behind] of Object.entries(BEHIND)) {
  test(`primary text stays AAA (7:1) on glass over ${name}`, () => {
    const seen = blend(GLASS_BASE, GLASS_ALPHA, behind);
    assert.ok(contrastRatio(PARCHMENT, seen) >= 7, `ratio ${contrastRatio(PARCHMENT, seen).toFixed(2)}`);
  });
  test(`secondary text stays AAA (7:1) on glass over ${name}`, () => {
    const seen = blend(GLASS_BASE, GLASS_ALPHA, behind);
    const r = contrastRatio(muted(seen), seen);
    assert.ok(r >= 7, `ratio ${r.toFixed(2)}`);
  });
}
