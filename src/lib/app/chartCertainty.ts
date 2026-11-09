/**
 * timeCertainty applied to a real chart.
 *
 * timeCertainty knows how far a body drifts in twelve hours and nothing else — deliberately, so
 * it can be tested without the mandala. This is where it meets the engine: longitudeToGate
 * supplies the ordering, and what comes out is the shape the app routes send down.
 */

// From ./mandala rather than ./human_design: the ordering is arithmetic, and importing it
// through the engine would pull the ephemeris binary in with it.
import { longitudeToGate } from '@/server/engines/mandala';
/**
 * Activations arrive from stored JSON, so these are structural rather than the engine's
 * GateActivation: a route that has just parsed a jsonb column holds `epoch: string`, and making
 * it prove otherwise would only mean a cast at the call site saying the same thing less honestly.
 */
export interface ActivationInput {
  planet: string;
  longitude: number;
}

export interface SunInput extends ActivationInput {
  epoch: string;
  line: number;
}
import {
  gateCertainty,
  lineCertainty,
  profileCertain,
  type Certainty,
} from '@/lib/app/timeCertainty';

const gateAt = (longitude: number) => longitudeToGate(longitude).gate;
const lineAt = (longitude: number) => longitudeToGate(longitude).line;

export interface ActivationCertainty {
  gate: Certainty;
  line: Certainty;
}

/** What a missing birth time does to one activation. */
export function activationCertainty(
  activation: ActivationInput,
  birthTimeKnown: boolean,
): ActivationCertainty {
  return {
    gate: gateCertainty(activation.planet, activation.longitude, birthTimeKnown, gateAt),
    line: lineCertainty(activation.planet, activation.longitude, birthTimeKnown, lineAt),
  };
}

export interface ProfileReading {
  /** What the chart was calculated as, e.g. "4/1". Always the first of `options`. */
  value: string;
  /** False when a birth time would be needed to settle it. */
  certain: boolean;
  /**
   * Every Profile the birth could produce, the calculated one first. One entry when certain.
   * Capped at four, which is as many as two uncertain lines can make.
   */
  options: string[];
}

/**
 * A Profile is the conscious Sun's line over the unconscious Sun's line, and the Sun covers
 * slightly more than one whole line in a day. So with no birth time neither half is settled, and
 * the honest answer is a short list rather than a single value.
 *
 * The calculated Profile stays first and keeps its place everywhere it is shown: it is still the
 * best single answer, and reordering it would make the chart look as though it had changed.
 */
export function profileReading(
  activations: readonly SunInput[],
  calculated: string,
  birthTimeKnown: boolean,
): ProfileReading {
  if (profileCertain(birthTimeKnown)) {
    return { value: calculated, certain: true, options: [calculated] };
  }

  const sunAt = (epoch: 'personality' | 'design') =>
    activations.find((a) => a.planet.toLowerCase() === 'sun' && a.epoch === epoch);
  const conscious = sunAt('personality');
  const design = sunAt('design');

  // Without both Suns there is nothing to work from. Still not certain — the arithmetic does not
  // depend on this chart — but there is no list to offer.
  if (!conscious || !design) {
    return { value: calculated, certain: false, options: [calculated] };
  }

  const linesFor = (a: SunInput) => {
    const c = lineCertainty(a.planet, a.longitude, false, lineAt);
    return [a.line, ...c.alternatives];
  };

  const options: string[] = [calculated];
  for (const first of linesFor(conscious)) {
    for (const second of linesFor(design)) {
      const option = `${first}/${second}`;
      if (!options.includes(option)) options.push(option);
    }
  }

  return { value: calculated, certain: false, options: options.slice(0, 4) };
}

/**
 * How a short list of possibilities reads in one line: "4/1 or 4/2" for two, and the calculated
 * value alone for more, because past two the list belongs in the explanation rather than beside
 * the value. Null when there is nothing to add.
 */
export function alsoReads(reading: ProfileReading): string | null {
  if (reading.certain || reading.options.length < 2) return null;
  if (reading.options.length === 2) return `${reading.options[0]} or ${reading.options[1]}`;
  return null;
}
