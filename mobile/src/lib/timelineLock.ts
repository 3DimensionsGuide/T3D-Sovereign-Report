/**
 * Which Timeline rows keep their explanation behind Premium. Transits and returns (a planet meeting your chart)
 * are listed for everyone, with their time and whether they flow or press, but what they mean opens with Premium.
 * Gate changes, Moon phases, eclipses, stations and sign changes are free today, but every event on a day after
 * today is listed and opens only with Premium.
 */
export type LockableKind = string;

const LOCKED_KINDS: readonly LockableKind[] = ['transit', 'return'];

export function isTransitLocked(kind: LockableKind, premium: boolean): boolean {
  return !premium && LOCKED_KINDS.includes(kind);
}

/**
 * The rest of this month is free. Later months are listed (the month and how many days have events)
 * but open only with Premium.
 */
export function isLaterMonthLocked(premium: boolean): boolean {
  return !premium;
}

/** An event is locked when it is a transit/return, or when it falls on a day after today. Day keys are YYYY-MM-DD. */
export function isEventLocked(kind: LockableKind, dayKey: string, todayKey: string, premium: boolean): boolean {
  return !premium && (dayKey > todayKey || LOCKED_KINDS.includes(kind));
}
