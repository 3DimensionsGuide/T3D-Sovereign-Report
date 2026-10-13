/** The parts of a reading this needs. The full types live in timelineTypes.ts. */
interface Gates<G> {
  gates: G[];
}
interface TodayShape<G> extends Gates<G> {
  strategy: string | null;
  authority: string | null;
}
interface DataShape<G> {
  gateToday?: TodayShape<G>;
  gateDays?: Array<{ dayIndex: number; gates: G[] }>;
}

/**
 * The gate reading for one day of the Timeline ribbon (0 is today). The person's own Strategy and Authority
 * are the same every day, so they come from today's result. Null when that day has no reading
 * (older saved copy, or past the days the server reads ahead).
 */
export function gateReadingForDay<G>(data: DataShape<G>, dayIndex: number): TodayShape<G> | null {
  if (!data.gateToday) return null;
  if (dayIndex === 0) return data.gateToday;
  const day = data.gateDays?.find((d) => d.dayIndex === dayIndex);
  if (!day || day.gates.length === 0) return null;
  return { gates: day.gates, strategy: data.gateToday.strategy, authority: data.gateToday.authority };
}
