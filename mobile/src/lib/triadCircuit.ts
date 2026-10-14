/**
 * The geometry and timing of the powered-on Triad: three corners joined by live traces,
 * a charging core in the middle, and a back face that gives the triangle depth.
 * Pure numbers (no React), so the layout and the animation maths can be tested.
 * Functions marked 'worklet' also run on the animation thread.
 */

export interface Pt { x: number; y: number }

/** The three corners, in the same 100 x 100 box the portrait is drawn in. */
export const CORNER_V: Pt = { x: 50, y: 28 };
export const CORNER_R: Pt = { x: 17, y: 66 };
export const CORNER_S: Pt = { x: 83, y: 66 };

/** The power core in the middle, with the T3D mark on top of it. */
export const CORE: Pt = { x: 50, y: 53 };
export const CORE_RING = 9.5;
export const CORE_DISC = 7.8;

/** How far the back face sits behind and below the front face. */
export const DEPTH: Pt = { x: 2.4, y: 3.6 };

/** Each corner, in the order the energy travels: Vehicle, Road, Stoplight. */
export const CORNERS: readonly Pt[] = [CORNER_V, CORNER_R, CORNER_S];

export function dist(a: Pt, b: Pt): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export interface Trace { from: Pt; to: Pt; length: number }

/** The three triangle edges, each running from one corner to the next. */
export const EDGES: readonly Trace[] = CORNERS.map((from, i) => {
  const to = CORNERS[(i + 1) % 3];
  return { from, to, length: dist(from, to) };
});

/** Where a spoke starts (just outside the core ring) and ends (just short of the corner's glow). */
export const SPOKE_START_GAP = CORE_RING + 1;
export const SPOKE_END_GAP = 8;

/** The three spokes, from the core out to each corner. */
export const SPOKES: readonly Trace[] = CORNERS.map((corner) => {
  const total = dist(CORE, corner);
  const ux = (corner.x - CORE.x) / total;
  const uy = (corner.y - CORE.y) / total;
  const from = { x: CORE.x + ux * SPOKE_START_GAP, y: CORE.y + uy * SPOKE_START_GAP };
  const to = { x: corner.x - ux * SPOKE_END_GAP, y: corner.y - uy * SPOKE_END_GAP };
  return { from, to, length: dist(from, to) };
});

/** The corner moved back to the back face. */
export function backOf(p: Pt): Pt {
  return { x: p.x + DEPTH.x, y: p.y + DEPTH.y };
}

/** Circumference of the core ring. */
export const CORE_CIRCUMFERENCE = 2 * Math.PI * CORE_RING;

/** The dash offset that places a pulse `dash` long at `phase` (0 to 1) along a line of `length`. */
export function pulseOffset(phase: number, length: number, dash: number): number {
  'worklet';
  return dash - phase * (length + dash);
}

/** Keeps a number between 0 and 1. */
export function clamp01(v: number): number {
  'worklet';
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/**
 * Splits one 0 to 1 power-on value into `count` steps that light in turn.
 * Step `index` starts once the earlier ones are `overlap` of the way along.
 */
export function stagger(on: number, index: number, count: number, overlap = 0.35): number {
  'worklet';
  if (on >= 1) return 1;
  const span = 1 + (count - 1) * (1 - overlap);
  const start = (index * (1 - overlap)) / span;
  return clamp01((on - start) / (1 / span));
}

/** A value that repeats from 0 up to 1 and wraps, shifted by `shift`. */
export function wrap01(v: number): number {
  'worklet';
  return v - Math.floor(v);
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** Mixes two #rrggbb colours: 0 gives `a`, 1 gives `b`. */
export function mixHex(a: string, b: string, t: number): string {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  const c = x.map((v, i) => Math.round(v + (y[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}
