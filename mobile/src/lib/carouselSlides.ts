/**
 * The three slides of the share carousel: one for each lens of the Triad.
 * Each slide uses only facts the other share cards already show. Never a name, birth date, time or place.
 */
export type Lens = 'vehicle' | 'road' | 'stoplight';
export const LENSES: readonly Lens[] = ['vehicle', 'road', 'stoplight'];

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

export interface CarouselChart {
  astrology: { tropicalSun: { sign: string }; tropicalMoon: { sign: string }; tropicalAscendant: number };
  numerology: { lifePath: number; destiny: number };
  humanDesign: { type: string; authority: string; profile: string };
}

export interface SlideFact { label: string; value: string }
export interface SlideContent {
  lens: Lens;
  name: string;
  question: string;
  facts: SlideFact[];
}

/** The sign a longitude from 0 to 360 falls in. */
export function signAt(degrees: number): string {
  const d = ((degrees % 360) + 360) % 360;
  return SIGNS[Math.floor(d / 30)];
}

/**
 * `birthNumber` is the single-digit (or master) number from the day of the month, worked out on the server.
 * It is left off until it arrives, so the slide never shows a guess. Only the reduced number is shown, never the day.
 */
export function slideContent(lens: Lens, chart: CarouselChart, birthTimeKnown: boolean, birthNumber: number | null = null): SlideContent {
  const { humanDesign: hd, numerology: num, astrology: astro } = chart;
  if (lens === 'vehicle') {
    return {
      lens, name: 'The Vehicle', question: 'How am I built to move?',
      facts: [
        { label: 'Type', value: hd.type },
        { label: 'Authority', value: hd.authority },
        { label: 'Profile', value: hd.profile.split(' ')[0] },
      ],
    };
  }
  if (lens === 'road') {
    const facts: SlideFact[] = [
      { label: 'Life Path', value: String(num.lifePath) },
      { label: 'Destiny', value: String(num.destiny) },
    ];
    if (birthNumber !== null) facts.push({ label: 'Birth Number', value: String(birthNumber) });
    return { lens, name: 'The Road', question: 'Where is my path taking me?', facts };
  }
  const facts: SlideFact[] = [{ label: 'Sun', value: astro.tropicalSun.sign }];
  if (birthTimeKnown) {
    facts.push({ label: 'Moon', value: astro.tropicalMoon.sign });
    facts.push({ label: 'Rising', value: signAt(astro.tropicalAscendant) });
  }
  return { lens, name: 'The Stoplight', question: 'When do I go, wait or slow down?', facts };
}
