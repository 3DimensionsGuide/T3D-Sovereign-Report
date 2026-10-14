import type { SkyPosition } from './api';
import { wheelPoint } from './transitWheel';

/**
 * "The sky now": the zodiac as a ring with every body where it is today. Aries starts at the left, the same
 * as the other wheels in the app. Bodies close together are moved to different distances from the ring so no
 * two glyphs sit on top of each other.
 */

const TEXT = '︎';
export const BODY_GLYPH: Record<SkyPosition['body'], string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
};
const NAMES: Record<SkyPosition['body'], string> = {
  sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto',
};
const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'] as const;

export const signAt = (longitude: number): string => SIGNS[Math.floor((((longitude % 360) + 360) % 360) / 30)]!;

export interface RingMark {
  body: SkyPosition['body'];
  glyph: string;
  name: string;
  sign: string;
  retrograde: boolean;
  /** Degrees into the sign, whole numbers. */
  degree: number;
  x: number;
  y: number;
  /** Which distance from the ring it was drawn at: 0 outermost. */
  tier: number;
}

export interface SkyRing {
  size: number;
  c: number;
  ringR: number;
  /** The twelve sign boundaries and where each sign's glyph sits. */
  ticks: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  signs: Array<{ sign: string; x: number; y: number }>;
  marks: RingMark[];
  spoken: string;
}

const MIN_GAP_DEGREES = 11;
const TIERS = 5;

export function buildSkyRing(positions: readonly SkyPosition[], size = 280): SkyRing {
  const c = size / 2;
  const ringR = c - 8;
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const [x1, y1] = wheelPoint(i * 30, ringR - 6, c);
    const [x2, y2] = wheelPoint(i * 30, ringR, c);
    return { x1, y1, x2, y2 };
  });
  const signs = Array.from({ length: 12 }, (_, i) => {
    const [x, y] = wheelPoint(i * 30 + 15, ringR - 15, c);
    return { sign: SIGNS[i]!, x, y };
  });
  const sorted = [...positions].sort((a, b) => a.longitude - b.longitude);
  const marks: RingMark[] = [];
  // Walk round the ring; a body too close to the one before it drops to the next tier in.
  const lastAt: number[] = Array.from({ length: TIERS }, () => -999);
  for (const p of sorted) {
    let tier = 0;
    while (tier < TIERS - 1 && p.longitude - lastAt[tier]! < MIN_GAP_DEGREES) tier += 1;
    lastAt[tier] = p.longitude;
    const [x, y] = wheelPoint(p.longitude, ringR - 40 - tier * 22, c);
    marks.push({
      body: p.body, glyph: BODY_GLYPH[p.body] + TEXT, name: NAMES[p.body], sign: signAt(p.longitude),
      retrograde: p.retrograde, degree: Math.floor(((p.longitude % 30) + 30) % 30), x, y, tier,
    });
  }
  const parts = marks.map((m) => `${m.name} in ${m.sign}${m.retrograde ? ' retrograde' : ''}`);
  return { size, c, ringR, ticks, signs, marks, spoken: `The sky now: ${parts.join(', ')}.` };
}
