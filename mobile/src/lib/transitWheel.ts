import type { AspectNature, DailyAspect, NatalPointName, SkyBody } from './apiTypes';

export interface WheelHit {
  transiting: SkyBody;
  natal: NatalPointName;
  aspect: DailyAspect;
  orb: number;
  applying: boolean;
  nature: AspectNature;
  transitLongitude?: number;
  natalLongitude?: number;
}

export interface WheelDot {
  key: string;
  ring: 'outer' | 'inner';
  x: number;
  y: number;
  /** Where the short label sits, just outside the dot. */
  lx: number;
  ly: number;
  label: string;
}

export interface WheelChord {
  key: string;
  /** 0 is the tightest. Drives draw-in order. */
  rank: number;
  /** 1-based number shown on the line and on the matching list row. */
  number: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  mx: number;
  my: number;
  /** Where the numbered badge sits: outside the ring, spread so each can be tapped on its own. */
  bx: number;
  by: number;
  /** "Jupiter conjunct your Midheaven" */
  phrase: string;
  nature: AspectNature;
  strokeWidth: number;
  opacity: number;
  dashed: boolean;
}

export interface TransitWheel {
  size: number;
  cx: number;
  cy: number;
  outerR: number;
  innerR: number;
  badgeR: number;
  dots: WheelDot[];
  /** Faint marks every 30 degrees, so the ring reads as a zodiac. */
  ticks: { x1: number; y1: number; x2: number; y2: number }[];
  chords: WheelChord[];
  /** Plain-words summary of the drawn contacts, tightest first. */
  spoken: string;
}

const ABBR: Record<string, string> = {
  sun: 'Su', moon: 'Mo', mercury: 'Me', venus: 'Ve', mars: 'Ma', jupiter: 'Ju', saturn: 'Sa',
  uranus: 'Ur', neptune: 'Ne', pluto: 'Pl', ascendant: 'As', midheaven: 'MC',
};
const NAMES: Record<string, string> = {
  sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn',
  uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto', ascendant: 'Rising sign', midheaven: 'Midheaven',
};
const ASPECT_WORD: Record<DailyAspect, string> = {
  conjunction: 'conjunct', sextile: 'sextile', square: 'square', trine: 'trine', opposition: 'opposite',
};
const NATURE_WORD: Record<AspectNature, string> = { flow: 'flow', friction: 'friction', neutral: 'neutral' };

/** The wheel draws only the tightest few, numbered to match the list under it. */
export const MAX_WHEEL_CHORDS = 3;
export const MIN_LABEL_GAP = 16;
/** Badges are at least this far apart (centre to centre): a comfortable 48-point touch target each. */
export const BADGE_GAP = 52;

/** Spreads angles (radians) so neighbours are at least `gap` apart on a circle of the given radius. */
export function spreadAngles(angles: number[], radius: number): number[] {
  const gap = BADGE_GAP / radius;
  const TAU = Math.PI * 2;
  const order = angles.map((a, i) => ({ i, a: ((a % TAU) + TAU) % TAU })).sort((p, q) => p.a - q.a);
  for (let pass = 0; pass < 40; pass++) {
    let moved = false;
    for (let k = 0; k < order.length; k++) {
      const cur = order[k];
      const nxt = order[(k + 1) % order.length];
      if (order.length < 2) break;
      let d = nxt.a - cur.a;
      if (k === order.length - 1) d += Math.PI * 2;
      if (d < gap) {
        const push = (gap - d) / 2 + 0.001;
        cur.a -= push;
        nxt.a += push;
        moved = true;
      }
    }
    if (!moved) break;
  }
  const out = new Array<number>(angles.length);
  for (const o of order) out[o.i] = o.a;
  return out;
}

/** Pushes crowded labels apart (same ring) so neighbours such as Mercury and the Moon stay readable. */
export function spreadLabels(dots: WheelDot[]): void {
  for (let pass = 0; pass < 12; pass++) {
    let moved = false;
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const a = dots[i];
        const b = dots[j];
        let dx = b.lx - a.lx;
        let dy = b.ly - a.ly;
        let d = Math.hypot(dx, dy);
        if (d >= MIN_LABEL_GAP) continue;
        if (d < 0.01) { dx = 1; dy = 0; d = 1; }
        const push = (MIN_LABEL_GAP - d) / 2 + 0.5;
        const ux = dx / d;
        const uy = dy / d;
        a.lx = Math.round((a.lx - ux * push) * 100) / 100;
        a.ly = Math.round((a.ly - uy * push) * 100) / 100;
        b.lx = Math.round((b.lx + ux * push) * 100) / 100;
        b.ly = Math.round((b.ly + uy * push) * 100) / 100;
        moved = true;
      }
    }
    if (!moved) break;
  }
}

