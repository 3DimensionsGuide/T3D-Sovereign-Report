/**
 * Which Timeline rows keep their explanation behind Premium. Transits and returns (a planet meeting your chart)
 * are listed for everyone, with their time and whether they flow or press, but what they mean opens with Premium.
 * Gate changes, Moon phases, eclipses, stations and sign changes stay free.
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
