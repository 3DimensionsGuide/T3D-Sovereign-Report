import { chartColors as c } from './palette';
import type { Prim, Scene } from './scene';
import type { WheelAspect, WheelBody, WheelChart, WheelPoint } from './chartTypes';

export const WHEEL_SIZE = 400;
const CX = 200;
const CY = 200;
const R_OUT = 178;
const R_SIGN_IN = 150;
const R_HOUSE_IN = 131;
const R_PLANET = 111;
const R_ASPECT = 90;

const TEXT_STYLE = '︎'; // ask the system for the text (not emoji) form of a glyph

export const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

export const SIGN_GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'].map((g) => g + TEXT_STYLE);

export const BODY_GLYPHS: Record<WheelBody, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂', jupiter: '♃',
  saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇', northNode: '☊',
};

export const BODY_NAMES: Record<WheelBody, string> = {
  sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune',
  pluto: 'Pluto', northNode: 'North Node',
};

export const ASPECT_NAMES: Record<WheelAspect, string> = {
  conjunction: 'Conjunction', sextile: 'Sextile', square: 'Square', trine: 'Trine', opposition: 'Opposition',
};

/** Fire / earth / air / water tints behind each sign (always also labelled by glyph). */
const ELEMENT_TINT = [c.vehicle, c.road, c.parchment, c.stoplight];

const rad = (deg: number) => (deg * Math.PI) / 180;
const norm = (deg: number) => ((deg % 360) + 360) % 360;

/** Screen position for a zodiac longitude: Ascendant sits on the left, zodiac runs counter-clockwise. */
function polar(longitude: number, ascendant: number, r: number): [number, number] {
  const a = rad(180 + (longitude - ascendant));
  return [CX + r * Math.cos(a), CY - r * Math.sin(a)];
}

function wedge(from: number, to: number, asc: number, rOut: number, rIn: number): string {
  const [x1, y1] = polar(from, asc, rOut);
  const [x2, y2] = polar(to, asc, rOut);
  const [x3, y3] = polar(to, asc, rIn);
  const [x4, y4] = polar(from, asc, rIn);
  // Zodiac runs counter-clockwise on screen => sweep-flag 0 on the outer arc.
  return `M ${x1} ${y1} A ${rOut} ${rOut} 0 0 0 ${x2} ${y2} L ${x3} ${y3} A ${rIn} ${rIn} 0 0 1 ${x4} ${y4} Z`;
}

/** Spread out glyphs that would overlap, keeping each as close to its true position as possible. */
export function spreadAngles(longitudes: number[], minSeparation: number): number[] {
  const n = longitudes.length;
  if (n < 2) return [...longitudes];
  const order = longitudes.map((_, i) => i).sort((a, b) => longitudes[a] - longitudes[b]);
  const pos = order.map((i) => longitudes[i]);
  for (let iter = 0; iter < 80; iter++) {
    let moved = false;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      let gap = pos[j] - pos[i];
      if (j === 0) gap += 360;
      if (gap < minSeparation) {
        const push = (minSeparation - gap) / 2;
        pos[i] -= push;
        pos[j] += push;
        moved = true;
      }
    }
    if (!moved) break;
  }
  const out = new Array<number>(n);
  order.forEach((orig, k) => { out[orig] = norm(pos[k]); });
  return out;
}

function aspectStyle(aspect: WheelAspect, peak: boolean): { stroke: string; w: number; dash?: string } {
  const w = peak ? 1.8 : 1.1;
  switch (aspect) {
    case 'trine': return { stroke: c.flow, w };
    case 'sextile': return { stroke: c.flow, w, dash: '5 3' };
    case 'square': return { stroke: c.friction, w };
    case 'opposition': return { stroke: c.friction, w, dash: '2 3' };
    case 'conjunction': return { stroke: c.conjunction, w: peak ? 2.4 : 1.6 };
  }
}

