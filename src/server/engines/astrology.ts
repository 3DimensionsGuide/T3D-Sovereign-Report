/**
 * T3D Astrology Engine — Tropical & Sidereal Natal Charts
 *
 * Uses the `swisseph` npm package wrapping the Swiss Ephemeris C library.
 *
 * Implements:
 *   - Julian Day Number conversion (local time → UTC → JD)
 *   - Tropical planetary positions (all 13 HD bodies)
 *   - Sidereal positions via Lahiri Ayanamsha (official Indian government standard)
 *   - Whole Sign house cusps and ASC/MC
 *   - Full result formatting (degrees, minutes, sign)
 *
 * Setup:
 *   npm install swisseph luxon
 *   npm install --save-dev @types/luxon
 *
 * Ephemeris files (optional but recommended for precision past 600 AD):
 *   Download DE431 files from ftp://ftp.astro.com/pub/swisseph/ephe/
 *   Set EPHE_PATH env var to their local directory.
 *   Without files, the engine falls back to Moshier algorithm (±0.01° accuracy).
 */

import type {
  AstrologyInput,
  AstrologyResult,
  ChartData,
  PlanetPosition,
  HouseData,
  ZodiacSign,
} from './types';
import { DateTime } from 'luxon';

// ─── SWISSEPH IMPORT & CONSTANTS ─────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-var-requires
const swisseph = require('swisseph') as SwissEph;

/** Minimal typing for the swisseph native module */
interface SweCalcResult {
  longitude: number;
  latitude: number;
  distance: number;
  longitudeSpeed: number;
  latitudeSpeed: number;
  distanceSpeed: number;
  rflag: number;
  error?: string;
}

interface SweHousesResult {
  house: number[]; // array of 13 elements; [1]...[12] are the cusps
  ascendant: number;
  mc: number;
  armc: number;
  vertex: number;
  equatorialAscendant: number;
  error?: string;
}

interface SwissEph {
  // Constants
  SE_GREG_CAL: number;
  SE_JUL_CAL: number;
  SEFLG_SPEED: number;
  SEFLG_SIDEREAL: number;
  SEFLG_MOSEPH: number;
  SE_SIDM_LAHIRI: number;
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
  SE_TRUE_NODE: number;
  // Methods
  swe_set_ephe_path: (path: string) => void;
  swe_julday: (year: number, month: number, day: number, hour: number, cal: number) => number;
  swe_calc_ut: (tjdUt: number, ipl: number, iflag: number) => SweCalcResult;
  swe_houses_ex: (tjdUt: number, iflag: number, lat: number, lon: number, hsys: number) => SweHousesResult;
  swe_set_sid_mode: (sidMode: number, t0: number, ayanT0: number) => void;
  swe_close: () => void;
}

// Planet identifiers
const PLANET_IDS = {
  sun:       swisseph.SE_SUN,
  moon:      swisseph.SE_MOON,
  mercury:   swisseph.SE_MERCURY,
  venus:     swisseph.SE_VENUS,
  mars:      swisseph.SE_MARS,
  jupiter:   swisseph.SE_JUPITER,
  saturn:    swisseph.SE_SATURN,
  uranus:    swisseph.SE_URANUS,
  neptune:   swisseph.SE_NEPTUNE,
  pluto:     swisseph.SE_PLUTO,
  northNode: swisseph.SE_TRUE_NODE,
} as const;

