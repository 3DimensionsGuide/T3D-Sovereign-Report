import Svg, { Circle, Line, Polygon } from 'react-native-svg';
import { LENS_COLOR } from '@/components/Lens';
import { colors } from '@/theme/tokens';

/**
 * The T3D seal: a gold ring ticked like a zodiac, with the Triad triangle inside.
 * Diamond = Vehicle, triangle = Road, dot = Stoplight. Decorative; the words "The 3 Dimensions" sit beside it.
 */
export function TriadSeal({ size = 96 }: { size?: number }) {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    return { x1: 50 + 46 * Math.cos(a), y1: 50 + 46 * Math.sin(a), x2: 50 + 49.2 * Math.cos(a), y2: 50 + 49.2 * Math.sin(a) };
  });
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Circle cx="50" cy="50" r="46" fill={colors.amethyst} stroke={colors.gold} strokeWidth={1.2} />
      <Circle cx="50" cy="50" r="41" fill="none" stroke={colors.gold} strokeWidth={0.5} opacity={0.55} />
      {ticks.map((t, i) => (
        <Line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={colors.gold} strokeWidth={1} />
      ))}
      <Polygon points="50,24 25,67 75,67" fill="none" stroke={colors.gold} strokeWidth={0.9} opacity={0.85} />
      {/* Vehicle: diamond */}
      <Polygon points="50,17 56,24 50,31 44,24" fill={LENS_COLOR.vehicle} />
      {/* Road: triangle */}
      <Polygon points="25,60 31,70 19,70" fill={LENS_COLOR.road} />
      {/* Stoplight: dot */}
      <Circle cx="75" cy="66" r="5" fill={LENS_COLOR.stoplight} />
    </Svg>
  );
}
