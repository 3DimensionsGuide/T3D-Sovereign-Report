/**
 * T3D Astrology Engine — Daily Sky
 *
 * Answers "what is the sky doing TODAY, relative to this person's natal
 * chart" for the app's Today screen. Rules come from the T3D PHILOSOPHER
 * knowledge base (queried via NotebookLM), not from generic astrology:
 *
 *  - Daily drivers are the Moon, Sun, Mercury, Venus and Mars. The slow
 *    outer planets (Jupiter–Pluto) only count on a given day when they are
 *    at an exact (<= 1 degree) alignment.
 *  - Natal points that matter: the Ascendant and Midheaven, plus the natal
 *    Sun, Moon, Mercury, Venus and Mars.
 *  - Only the five Ptolemaic aspects. Orb <= 1 degree is the "peak" trigger
 *    window; 2 to 3 degrees is still "active". Same orbs for every planet.
 *  - Applying (tightening) vs separating (resolving) is reported.
 *  - The Moon is the daily timekeeper: its sign, its whole-sign house in
 *    the natal chart, its phase (waxing / waning), and its next applying
 *    aspect (within about 13 degrees, its average daily motion) plus what it
 *    is separating from.
 *  - Flow vs friction is classified from aspect quality (trine / sextile =
 *    supportive, square / opposition = frictional, conjunction = by the
 *    transiting planet's nature). The framework deliberately defines NO
 *    green / yellow / red score and treats transits as neutral weather, so
 *    this module returns classifications only — never a combined score.
 *  - Not implemented because the framework doesn't specify them: Void-of-
 *    Course Moon rules and per-sign activity tables. Sect alignment (day vs
 *    night chart weighting) is not applied in this first version.
 *
 * Uses `sweph` (prebuilt, cross-platform) exactly like transits.ts. The
 * small ephemeris setup is intentionally duplicated from transits.ts rather
 * than imported, so adding this file can never change how existing report
 * transits behave.
 */

import fs from 'fs';
import type { PlanetPosition, ZodiacSign } from './types';

// ─── PUBLIC TYPES ────────────────────────────────────────────────────────────

export type SkyBody =
  | 'moon' | 'sun' | 'mercury' | 'venus' | 'mars'
  | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto';

export type NatalPointName =
  | 'sun' | 'moon' | 'mercury' | 'venus' | 'mars'
  | 'jupiter' | 'saturn' | 'ascendant' | 'midheaven';

export type DailyAspect = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
export type AspectNature = 'flow' | 'friction' | 'neutral';

/** The natal longitudes (tropical, 0–360) this module needs. */
export interface NatalSkyPoints {
  sun: number;
  moon: number;
  mercury: number;
  venus: number;
  mars: number;
  jupiter: number;
  saturn: number;
  ascendant: number;
  midheaven: number;
}

export interface DailyTransitHit {
  transiting: SkyBody;
  natal: NatalPointName;
  aspect: DailyAspect;
  /** Degrees off exact (0 = exact). */
  orb: number;
  /** True when within 1 degree — the framework's "peak" window. */
  peak: boolean;
  applying: boolean;
  nature: AspectNature;
}

export interface MoonAspectContact {
  natal: NatalPointName;
  aspect: DailyAspect;
  /** Degrees of Moon travel until (applying) or since (separating) exact. */
  degrees: number;
  /** Approximate hours until / since exact, from the Moon's current speed. */
  approxHours: number;
}

export interface MoonReading {
  sign: ZodiacSign;
  formatted: string;
  /** Whole-sign house (1–12) the Moon is transiting in the natal chart. */
  house: number;
  phase: string;
  waxing: boolean;
  /** 0–100 */
  illuminationPercent: number;
  nextApplying: MoonAspectContact | null;
  lastSeparating: MoonAspectContact | null;
}

export interface DailySkyResult {
  /** ISO timestamp the sky was calculated for. */
  asOf: string;
  moon: MoonReading;
  sun: { sign: ZodiacSign; formatted: string; house: number };
  /** Bodies currently retrograde (Mercury through Pluto). */
  retrograde: SkyBody[];
  /** Tightest-orb first. */
  transits: DailyTransitHit[];
}

// ─── EPHEMERIS SETUP (duplicated from transits.ts on purpose) ───────────────

