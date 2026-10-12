import Svg, { Circle, Path } from 'react-native-svg';
import { moonShape } from '@/lib/moonShape';
import { colors } from '@/theme/tokens';

interface Props {
  /** 0 to 100, from the sky data. */
  illuminationPercent: number;
  waxing: boolean;
  size?: number;
}

/**
 * The Moon drawn from today's real illumination: a dark disc with the lit part on top. Decorative,
 * because the phase name and percent are always written next to it.
 */
export function MoonIcon({ illuminationPercent, waxing, size = 44 }: Props) {
  const shape = moonShape(illuminationPercent, waxing);
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Circle cx={24} cy={24} r={20} fill="#1F1235" stroke={colors.parchmentMuted} strokeWidth={1.5} />
      {shape.kind === 'full' ? <Circle cx={24} cy={24} r={20} fill={colors.parchment} /> : null}
      {shape.kind === 'path' ? <Path d={shape.d} fill={colors.parchment} /> : null}
    </Svg>
  );
}
