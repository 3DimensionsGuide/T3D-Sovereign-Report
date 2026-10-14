import { useId } from 'react';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import { moonShape } from '@/lib/moonShape';
import { colors } from '@/theme/tokens';

interface Props {
  /** 0 to 100, from the sky data. */
  illuminationPercent: number;
  waxing: boolean;
  size?: number;
  /** A soft glow around the disc and faint craters on it, for the large Moon at the head of a card. */
  hero?: boolean;
}

/**
 * The Moon drawn from today's real illumination: a dark disc with the lit part on top. Decorative,
 * because the phase name and percent are always written next to it.
 */
export function MoonIcon({ illuminationPercent, waxing, size = 44, hero = false }: Props) {
  const shape = moonShape(illuminationPercent, waxing);
  const halo = `halo${useId().replace(/\W/g, '')}`;
  const craters = hero ? (
    <>
      <Circle cx={18} cy={17} r={4.2} fill={colors.obsidian} opacity={0.1} />
      <Circle cx={29} cy={29} r={5.5} fill={colors.obsidian} opacity={0.09} />
      <Circle cx={30} cy={15} r={2.6} fill={colors.obsidian} opacity={0.1} />
      <Circle cx={16} cy={31} r={2.8} fill={colors.obsidian} opacity={0.08} />
    </>
  ) : null;
  return (
    <Svg width={size} height={size} viewBox={hero ? '-12 -12 72 72' : '0 0 48 48'} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {hero ? (
        <>
          <Defs>
            <RadialGradient id={halo} cx="24" cy="24" r="34" gradientUnits="userSpaceOnUse">
              <Stop offset="0.55" stopColor={colors.parchment} stopOpacity={0.22 * Math.max(0.15, illuminationPercent / 100)} />
              <Stop offset="1" stopColor={colors.parchment} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={24} cy={24} r={34} fill={`url(#${halo})`} />
        </>
      ) : null}
      <Circle cx={24} cy={24} r={20} fill={colors.amethyst} stroke={colors.parchmentMuted} strokeWidth={1.5} />
      {shape.kind === 'full' ? <Circle cx={24} cy={24} r={20} fill={colors.parchment} /> : null}
      {shape.kind === 'path' ? <Path d={shape.d} fill={colors.parchment} /> : null}
      {craters}
    </Svg>
  );
}