interface SwephCalcResult {
  flag: number;
  error?: string;
  data: number[];
}
interface Sweph {
  constants: {
    SE_GREG_CAL: number;
    SEFLG_SPEED: number;
    SEFLG_MOSEPH: number;
    SE_SUN: number;
    SE_MOON: number;
    SE_MERCURY: number;
    SE_VENUS: number;
    SE_MARS: number;
    SE_JUPITER: number;
    SE_SATURN: number;
    SE_URANUS: number;
    SE_NEPTUNE: number;
    SE_PLUTO: number;
  };
  set_ephe_path: (path: string) => void;
  julday: (year: number, month: number, day: number, hour: number, cal: number) => number;
  calc_ut: (tjdUt: number, ipl: number, iflag: number) => SwephCalcResult;
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const sweph = require('sweph') as Sweph;

let ephemerisReady = false;
let useMoshier = false;

function initEphemeris(): void {
  if (ephemerisReady) return;
  const ephePath = process.env.EPHE_PATH ?? '';
  if (ephePath) {
    sweph.set_ephe_path(ephePath);
    try {
      const hasFiles = fs.readdirSync(ephePath).some((f) => f.endsWith('.se1'));
      if (!hasFiles) useMoshier = true;
    } catch {
      useMoshier = true;
    }
  } else {
    useMoshier = true;
  }
  ephemerisReady = true;
}

const BODY_IDS: Record<SkyBody, number> = {
  moon:    sweph.constants.SE_MOON,
  sun:     sweph.constants.SE_SUN,
  mercury: sweph.constants.SE_MERCURY,
  venus:   sweph.constants.SE_VENUS,
  mars:    sweph.constants.SE_MARS,
  jupiter: sweph.constants.SE_JUPITER,
  saturn:  sweph.constants.SE_SATURN,
  uranus:  sweph.constants.SE_URANUS,
  neptune: sweph.constants.SE_NEPTUNE,
  pluto:   sweph.constants.SE_PLUTO,
};

/** Daily drivers per the framework. */
const DAILY_DRIVERS: readonly SkyBody[] = ['moon', 'sun', 'mercury', 'venus', 'mars'];
/** Outer planets count only on an exact (peak) alignment. */
const OUTER_BODIES: readonly SkyBody[] = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const RETROGRADE_CHECKED: readonly SkyBody[] = [
  'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
];

/** Natal points compared against transits. */
const NATAL_TARGETS: readonly NatalPointName[] = [
  'ascendant', 'midheaven', 'sun', 'moon', 'mercury', 'venus', 'mars',
];
/** The Moon's applying/separating contacts also include the classic benefic and malefic. */
const MOON_TARGETS: readonly NatalPointName[] = [...NATAL_TARGETS, 'jupiter', 'saturn'];

const ASPECT_ANGLES: Record<DailyAspect, number> = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  opposition: 180,
};

const PEAK_ORB_DEGREES = 1;
const ACTIVE_ORB_DEGREES = 3;
const MOON_CONTACT_RANGE_DEGREES = 13;
const MAX_TRANSITS_RETURNED = 8;

const BENEFICS: readonly SkyBody[] = ['jupiter', 'venus'];
const MALEFICS: readonly SkyBody[] = ['mars', 'saturn'];

