import { View } from 'react-native';
import Svg, { Circle, Polygon } from 'react-native-svg';
import { LENS_COLOR, type LensName } from '@/components/Lens';
import { MotionLensIcon } from '@/components/LensMotion';
import { colors } from '@/theme/tokens';

/** Where each lens sits on the seal, in a 100 by 100 box: Vehicle on top, Road left, Stoplight right. */
const SPOTS: Record<LensName, { x: number; y: number }> = {
  vehicle: { x: 50, y: 28 },
  road: { x: 26, y: 68 },
  stoplight: { x: 74, y: 68 },
};
const ORDER: LensName[] = ['vehicle', 'road', 'stoplight'];

interface Props {
  size?: number;
  /**
   * Which lenses this person has data for. A lens set to false is drawn as a hollow outline.
   * Leave it out for the full brand seal.
   */
  lenses?: Partial<Record<LensName, boolean>>;
  /**
   * true = the three shapes appear one after another, each with its own lens movement.
   * Keep it false anywhere the seal is drawn into an image (share cards).
   */
  animate?: boolean;
}

/**
 * The T3D seal: one badge made of the three lens shapes, tied by the Triad triangle.
 * Diamond = Vehicle (amber), triangle = Road (emerald), dot = Stoplight (crimson).
 * Decorative: the words "The 3 Dimensions" or the lens names always sit beside it.
 */
export function TriadSeal({ size = 96, lenses, animate = false }: Props) {
  const unit = size / 100;
  const icon = Math.max(8, Math.round(size * 0.25));
  const has = (l: LensName) => (lenses ? lenses[l] !== false : true);
  return (
    <View
      style={{ width: size, height: size }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="46" fill={colors.amethyst} stroke={colors.gold} strokeWidth={1.4} />
        <Circle cx="50" cy="50" r="40" fill="none" stroke={colors.gold} strokeWidth={0.5} opacity={0.5} />
        <Polygon
          points={ORDER.map((l) => `${SPOTS[l].x},${SPOTS[l].y}`).join(' ')}
          fill="none"
          stroke={colors.gold}
          strokeWidth={1}
          strokeLinejoin="round"
          opacity={0.7}
        />
      </Svg>
      {ORDER.map((l, i) => (
        <View
          key={l}
          style={{ position: 'absolute', left: SPOTS[l].x * unit - icon / 2, top: SPOTS[l].y * unit - icon / 2 }}
        >
          <MotionLensIcon
            lens={l}
            size={icon}
            color={LENS_COLOR[l]}
            outline={!has(l)}
            play={animate && has(l)}
            enter={animate}
            delay={i * 450}
          />
        </View>
      ))}
    </View>
  );
}