export function buildWheelScene(chart: WheelChart): Scene {
  const prims: Prim[] = [];
  const asc = chart.ascendant;

  // Background disc
  prims.push({ k: 'circle', cx: CX, cy: CY, r: R_OUT + 2, fill: c.charcoal });

  // Sign ring (aligned to real longitudes) + whole-sign house ring.
  for (let s = 0; s < 12; s++) {
    prims.push({ k: 'path', d: wedge(s * 30, (s + 1) * 30, asc, R_OUT, R_SIGN_IN), fill: ELEMENT_TINT[s % 4], op: 0.1, stroke: c.parchment, w: 0.8 });
    const [gx, gy] = polar(s * 30 + 15, asc, (R_OUT + R_SIGN_IN) / 2);
    prims.push({ k: 'text', x: gx, y: gy, s: SIGN_GLYPHS[s], size: 15, fill: c.parchment, font: 'symbol' });
    prims.push({ k: 'path', d: wedge(s * 30, (s + 1) * 30, asc, R_SIGN_IN, R_HOUSE_IN), fill: c.amethyst, op: s % 2 ? 0.55 : 0.85, stroke: c.parchment, w: 0.6 });
  }
  // House numbers: house 1 is the sign containing the Ascendant.
  const ascSign = Math.floor(norm(asc) / 30);
  for (let h = 1; h <= 12; h++) {
    const s = (ascSign + h - 1) % 12;
    const [hx, hy] = polar(s * 30 + 15, asc, (R_SIGN_IN + R_HOUSE_IN) / 2);
    prims.push({ k: 'text', x: hx, y: hy, s: String(h), size: 9.5, fill: c.muted, font: 'body' });
  }

  // Inner aspect circle
  prims.push({ k: 'circle', cx: CX, cy: CY, r: R_ASPECT, fill: c.obsidian, stroke: c.parchment, w: 0.8, op: 1 });

  // Axis lines (Ascendant–Descendant and MC–IC) just inside the ring.
  const axis = (lon: number, col: string) => {
    const [x1, y1] = polar(lon, asc, R_HOUSE_IN);
    const [x2, y2] = polar(lon + 180, asc, R_HOUSE_IN);
    prims.push({ k: 'line', x1, y1, x2, y2, stroke: col, w: 0.9, op: 0.35, dash: '4 4' });
  };
  axis(asc, c.gold);
  axis(chart.midheaven, c.gold);

  // Aspect lines between true positions.
  const positionOf = (p: WheelPoint): number | null => {
    if (p === 'ascendant') return chart.ascendant;
    if (p === 'midheaven') return chart.midheaven;
    return chart.planets.find((pl) => pl.body === p)?.longitude ?? null;
  };
  const sortedAspects = [...chart.aspects].sort((x, y) => Number(x.peak) - Number(y.peak));
  for (const asp of sortedAspects) {
    const la = positionOf(asp.a);
    const lb = positionOf(asp.b);
    if (la == null || lb == null) continue;
    const [x1, y1] = polar(la, asc, R_ASPECT);
    const [x2, y2] = polar(lb, asc, R_ASPECT);
    const st = aspectStyle(asp.aspect, asp.peak);
    prims.push({ k: 'line', x1, y1, x2, y2, stroke: st.stroke, w: st.w, dash: st.dash, op: asp.peak ? 0.95 : 0.65 });
  }

  // Planets: tick at the true longitude, glyph at a spread-out position.
  const lons = chart.planets.map((p) => p.longitude);
  const spread = spreadAngles(lons, 11);
  chart.planets.forEach((pl, i) => {
    const [t1x, t1y] = polar(pl.longitude, asc, R_HOUSE_IN);
    const [t2x, t2y] = polar(pl.longitude, asc, R_HOUSE_IN - 7);
    prims.push({ k: 'line', x1: t1x, y1: t1y, x2: t2x, y2: t2y, stroke: c.gold, w: 1.4 });
    const [gx, gy] = polar(spread[i], asc, R_PLANET);
    prims.push({ k: 'text', x: gx, y: gy, s: BODY_GLYPHS[pl.body] + TEXT_STYLE, size: 16, fill: c.parchment, font: 'symbol' });
    if (pl.retrograde) {
      const [rx, ry] = polar(spread[i], asc, R_PLANET - 13);
      prims.push({ k: 'text', x: rx, y: ry, s: 'R', size: 7, fill: c.friction, font: 'bold' });
    }
  });

  // Ascendant / Midheaven labels outside the ring.
  const label = (lon: number, s: string) => {
    const [x, y] = polar(lon, asc, R_OUT + 12);
    prims.push({ k: 'text', x, y, s, size: 9, fill: c.gold, font: 'bold' });
  };
  label(asc, 'AC');
  label(asc + 180, 'DC');
  label(chart.midheaven, 'MC');
  label(chart.midheaven + 180, 'IC');

  return { w: WHEEL_SIZE, h: WHEEL_SIZE, prims };
}
