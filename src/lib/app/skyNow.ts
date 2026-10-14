/**
 * The public "sky now" for the welcome screen: the Moon tonight, with no person attached.
 * Nothing here depends on a chart, so it can be shown before anyone has typed anything.
 */

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

export interface SkyNow {
  moonSign: string;
  phase: string;
  waxing: boolean;
  illuminationPercent: number;
}

/** The zodiac sign a tropical longitude (degrees, any value) falls in. */
export function signOfLongitude(longitude: number): string {
  const wrapped = ((longitude % 360) + 360) % 360;
  return SIGNS[Math.floor(wrapped / 30)]!;
}
