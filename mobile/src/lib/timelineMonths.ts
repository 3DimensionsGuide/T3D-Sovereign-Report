/**
 * Splits the Timeline's day groups into "the rest of this month" and "later", so the list can start with
 * what is close and keep the rest behind a button. Day keys look like "2026-10-11". Pure, no imports.
 */
export type DayGroup<T> = [string, T[]];

export interface MonthSplit<T> {
  now: DayGroup<T>[];
  later: DayGroup<T>[];
  /** Month keys ("2026-11") of the later days, in order, with no repeats. */
  laterMonths: string[];
}

export const monthOf = (dayKey: string): string => dayKey.slice(0, 7);

export function splitCurrentMonth<T>(groups: DayGroup<T>[], todayKey: string): MonthSplit<T> {
  const month = monthOf(todayKey);
  const now = groups.filter(([day]) => monthOf(day) <= month);
  const later = groups.filter(([day]) => monthOf(day) > month);
  const laterMonths = [...new Set(later.map(([day]) => monthOf(day)))];
  return { now, later, laterMonths };
}

