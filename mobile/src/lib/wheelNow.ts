import type { WheelAspect, WheelBody, WheelChart, WheelPoint } from '../charts/chartTypes';
import type { WheelNowContact } from '../charts/wheel';

/**
 * Today's planets for the wheel's outer ring. Pure arithmetic on positions the server already sent:
 * which sign each planet is in, which of your whole-sign houses it moves through, and how to shift the
 * tropical positions into the sidereal zodiac (every point moves by the same amount).
 */
export interface NowPlanet {
  body: WheelBody;
  longitude: number;
  retrograde: boolean;
}

export interface NowRow {
  body: WheelBody;
  /** Like "9°25' Leo". */
  formatted: string;
  retrograde: boolean;
  /** The whole-sign house of your chart it moves through (1 to 12). */
  house: number;
}

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

const norm = (deg: number): number => ((deg % 360) + 360) % 360;

/** How far the sidereal zodiac sits from the tropical one, from the same planet in both charts. */
export function zodiacShift(tropical: WheelChart, sidereal: WheelChart): number {
  const t = tropical.planets.find((p) => p.body === 'sun');
  const s = sidereal.planets.find((p) => p.body === 'sun');
  return t && s ? norm(s.longitude - t.longitude) : 0;
}

/** Positions from the server (tropical), shifted into the zodiac being shown. */
export function nowPlanets(
  positions: ReadonlyArray<{ body: string; longitude: number; retrograde: boolean }>,
  shift: number,
): NowPlanet[] {
  return positions.map((p) => ({ body: p.body as WheelBody, longitude: norm(p.longitude + shift), retrograde: p.retrograde }));
}

export function formatPlace(longitude: number): string {
  const lon = norm(longitude);
  const idx = Math.floor(lon / 30);
  const inSign = lon - idx * 30;
  const deg = Math.floor(inSign);
  const min = Math.floor((inSign - deg) * 60);
  return `${deg}°${String(min).padStart(2, '0')}' ${SIGNS[idx]}`;
}

export function nowRows(chart: WheelChart, planets: readonly NowPlanet[]): NowRow[] {
  const ascSign = Math.floor(norm(chart.ascendant) / 30);
  return planets.map((p) => ({
    body: p.body,
    formatted: formatPlace(p.longitude),
    retrograde: p.retrograde,
    house: ((Math.floor(norm(p.longitude) / 30) - ascSign + 12) % 12) + 1,
  }));
}

// ─── today's contacts with your birth chart ──────────────────────────────────

const ASPECT_ANGLES: Record<WheelAspect, number> = { conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180 };
/** The same rules as the Today screen: the Moon and fast planets count within 3 degrees, slower ones only when nearly exact. */
const FAST: readonly WheelBody[] = ['sun', 'moon', 'mercury', 'venus', 'mars'];
const ACTIVE_ORB = 3;
const PEAK_ORB = 1;
/** The points of your chart that today's planets are measured against. */
const TARGETS: readonly WheelPoint[] = ['ascendant', 'midheaven', 'sun', 'moon', 'mercury', 'venus', 'mars'];
export const MAX_CONTACTS = 12;

const gap = (a: number, b: number): number => {
  const d = Math.abs(norm(a) - norm(b));
  return d > 180 ? 360 - d : d;
};

function natalLongitude(chart: WheelChart, point: WheelPoint): number | null {
  if (point === 'ascendant') return chart.ascendant;
  if (point === 'midheaven') return chart.midheaven;
  return chart.planets.find((p) => p.body === point)?.longitude ?? null;
}

/** Aspects between today's planets and your birth chart, closest first. */
export function nowContacts(chart: WheelChart, planets: readonly NowPlanet[]): WheelNowContact[] {
  const out: WheelNowContact[] = [];
  for (const p of planets) {
    const limit = FAST.includes(p.body) ? ACTIVE_ORB : PEAK_ORB;
    for (const target of TARGETS) {
      const nl = natalLongitude(chart, target);
      if (nl === null) continue;
      for (const aspect of Object.keys(ASPECT_ANGLES) as WheelAspect[]) {
        const orb = Math.abs(gap(p.longitude, nl) - ASPECT_ANGLES[aspect]);
        if (orb > limit) continue;
        out.push({ transit: p.body, natal: target, aspect, orb, peak: orb <= PEAK_ORB });
      }
    }
  }
  out.sort((a, b) => a.orb - b.orb);
  return out.slice(0, MAX_CONTACTS);
}
