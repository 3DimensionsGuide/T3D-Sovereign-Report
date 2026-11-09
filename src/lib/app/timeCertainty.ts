/**
 * What a missing birth time actually costs.
 *
 * When somebody does not know their birth time the engines use 12:00 noon, so the real moment is
 * somewhere in a twenty-four hour window around it — twelve hours either side. Everything in the
 * chart that moves fast enough to cross a boundary inside that window is a guess, and until now
 * the app stated all of it flatly.
 *
 * A gate is 5.625° wide (360 / 64) and a line is a sixth of that, 0.9375°. Against those two
 * numbers, twelve hours either side work out like this:
 *
 *   Moon      ±7.7°   wider than a whole gate — the gate is never reliable and the line is
 *                     meaningless. It could be any of three gates.
 *   Sun       ±0.51°  the gate is an edge case; the line is never reliable, because the Sun
 *                     crosses slightly more than one whole line every day.
 *   Mercury   ±1.1°   gate is an edge case, line rarely reliable
 *   Venus     ±0.63°  gate is an edge case, line often unreliable
 *   Mars      ±0.4°   the gate is nearly always fine, the line sometimes is not
 *   Jupiter→  ±0.12°  and smaller: both reliable
 *
 * The consequence worth knowing: a Profile is the conscious Sun's line over the unconscious Sun's
 * line, and the Sun's line is never reliable without a birth time. So a Profile printed as a flat
 * "4/1" for somebody who does not know their birth time is one of at least two answers, and
 * nothing in the chart says which. That is not an edge case to flag occasionally — it is always
 * true, and it is why profileCertain() needs no longitude to answer.
 *
 * The motions below are upper bounds rather than averages, deliberately. A bound that is a little
 * too generous says "this might be something else" once too often; an average says "this is
 * certain" when it is not, which is the failure this module exists to prevent.
 *
 * Nothing here knows the mandala ordering. Callers pass gateAt and lineAt, because where a gate
 * starts is the engine's business and this module's only business is how far a body can drift.
 */

/** 360 / 64. */
export const DEGREES_PER_GATE = 360 / 64;
/** A gate divides into six lines. */
export const DEGREES_PER_LINE = DEGREES_PER_GATE / 6;

/**
 * The fastest each body travels, in degrees of ecliptic longitude per day, seen from Earth.
 * Upper bounds: the Moon runs 11.7–15.4 depending on where it is in its orbit and Mercury swings
 * widely, so the larger figure is used for both. A body not named here is treated as the slowest
 * case, which is safe for anything out beyond Mars.
 */
const MAX_DAILY_MOTION: Record<string, number> = {
  sun: 1.02,
  earth: 1.02, // the Sun's opposite point, so it moves with it
  moon: 15.4,
  mercury: 2.2,
  venus: 1.26,
  mars: 0.79,
  jupiter: 0.24,
  saturn: 0.13,
  uranus: 0.06,
  neptune: 0.04,
  pluto: 0.04,
  northnode: 0.06,
  southnode: 0.06,
  chiron: 0.06,
};

const SLOWEST = 0.06;

/** Half a day's travel: how far the body may sit either side of where noon put it. */
export function halfDayArc(planet: string): number {
  const key = planet.toLowerCase().replace(/[^a-z]/g, '');
  return (MAX_DAILY_MOTION[key] ?? SLOWEST) / 2;
}

export interface Certainty {
  /** False when the noon fallback could have put this somewhere else. */
  certain: boolean;
  /**
   * The other values it could be. Empty when certain, and also empty when the band is so wide
   * that listing candidates would dress a blank as a shortlist — the Moon's line, for one.
   */
  alternatives: number[];
}

const CERTAIN: Certainty = { certain: true, alternatives: [] };

/** 0 to just under 360, so arithmetic that runs off either end comes back on. */
const wrap = (d: number) => ((d % 360) + 360) % 360;

/**
 * Every distinct value the band from -arc to +arc covers, nearest first.
 *
 * Sampled rather than solved: the step is half the narrowest band a value can occupy, so nothing
 * is stepped over, and both ends are taken exactly because the loop can stop short of them.
 */
function across(centre: number, arc: number, width: number, at: (lon: number) => number): number[] {
  const found = [at(wrap(centre))];
  const offsets: number[] = [-arc, arc];
  for (let o = -arc; o < arc; o += width / 2) offsets.push(o);
  // Nearest first, so the alternatives read in the order they become possible.
  offsets.sort((a, b) => Math.abs(a) - Math.abs(b));
  for (const o of offsets) {
    const value = at(wrap(centre + o));
    if (!found.includes(value)) found.push(value);
  }
  return found;
}

/** Whether the gate this longitude falls in would survive knowing the birth time. */
export function gateCertainty(
  planet: string,
  longitude: number,
  birthTimeKnown: boolean,
  gateAt: (longitude: number) => number,
): Certainty {
  if (birthTimeKnown) return CERTAIN;
  const found = across(longitude, halfDayArc(planet), DEGREES_PER_GATE, gateAt);
  if (found.length === 1) return CERTAIN;
  return { certain: false, alternatives: found.slice(1) };
}

/**
 * Whether the line this longitude falls in would survive knowing the birth time.
 *
 * A band at least a whole gate wide has swept every line there is, so it returns no alternatives:
 * naming six candidates out of six is a list pretending to be information.
 */
export function lineCertainty(
  planet: string,
  longitude: number,
  birthTimeKnown: boolean,
  lineAt: (longitude: number) => number,
): Certainty {
  if (birthTimeKnown) return CERTAIN;
  const arc = halfDayArc(planet);
  if (arc * 2 >= DEGREES_PER_GATE) return { certain: false, alternatives: [] };
  const found = across(longitude, arc, DEGREES_PER_LINE, lineAt);
  if (found.length === 1) return CERTAIN;
  return { certain: false, alternatives: found.slice(1) };
}

/**
 * Whether a Profile survives not knowing the birth time. It does not.
 *
 * Both halves are Sun lines, and the Sun covers slightly more than one whole line in a day —
 * 1.02° against 0.9375° — so with the time unknown each half is one of at least two values. This
 * is a fact about the arithmetic rather than about any particular birth, which is why it takes no
 * longitude.
 */
export function profileCertain(birthTimeKnown: boolean): boolean {
  return birthTimeKnown;
}

/** One sentence for a chart built on the noon fallback, or null when there is nothing to say. */
export function timeUnknownNote(birthTimeKnown: boolean): string | null {
  if (birthTimeKnown) return null;
  return 'This chart was worked out from noon, because no birth time was given. Anything marked as uncertain would need the real time to settle.';
}
