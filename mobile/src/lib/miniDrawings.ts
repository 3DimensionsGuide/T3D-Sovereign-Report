import type { RoadStripModel } from './roadStrip';
import { wheelPoint } from './transitWheel';

/**
 * Geometry for the two small drawings at the top right of the Road and Stoplight cards on My Chart.
 * Both are drawn from the person's own chart: the four Pinnacles, and where the Sun, Moon and Rising sit.
 */

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

/** Ecliptic longitude from a sign and the degrees and minutes inside it. Null when the sign is unknown. */
export function longitudeFromPlacement(sign: string, degreeInSign: number, minuteInSign = 0): number | null {
  const i = SIGNS.findIndex((s) => s.toLowerCase() === sign.trim().toLowerCase());
  if (i === -1 || !Number.isFinite(degreeInSign)) return null;
  return i * 30 + degreeInSign + (Number.isFinite(minuteInSign) ? minuteInSign : 0) / 60;
}

export type MiniRoadState = 'past' | 'current' | 'future';

export interface MiniRoadBar {
  x: number;
  width: number;
  number: number;
  state: MiniRoadState;
}

export interface MiniRoad {
  width: number;
  height: number;
  barY: number;
  barHeight: number;
  bars: MiniRoadBar[];
  /** Centre of the triangle under the current Pinnacle. */
  markerX: number | null;
  spoken: string;
}

const BAR_GAP = 3;
const MIN_BAR = 16;

export function buildMiniRoad(model: RoadStripModel, width = 92, height = 44): MiniRoad {
  const n = model.segments.length;
  const room = width - BAR_GAP * Math.max(0, n - 1);
  // Real widths follow the share of a life each Pinnacle covers, but none shrinks below what a number needs.
  const raw = model.segments.map((s) => Math.max(MIN_BAR, (s.widthPct / 100) * room));
  const scale = room / raw.reduce((a, b) => a + b, 0);
  let x = 0;
  const bars: MiniRoadBar[] = model.segments.map((s, i) => {
    const w = Math.round(raw[i]! * scale * 100) / 100;
    const bar: MiniRoadBar = {
      x: Math.round(x * 100) / 100,
      width: w,
      number: s.number,
      state: s.current ? 'current' : s.past ? 'past' : 'future',
    };
    x += w + BAR_GAP;
    return bar;
  });
  const current = bars.find((b) => b.state === 'current');
  return {
    width,
    height,
    barY: 3,
    barHeight: 22,
    bars,
    markerX: current ? Math.round((current.x + current.width / 2) * 100) / 100 : null,
    spoken: `Your four Pinnacles along your life. ${model.sentence}`,
  };
}

export interface MiniWheelMark {
  who: 'Sun' | 'Moon' | 'Rising';
  longitude: number;
  x: number;
  y: number;
  /** For Rising: the short bar that crosses the ring. */
  x2: number;
  y2: number;
}

export interface MiniWheel {
  size: number;
  c: number;
  ringR: number;
  ticks: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  marks: MiniWheelMark[];
  spoken: string;
}

export function buildMiniWheel(
  sun: number | null,
  moon: number | null,
  rising: number | null,
  sizes: { sun: string; moon: string; rising: string },
  size = 64,
): MiniWheel {
  const c = size / 2;
  const ringR = c - 6;
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const [x1, y1] = wheelPoint(i * 30, ringR - 3, c);
    const [x2, y2] = wheelPoint(i * 30, ringR, c);
    return { x1, y1, x2, y2 };
  });
  const marks: MiniWheelMark[] = [];
  if (sun !== null) {
    const [x, y] = wheelPoint(sun, ringR - 9, c);
    marks.push({ who: 'Sun', longitude: sun, x, y, x2: x, y2: y });
  }
  if (moon !== null) {
    const [x, y] = wheelPoint(moon, ringR - 18, c);
    marks.push({ who: 'Moon', longitude: moon, x, y, x2: x, y2: y });
  }
  if (rising !== null) {
    const [x, y] = wheelPoint(rising, ringR - 5, c);
    const [x2, y2] = wheelPoint(rising, ringR + 5, c);
    marks.push({ who: 'Rising', longitude: rising, x, y, x2, y2 });
  }
  const parts = marks.map((m) => (m.who === 'Sun' ? `Sun in ${sizes.sun}` : m.who === 'Moon' ? `Moon in ${sizes.moon}` : `Rising in ${sizes.rising}`));
  return { size, c, ringR, ticks, marks, spoken: parts.length ? `Your chart wheel: ${parts.join(', ')}.` : 'Your chart wheel.' };
}
