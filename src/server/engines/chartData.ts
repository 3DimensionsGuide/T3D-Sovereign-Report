/**
 * T3D — curated chart-drawing data
 *
 * Turns a saved lead's stored results into exactly what the app needs to DRAW
 * the natal wheel and the Human Design bodygraph. Pure data shaping: no new
 * astrology or Human Design formulas live here. Positions, gates, channels and
 * centers come straight from what the engines already wrote to the lead.
 *
 * Natal aspects use the T3D framework's orbs (5 Ptolemaic aspects; 1 degree
 * = peak, up to 3 degrees = active), the same orbs the Today screen uses.
 */

import type { AstrologyResult, ChartData, HumanDesignResult } from './types';

export type WheelBody =
  | 'sun' | 'moon' | 'mercury' | 'venus' | 'mars'
  | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto' | 'northNode';
export type WheelPoint = WheelBody | 'ascendant' | 'midheaven';
export type WheelAspect = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';

export interface WheelPlanet {
  body: WheelBody;
  longitude: number;
  sign: string;
  formatted: string;
  retrograde: boolean;
  /** Whole-sign house (1–12), counted from the Ascendant's sign. */
  house: number;
}

export interface WheelAspectLine {
  a: WheelPoint;
  b: WheelPoint;
  aspect: WheelAspect;
  orb: number;
  peak: boolean;
}

export interface WheelChart {
  planets: WheelPlanet[];
  ascendant: number;
  midheaven: number;
  aspects: WheelAspectLine[];
}

export interface BodygraphData {
  type: string;
  authority: string;
  profile: string;
  strategy: string;
  notSelf: string;
  incarnationCross: string;
  definedCenters: string[];
  undefinedCenters: string[];
  channels: Array<{
    gates: [number, number];
    name: string;
    fromCenter: string;
    toCenter: string;
    activatedBy: 'personality' | 'design' | 'both';
  }>;
  gates: Array<{
    gate: number;
    line: number;
    epoch: 'personality' | 'design';
    planet: string;
    center: string;
  }>;
}

export interface ChartDrawingData {
  tropical: WheelChart;
  sidereal: WheelChart;
  humanDesign: BodygraphData;
}

const WHEEL_BODIES: readonly WheelBody[] = [
  'sun', 'moon', 'mercury', 'venus', 'mars',
  'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'northNode',
];

/** Bodies that take part in aspect lines (nodes are drawn but not aspected). */
const ASPECTED_BODIES: readonly WheelPoint[] = [
  'sun', 'moon', 'mercury', 'venus', 'mars',
  'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'ascendant', 'midheaven',
];

const ASPECT_ANGLES: Record<WheelAspect, number> = {
  conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180,
};

const PEAK_ORB = 1;
const ACTIVE_ORB = 3;

const normalize = (deg: number): number => ((deg % 360) + 360) % 360;

function separation(a: number, b: number): number {
  const diff = Math.abs(normalize(a - b));
  return diff > 180 ? 360 - diff : diff;
}

const signIndex = (longitude: number): number => Math.floor(normalize(longitude) / 30);

function buildWheel(chart: ChartData): WheelChart {
  const ascendant = chart.houses.ascendant;
  const midheaven = chart.houses.mc;

  const planets: WheelPlanet[] = WHEEL_BODIES.map((body) => {
    const position = chart[body];
    return {
      body,
      longitude: position.longitude,
      sign: position.sign,
      formatted: position.formatted,
      retrograde: position.retrograde,
      house: ((signIndex(position.longitude) - signIndex(ascendant) + 12) % 12) + 1,
    };
  });

  const longitudeOf = (point: WheelPoint): number =>
    point === 'ascendant' ? ascendant
      : point === 'midheaven' ? midheaven
      : chart[point].longitude;

  const aspects: WheelAspectLine[] = [];
  for (let i = 0; i < ASPECTED_BODIES.length; i++) {
    for (let j = i + 1; j < ASPECTED_BODIES.length; j++) {
      const a = ASPECTED_BODIES[i]!;
      const b = ASPECTED_BODIES[j]!;
      // The two angles always relate to each other by construction; skip that pair.
      if ((a === 'ascendant' || a === 'midheaven') && (b === 'ascendant' || b === 'midheaven')) continue;
      const gap = separation(longitudeOf(a), longitudeOf(b));
      for (const aspect of Object.keys(ASPECT_ANGLES) as WheelAspect[]) {
        const orb = Math.abs(gap - ASPECT_ANGLES[aspect]);
        if (orb <= ACTIVE_ORB) {
          aspects.push({ a, b, aspect, orb, peak: orb <= PEAK_ORB });
        }
      }
    }
  }
  aspects.sort((x, y) => x.orb - y.orb);

  return { planets, ascendant, midheaven, aspects };
}

export function buildChartDrawingData(
  astrology: AstrologyResult,
  humanDesign: HumanDesignResult,
): ChartDrawingData {
  return {
    tropical: buildWheel(astrology.tropical),
    sidereal: buildWheel(astrology.sidereal),
    humanDesign: {
      type: humanDesign.type,
      authority: humanDesign.authority,
      profile: humanDesign.profile,
      strategy: humanDesign.strategy,
      notSelf: humanDesign.notSelf,
      incarnationCross: humanDesign.incarnationCross,
      definedCenters: humanDesign.definedCenters,
      undefinedCenters: humanDesign.undefinedCenters,
      channels: humanDesign.activeChannels.map((channel) => ({
        gates: channel.gates,
        name: channel.name,
        fromCenter: channel.fromCenter,
        toCenter: channel.toCenter,
        activatedBy: channel.activatedBy,
      })),
      gates: humanDesign.activeGates.map((gate) => ({
        gate: gate.gate,
        line: gate.line,
        epoch: gate.epoch,
        planet: gate.planet,
        center: gate.center,
      })),
    },
  };
}
