import { colors } from '@/theme/tokens';

/**
 * Every tab is its own room: the same obsidian floor and purple atmosphere, but each room has its own light
 * and one quiet piece of line art, so you can tell where you are before you read a word.
 * Colours stay inside the palette; the art is faint enough to sit behind any text.
 */
export type RoomName = 'sky' | 'road' | 'study' | 'ritual' | 'observatory';

export type RoomArt = 'stars' | 'road' | 'rings' | 'none';

export interface Room {
  /** Soft pools of light, drawn from the top edge. Later layers sit on top of earlier ones. */
  glows: { color: string; opacity: number; cx: number }[];
  art: RoomArt;
  /** Colour of the line art. */
  artColor: string;
}

export const ROOMS: Record<RoomName, Room> = {
  // Today: the night sky, with the purple pool centred and a few stars.
  sky: { glows: [{ color: colors.purple, opacity: 0.7, cx: 50 }], art: 'stars', artColor: colors.parchment },
  // Timeline: the road ahead, a cool green light on the horizon and lines running toward it.
  road: {
    glows: [{ color: colors.purple, opacity: 0.55, cx: 30 }, { color: colors.road, opacity: 0.22, cx: 50 }],
    art: 'road',
    artColor: colors.road,
  },
  // Readings: a warm study, amber lamplight over the purple.
  study: {
    glows: [{ color: colors.purple, opacity: 0.6, cx: 40 }, { color: colors.vehicle, opacity: 0.14, cx: 75 }],
    art: 'none',
    artColor: colors.vehicle,
  },
  // Practice: dusk, a low red-violet glow for the daily ritual.
  ritual: {
    glows: [{ color: colors.purple, opacity: 0.65, cx: 60 }, { color: colors.stoplight, opacity: 0.14, cx: 25 }],
    art: 'none',
    artColor: colors.stoplight,
  },
  // My Chart: an observatory, with astrolabe rings in the corner.
  observatory: { glows: [{ color: colors.purple, opacity: 0.75, cx: 50 }], art: 'rings', artColor: colors.gold },
};