/** Aries 0° sits at the left, signs run counter-clockwise like a printed chart. Returns radians. */
export function wheelAngle(longitude: number): number {
  const lon = ((longitude % 360) + 360) % 360;
  return Math.PI + (lon * Math.PI) / 180;
}

export function wheelPoint(longitude: number, radius: number, c: number): [number, number] {
  const a = wheelAngle(longitude);
  // Screen y grows downward, so a positive sine goes up the page.
  return [Math.round((c + radius * Math.cos(a)) * 100) / 100, Math.round((c - radius * Math.sin(a)) * 100) / 100];
}

export function hasWheelPositions(hits: readonly WheelHit[]): boolean {
  return hits.some((h) => typeof h.transitLongitude === 'number' && typeof h.natalLongitude === 'number');
}

/** The tightest contacts drawn between two rings: today's sky outside, your chart inside. */
export function buildTransitWheel(hits: readonly WheelHit[], size = 260): TransitWheel {
  const c = size / 2;
  const outerR = c - 54;
  const innerR = outerR - 52;
  const badgeR = outerR + 28;
  const usable = hits
    .filter((h) => typeof h.transitLongitude === 'number' && typeof h.natalLongitude === 'number')
    .slice()
    .sort((a, b) => a.orb - b.orb)
    .slice(0, MAX_WHEEL_CHORDS);

  const dots = new Map<string, WheelDot>();
  const addDot = (ring: 'outer' | 'inner', name: string, lon: number) => {
    const key = `${ring}-${name}`;
    if (dots.has(key)) return;
    const r = ring === 'outer' ? outerR : innerR;
    const [x, y] = wheelPoint(lon, r, c);
    const [lx, ly] = wheelPoint(lon, ring === 'outer' ? r + 15 : r - 15, c);
    // The sky's planets are named in the numbered list; only your own points are labelled on the ring.
    dots.set(key, { key, ring, x, y, lx, ly, label: ring === 'outer' ? '' : ABBR[name] ?? name });
  };

  const chords: WheelChord[] = usable.map((h, rank) => {
    addDot('outer', h.transiting, h.transitLongitude as number);
    addDot('inner', h.natal, h.natalLongitude as number);
    const [x1, y1] = wheelPoint(h.transitLongitude as number, outerR, c);
    const [x2, y2] = wheelPoint(h.natalLongitude as number, innerR, c);
    return {
      key: `${h.transiting}-${h.natal}-${h.aspect}`,
      rank,
      number: rank + 1,
      x1, y1, x2, y2,
      mx: Math.round(((x1 + x2) / 2) * 100) / 100,
      my: Math.round(((y1 + y2) / 2) * 100) / 100,
      bx: 0,
      by: 0,
      phrase: `${NAMES[h.transiting]} ${ASPECT_WORD[h.aspect]} your ${NAMES[h.natal]}`,
      nature: h.nature,
      // Tighter contacts are thicker and stronger.
      strokeWidth: h.orb <= 1 ? 3.2 : h.orb <= 2 ? 2.4 : 1.8,
      opacity: h.orb <= 1 ? 1 : h.orb <= 2 ? 0.85 : 0.7,
      dashed: h.nature === 'friction',
    };
  });

  const spoken = usable.length
    ? `Today's tightest contacts to your chart, closest first. ` +
      usable
        .map((h, i) => `${i + 1}. ${NAMES[h.transiting]} ${ASPECT_WORD[h.aspect]} your ${NAMES[h.natal]}, ${h.orb.toFixed(1)} degrees from exact, ${NATURE_WORD[h.nature]}`)
        .join('. ') + '.'
    : 'No close contacts to your chart today.';

  // Badges ride outside the ring at the sky planet's angle, nudged apart so none hides another.
  const spread = spreadAngles(usable.map((h) => wheelAngle(h.transitLongitude as number)), badgeR);
  chords.forEach((ch, i) => {
    ch.bx = Math.round((c + badgeR * Math.cos(spread[i])) * 100) / 100;
    ch.by = Math.round((c - badgeR * Math.sin(spread[i])) * 100) / 100;
  });
  const list = [...dots.values()];
  spreadLabels(list.filter((d) => d.ring === 'outer'));
  spreadLabels(list.filter((d) => d.ring === 'inner'));
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const [x1, y1] = wheelPoint(i * 30, outerR - 6, c);
    const [x2, y2] = wheelPoint(i * 30, outerR + 6, c);
    return { x1, y1, x2, y2 };
  });
  return { size, cx: c, cy: c, outerR, innerR, badgeR, dots: list, ticks, chords, spoken };
}
