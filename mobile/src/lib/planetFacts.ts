import type { DailyTransitHit, SkyPosition } from './api';
import { SIGN_NAMES } from './skyRing';

/**
 * What can be said about one planet in today's sky, from facts the app already has: where it is, which of
 * the person's houses it moves through, how long it stays in a sign, and which contacts it makes to their chart.
 * Nothing here is a prediction or a rule; the words are the same plain ones used elsewhere in the app.
 */

type Body = SkyPosition['body'];

export const TEMPO: Record<Body, string> = {
  sun: 'The Sun spends about a month in each sign.',
  moon: 'The Moon changes sign about every two and a half days, so its sign colours one short stretch.',
  mercury: 'Mercury usually stays two to four weeks in a sign, longer around a retrograde.',
  venus: 'Venus usually stays about four weeks in a sign, longer around a retrograde.',
  mars: 'Mars stays about six to seven weeks in a sign.',
  jupiter: 'Jupiter stays about a year in each sign.',
  saturn: 'Saturn stays about two and a half years in each sign.',
  uranus: 'Uranus stays about seven years in each sign, so its sign is shared by a whole generation.',
  neptune: 'Neptune stays about fourteen years in each sign, so its sign is shared by a whole generation.',
  pluto: 'Pluto stays between twelve and thirty years in a sign, so its sign is shared by several generations.',
};

/** Whole-sign house (1 to 12) a longitude falls in, counting from the sign of the person's Ascendant. */
export function houseFor(longitude: number, ascendant: number): number {
  const sign = (l: number) => Math.floor((((l % 360) + 360) % 360) / 30);
  return ((sign(longitude) - sign(ascendant) + 12) % 12) + 1;
}

/** Where in its sign a planet stands, in plain words. */
export function signStage(degree: number): string {
  if (degree < 10) return 'early in the sign';
  if (degree < 20) return 'in the middle of the sign';
  return 'late in the sign, close to moving on';
}

export function signOfBody(longitude: number): string {
  return SIGN_NAMES[Math.floor((((longitude % 360) + 360) % 360) / 30)]!;
}

/** The contacts today's transit list shows for this planet, tightest first (the list is already sorted that way). */
export function contactsFor(body: Body, transits: readonly DailyTransitHit[]): DailyTransitHit[] {
  return transits.filter((t) => t.transiting === body);
}

export function retrogradeNote(body: Body): string {
  return body === 'sun' || body === 'moon'
    ? ''
    : 'It is moving backward from our point of view. Astrologers read that as a time to review and revisit that planet’s themes, not to push them.';
}
