import { chartColors as c } from './palette';
import type { Hotspot, Prim, Scene } from './scene';
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

/** One aspect picked to be lit on the wheel. */
export interface WheelFocus {
  a: WheelPoint;
  b: WheelPoint;
}

export const ASPECT_SYMBOLS: Record<WheelAspect, string> = {
  conjunction: '☌', sextile: '⚹', square: '□', trine: '△', opposition: '☍',
};

export const sameFocus = (f: WheelFocus | null, asp: { a: WheelPoint; b: WheelPoint }): boolean =>
  f !== null && f.a === asp.a && f.b === asp.b;

/** Shortest angle between two longitudes, in degrees. */
const angleBetween = (x: number, y: number): number => {
  const d = Math.abs(norm(x) - norm(y));
  return d > 180 ? 360 - d : d;
};

/** How far a glyph must be pushed from its true position before a thin line joins the two. */
export const CONNECTOR_MIN_DEGREES = 1.5;

/** With today's sky on the outer ring, the birth wheel shrinks to this share of its size to make room. */
export const NOW_SCALE = 0.84;

/** One aspect between a planet in today's sky and a point of your birth chart. */
export interface WheelNowContact {
  transit: WheelBody;
  natal: WheelPoint;
  aspect: WheelAspect;
  orb: number;
  peak: boolean;
}

export const sameContact = (f: { transit: WheelBody; natal: WheelPoint } | null, c: { transit: WheelBody; natal: WheelPoint }): boolean =>
  f !== null && f.transit === c.transit && f.natal === c.natal;

/** One planet of today's sky, drawn in the outer ring. */
export interface WheelNowPlanet { body: WheelBody; longitude: number; retrograde: boolean }

