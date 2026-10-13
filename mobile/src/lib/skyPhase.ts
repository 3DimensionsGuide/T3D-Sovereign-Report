import { colors } from '../theme/tokens';

/**
 * The light on the Today tab follows the phone's clock: stars and a faint violet at night, amber from the east
 * at dawn, a warm gold overhead by day, red-orange from the west at dusk. It only uses the local time, so it needs
 * no permission and sends nothing anywhere. The palette stays inside the T3D colours.
 */
export interface SkyLook {
  /** The second pool of light, drawn over the purple one. */
  glow: { color: string; opacity: number; cx: number };
  /** 0 hides the stars, 1 shows them fully. */
  starOpacity: number;
  /** The sun itself: a disc with rings, drawn over the top of the page. Hidden at night. */
  sun: { opacity: number; cx: number; y: number };
  /** How much of the night's purple pool stays. The day lets it fade back so the warm light can be seen. */
  purple: number;
}

interface Key {
  hour: number;
  color: string;
  opacity: number;
  cx: number;
  stars: number;
  /** Sun strength, its height from the top of the page in points, and how much purple remains. */
  sun: number;
  sunY: number;
  purple: number;
}

// The sun's pool moves from the east edge (cx near 90) at dawn to the west edge (cx near 10) at dusk.
const KEYS: Key[] = [
  { hour: 0, color: colors.purple, opacity: 0, cx: 50, stars: 1, sun: 0, sunY: 150, purple: 1 },
  { hour: 5, color: colors.vehicle, opacity: 0.1, cx: 95, stars: 0.7, sun: 0, sunY: 150, purple: 1 },
  { hour: 6.5, color: colors.vehicle, opacity: 0.32, cx: 88, stars: 0.2, sun: 0.7, sunY: 130, purple: 0.75 },
  { hour: 9, color: colors.sun, opacity: 0.3, cx: 70, stars: 0, sun: 1, sunY: 96, purple: 0.45 },
  { hour: 12, color: colors.sun, opacity: 0.28, cx: 50, stars: 0, sun: 1, sunY: 78, purple: 0.4 },
  { hour: 15.5, color: colors.vehicle, opacity: 0.28, cx: 30, stars: 0, sun: 1, sunY: 100, purple: 0.45 },
  { hour: 18, color: colors.stoplight, opacity: 0.3, cx: 12, stars: 0.2, sun: 0.7, sunY: 132, purple: 0.75 },
  { hour: 20, color: colors.stoplight, opacity: 0.12, cx: 25, stars: 0.65, sun: 0, sunY: 150, purple: 1 },
  { hour: 22, color: colors.purple, opacity: 0, cx: 50, stars: 1, sun: 0, sunY: 150, purple: 1 },
  { hour: 24, color: colors.purple, opacity: 0, cx: 50, stars: 1, sun: 0, sunY: 150, purple: 1 },
];

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const [ar, ag, ab] = hex(a);
  const [br, bg, bb] = hex(b);
  const ch = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0');
  return `#${ch(ar, br)}${ch(ag, bg)}${ch(ab, bb)}`;
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** The look of the sky at a time of day, given as hours from midnight (13.5 is 1:30 pm). */
export function skyLook(hours: number): SkyLook {
  const h = ((hours % 24) + 24) % 24;
  let i = 0;
  while (i < KEYS.length - 2 && h >= KEYS[i + 1].hour) i += 1;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = (h - a.hour) / (b.hour - a.hour);
  return {
    glow: { color: mix(a.color, b.color, t), opacity: lerp(a.opacity, b.opacity, t), cx: lerp(a.cx, b.cx, t) },
    starOpacity: lerp(a.stars, b.stars, t),
    sun: { opacity: lerp(a.sun, b.sun, t), cx: lerp(a.cx, b.cx, t), y: lerp(a.sunY, b.sunY, t) },
    purple: lerp(a.purple, b.purple, t),
  };
}

export const hoursOf = (d: Date) => d.getHours() + d.getMinutes() / 60;
