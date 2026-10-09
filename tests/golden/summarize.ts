/**
 * Boils one fixture down to the values worth locking in: positions, houses,
 * Human Design results and numerology. Used by both the snapshot writer and
 * the test, so they always describe the same thing.
 */

import { calculateAstrology } from '@/server/engines/astrology';
import { calculateHumanDesign } from '@/server/engines/human_design';
import { calculateNumerology } from '@/server/engines/numerology';
import type { ChartData } from '@/server/engines/types';
import type { GoldenFixture } from './fixtures';

const r3 = (n: number): number => Math.round(n * 1000) / 1000;

const BODIES = [
  'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn',
  'uranus', 'neptune', 'pluto', 'northNode',
] as const;

export interface BodySummary {
  sign: string;
  longitude: number;
  retrograde: boolean;
}

export interface ZodiacSummary {
  bodies: Record<string, BodySummary>;
  ascendant: number;
  ascendantSign: string;
  midheaven: number;
}

export interface ChartSummary {
  julianDay: number;
  tropical: ZodiacSummary;
  sidereal: ZodiacSummary;
  humanDesign: {
    type: string;
    authority: string;
    profile: string;
    cross: string;
    definedCenters: string[];
    channels: string[];
    gates: string[];
  };
  numerology: {
    lifePath: number;
    destiny: number;
    personality: number;
    soulUrge: number;
    hiddenPassion: number;
    karmicLessons: number[];
    pinnacles: number[];
    challenges: number[];
  };
}

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

function zodiac(chart: ChartData): ZodiacSummary {
  const bodies: Record<string, BodySummary> = {};
  for (const key of BODIES) {
    const p = chart[key];
    bodies[key] = { sign: p.sign, longitude: r3(p.longitude), retrograde: p.retrograde };
  }
  const asc = ((chart.houses.ascendant % 360) + 360) % 360;
  return {
    bodies,
    ascendant: r3(asc),
    ascendantSign: SIGNS[Math.floor(asc / 30)] ?? '',
    midheaven: r3(chart.houses.mc),
  };
}

export function summarize(f: GoldenFixture): ChartSummary {
  const input = {
    birthDate: f.birthDate, birthTime: f.birthTime,
    latitude: f.latitude, longitude: f.longitude, timezone: f.timezone,
  };
  const astro = calculateAstrology(input);
  const hd = calculateHumanDesign(input);
  const num = calculateNumerology({
    firstName: f.firstName, middleName: f.middleName, lastName: f.lastName, birthDate: f.birthDate,
  });
  return {
    julianDay: Math.round(astro.julianDay * 1e6) / 1e6,
    tropical: zodiac(astro.tropical),
    sidereal: zodiac(astro.sidereal),
    humanDesign: {
      type: hd.type,
      authority: hd.authority,
      profile: hd.profile,
      cross: hd.incarnationCross,
      definedCenters: [...hd.definedCenters].sort(),
      channels: hd.activeChannels.map((c) => [...c.gates].sort((a, b) => a - b).join('-')).sort(),
      gates: hd.activeGates
        .map((g) => `${g.epoch === 'personality' ? 'P' : 'D'} ${g.planet} ${g.gate}.${g.line}`)
        .sort(),
    },
    numerology: {
      lifePath: num.lifePath,
      destiny: num.destiny,
      personality: num.personality,
      soulUrge: num.soulUrge,
      hiddenPassion: num.hiddenPassion,
      karmicLessons: num.karmicLessons,
      pinnacles: num.pinnacles.map((p) => p.number),
      challenges: num.challenges.map((c) => c.number),
    },
  };
}
