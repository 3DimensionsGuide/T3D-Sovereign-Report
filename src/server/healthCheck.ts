/**
 * The deployed accuracy check behind /api/health.
 *
 * The golden tests run on a developer computer. Production runs on Vercel with its own
 * copy of the ephemeris code, so this recalculates three reference charts there and
 * compares a few key numbers with the values the golden tests lock in. If Vercel ever
 * produces different numbers, the health route says so.
 *
 * The reference charts are synthetic (no real people). The expected values below come
 * from tests/golden/snapshot.json. If that snapshot is ever refreshed on purpose,
 * refresh these too (tests/app/health.test.ts fails until you do).
 */

import { calculateAstrology } from '@/server/engines/astrology';
import { calculateHumanDesign } from '@/server/engines/human_design';
import { calculateNumerology } from '@/server/engines/numerology';

const TOLERANCE = 0.002; // degrees, the same as the golden tests

interface Reference {
  id: string;
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  timezone: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  sun: number;
  moon: number;
  ascendant: number;
  northNode: number;
  type: string;
  authority: string;
  profile: string;
  lifePath: number;
}

export const REFERENCES: readonly Reference[] = [
  {
    id: 'la-1990', birthDate: '1990-11-12', birthTime: '15:42', latitude: 34.0522, longitude: -118.2437,
    timezone: 'America/Los_Angeles', firstName: 'Alex', middleName: 'Jordan', lastName: 'Smith',
    sun: 230.331, moon: 181.333, ascendant: 28.677, northNode: 301.134,
    type: 'Projector', authority: 'Mental', profile: '2/4', lifePath: 6,
  },
  {
    id: 'london-newyear-1975', birthDate: '1975-01-01', birthTime: '00:00', latitude: 51.5074, longitude: -0.1278,
    timezone: 'Europe/London', firstName: 'John', lastName: 'Henry',
    sun: 279.935, moon: 139.188, ascendant: 186.98, northNode: 249.959,
    type: 'Manifestor', authority: 'Splenic', profile: '1/3', lifePath: 6,
  },
  {
    id: 'sydney-leapday-2000', birthDate: '2000-02-29', birthTime: '12:00', latitude: -33.8688, longitude: 151.2093,
    timezone: 'Australia/Sydney', firstName: 'Zoe', middleName: 'Ray', lastName: 'Yoder',
    sun: 339.746, moon: 270.122, ascendant: 45.401, northNode: 123.187,
    type: 'Generator', authority: 'Emotional', profile: '5/1', lifePath: 6,
  },
];

function near(want: number, got: number): boolean {
  const d = Math.abs(want - got) % 360;
  return Math.min(d, 360 - d) <= TOLERANCE;
}

/** Names of the checks that did not match. Empty means every number agrees. */
export function compareReference(ref: Reference): string[] {
  const input = {
    birthDate: ref.birthDate, birthTime: ref.birthTime,
    latitude: ref.latitude, longitude: ref.longitude, timezone: ref.timezone,
  };
  const astro = calculateAstrology(input);
  const hd = calculateHumanDesign(input);
  const num = calculateNumerology({
    firstName: ref.firstName, middleName: ref.middleName, lastName: ref.lastName, birthDate: ref.birthDate,
  });
  const t = astro.tropical;
  const asc = ((t.houses.ascendant % 360) + 360) % 360;
  const misses: string[] = [];
  if (!near(ref.sun, t.sun.longitude)) misses.push('sun');
  if (!near(ref.moon, t.moon.longitude)) misses.push('moon');
  if (!near(ref.ascendant, asc)) misses.push('ascendant');
  if (!near(ref.northNode, t.northNode.longitude)) misses.push('northNode');
  if (hd.type !== ref.type) misses.push('type');
  if (hd.authority !== ref.authority) misses.push('authority');
  if (hd.profile !== ref.profile) misses.push('profile');
  if (num.lifePath !== ref.lifePath) misses.push('lifePath');
  return misses;
}

export type EngineStatus = 'ok' | 'mismatch' | 'error';

/** Recalculates every reference chart. Never throws. */
export function checkEngine(): { status: EngineStatus; misses: string[] } {
  try {
    const misses: string[] = [];
    for (const ref of REFERENCES) {
      for (const m of compareReference(ref)) misses.push(`${ref.id}:${m}`);
    }
    return { status: misses.length === 0 ? 'ok' : 'mismatch', misses };
  } catch (error: unknown) {
    console.error('[Health] Engine check failed:', error instanceof Error ? error.message : 'unknown');
    return { status: 'error', misses: [] };
  }
}