export function buildWheelScene(
  chart: WheelChart,
  focus: WheelFocus | null = null,
  now: readonly WheelNowPlanet[] | null = null,
  contacts: readonly WheelNowContact[] = [],
  nowFocus: { transit: WheelBody; natal: WheelPoint } | null = null,
): Scene {
  const k = now ? NOW_SCALE : 1;
  const rOut = R_OUT * k;
  const rSignIn = R_SIGN_IN * k;
  const rHouseIn = R_HOUSE_IN * k;
  const rPlanet = R_PLANET * k;
  const rAspect = R_ASPECT * k;
  const prims: Prim[] = [];
  const hotspots: Hotspot[] = [];
  const asc = chart.ascendant;

  // Background disc
  prims.push({ k: 'circle', cx: CX, cy: CY, r: rOut + 2, fill: c.charcoal });

  // Sign ring (aligned to real longitudes) + whole-sign house ring.
  for (let s = 0; s < 12; s++) {
    prims.push({ k: 'path', d: wedge(s * 30, (s + 1) * 30, asc, rOut, rSignIn), fill: ELEMENT_TINT[s % 4], op: 0.1, stroke: c.parchment, w: 0.8 });
    const [gx, gy] = polar(s * 30 + 15, asc, (rOut + rSignIn) / 2);
    prims.push({ k: 'text', x: gx, y: gy, s: SIGN_GLYPHS[s], size: 15, fill: c.parchment, font: 'symbol' });
    prims.push({ k: 'path', d: wedge(s * 30, (s + 1) * 30, asc, rSignIn, rHouseIn), fill: c.amethyst, op: s % 2 ? 0.55 : 0.85, stroke: c.parchment, w: 0.6 });
  }
  // House numbers: house 1 is the sign containing the Ascendant.
  const ascSign = Math.floor(norm(asc) / 30);
  for (let h = 1; h <= 12; h++) {
    const s = (ascSign + h - 1) % 12;
    const [hx, hy] = polar(s * 30 + 15, asc, (rSignIn + rHouseIn) / 2);
    prims.push({ k: 'text', x: hx, y: hy, s: String(h), size: 9.5, fill: c.muted, font: 'body' });
  }

  // Inner aspect circle
  prims.push({ k: 'circle', cx: CX, cy: CY, r: rAspect, fill: c.obsidian, stroke: c.parchment, w: 0.8, op: 1 });

  // Axis lines (Ascendant–Descendant and MC–IC) just inside the ring.
  const axis = (lon: number, col: string) => {
    const [x1, y1] = polar(lon, asc, rHouseIn);
    const [x2, y2] = polar(lon + 180, asc, rHouseIn);
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
    const [x1, y1] = polar(la, asc, rAspect);
    const [x2, y2] = polar(lb, asc, rAspect);
    const st = aspectStyle(asp.aspect, asp.peak);
    if (focus && !sameFocus(focus, asp)) {
      prims.push({ k: 'line', x1, y1, x2, y2, stroke: st.stroke, w: st.w, dash: st.dash, op: 0.12 });
    } else if (focus) {
      prims.push({ k: 'line', x1, y1, x2, y2, stroke: st.stroke, w: st.w + 1.6, dash: st.dash, op: 1 });
      prims.push({ k: 'circle', cx: x1, cy: y1, r: 4, fill: st.stroke, stroke: c.obsidian, w: 1 });
      prims.push({ k: 'circle', cx: x2, cy: y2, r: 4, fill: st.stroke, stroke: c.obsidian, w: 1 });
    } else {
      prims.push({ k: 'line', x1, y1, x2, y2, stroke: st.stroke, w: st.w, dash: st.dash, op: (asp.peak ? 0.95 : 0.65) * (now ? 0.5 : 1) });
    }
  }

  // Planets: tick at the true longitude, glyph at a spread-out position.
  const lons = chart.planets.map((p) => p.longitude);
  const spread = spreadAngles(lons, now ? 15 : 12);
  chart.planets.forEach((pl, i) => {
    const [t1x, t1y] = polar(pl.longitude, asc, rHouseIn);
    const [t2x, t2y] = polar(pl.longitude, asc, rHouseIn - 7);
    prims.push({ k: 'line', x1: t1x, y1: t1y, x2: t2x, y2: t2y, stroke: c.gold, w: 1.4 });
    const [gx, gy] = polar(spread[i], asc, rPlanet);
    if (angleBetween(pl.longitude, spread[i]) > CONNECTOR_MIN_DEGREES) {
      // The glyph was moved to make room: a thin line joins it back to its true position.
      const [cx1, cy1] = polar(spread[i], asc, rPlanet + 11);
      prims.push({ k: 'line', x1: t2x, y1: t2y, x2: cx1, y2: cy1, stroke: c.gold, w: 0.9, op: 0.7 });
    }
    if (focus && (focus.a === pl.body || focus.b === pl.body)) {
      prims.push({ k: 'circle', cx: gx, cy: gy, r: 15, stroke: c.gold, w: 1.8 });
    }
    hotspots.push({ x: gx, y: gy, key: pl.body, label: `${BODY_NAMES[pl.body]} in ${pl.formatted}` });
    prims.push({ k: 'text', x: gx, y: gy, s: BODY_GLYPHS[pl.body] + TEXT_STYLE, size: 19, fill: c.parchment, font: 'symbol' });
    if (pl.retrograde) {
      const [rx, ry] = polar(spread[i], asc, rPlanet - 13);
      prims.push({ k: 'text', x: rx, y: ry, s: 'R', size: 7, fill: c.friction, font: 'bold' });
    }
  });

  // Ascendant / Midheaven labels outside the ring.
  const label = (lon: number, s: string) => {
    const [x, y] = polar(lon, asc, rOut + (now ? 8 : 12));
    prims.push({ k: 'text', x, y, s, size: 9, fill: c.gold, font: 'bold' });
  };
  label(asc, 'AC');
  label(asc + 180, 'DC');
  label(chart.midheaven, 'MC');
  label(chart.midheaven + 180, 'IC');

  // Today's contacts: a line from each planet in today's sky, through the wheel, to the point of your chart it touches.
  if (now && contacts.length) {
    const nowLon = (b: WheelBody): number | null => now.find((p) => p.body === b)?.longitude ?? null;
    for (const ct of [...contacts].sort((x, y) => Number(x.peak) - Number(y.peak))) {
      const tl = nowLon(ct.transit);
      const nl = positionOf(ct.natal);
      if (tl == null || nl == null) continue;
      const [x1, y1] = polar(tl, asc, rOut);
      const [x2, y2] = polar(nl, asc, rAspect);
      const st = aspectStyle(ct.aspect, ct.peak);
      const dim = nowFocus !== null && !sameContact(nowFocus, ct);
      const lit = nowFocus !== null && sameContact(nowFocus, ct);
      prims.push({ k: 'line', x1, y1, x2, y2, stroke: st.stroke, w: lit ? st.w + 1.8 : st.w + 0.4, dash: st.dash, op: dim ? 0.12 : 1 });
      // A crimson dot where the line meets your chart; the line's own style says which aspect it is.
      prims.push({ k: 'circle', cx: x2, cy: y2, r: lit ? 4.5 : 3, fill: c.stoplight, stroke: c.obsidian, w: 1, op: dim ? 0.25 : 1 });
    }
  }

  // Today's sky: an outer ring of glyphs in the Stoplight's crimson, ticked onto the sign ring.
  if (now && now.length) {
    const rNow = rOut + 26;
    prims.push({ k: 'circle', cx: CX, cy: CY, r: rOut + 12, stroke: c.stoplight, w: 0.8, op: 0.5 });
    const nowSpread = spreadAngles(now.map((p) => p.longitude), 14);
    now.forEach((pl, i) => {
      const [t1x, t1y] = polar(pl.longitude, asc, rOut);
      const [t2x, t2y] = polar(pl.longitude, asc, rOut + 12);
      prims.push({ k: 'line', x1: t1x, y1: t1y, x2: t2x, y2: t2y, stroke: c.stoplight, w: 1.4 });
      const [gx, gy] = polar(nowSpread[i], asc, rNow);
      if (angleBetween(pl.longitude, nowSpread[i]) > CONNECTOR_MIN_DEGREES) {
        const [cx1, cy1] = polar(nowSpread[i], asc, rNow - 10);
        prims.push({ k: 'line', x1: t2x, y1: t2y, x2: cx1, y2: cy1, stroke: c.stoplight, w: 0.9, op: 0.7 });
      }
      prims.push({ k: 'text', x: gx, y: gy, s: BODY_GLYPHS[pl.body] + TEXT_STYLE, size: 17, fill: c.stoplight, font: 'symbol' });
      if (pl.retrograde) {
        const [rx, ry] = polar(nowSpread[i], asc, rNow + 12);
        prims.push({ k: 'text', x: rx, y: ry, s: 'R', size: 7, fill: c.friction, font: 'bold' });
      }
    });
  }

  return { w: WHEEL_SIZE, h: WHEEL_SIZE, prims, hotspots };
}
