import type { WheelBody, WheelChart } from '../charts/chartTypes';

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
