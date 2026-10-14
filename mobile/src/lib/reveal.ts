/**
 * The chart reveal shown right after the chart is built: one hero fact per lens, each with one plain line
 * that comes straight from the person's own chart. Pure, with no imports, so tests can use it directly.
 */
export type RevealLens = 'vehicle' | 'road' | 'stoplight';

export interface RevealStage {
  lens: RevealLens;
  /** The lens name, as written everywhere else in the app. */
  label: string;
  /** The one big fact. */
  hero: string;
  /** One supporting line drawn from the same chart. */
  line: string;
}

/** The slice of the chart the reveal reads. */
export interface RevealChart {
  humanDesign: { type: string; authority: string; strategy: string };
  numerology: { lifePath: number; destiny: number; soulUrge: number };
  astrology: { tropicalSun: { sign: string }; tropicalMoon: { sign: string }; tropicalAscendant: number };
}

export const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

/** The sign an ecliptic longitude (0 to 360 degrees) falls in. */
export function signOfLongitude(longitude: number): string {
  const wrapped = ((longitude % 360) + 360) % 360;
  return SIGNS[Math.floor(wrapped / 30)];
}

export function buildReveal(chart: RevealChart, birthTimeKnown: boolean): RevealStage[] {
  const { humanDesign: hd, numerology: num, astrology: astro } = chart;
  return [
    {
      lens: 'vehicle',
      label: 'The Vehicle',
      hero: hd.type,
      line: `Strategy: ${hd.strategy}. Authority: ${hd.authority}.`,
    },
    {
      lens: 'road',
      label: 'The Road',
      hero: `Life Path ${num.lifePath}`,
      line: `Destiny ${num.destiny} · Soul Urge ${num.soulUrge}`,
    },
    {
      lens: 'stoplight',
      label: 'The Stoplight',
      hero: `Sun in ${astro.tropicalSun.sign}`,
      line: birthTimeKnown
        ? `Moon in ${astro.tropicalMoon.sign} · Rising ${signOfLongitude(astro.tropicalAscendant)}`
        : 'Add your birth time later to reveal your Rising sign.',
    },
  ];
}

/** The first thing the person reads on Today, in their own Type and Authority. */
export function firstRunLine(chart: RevealChart): string {
  const { type, authority, strategy } = chart.humanDesign;
  return `You are a ${type} with ${authority} authority. Your strategy: ${strategy}.`;
}
