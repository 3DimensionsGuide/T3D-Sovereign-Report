/** The parts of a reading this needs. The full types live in timelineTypes.ts. */
interface Gates<G, M> {
  gates: G[];
  moon?: M[];
}
interface TodayShape<G, M> extends Gates<G, M> {
  strategy: string | null;
  authority: string | null;
}
interface DataShape<G, M> {
  gateToday?: TodayShape<G, M>;
  gateDays?: Array<{ dayIndex: number; gates: G[]; moon?: M[] }>;
}

/**
 * The gate reading for one day of the Timeline ribbon (0 is today). The person's own Strategy and Authority
 * are the same every day, so they come from today's result. Null when that day has no reading
 * (older saved copy, or past the days the server reads ahead).
 */
export function gateReadingForDay<G, M = never>(data: DataShape<G, M>, dayIndex: number): TodayShape<G, M> | null {
  if (!data.gateToday) return null;
  if (dayIndex === 0) return data.gateToday;
  const day = data.gateDays?.find((d) => d.dayIndex === dayIndex);
  if (!day || day.gates.length === 0) return null;
  return { gates: day.gates, moon: day.moon ?? [], strategy: data.gateToday.strategy, authority: data.gateToday.authority };
}
