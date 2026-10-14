/**
 * The Moon's day for the Timeline's Stoplight lens (server-side only).
 *
 * The Moon changes sign every two to three days, so a day has one sign, or two when it crosses a boundary that
 * day. Each sign is read three ways from the T3D knowledge base (what the day feels like and favors, where it
 * tips over, and what to do with it), plus the house of the person's chart the Moon is moving through.
 * Conditions, never commands.
 */

import { HOUSE_NAMES, HOUSE_THEMES } from '@/lib/report/advanced/stoplight/transits-content';

export const MOON_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

export interface MoonSignReading {
  theme: string;
  shadow: string;
  guidance: string;
}

export const MOON_SIGN_READINGS: Record<(typeof MOON_SIGNS)[number], MoonSignReading> = {
  Aries: {
    theme: 'A fast, fiery surge of initiative, courage, and spontaneous energy that favors starting something and taking direct action.',
    shadow: 'It tips over into impatience, sudden irritability, reckless impulsiveness, and burning through your energy too quickly.',
    guidance: 'Channel the spark into focused short sprints and pace yourself so you do not burn out or act selfishly.',
  },
  Taurus: {
    theme: 'A grounded, methodical, sensory mood that favors slowing down, physical comfort, and building steady stability.',
    shadow: 'It tips over into stubborn resistance to change, inertia, self-indulgence, or getting stuck in comfortable routines.',
    guidance: 'Savor tactile pleasures and make steady progress while staying willing to adapt if circumstances ask for it.',
  },
  Gemini: {
    theme: 'A nimble, mentally active, inquisitive mood that favors lively conversation, learning, and gathering new information.',
    shadow: 'It tips over into restlessness, scattered focus, and feeling overwhelmed by too many options at once.',
    guidance: 'Follow your curiosity and trade ideas with others, but narrow your focus to two or three priorities.',
  },
  Cancer: {
    theme: 'A deeply emotional, protective, caring climate that favors staying close to home and nourishing yourself and loved ones.',
    shadow: 'It tips over into hypersensitivity, defensive armor, moodiness, and clingy insecurity.',
    guidance: 'Make a comfortable, safe space and honor your feelings without getting swept into reactive moods.',
  },
  Leo: {
    theme: 'Warm, radiant emotional energy that favors creative self-expression, leadership, and sharing authentic joy from the heart.',
    shadow: 'It tips over when the need for attention or status turns into drama, vanity, and thirst for outside validation.',
    guidance: 'Radiate your natural light and use your warmth to lift others without demanding the spotlight.',
  },
  Virgo: {
    theme: 'A practical, analytical mood that favors sorting details, solving problems, and improving how things work.',
    shadow: 'It tips over into nitpicking, nagging, and paralysis by analysis when minor flaws crowd out the bigger picture.',
    guidance: 'Use your discernment to be of service and refine everyday systems, accepting that perfect is not required.',
  },
  Libra: {
    theme: 'An emotional weather that favors connection, diplomatic conversation, beauty, and weighing perspectives fairly.',
    shadow: 'It tips over into indecision, contrary arguing, or avoiding disagreement by overthinking every option.',
    guidance: 'Look for fair, balanced cooperation and build real bridges without giving up your own clear choice.',
  },
  Scorpio: {
    theme: 'A deep, intense mood that favors focus, research, and getting beneath the surface to what is really going on.',
    shadow: 'It tips over into guarded suspicion, mistrust, and holding grudges when protection hardens into obsession.',
    guidance: 'Put your instinctive depth toward focused work and real emotional change, and stay open to trust.',
  },
  Sagittarius: {
    theme: 'An optimistic, adventurous mood that favors widening your horizons, learning, and pursuing something meaningful.',
    shadow: 'It tips over into restless agitation, preachiness, or big promises that overlook the practical details.',
    guidance: 'Aim your enthusiasm at exploring new ideas and uplifting pursuits without overcommitting.',
  },
  Capricorn: {
    theme: 'A grounded, pragmatic atmosphere that favors structure, duties, and long-term goals.',
    shadow: 'It tips over into pessimism, emotional rigidity, standoffishness, or a long list of reasons it cannot work.',
    guidance: 'Make steady, methodical progress on the essentials and leave room for personal warmth.',
  },
  Aquarius: {
    theme: 'An intellectual, humanitarian mood that favors objective problem-solving, group projects, and fresh ideas.',
    shadow: 'It tips over into emotional detachment, stubborn dogma, or feeling like an outsider disconnected from others.',
    guidance: 'Bring your inventive view to shared projects and make the effort to stay personally connected.',
  },
  Pisces: {
    theme: 'A soulful, empathetic mood that favors creativity, quiet intuition, and reflection.',
    shadow: 'It tips over into emotional overwhelm, flakiness, boundaryless self-sacrifice, or escaping from daily reality.',
    guidance: 'Make room for rest, reflection, and creative expression while keeping clear boundaries to protect your energy.',
  },
};

export interface MoonDaySegment {
  sign: string;
  /** The house of the person's chart (whole signs from the Rising sign) the Moon moves through. */
  house: number;
  houseName: string;
  houseTheme: string;
  /** When the Moon enters this sign during the day (ISO, UTC); null when it was already here at the start. */
  from: string | null;
  /** When the Moon leaves this sign (ISO, UTC). */
  until: string;
  reading: MoonSignReading;
}

export interface MoonDay {
  dayIndex: number;
  segments: MoonDaySegment[];
}

/** Julian day (UT) to an ISO timestamp. */
const jdToIso = (jd: number): string => new Date((jd - 2440587.5) * 86400000).toISOString();

const norm = (lon: number): number => ((lon % 360) + 360) % 360;
const signIdx = (lon: number): number => Math.floor(norm(lon) / 30);

/** The next moment after `jd` that the Moon is in a different sign (found by stepping, then bisecting). */
function nextSignChange(jd: number, lonAt: (jd: number) => number): number {
  const start = signIdx(lonAt(jd));
  let lo = jd;
  let hi = jd;
  const step = 0.125;
  for (let i = 0; i < 40; i++) {
    hi = lo + step;
    if (signIdx(lonAt(hi)) !== start) break;
    lo = hi;
  }
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (signIdx(lonAt(mid)) === start) lo = mid;
    else hi = mid;
  }
  return hi;
}

/**
 * The Moon's sign stretches that overlap the day that starts at `startJd`, with the house each falls in.
 * `lonAt` is the Moon's ecliptic longitude at a Julian day; `ascendant` is the person's Rising longitude.
 */
export function buildMoonDay(startJd: number, ascendant: number, lonAt: (jd: number) => number): MoonDaySegment[] {
  const endJd = startJd + 1;
  const out: MoonDaySegment[] = [];
  let at = startJd;
  let from: number | null = null;
  while (at < endJd && out.length < 3) {
    const lon = lonAt(at + 1e-6);
    const sign = MOON_SIGNS[signIdx(lon)]!;
    const until = nextSignChange(at + 1e-6, lonAt);
    const house = ((signIdx(lon) - signIdx(ascendant) + 12) % 12) + 1;
    out.push({
      sign,
      house,
      houseName: HOUSE_NAMES[house] ?? '',
      houseTheme: HOUSE_THEMES[house] ?? '',
      from: from === null ? null : jdToIso(from),
      until: jdToIso(until),
      reading: MOON_SIGN_READINGS[sign],
    });
    from = until;
    at = until;
  }
  return out;
}
