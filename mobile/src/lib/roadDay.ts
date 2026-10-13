/** Picks the Personal Day reading for a day in the Timeline. Self-contained so tests can import it. */
export interface RoadDayMeaning {
  number: number;
  root: number | null;
  label: string;
  theme: string;
  keyThemes: string[];
  leanIn: string;
  watchFor: string;
}

export interface RoadDayInput {
  personal: { date: string; year: number; month: number; day: number }[];
  dayMeanings?: Record<number, RoadDayMeaning>;
}

export interface RoadDay {
  date: string;
  year: number;
  month: number;
  meaning: RoadDayMeaning;
}

/** The reading for `dayIndex` (0 = today), or null when the server did not send it. */
export function roadDayFor(data: RoadDayInput, dayIndex: number): RoadDay | null {
  const d = data.personal[dayIndex];
  const meaning = d ? data.dayMeanings?.[d.day] : undefined;
  if (!d || !meaning) return null;
  return { date: d.date, year: d.year, month: d.month, meaning };
}
