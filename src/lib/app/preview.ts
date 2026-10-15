/**
 * The first-launch preview: what a birth date alone can honestly show.
 * The Life Path comes from the date only. The Sun sign needs the date only too,
 * except on the day the Sun changes sign, where the birth time and place decide.
 * Nothing about the person is saved or logged.
 */

import { LIFE_PATH_CONTENT } from '@/lib/report/section4/road-content';
import { GATE_KEYNOTES } from '@/lib/report/section3/gate-content';
import { SIGN_ELEMENT, SUN_SIGN_CONTENT } from '@/lib/report/section5/astro-content';

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

export interface BirthPreview {
  lifePath: { number: number; name: string; direction: string; plain: string };
  sun: { sign: string; element: string; orientation: string; cusp: boolean };
  /** The Human Design gate the Sun was in, which a birth date alone can show. Type, Strategy and Authority need the birth time. */
  vehicle: { gate: number; name: string; meaning: string; center: string; cusp: boolean } | null;
  /** What the full chart adds, so the visitor sees what is waiting. */
  locked: string[];
}

const CENTER_NAME: Record<string, string> = {
  head: 'Head', ajna: 'Ajna', throat: 'Throat', g_center: 'G', heart: 'Heart',
  solar_plexus: 'Solar Plexus', sacral: 'Sacral', spleen: 'Spleen', root: 'Root',
};

export const PREVIEW_LOCKED = [
  'Your Human Design Type, Strategy and Authority',
  'Your Rising sign and houses',
  'Your Moon sign',
  'Today’s reading, written for your chart',
  'Your 7-day practice and decision log',
];

/** Master numbers (11, 22, 33) have their own entry; fall back to the plain root if one is missing. */
function lifePathEntry(n: number) {
  return LIFE_PATH_CONTENT[n] ?? LIFE_PATH_CONTENT[({ 11: 2, 22: 4, 33: 6 } as Record<number, number>)[n] ?? n] ?? null;
}

/** The Sun's gate as the route works it out (the engine needs the ephemeris, so this file only receives the answer). */
export interface SunGate { gate: number; nearEdge: boolean }

export function buildBirthPreview(lifePathNumber: number, sunLongitude: number, sunGate?: SunGate): BirthPreview | null {
  const entry = lifePathEntry(lifePathNumber);
  const norm = ((sunLongitude % 360) + 360) % 360;
  const sign = SIGNS[Math.floor(norm / 30)] ?? 'Aries';
  const content = SUN_SIGN_CONTENT[sign];
  if (!entry || !content) return null;
  const degree = norm % 30;
  return {
    lifePath: { number: lifePathNumber, name: entry.name, direction: entry.direction, plain: entry.plain },
    sun: {
      sign,
      element: SIGN_ELEMENT[sign] ?? '',
      orientation: content.orientation,
      // The Sun moves about one degree a day, and a date has no time of day.
      cusp: degree < 1 || degree > 29,
    },
    vehicle: vehicleFor(sunGate),
    locked: PREVIEW_LOCKED,
  };
}

function vehicleFor(sunGate: SunGate | undefined): BirthPreview['vehicle'] {
  const key = sunGate ? GATE_KEYNOTES[sunGate.gate] : undefined;
  if (!sunGate || !key) return null;
  return {
    gate: sunGate.gate,
    name: key.ichingName,
    meaning: key.coreMeaning,
    center: `${CENTER_NAME[key.center] ?? ''} Center`.trim(),
    cusp: sunGate.nearEdge,
  };
}
