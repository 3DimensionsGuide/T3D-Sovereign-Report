import { colors } from '@/theme/tokens';

/**
 * Every tab is its own room: the same obsidian floor and purple atmosphere, but each room has its own light
 * and one quiet piece of line art, so you can tell where you are before you read a word.
 * Colours stay inside the palette; the art is faint enough to sit behind any text.
 */
export type RoomName =
  | 'sky' | 'road' | 'ritual' | 'observatory'
  | 'readingVehicle' | 'readingRoad' | 'readingStoplight';

export type RoomArt = 'stars' | 'road' | 'rings' | 'diamonds' | 'triangles' | 'orbits' | 'sunpath' | 'none';

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
    glows: [{ color: '#12301F', opacity: 0.6, cx: 30 }, { color: colors.road, opacity: 0.22, cx: 50 }],
    art: 'road',
    artColor: colors.road,
  },
  // Readings: the room follows the lens you are reading. Each lens has its own light and its own geometry.
  // Vehicle: amber lamplight and nested diamonds, like the centers of a bodygraph.
  readingVehicle: {
    glows: [{ color: '#16213A', opacity: 0.7, cx: 35 }, { color: colors.vehicle, opacity: 0.2, cx: 80 }],
    art: 'diamonds',
    artColor: colors.vehicle,
  },
  // Road: emerald light and rising triangles, a climb in steps.
  readingRoad: {
    glows: [{ color: '#16213A', opacity: 0.7, cx: 35 }, { color: colors.road, opacity: 0.2, cx: 80 }],
    art: 'triangles',
    artColor: colors.road,
  },
  // Stoplight: crimson light and planets on their orbits.
  readingStoplight: {
    glows: [{ color: '#16213A', opacity: 0.7, cx: 35 }, { color: colors.stoplight, opacity: 0.18, cx: 80 }],
    art: 'orbits',
    artColor: colors.stoplight,
  },
  // Practice: dusk, and the path of the sun over one day with a marker for each of the three daily check-ins.
  ritual: {
    glows: [{ color: '#38211A', opacity: 0.7, cx: 60 }, { color: colors.stoplight, opacity: 0.2, cx: 20 }, { color: colors.vehicle, opacity: 0.1, cx: 85 }],
    art: 'sunpath',
    artColor: colors.parchment,
  },
  // My Chart: an observatory, with astrolabe rings in the corner.
  observatory: { glows: [{ color: '#232933', opacity: 0.85, cx: 50 }], art: 'rings', artColor: '#CDD4E2' },
};
