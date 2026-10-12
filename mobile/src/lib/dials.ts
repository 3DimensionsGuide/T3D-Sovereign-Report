/**
 * The nine-tick dial for Personal Year, Month and Day. Master numbers sit on their foundation tick
 * (11 on 2, 22 on 4, 33 on 6), the same rule the Road strip uses. Pure arithmetic, no imports.
 */
export const DIAL_TICKS = 9;
const DEGREES_PER_TICK = 360 / DIAL_TICKS;

export function dialBase(n: number): number {
  const base = n === 11 ? 2 : n === 22 ? 4 : n === 33 ? 6 : n;
  return Math.min(DIAL_TICKS, Math.max(1, Math.round(base)));
}

/** Degrees clockwise from the top: tick 1 is straight up. */
export function dialAngle(n: number): number {
  return (dialBase(n) - 1) * DEGREES_PER_TICK;
}

/** Where tick `i` (1 to 9) sits on a circle of radius `r` around (cx, cy). */
export function tickPoint(i: number, r: number, cx: number, cy: number): { x: number; y: number } {
  const a = ((i - 1) * DEGREES_PER_TICK * Math.PI) / 180;
  return { x: Math.round((cx + r * Math.sin(a)) * 100) / 100, y: Math.round((cy - r * Math.cos(a)) * 100) / 100 };
}

export function dialSpoken(kind: 'Year' | 'Month' | 'Day', n: number): string {
  return `Personal ${kind} ${n}, at tick ${dialBase(n)} of ${DIAL_TICKS}`;
}
