/**
 * "Your first week": a short, calm list of the things worth trying in the first seven days.
 * Pure code (no React), so the rules can be tested.
 */

export type StepKey = 'chart' | 'readings' | 'timeline' | 'practice' | 'tribe';

export interface StepDef {
  key: StepKey;
  /** What to do, as a short instruction. */
  label: string;
  /** Why it is worth doing. */
  detail: string;
  /** Where the step takes you. */
  route: '/chart' | '/readings' | '/timeline' | '/practice';
  /** The button that opens it. */
  cta: string;
  /** Needs Premium to open. */
  premium: boolean;
}

export const STEPS: readonly StepDef[] = [
  { key: 'chart', cta: 'Open My Chart', label: 'Open My Chart and see your Triad', detail: 'Your Vehicle, Road and Stoplight in one picture.', route: '/chart', premium: false },
  { key: 'readings', cta: 'Open Readings', label: 'Read about your Vehicle', detail: 'How you are built, and how you decide best.', route: '/readings', premium: false },
  { key: 'timeline', cta: 'Open Timeline', label: 'Look at the week ahead', detail: 'When the road is open, and when to slow down.', route: '/timeline', premium: false },
  { key: 'practice', cta: 'Start a decision', label: 'Run one decision through the three checks', detail: 'Use your Authority on something real.', route: '/practice', premium: true },
  { key: 'tribe', cta: 'Open My Tribe', label: 'Add someone to My Tribe', detail: 'See how you fit with a friend or someone you are seeing.', route: '/practice', premium: true },
];

/** The days the card stays after the first visit, even if steps are left. */
export const JOURNEY_DAYS = 14;
/** The most steps shown at once. */
export const SHOWN = 3;

export interface JourneyInput {
  startedOn: string | null;
  today: string;
  dismissed: boolean;
  premium: boolean;
  visited: Readonly<Record<string, true>>;
  decisions: number;
  people: number;
}

export interface JourneyStep extends StepDef { done: boolean }

export interface JourneyView {
  show: boolean;
  /** 1 to 7 for the first week, then 8 and up. */
  dayNumber: number;
  steps: JourneyStep[];
  /** Every step, in order, so the card can be paged back and forth. */
  all: JourneyStep[];
  /** Which step to show first: the first one not done yet (or the first, when all are done). */
  firstOpen: number;
  doneCount: number;
  total: number;
  allDone: boolean;
}

const MS_DAY = 86_400_000;
const utc = (d: string): number => {
  const [y, m, day] = d.split('-').map(Number);
  return Date.UTC(y!, (m ?? 1) - 1, day ?? 1);
};

/** Day 1 is the day the card was first shown. */
export function dayNumber(startedOn: string | null, today: string): number {
  if (!startedOn) return 1;
  return Math.max(1, Math.round((utc(today) - utc(startedOn)) / MS_DAY) + 1);
}

export function journeyView(i: JourneyInput): JourneyView {
  const defs = STEPS.filter((s) => i.premium || !s.premium);
  const doneOf = (k: StepKey): boolean =>
    k === 'practice' ? i.decisions > 0 : k === 'tribe' ? i.people > 0 : i.visited[k] === true;
  const all: JourneyStep[] = defs.map((s) => ({ ...s, done: doneOf(s.key) }));
  const doneCount = all.filter((s) => s.done).length;
  const day = dayNumber(i.startedOn, i.today);
  const allDone = doneCount === all.length;
  const show = !i.dismissed && day <= JOURNEY_DAYS;
  // Next steps first (up to three), so the card is never a long list; finished steps follow only when nothing is left.
  const next = all.filter((s) => !s.done).slice(0, SHOWN);
  const firstOpen = Math.max(0, all.findIndex((s) => !s.done));
  return { show, dayNumber: day, steps: allDone ? all : next, all, firstOpen, doneCount, total: all.length, allDone };
}

const WORDS: Record<number, string> = { 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five' };

/** The card's heading: what it is, in a sentence. */
export function journeyHeading(total: number): string {
  const n = WORDS[total] ?? String(total);
  return `${n} small ${total === 1 ? 'step' : 'steps'} to get to know your chart`;
}

/** What the card is for and how to use it. */
export const JOURNEY_PURPOSE = 'One a day is plenty. Tap a day to see its step, then open it. A step ticks off when you have done it.';

/** The status of the step on show. */
export function stepStatus(index: number, done: boolean): string {
  return `Day ${index + 1} · ${done ? 'Done' : 'Not done yet'}`;
}

/** How many are done, written out. */
export function doneNote(doneCount: number, total: number): string {
  return `${doneCount} of ${total} done`;
}
