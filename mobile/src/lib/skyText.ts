import type { DailyAspect, MoonAspectContact, NatalPointName, SkyBody } from '@/lib/api';

/** Display-only wording for the Today screen. No calculations live here. */

const BODY_NAMES: Record<SkyBody, string> = {
  moon: 'Moon', sun: 'Sun', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto',
};

const NATAL_NAMES: Record<NatalPointName, string> = {
  sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', ascendant: 'Rising sign', midheaven: 'Midheaven',
};

const ASPECT_WORDS: Record<DailyAspect, string> = {
  conjunction: 'conjunct',
  sextile: 'sextile',
  square: 'square',
  trine: 'trine',
  opposition: 'opposite',
};

export const bodyName = (body: SkyBody): string => BODY_NAMES[body];
export const natalName = (point: NatalPointName): string => NATAL_NAMES[point];
export const aspectWord = (aspect: DailyAspect): string => ASPECT_WORDS[aspect];

/** General whole-sign house themes. */
const HOUSE_THEMES: Record<number, string> = {
  1: 'self, body, and how you show up',
  2: 'money, possessions, and self-worth',
  3: 'communication, learning, and errands',
  4: 'home, family, and roots',
  5: 'creativity, play, and romance',
  6: 'daily work, routines, and health habits',
  7: 'partnerships and one-to-one bonds',
  8: 'shared resources, intimacy, and change',
  9: 'beliefs, travel, and study',
  10: 'career and public role',
  11: 'friends, groups, and hopes',
  12: 'rest, solitude, and the unseen',
};
export const houseTheme = (house: number): string => HOUSE_THEMES[house] ?? '';

export function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

/** "within the hour", "in about 5 hours". */
export function hoursPhrase(hours: number, direction: 'ahead' | 'behind'): string {
  const rounded = Math.round(hours);
  if (rounded < 1) return direction === 'ahead' ? 'within the hour' : 'within the last hour';
  const unit = rounded === 1 ? 'hour' : 'hours';
  return direction === 'ahead' ? `in about ${rounded} ${unit}` : `about ${rounded} ${unit} ago`;
}

export function contactSentence(contact: MoonAspectContact, direction: 'ahead' | 'behind'): string {
  return `${aspectWord(contact.aspect)} your ${natalName(contact.natal)}, ${hoursPhrase(contact.approxHours, direction)}`;
}

/** The framework's reading of the Moon's phase. */
export function phaseMeaning(waxing: boolean, phase?: string): string {
  if (phase === 'New Moon') return 'Dark sky: a time for quiet, setting intentions, and beginning again.';
  if (phase === 'Full Moon') return 'Fullest light: a time of clarity, culmination, and release.';
  return waxing
    ? 'Waxing light: a time for building, growing, and gathering.'
    : 'Waning light: a time for releasing, harvesting, and consolidating.';
}

export function moonGlyph(phase: string): string {
  switch (phase) {
    case 'New Moon': return '🌑';
    case 'Waxing Crescent': return '🌒';
    case 'First Quarter': return '🌓';
    case 'Waxing Gibbous': return '🌔';
    case 'Full Moon': return '🌕';
    case 'Waning Gibbous': return '🌖';
    case 'Last Quarter': return '🌗';
    default: return '🌘';
  }
}

/** Capitalises the first letter, for lines that are joined after a full stop. */
export const capFirst = (text: string): string => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text);

/**
 * The Lord of the Year line comes from the ten-year Firdaria texts ("A decade ruled by ..."),
 * which is the wrong span for a one-year house. This rewrites it to a year.
 */
export const yearQuote = (quote: string): string => quote.replace(/^A decade ruled by/, 'A year ruled by');
