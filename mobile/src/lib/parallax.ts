/**
 * Depth by scrolling: the light and line art behind a screen drift up more slowly than the content,
 * so the page feels layered. Plain arithmetic, so it can be tested without a phone.
 */
export const PARALLAX = { glow: 0.12, art: 0.28 } as const;

/** How far to lift a background layer, in points, for a scroll position. Never moves when pulled down past the top. */
export function parallaxShift(scrollY: number, factor: number, limit = 220): number {
  if (!Number.isFinite(scrollY) || scrollY <= 0) return 0;
  return -Math.min(scrollY, limit) * factor;
}
