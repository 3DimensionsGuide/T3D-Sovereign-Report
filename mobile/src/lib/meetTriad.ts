/** Meet your Triad: seven stops, one opening each day. The first three are free; four to seven are Premium. */

export type StopLens = 'vehicle' | 'road' | 'stoplight' | 'triad';

export interface TriadStop {
  day: number;
  lens: StopLens;
  title: string;
  /** One line on what the stop shows. */
  blurb: string;
  /** What to try today, in plain words. */
  tryIt: string;
  free: boolean;
}

export const FREE_DAYS = 3;
export const TOTAL_DAYS = 7;

export const STOPS: readonly TriadStop[] = [
  {
    day: 1, lens: 'vehicle', free: true, title: 'Your Vehicle',
    blurb: 'The body you drive: your type, how it decides, and which centers run steadily.',
    tryIt: 'Today, wait for something to respond to before you commit, then notice how your body answers.',
  },
  {
    day: 2, lens: 'road', free: true, title: 'Your Road',
    blurb: 'Where you are on the road: your year, month and day, and the phase of life you are in.',
    tryIt: 'Pick one thing that fits today’s number and give it your first hour.',
  },
  {
    day: 3, lens: 'stoplight', free: true, title: 'Your Stoplight',
    blurb: 'Today’s timing: the signal and the sky behind it.',
    tryIt: 'Check the signal before one decision today, then make the call through your own Authority.',
  },
  {
    day: 4, lens: 'stoplight', free: false, title: 'The sky against your chart',
    blurb: 'Your closest transits drawn on a wheel, so you can see which contact is doing the work.',
    tryIt: 'Find the numbered contact you feel most today and read what it asks of you.',
  },
  {
    day: 5, lens: 'road', free: false, title: 'Your Timeline',
    blurb: 'The weeks and months ahead, laid out so the next season never arrives as a surprise.',
    tryIt: 'Open the next month and note one date you want to plan around.',
  },
  {
    day: 6, lens: 'vehicle', free: false, title: 'Decide with three lamps',
    blurb: 'Authority, Road and Stoplight checked in order, so a decision gets all three lenses.',
    tryIt: 'Run one real decision through the three checks.',
  },
  {
    day: 7, lens: 'triad', free: false, title: 'Your whole Triad',
    blurb: 'The three lenses side by side, and what the week showed you.',
    tryIt: 'Look back over the week and keep the one habit that helped.',
  },
] as const;

export type StopStatus = 'done' | 'open' | 'soon' | 'premium';

function dayNumber(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y!, (m ?? 1) - 1, d ?? 1) / 86_400_000;
}

/** Whole calendar days from `from` to `to` (YYYY-MM-DD). */
export function daysBetween(from: string, to: string): number {
  return Math.round(dayNumber(to) - dayNumber(from));
}

/** Which stop the person is up to today: 1 on the day they begin, never past 7. */
export function currentStop(startedOn: string, todayKey: string): number {
  return Math.min(TOTAL_DAYS, Math.max(1, daysBetween(startedOn, todayKey) + 1));
}

/** The calendar day a stop opens (YYYY-MM-DD). */
export function opensOn(startedOn: string, day: number): string {
  const [y, m, d] = startedOn.split('-').map(Number);
  const date = new Date(Date.UTC(y!, (m ?? 1) - 1, (d ?? 1) + day - 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

export function stopStatus(
  stop: TriadStop,
  startedOn: string,
  todayKey: string,
  done: readonly number[],
  premium: boolean,
): StopStatus {
  if (!stop.free && !premium) return 'premium';
  if (done.includes(stop.day)) return 'done';
  return currentStop(startedOn, todayKey) >= stop.day ? 'open' : 'soon';
}

/** The first-week card stays on Today until the seven days have passed, or every stop the person can open is done. */
export function showTodayCard(startedOn: string | null, todayKey: string, done: readonly number[], premium: boolean): boolean {
  if (!startedOn) return false;
  if (daysBetween(startedOn, todayKey) >= TOTAL_DAYS) return false;
  const reachable = premium ? TOTAL_DAYS : FREE_DAYS;
  const finished = STOPS.filter((s) => s.day <= reachable).every((s) => done.includes(s.day));
  return !(finished && daysBetween(startedOn, todayKey) + 1 >= reachable);
}

const WORD: Record<StopStatus, string> = { done: 'Done', open: 'Open now', soon: 'Opens soon', premium: 'Premium' };
export const statusWord = (s: StopStatus): string => WORD[s];

export type CheckLens = 'vehicle' | 'road' | 'stoplight';
export type CheckState = 'go' | 'slow' | 'pause';

export interface DecisionCheck {
  step: number;
  lens: CheckLens;
  question: string;
  /** Today's answer for this lens, or null when it could not be read. */
  state: CheckState | null;
  reason: string;
}

interface LampLike { state: CheckState; reason: string }

/** The three checks for Day 6, always in the same order: Authority, then Road, then Stoplight. */
export function decisionChecks(
  signal: { vehicle: LampLike | null; road: LampLike; stoplight: LampLike } | null | undefined,
  vehicle?: { authority?: string | null; strategy?: string | null } | null,
): DecisionCheck[] {
  const make = (step: number, lens: CheckLens, question: string, lamp: LampLike | null | undefined): DecisionCheck => ({
    step, lens, question, state: lamp?.state ?? null, reason: lamp?.reason ?? '',
  });
  return [
    { ...make(1, 'vehicle', 'Does it fit your Strategy and Authority?', signal?.vehicle), reason: vehicleReason(vehicle) ?? signal?.vehicle?.reason ?? '' },
    make(2, 'road', 'Does it fit today’s number?', signal?.road),
    make(3, 'stoplight', 'Do today’s conditions allow it?', signal?.stoplight),
  ];
}

/** One plain sentence on the week for Day 7: which stops were finished. */
export function weekRecap(done: readonly number[]): string {
  const titles = STOPS.filter((s) => done.includes(s.day)).map((s) => s.title);
  if (!titles.length) return 'You have not marked a stop done yet. Open one and tap done when you have tried it.';
  if (titles.length === 1) return `You finished one stop: ${titles[0]}.`;
  const last = titles[titles.length - 1];
  return `You finished ${titles.length} stops: ${titles.slice(0, -1).join(', ')} and ${last}.`;
}

/** Day 6, check 1: what the person's own Authority and Strategy ask, in plain words (not the sky). */
function vehicleReason(v?: { authority?: string | null; strategy?: string | null } | null): string | null {
  const authority = v?.authority?.trim();
  const strategy = v?.strategy?.trim();
  if (!authority && !strategy) return null;
  const first = strategy ? strategy.charAt(0).toLowerCase() + strategy.slice(1).replace(/[.]+$/, '') : null;
  if (authority && first) return `Your Authority is ${authority}, and your Strategy is to ${first}. Check the choice against both.`;
  if (authority) return `Your Authority is ${authority}. Check the choice against it.`;
  return `Your Strategy is to ${first}. Check the choice against it.`;
}
