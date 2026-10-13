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


/** The day key `n` days after `dayKey` ("2026-10-13" + 7 = "2026-10-20"). */
export function addDaysKey(dayKey: string, n: number): string {
  const [y, m, d] = dayKey.split('-').map(Number) as [number, number, number];
  const t = new Date(y, m - 1, d + n);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

export interface WeekSplit<T> {
  /** Today and the next six days. */
  week: DayGroup<T>[];
  /** The rest of this month, after the week. */
  rest: DayGroup<T>[];
}

/** Splits the days of this month into the week ahead and the rest of the month. */
export function splitWeek<T>(nowGroups: DayGroup<T>[], todayKey: string, days = 7): WeekSplit<T> {
  const end = addDaysKey(todayKey, days);
  return {
    week: nowGroups.filter(([day]) => day < end),
    rest: nowGroups.filter(([day]) => day >= end),
  };
}
