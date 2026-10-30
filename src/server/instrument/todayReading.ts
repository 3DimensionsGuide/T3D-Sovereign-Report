/**
 * Today's reading, for the public instrument on the homepage.
 *
 * Every value here is computed from the real current date by the same engines the
 * paid reports use. Nothing is invented, nothing is sampled, and nothing is stored.
 * The point of the surface is that it is genuinely running before anybody types
 * anything, so the only input is the clock.
 *
 * The formulas stay on the server. The page receives results only: a gate number,
 * a day number, and a short table of positions for the hours of today.
 */

import { GATE_KEYNOTES } from '@/lib/report/section3/gate-content';
import { MOON_SIGNS, MOON_SIGN_READINGS, type MoonSignReading } from '@/lib/app/moonDay';
import { meaning, universalDayNumber } from '@/server/engines/dayNumerology';

const CENTER_NAME: Record<string, string> = {
  head: 'Head', ajna: 'Ajna', throat: 'Throat', g_center: 'G', heart: 'Heart',
  solar_plexus: 'Solar Plexus', sacral: 'Sacral', spleen: 'Spleen', root: 'Root',
};

/** One sample of the sky, on the hour, in UTC. */
export interface SkyHour {
  /** 0 to 24. 24 is midnight at the end of the day, so the track closes. */
  hour: number;
  /** Ecliptic longitude, degrees. */
  moon: number;
  sun: number;
  /** Moon minus Sun, 0 to 360. This is the elongation the phase is read from. */
  elongation: number;
  /** Lit fraction of the Moon's disc, 0 to 1. */
  lit: number;
  moonSign: string;
  phase: string;
}

export interface TodayReading {
  /** The UTC calendar date this reading is for. */
  date: string;
  /** The hour of the day the page was rendered on, so the surface can open on "now". */
  nowHour: number;
  vehicle: { gate: number; line: number; name: string; meaning: string; center: string };
  road: { number: number; label: string; theme: string; leanIn: string; watchFor: string };
  sky: {
    sunSign: string;
    sunDegree: number;
    hours: SkyHour[];
    /** Readings for every Moon sign the Moon actually passes through today. */
    signReadings: { sign: string; reading: MoonSignReading }[];
  };
}

/** The eight standard phase names, read from elongation. Nothing here is a judgement. */
function phaseName(elongation: number): string {
  if (elongation < 22.5 || elongation >= 337.5) return 'New';
  if (elongation < 67.5) return 'Waxing crescent';
  if (elongation < 112.5) return 'First quarter';
  if (elongation < 157.5) return 'Waxing gibbous';
  if (elongation < 202.5) return 'Full';
  if (elongation < 247.5) return 'Waning gibbous';
  if (elongation < 292.5) return 'Last quarter';
  return 'Waning crescent';
}

const signOf = (longitude: number): string => {
  const norm = ((longitude % 360) + 360) % 360;
  return MOON_SIGNS[Math.floor(norm / 30)] ?? MOON_SIGNS[0];
};

const round = (n: number, places = 2): number => {
  const f = 10 ** places;
  return Math.round(n * f) / f;
};

/**
 * Build the reading for a given instant. `at` defaults to now; the UTC date of that
 * instant is the day the surface reads. UTC is used rather than a visitor's own zone
 * because one page is rendered for everybody, and the surface says "UTC" on its face.
 *
 * Returns null if the ephemeris is unavailable, so a page can render an honest
 * "not reading" state instead of failing, at build time as well as at request time.
 */
export async function buildTodayReading(at: Date = new Date()): Promise<TodayReading | null> {
  try {
    const date = at.toISOString().slice(0, 10);

    // Loaded here rather than at the top of the file. The ephemeris is a native module,
    // and a static import would take the whole homepage down with it at build time on a
    // machine where it failed to compile. Imported inside the try, a missing ephemeris
    // just means the surface renders its offline state.
    const { getPlanetPositionsAtJD, localToJulianDay } = await import('@/server/engines/astrology');
    const { longitudeToGate } = await import('@/server/engines/human_design');

    const hours: SkyHour[] = [];
    for (let h = 0; h <= 24; h += 1) {
      const stamp = `${String(h % 24).padStart(2, '0')}:00`;
      const dayFor = h === 24
        ? new Date(Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate() + 1)).toISOString().slice(0, 10)
        : date;
      const jd = localToJulianDay(dayFor, stamp, 'UTC');
      const chart = getPlanetPositionsAtJD(jd, 0, 0, false);
      const moon = ((chart.moon.longitude % 360) + 360) % 360;
      const sun = ((chart.sun.longitude % 360) + 360) % 360;
      const elongation = ((moon - sun) % 360 + 360) % 360;
      hours.push({
        hour: h,
        moon: round(moon),
        sun: round(sun),
        elongation: round(elongation),
        lit: round((1 - Math.cos((elongation * Math.PI) / 180)) / 2, 3),
        moonSign: signOf(moon),
        phase: phaseName(elongation),
      });
    }

    const noon = hours[12] ?? hours[0];
    if (!noon) return null;

    const gateAt = longitudeToGate(noon.sun);
    const keynote = GATE_KEYNOTES[gateAt.gate];
    if (!keynote) return null;

    const dayNumber = universalDayNumber(date);
    const dayMeaning = meaning(dayNumber);

    const seen = new Set<string>();
    const signReadings: { sign: string; reading: MoonSignReading }[] = [];
    for (const h of hours) {
      if (seen.has(h.moonSign)) continue;
      seen.add(h.moonSign);
      const reading = MOON_SIGN_READINGS[h.moonSign as (typeof MOON_SIGNS)[number]];
      if (reading) signReadings.push({ sign: h.moonSign, reading });
    }

    return {
      date,
      nowHour: at.getUTCHours(),
      vehicle: {
        gate: gateAt.gate,
        line: gateAt.line,
        name: keynote.ichingName,
        meaning: keynote.coreMeaning,
        center: CENTER_NAME[keynote.center] ?? keynote.center,
      },
      road: {
        number: dayNumber,
        label: dayMeaning.label,
        theme: dayMeaning.theme,
        leanIn: dayMeaning.leanIn,
        watchFor: dayMeaning.watchFor,
      },
      sky: {
        sunSign: signOf(noon.sun),
        sunDegree: round(noon.sun % 30, 1),
        hours,
        signReadings,
      },
    };
  } catch {
    return null;
  }
}
