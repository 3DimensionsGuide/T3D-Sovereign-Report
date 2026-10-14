/**
 * Glass surfaces: a card that is slightly see-through, so the stars and the sun glow behind it
 * show faintly, while the text on it stays as readable as on a solid card.
 *
 * Pure numbers and maths only (no React), so the readability rule can be tested.
 */

export interface Rgb { r: number; g: number; b: number }

/** The graphite card colour, as numbers. */
export const GLASS_BASE: Rgb = { r: 23, g: 22, b: 26 };

/** How solid the fill is. Low enough that the sky shows, high enough to keep text AAA. */
export const GLASS_ALPHA = 0.86;

/** The raised variant (a card sitting on a card) is a touch more solid. */
export const GLASS_RAISED_ALPHA = 0.92;

/** The soft light along the top of the glass: how much of the card's height it covers. */
export const GLASS_SHEEN_HEIGHT = 0.55;

export function glassFill(raised = false): string {
  const a = raised ? GLASS_RAISED_ALPHA : GLASS_ALPHA;
  return `rgba(${GLASS_BASE.r},${GLASS_BASE.g},${GLASS_BASE.b},${a})`;
}

/** The colour you actually see: the fill laid over whatever is behind it. */
export function blend(fg: Rgb, alpha: number, bg: Rgb): Rgb {
  return {
    r: Math.round(fg.r * alpha + bg.r * (1 - alpha)),
    g: Math.round(fg.g * alpha + bg.g * (1 - alpha)),
    b: Math.round(fg.b * alpha + bg.b * (1 - alpha)),
  };
}

function channel(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance(c: Rgb): number {
  return 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b);
}

/** WCAG contrast ratio between two opaque colours. */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
