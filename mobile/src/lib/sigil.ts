/**
 * The T3D Sigil: a drawing made only from a person's own chart, so no two charts give the same picture.
 * It uses nothing private: no name, birth date, time or place, only the same facts the share cards already show.
 *
 *  Vehicle (amber):   two nested diamonds sized by the two profile lines, with a centre mark for the Type.
 *  Road (emerald):    nested triangles, one per step of the Life Path, turned by the Destiny number.
 *  Stoplight (crimson): the Sun, Moon and (when the birth time is known) Rising on a ring of the twelve signs,
 *                       joined by lines.
 *
 * This file only works out where things go; components/Sigil.tsx draws them.
 */
/** The few chart facts the Sigil reads (structurally compatible with the full chart result). */
type Placement = { sign: string; degreeInSign: number; minuteInSign: number };
export interface SigilChart {
  astrology: { tropicalSun: Placement; tropicalMoon: Placement; tropicalAscendant: number };
  numerology: { lifePath: number; destiny: number };
  humanDesign: { type: string; profile: string };
}

const SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

export const SIGIL_BOX = 200;
export const SIGIL_CENTER = SIGIL_BOX / 2;
export const RING_RADIUS = 92;

export interface Point { x: number; y: number }
export type CentreMark = 'dot' | 'dotRing' | 'bar' | 'ring' | 'tick';

export interface SigilGeometry {
  /** Short ticks around the ring: the twelve sign boundaries are the long ones. */
  ticks: { from: Point; to: Point; major: boolean }[];
  /** Stoplight: planets on the ring, and the lines that join them. */
  planets: { name: 'Sun' | 'Moon' | 'Rising'; at: Point; r: number }[];
  chords: { from: Point; to: Point }[];
  /** Road: nested triangles, drawn as point lists. */
  triangles: { points: Point[]; opacity: number }[];
  /** Vehicle: the outer (outline) and inner (filled) diamonds, as point lists. */
  outerDiamond: Point[];
  innerDiamond: Point[];
  centre: CentreMark;
}

/** Reduces a number to one digit by adding its digits (11 gives 2, 29 gives 2). Zero becomes 9. */
export function digitRoot(n: number): number {
  let v = Math.abs(Math.round(n));
  while (v > 9) v = String(v).split('').reduce((a, d) => a + Number(d), 0);
  return v === 0 ? 9 : v;
}

/** The ecliptic longitude of a placement, 0 to 360, from its sign and degree. */
export function longitudeOf(p: { sign: string; degreeInSign: number; minuteInSign: number }): number {
  const i = Math.max(0, SIGN_NAMES.indexOf(p.sign));
  return i * 30 + p.degreeInSign + p.minuteInSign / 60;
}

/** Aries at the left going round the way a chart wheel does. */
export function onCircle(degrees: number, radius: number): Point {
  const rad = ((180 - degrees) * Math.PI) / 180;
  return { x: SIGIL_CENTER + radius * Math.cos(rad), y: SIGIL_CENTER - radius * Math.sin(rad) };
}

const polygon = (sides: number, radius: number, rotationDeg: number): Point[] =>
  Array.from({ length: sides }, (_, i) => {
    const rad = ((rotationDeg + (360 / sides) * i - 90) * Math.PI) / 180;
    return { x: SIGIL_CENTER + radius * Math.cos(rad), y: SIGIL_CENTER + radius * Math.sin(rad) };
  });

function centreFor(type: string): CentreMark {
  const t = type.toLowerCase();
  if (t.includes('manifesting generator')) return 'dotRing';
  if (t.includes('generator')) return 'dot';
  if (t.includes('manifestor')) return 'bar';
  if (t.includes('reflector')) return 'ring';
  return 'tick'; // Projector
}

export function sigilGeometry(chart: SigilChart, birthTimeKnown: boolean): SigilGeometry {
  const { astrology: astro, numerology: num, humanDesign: hd } = chart;

  const ticks = Array.from({ length: 36 }, (_, i) => {
    const major = i % 3 === 0;
    return { from: onCircle(i * 10, RING_RADIUS), to: onCircle(i * 10, RING_RADIUS - (major ? 7 : 3.5)), major };
  });

  const planets: SigilGeometry['planets'] = [
    { name: 'Sun', at: onCircle(longitudeOf(astro.tropicalSun), RING_RADIUS), r: 5.2 },
    { name: 'Moon', at: onCircle(longitudeOf(astro.tropicalMoon), RING_RADIUS), r: 3.8 },
  ];
  if (birthTimeKnown) planets.push({ name: 'Rising', at: onCircle(astro.tropicalAscendant, RING_RADIUS), r: 3.2 });
  const chords: SigilGeometry['chords'] = [];
  for (let a = 0; a < planets.length; a += 1) {
    for (let b = a + 1; b < planets.length; b += 1) chords.push({ from: planets[a].at, to: planets[b].at });
  }

  const steps = digitRoot(num.lifePath);
  const turn = digitRoot(num.destiny) * 40;
  const triangles = Array.from({ length: steps }, (_, k) => ({
    points: polygon(3, 24 + ((70 - 24) * (k + 1)) / steps, turn + (k * 120) / steps),
    opacity: 0.85 - (k * 0.5) / steps,
  }));

  const lines = (hd.profile.match(/\d/g) ?? ['3', '3']).map(Number);
  const first = Math.min(6, Math.max(1, lines[0] ?? 3));
  const second = Math.min(6, Math.max(1, lines[1] ?? 3));
  const outerDiamond = polygon(4, 14 + first * 3.4, 0);
  const innerDiamond = polygon(4, 6 + second * 1.9, 0);

  return { ticks, planets, chords, triangles, outerDiamond, innerDiamond, centre: centreFor(hd.type) };
}

export const pointsAttr = (pts: Point[]) => pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
