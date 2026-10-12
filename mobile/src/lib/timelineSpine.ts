/**
 * Geometry for the Timeline spine: seasons as bars on one time axis, and the Pinnacle and Challenge cycles as
 * bars on a long axis. Pure functions with no imports, so they can be tested without the app.
 */
export interface SpineSeasonIn {
  windowStart: string; // "2026-10-01"
  windowEnd: string;
  exactAt: string[]; // ISO timestamps
  lord: boolean;
  nature: 'flow' | 'friction' | 'neutral';
}

export interface SpineBar {
  /** Left edge and width as fractions of the axis (0 to 1). */
  x: number;
  width: number;
  /** True when the season began before the axis starts, or ends after it does. */
  cutLeft: boolean;
  cutRight: boolean;
  /** Fractions where the aspect is exact. */
  exact: number[];
}

export interface SpineTick {
  x: number;
  label: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_MS = 86_400_000;

/** Whole days since 1970 for a calendar day written "YYYY-MM-DD" or an ISO timestamp (read in local time). */
export function dayNumber(value: string): number {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number) as [number, number, number];
    return Math.round(Date.UTC(y, m - 1, d) / DAY_MS);
  }
  const t = new Date(value);
  return Math.round(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) / DAY_MS);
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** One season as a bar on the axis running from `from` to `to` (both inclusive). A season is at least one day wide. */
export function seasonBar(s: SpineSeasonIn, from: string, to: string): SpineBar {
  const start = dayNumber(from);
  const span = Math.max(1, dayNumber(to) - start + 1);
  const a = dayNumber(s.windowStart) - start;
  const b = dayNumber(s.windowEnd) - start + 1; // inclusive end
  const left = clamp01(a / span);
  const right = clamp01(b / span);
  const exact = s.exactAt
    .map((at) => (dayNumber(at) - start + 0.5) / span)
    .filter((f) => f >= 0 && f <= 1);
  return {
    x: left,
    width: Math.max(1 / span, right - left),
    cutLeft: a < 0,
    cutRight: b > span,
    exact,
  };
}

/** Month starts that fall inside the axis, each placed at its day. */
export function monthTicks(from: string, to: string): SpineTick[] {
  const start = dayNumber(from);
  const span = Math.max(1, dayNumber(to) - start + 1);
  const [fy, fm] = from.split('-').map(Number) as [number, number];
  const ticks: SpineTick[] = [];
  for (let i = 1; i <= 14; i++) {
    const idx = fm - 1 + i;
    const y = fy + Math.floor(idx / 12);
    const m = ((idx % 12) + 12) % 12;
    const key = `${y}-${String(m + 1).padStart(2, '0')}-01`;
    const x = (dayNumber(key) - start) / span;
    if (x > 1) break;
    if (x > 0) ticks.push({ x, label: MONTHS[m]! });
  }
  return ticks;
}

export interface CycleIn {
  number: number;
  startsOn: string;
  endsOn: string | null;
}

export interface CycleBarModel {
  segments: Array<{ which: 'now' | 'next'; number: number; width: number }>;
  /** Where today sits along the whole bar (0 to 1). */
  todayX: number;
  /** Fraction of the current cycle already lived (0 to 1). */
  progress: number;
}

const OPEN_ENDED_DAYS = 9 * 365; // a cycle with no end date is drawn nine years long

/** The current cycle and the one after it as segments on one bar, with today marked. */
export function cycleBar(current: CycleIn, next: CycleIn | null, today: string): CycleBarModel {
  const t = dayNumber(today);
  const cs = dayNumber(current.startsOn);
  const ce = current.endsOn ? dayNumber(current.endsOn) : cs + OPEN_ENDED_DAYS;
  const d1 = Math.max(1, ce - cs);
  let d2 = 0;
  if (next) {
    const ns = dayNumber(next.startsOn);
    d2 = Math.max(1, (next.endsOn ? dayNumber(next.endsOn) : ns + OPEN_ENDED_DAYS) - ns);
  }
  const total = d1 + d2;
  const progress = clamp01((t - cs) / d1);
  const segments: CycleBarModel['segments'] = [{ which: 'now', number: current.number, width: d1 / total }];
  if (next) segments.push({ which: 'next', number: next.number, width: d2 / total });
  return { segments, todayX: (progress * d1) / total, progress };
}

/** "About 40% of the way through" in words a person would say. */
export function progressWords(progress: number): string {
  const pct = Math.round(progress * 100);
  if (pct <= 5) return 'Just beginning';
  if (pct >= 95) return 'Almost over';
  return `About ${pct}% of the way through`;
}
