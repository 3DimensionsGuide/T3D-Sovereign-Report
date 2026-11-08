/**
 * Turning a birth date, a birth time and a time zone into one exact moment.
 *
 * Almost every wall-clock reading names exactly one moment. Twice a year, in any zone that keeps
 * daylight saving, two readings do not:
 *
 *   Ambiguous   the clocks went back, so the hour ran twice. "30 Oct 2005, 1:30 AM" in New York is
 *               two different moments, an hour apart.
 *   Nonexistent the clocks went forward, so the hour never ran at all. "28 Mar 1993, 2:30 AM" in
 *               Berlin never happened; the clocks jumped from 2:00 to 3:00.
 *
 * Luxon resolves an ambiguous reading by starting from the zone's offset *at the moment you ask*
 * and refining from there. For an unambiguous reading that converges on the one right answer, but
 * for an ambiguous one the starting guess decides which of the two you get — so the same birth
 * resolved to 05:30 UTC while New York was on daylight time and 06:30 UTC after the clocks changed.
 * A chart that moves with the seasons is worse than one that is wrong in a fixed way, because
 * nothing in the output says it moved.
 *
 * So this works it out from the zone's own rules instead, and never consults the current time:
 *
 *   1. Read the wall clock as though it were UTC, to get a number to work from.
 *   2. Take the offsets a day either side. Away from a transition they are the same; across one
 *      they are the two offsets in play.
 *   3. For each, subtract it and ask the zone what the offset really is at that moment. It is a
 *      real reading only when the zone agrees with the offset that produced it.
 *   4. Two survivors means the hour ran twice: take the earlier moment — the first 1:30, not the
 *      second. Astro.com and Jovian Archive both read it that way, and tests/golden/verification.json
 *      records them agreeing with this chart.
 *   5. No survivors means the hour never ran: read it with the offset from before the transition,
 *      which carries the reading forward across the gap by exactly the gap's length — 2:30 becomes
 *      3:30. That is also what Luxon does here, so charts already calculated this way do not move.
 *
 * The answer depends only on the birth details and the zone's history, so it is the same today, in
 * six months, and on any machine.
 */

import { DateTime, IANAZone } from 'luxon';

/** Which of the three kinds of wall-clock reading this was. */
export type LocalResolution =
  /** One moment matches, as on almost every day of the year. */
  | 'exact'
  /** The clocks went back and the hour ran twice; the earlier moment was taken. */
  | 'ambiguous'
  /** The clocks went forward and the hour never ran; the reading was carried across the gap. */
  | 'nonexistent';

export interface ResolvedInstant {
  /** The moment itself, in UTC. */
  utc: DateTime;
  /** The zone's offset from UTC at that moment, in minutes. */
  offsetMinutes: number;
  resolution: LocalResolution;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The one moment a birth date, time and zone name.
 *
 * @param dateStr  YYYY-MM-DD
 * @param timeStr  HH:MM, 24-hour
 * @param timezone an IANA name, for example "America/New_York"
 * @throws if the date, the time or the zone cannot be read
 */
export function resolveLocalInstant(
  dateStr: string,
  timeStr: string,
  timezone: string,
): ResolvedInstant {
  if (!IANAZone.isValidZone(timezone)) {
    throw new Error(`Unknown time zone: ${timezone}`);
  }
  const zone = IANAZone.create(timezone);

  // Step 1. The wall clock as a plain number, read as though it were UTC. This is not the answer,
  // only something to measure offsets against.
  const asIfUtc = DateTime.fromISO(`${dateStr}T${timeStr}:00`, { zone: 'utc' });
  if (!asIfUtc.isValid) {
    throw new Error(`Invalid date or time: ${dateStr} ${timeStr} — ${asIfUtc.invalidReason}`);
  }
  const wallMs = asIfUtc.toMillis();

  // Step 2. The offsets in force a day either side. Equal away from a transition.
  const offsetBefore = zone.offset(wallMs - DAY_MS);
  const offsetAfter = zone.offset(wallMs + DAY_MS);

  // Step 3. Keep the candidates the zone actually agrees with.
  const real = [...new Set([offsetBefore, offsetAfter])]
    .map((offsetMinutes) => ({ offsetMinutes, utcMs: wallMs - offsetMinutes * 60_000 }))
    .filter((c) => zone.offset(c.utcMs) === c.offsetMinutes)
    .sort((a, b) => a.utcMs - b.utcMs);

  // Step 4. One survivor is an ordinary reading; two means the hour ran twice, and the first one wins.
  if (real.length > 0) {
    const chosen = real[0]!;
    return {
      utc: DateTime.fromMillis(chosen.utcMs, { zone: 'utc' }),
      offsetMinutes: chosen.offsetMinutes,
      resolution: real.length > 1 ? 'ambiguous' : 'exact',
    };
  }

  // Step 5. No survivor: the hour never ran. Reading it with the offset from before the transition
  // carries it forward across the gap.
  const utcMs = wallMs - offsetBefore * 60_000;
  return {
    utc: DateTime.fromMillis(utcMs, { zone: 'utc' }),
    offsetMinutes: zone.offset(utcMs),
    resolution: 'nonexistent',
  };
}