const ZODIAC_SIGNS: ZodiacSign[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

// House system ASCII code: 'W' = 87 = Whole Sign
const WHOLE_SIGN_HSYS = 87;

// ─── EPHEMERIS SETUP ─────────────────────────────────────────────────────────

let ephemerisInitialized = false;

function initEphemeris(): void {
  if (ephemerisInitialized) return;
  const ephePath = process.env.EPHE_PATH ?? '';
  if (ephePath) {
    swisseph.swe_set_ephe_path(ephePath);
  }
  ephemerisInitialized = true;
}

// ─── JULIAN DAY CALCULATION ───────────────────────────────────────────────────

/**
 * Convert a local birth date + time + IANA timezone to a Julian Day Number (UT).
 *
 * Flow: Local Time → UTC (via IANA timezone) → Julian Day Number
 */
export function localToJulianDay(
  dateStr: string,  // YYYY-MM-DD
  timeStr: string,  // HH:MM
  timezone: string, // IANA e.g. "America/Los_Angeles"
): number {
  // Parse as local datetime in the given timezone, then convert to UTC
  const localDt = DateTime.fromISO(`${dateStr}T${timeStr}:00`, { zone: timezone });
  if (!localDt.isValid) {
    throw new Error(`Invalid date/time/timezone: ${dateStr} ${timeStr} ${timezone} — ${localDt.invalidReason}`);
  }

  const utc = localDt.toUTC();
  // Swiss Ephemeris expects hour as decimal
  const hourDecimal = utc.hour + utc.minute / 60 + utc.second / 3600;

  return swisseph.swe_julday(
    utc.year,
    utc.month,
    utc.day,
    hourDecimal,
    swisseph.SE_GREG_CAL,
  );
}

// ─── POSITION FORMATTING ─────────────────────────────────────────────────────

/**
 * Format a raw ecliptic longitude (0–360°) into a structured PlanetPosition.
 */
function formatPosition(longitude: number, latitude: number, speed: number): PlanetPosition {
  // Normalise to 0–360
  const lon = ((longitude % 360) + 360) % 360;

  const signIndex = Math.floor(lon / 30);
  const sign = ZODIAC_SIGNS[signIndex];
  const degreeInSign = lon - signIndex * 30;
  const wholeDeg = Math.floor(degreeInSign);
  const minuteInSign = Math.floor((degreeInSign - wholeDeg) * 60);

  return {
    longitude: lon,
    latitude,
    speed,
    retrograde: speed < 0,
    sign,
    degreeInSign,
    minuteInSign,
    formatted: `${wholeDeg}°${String(minuteInSign).padStart(2, '0')}' ${sign}`,
  };
}

// ─── PLANET CALCULATION ───────────────────────────────────────────────────────

/**
 * Compute all 13 planetary positions for a given Julian Day.
 * isSidereal: when true, applies Lahiri ayanamsha correction.
 */
export function getPlanetPositionsAtJD(
  jd: number,
  latitude: number,
  longitude: number,
  isSidereal: boolean,
): ChartData {
  initEphemeris();

  // Base flags: always include speed; use Moshier as fallback if no ephe files
  const baseFlags = swisseph.SEFLG_SPEED |
    (process.env.EPHE_PATH ? 0 : swisseph.SEFLG_MOSEPH);

  let flags = baseFlags;

  if (isSidereal) {
    swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);
    flags |= swisseph.SEFLG_SIDEREAL;
  }

  /**
   * Helper: calculate one planet and throw a descriptive error on failure.
   */
  function calcPlanet(planetKey: keyof typeof PLANET_IDS): PlanetPosition {
    const result = swisseph.swe_calc_ut(jd, PLANET_IDS[planetKey], flags);
    if (result.error) {
      throw new Error(`swisseph.swe_calc_ut failed for ${planetKey}: ${result.error}`);
    }
    return formatPosition(result.longitude, result.latitude, result.longitudeSpeed);
  }

  // Calculate all named planets
  const sun       = calcPlanet('sun');
  const moon      = calcPlanet('moon');
  const mercury   = calcPlanet('mercury');
  const venus     = calcPlanet('venus');
  const mars      = calcPlanet('mars');
  const jupiter   = calcPlanet('jupiter');
  const saturn    = calcPlanet('saturn');
  const uranus    = calcPlanet('uranus');
  const neptune   = calcPlanet('neptune');
  const pluto     = calcPlanet('pluto');
  const northNode = calcPlanet('northNode');

  // Earth = anti-Sun (Sun longitude + 180°)
  const earthLon = (sun.longitude + 180) % 360;
  const earth = formatPosition(earthLon, -sun.latitude, sun.speed);

  // South Node = anti-North Node
  const southLon = (northNode.longitude + 180) % 360;
  const southNode = formatPosition(southLon, -northNode.latitude, northNode.speed);

  // ── Whole Sign house cusps ────────────────────────────────────────────────
  const houseFlags = isSidereal ? swisseph.SEFLG_SIDEREAL : 0;
  const houseResult = swisseph.swe_houses_ex(jd, houseFlags, latitude, longitude, WHOLE_SIGN_HSYS);

  if (houseResult.error) {
    throw new Error(`swisseph.swe_houses_ex failed: ${houseResult.error}`);
  }

  // Under Whole Sign, house[1] is the ASC sign start; cusps are every 30° thereafter
  // The ASC degree determines which sign is House 1; each house = one full sign
  const ascDegree = houseResult.ascendant;
  const ascSignIndex = Math.floor(((ascDegree % 360) + 360) % 360 / 30);
  const wholeCusps: number[] = Array.from({ length: 12 }, (_, i) => ((ascSignIndex + i) % 12) * 30);

  const houses: HouseData = {
    cusps: wholeCusps,
    ascendant: ascDegree,
    mc: houseResult.mc,
    system: 'Whole Sign',
  };

  return {
    sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune,
    pluto, northNode, southNode, earth, houses,
  };
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

/**
 * Calculate the complete natal chart for a birth event.
 * Returns both tropical and Lahiri sidereal positions.
 */
export function calculateAstrology(input: AstrologyInput): AstrologyResult {
  const { birthDate, birthTime, latitude, longitude, timezone } = input;

  const jd = localToJulianDay(birthDate, birthTime, timezone);

  const tropical = getPlanetPositionsAtJD(jd, latitude, longitude, false);
  const sidereal = getPlanetPositionsAtJD(jd, latitude, longitude, true);

  return { tropical, sidereal, julianDay: jd };
}
