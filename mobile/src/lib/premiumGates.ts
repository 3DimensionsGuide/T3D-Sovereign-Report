const dayKey = (d: Date): string => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/**
 * Which parts of the app sit behind Premium (the rest of the list lives in lib/premium.ts).
 * - The Practice tab and the Year ahead screen open with Premium.
 * - Today's Sky is free for today; stepping to another day, past or future, is Premium.
 */
export function isTimingLocked(target: Date, premium: boolean, now: Date = new Date()): boolean {
  return !premium && dayKey(target) !== dayKey(now);
}
