/**
 * The lit part of the Moon as an SVG path, drawn from the real illumination and whether it is waxing.
 * Pure arithmetic with no imports, so tests can use it directly.
 *
 * Seen from the northern hemisphere a waxing Moon is lit on the right and a waning Moon on the left.
 * The edge of the lit part (the terminator) is half an ellipse whose width shrinks to nothing at the
 * quarters and grows to the full radius at new and full.
 */
export type MoonShape =
  | { kind: 'none' }
  | { kind: 'full' }
  | { kind: 'path'; d: string };

export function moonShape(illuminationPercent: number, waxing: boolean, r = 20, cx = 24, cy = 24): MoonShape {
  const f = Math.min(1, Math.max(0, illuminationPercent / 100));
  if (f < 0.02) return { kind: 'none' };
  if (f > 0.98) return { kind: 'full' };
  const rx = Math.abs(1 - 2 * f) * r;
  const crescent = f < 0.5;
  const top = `${cx} ${cy - r}`;
  const bottom = `${cx} ${cy + r}`;
  // Limb: top to bottom down the lit side. Terminator: bottom back to top.
  const limbSweep = waxing ? 1 : 0;
  const terminatorSweep = waxing ? (crescent ? 0 : 1) : crescent ? 1 : 0;
  const round = (n: number) => Math.round(n * 100) / 100;
  const d = `M ${top} A ${r} ${r} 0 0 ${limbSweep} ${bottom} A ${round(rx)} ${r} 0 0 ${terminatorSweep} ${top} Z`;
  return { kind: 'path', d };
}