const ZODIAC: ZodiacSign[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const normalize = (deg: number): number => ((deg % 360) + 360) % 360;

function separation(a: number, b: number): number {
  const diff = Math.abs(normalize(a - b));
  return diff > 180 ? 360 - diff : diff;
}

function signIndex(longitude: number): number {
  return Math.floor(normalize(longitude) / 30);
}

function formatPosition(longitude: number, latitude: number, speed: number): PlanetPosition {
  const lon = normalize(longitude);
  const idx = Math.floor(lon / 30);
  const degreeInSign = lon - idx * 30;
  const wholeDeg = Math.floor(degreeInSign);
  const minuteInSign = Math.floor((degreeInSign - wholeDeg) * 60);
  return {
    longitude: lon,
    latitude,
    speed,
    retrograde: speed < 0,
    sign: ZODIAC[idx]!,
    degreeInSign,
    minuteInSign,
    formatted: `${wholeDeg}°${String(minuteInSign).padStart(2, '0')}' ${ZODIAC[idx]}`,
  };
}

function toJulianDay(date: Date): number {
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  return sweph.julday(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    hour,
    sweph.constants.SE_GREG_CAL,
  );
}

/** Whole-sign house (1–12) for a longitude, counted from the natal Ascendant sign. */
function wholeSignHouse(longitude: number, ascendant: number): number {
  return ((signIndex(longitude) - signIndex(ascendant) + 12) % 12) + 1;
}

function getSkyPositions(date: Date): Record<SkyBody, PlanetPosition> {
  initEphemeris();
  const jd = toJulianDay(date);
  const flags = sweph.constants.SEFLG_SPEED | (useMoshier ? sweph.constants.SEFLG_MOSEPH : 0);
  const out = {} as Record<SkyBody, PlanetPosition>;
  for (const body of Object.keys(BODY_IDS) as SkyBody[]) {
    const result = sweph.calc_ut(jd, BODY_IDS[body], flags);
    if (result.data?.[0] === undefined) {
      throw new Error(`sweph.calc_ut failed for ${body}: ${result.error ?? 'no data returned'}`);
    }
    const [longitude, latitude, , speed] = result.data;
    out[body] = formatPosition(longitude!, latitude!, speed!);
  }
  return out;
}

const MOON_PHASES = [
  'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
  'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent',
] as const;

function moonPhase(sunLon: number, moonLon: number) {
  const elongation = normalize(moonLon - sunLon);
  return {
    phase: MOON_PHASES[Math.floor(((elongation + 22.5) % 360) / 45)]!,
    waxing: elongation < 180,
    illuminationPercent: Math.round(((1 - Math.cos((elongation * Math.PI) / 180)) / 2) * 100),
  };
}

function classify(transiting: SkyBody, aspect: DailyAspect): AspectNature {
  if (aspect === 'trine' || aspect === 'sextile') return 'flow';
  if (aspect === 'square' || aspect === 'opposition') return 'friction';
  // Conjunction merges energies: its tone follows the transiting planet.
  if (BENEFICS.includes(transiting)) return 'flow';
  if (MALEFICS.includes(transiting)) return 'friction';
  return 'neutral';
}

/** Nearest exact aspect point ahead of / behind the Moon, within range. */
function moonContacts(
  moon: PlanetPosition,
  natal: NatalSkyPoints,
): { next: MoonAspectContact | null; last: MoonAspectContact | null } {
  let next: MoonAspectContact | null = null;
  let last: MoonAspectContact | null = null;
  // Guard against a (never expected) zero or negative Moon speed.
  const speed = moon.speed > 0.1 ? moon.speed : 13;

  for (const target of MOON_TARGETS) {
    const targetLon = natal[target];
    for (const aspect of Object.keys(ASPECT_ANGLES) as DailyAspect[]) {
      const angle = ASPECT_ANGLES[aspect];
      // A non-conjunction aspect has two exact points, one on each side.
      const exactPoints = angle === 0 || angle === 180
        ? [normalize(targetLon + angle)]
        : [normalize(targetLon + angle), normalize(targetLon - angle)];

      for (const exact of exactPoints) {
        const ahead = normalize(exact - moon.longitude);
        const behind = normalize(moon.longitude - exact);
        if (ahead > 0.0001 && ahead <= MOON_CONTACT_RANGE_DEGREES && (!next || ahead < next.degrees)) {
          next = { natal: target, aspect, degrees: ahead, approxHours: (ahead / speed) * 24 };
        }
        if (behind > 0.0001 && behind <= MOON_CONTACT_RANGE_DEGREES && (!last || behind < last.degrees)) {
          last = { natal: target, aspect, degrees: behind, approxHours: (behind / speed) * 24 };
        }
      }
    }
  }
  return { next, last };
}

// ─── MAIN ENTRY POINT ────────────────────────────────────────────────────────

export function calculateDailySky(natal: NatalSkyPoints, at: Date = new Date()): DailySkyResult {
  const sky = getSkyPositions(at);

  // Transit hits.
  const hits: DailyTransitHit[] = [];
  const bodies: readonly SkyBody[] = [...DAILY_DRIVERS, ...OUTER_BODIES];
  const HOUR_IN_DAYS = 1 / 24;

  for (const body of bodies) {
    const position = sky[body];
    const isOuter = OUTER_BODIES.includes(body);
    for (const target of NATAL_TARGETS) {
      for (const aspect of Object.keys(ASPECT_ANGLES) as DailyAspect[]) {
        const orb = Math.abs(separation(position.longitude, natal[target]) - ASPECT_ANGLES[aspect]);
        const limit = isOuter ? PEAK_ORB_DEGREES : ACTIVE_ORB_DEGREES;
        if (orb > limit) continue;
        const orbSoon = Math.abs(
          separation(position.longitude + position.speed * HOUR_IN_DAYS, natal[target]) - ASPECT_ANGLES[aspect],
        );
        hits.push({
          transiting: body,
          natal: target,
          aspect,
          orb,
          peak: orb <= PEAK_ORB_DEGREES,
          applying: orbSoon < orb,
          nature: classify(body, aspect),
        });
      }
    }
  }
  hits.sort((a, b) => a.orb - b.orb);

  const { phase, waxing, illuminationPercent } = moonPhase(sky.sun.longitude, sky.moon.longitude);
  const contacts = moonContacts(sky.moon, natal);

  return {
    asOf: at.toISOString(),
    moon: {
      sign: sky.moon.sign,
      formatted: sky.moon.formatted,
      house: wholeSignHouse(sky.moon.longitude, natal.ascendant),
      phase,
      waxing,
      illuminationPercent,
      nextApplying: contacts.next,
      lastSeparating: contacts.last,
    },
    sun: {
      sign: sky.sun.sign,
      formatted: sky.sun.formatted,
      house: wholeSignHouse(sky.sun.longitude, natal.ascendant),
    },
    retrograde: RETROGRADE_CHECKED.filter((body) => sky[body].retrograde),
    transits: hits.slice(0, MAX_TRANSITS_RETURNED),
  };
}
