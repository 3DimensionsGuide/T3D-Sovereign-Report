/**
 * "How did today land?": one tap a day, and the patterns that show up in a person's own notes.
 * Pure functions only; the phone-only store lives in store/useDayLogStore.ts.
 * Nothing here predicts anything. It reports what the person themselves marked, with the counts.
 */

export type Feeling = 'clear' | 'mixed' | 'heavy';
export type SignalWord = 'go' | 'slow' | 'pause';

/** What the sky and numbers were doing on the day the person tapped. */
export interface DayContext {
  personalDay: number | null;
  signal: SignalWord | null;
  moonSign: string | null;
}

export interface DayLogEntry {
  feeling: Feeling;
  ctx: DayContext;
}

export type DayLog = Record<string, DayLogEntry>;

export const FEELINGS: readonly Feeling[] = ['clear', 'mixed', 'heavy'];
export const FEELING_WORD: Record<Feeling, string> = { clear: 'Clear', mixed: 'Mixed', heavy: 'Heavy' };
export const FEELING_GLYPH: Record<Feeling, string> = { clear: '○', mixed: '◐', heavy: '●' };
export const SIGNAL_WORD: Record<SignalWord, string> = { go: 'Go', slow: 'Slow', pause: 'Pause' };

/** Patterns need a real base of notes; below this the screen only counts. */
export const MIN_FOR_PATTERNS = 14;
/** A group needs this many days, and so does the rest, before it is compared. */
export const MIN_GROUP = 3;
/** The share of Clear days must differ by at least this much (0 to 1). */
export const MIN_GAP = 0.25;

export function addDaysTo(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const next = new Date(y!, m! - 1, d! + days, 12, 0, 0);
  const mm = String(next.getMonth() + 1).padStart(2, '0');
  const dd = String(next.getDate()).padStart(2, '0');
  return `${next.getFullYear()}-${mm}-${dd}`;
}

export function counts(entries: DayLogEntry[]): Record<Feeling, number> {
  const out: Record<Feeling, number> = { clear: 0, mixed: 0, heavy: 0 };
  for (const e of entries) out[e.feeling] += 1;
  return out;
}

/** The entries from the last `days` days up to and including `today`, oldest first. */
export function recentEntries(log: DayLog, today: string, days: number): Array<{ date: string; entry: DayLogEntry }> {
  const out: Array<{ date: string; entry: DayLogEntry }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = addDaysTo(today, -i);
    const entry = log[date];
    if (entry) out.push({ date, entry });
  }
  return out;
}

export interface Pattern {
  /** Stable key for lists and tests. */
  id: string;
  kind: 'personalDay' | 'signal' | 'moonSign';
  label: string;
  lean: 'clearer' | 'heavier';
  clearIn: number;
  total: number;
  clearElse: number;
  totalElse: number;
  text: string;
}

type Factor = { kind: Pattern['kind']; value: string; label: string };

function factorsOf(ctx: DayContext): Factor[] {
  const out: Factor[] = [];
  if (ctx.personalDay !== null) out.push({ kind: 'personalDay', value: String(ctx.personalDay), label: `Personal Day ${ctx.personalDay}` });
  if (ctx.signal) out.push({ kind: 'signal', value: ctx.signal, label: `${SIGNAL_WORD[ctx.signal]} days` });
  if (ctx.moonSign) out.push({ kind: 'moonSign', value: ctx.moonSign, label: `Moon in ${ctx.moonSign}` });
  return out;
}

/**
 * Compares days that share a factor with all the other days. A pattern is reported only when both sides
 * have at least MIN_GROUP days and the share of Clear days differs by at least MIN_GAP.
 * Strongest first. Needs MIN_FOR_PATTERNS notes in total.
 */
export function findPatterns(log: DayLog): Pattern[] {
  const all = Object.values(log);
  if (all.length < MIN_FOR_PATTERNS) return [];
  const groups = new Map<string, { factor: Factor; entries: DayLogEntry[] }>();
  for (const e of all) {
    for (const f of factorsOf(e.ctx)) {
      const key = `${f.kind}:${f.value}`;
      const g = groups.get(key) ?? { factor: f, entries: [] };
      g.entries.push(e);
      groups.set(key, g);
    }
  }
  const found: Array<Pattern & { gap: number }> = [];
  for (const [key, g] of groups) {
    const inside = g.entries;
    const rest = all.filter((e) => !inside.includes(e));
    if (inside.length < MIN_GROUP || rest.length < MIN_GROUP) continue;
    const clearIn = inside.filter((e) => e.feeling === 'clear').length;
    const clearElse = rest.filter((e) => e.feeling === 'clear').length;
    const rateIn = clearIn / inside.length;
    const rateElse = clearElse / rest.length;
    const gap = rateIn - rateElse;
    if (Math.abs(gap) < MIN_GAP) continue;
    const lean = gap > 0 ? 'clearer' : 'heavier';
    const text = `${g.factor.label}: you marked Clear on ${clearIn} of ${inside.length}, against ${clearElse} of ${rest.length} on your other days.`;
    found.push({
      id: key, kind: g.factor.kind, label: g.factor.label, lean, clearIn, total: inside.length, clearElse, totalElse: rest.length, text, gap: Math.abs(gap),
    });
  }
  found.sort((a, b) => b.gap - a.gap || b.total - a.total || a.id.localeCompare(b.id));
  return found.slice(0, 5).map(({ gap: _gap, ...p }) => p);
}

export interface Recap {
  /** 'week' once seven days are logged in the last seven, otherwise 'none'. */
  kind: 'week' | 'none';
  logged: number;
  counts: Record<Feeling, number>;
  line: string;
}

/** The weekly line: counts for the last seven days, shown once at least 3 of them are logged. */
export function weeklyRecap(log: DayLog, today: string): Recap {
  const recent = recentEntries(log, today, 7);
  const c = counts(recent.map((r) => r.entry));
  if (recent.length < 3) return { kind: 'none', logged: recent.length, counts: c, line: '' };
  const parts = FEELINGS.filter((f) => c[f] > 0).map((f) => `${c[f]} ${FEELING_WORD[f].toLowerCase()}`);
  return {
    kind: 'week',
    logged: recent.length,
    counts: c,
    line: `This week you logged ${recent.length} of 7 days: ${parts.join(', ')}.`,
  };
}

/** The same counts over the last 28 days, for the monthly view. */
export function monthlyCounts(log: DayLog, today: string): { logged: number; counts: Record<Feeling, number> } {
  const recent = recentEntries(log, today, 28);
  return { logged: recent.length, counts: counts(recent.map((r) => r.entry)) };
}

/** Days left before patterns are reported. */
export function daysToPatterns(log: DayLog): number {
  return Math.max(0, MIN_FOR_PATTERNS - Object.keys(log).length);
}

export function isFeeling(v: unknown): v is Feeling {
  return v === 'clear' || v === 'mixed' || v === 'heavy';
}
