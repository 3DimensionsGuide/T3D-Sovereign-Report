import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';
import { colors } from '@/theme/tokens';

/**
 * The T3D shape language. Every lens and every signal has its own shape AND colour,
 * so meaning never depends on colour alone.
 *
 *  Lenses : Vehicle = diamond, Road = triangle, Stoplight = dot.
 *  Signals: Flow = ringed check, Friction = square with a bar, Caution = hexagon with a mark, Neutral = plain ring.
 */
export type LensName = 'vehicle' | 'road' | 'stoplight';
export type SignalKind = 'flow' | 'friction' | 'caution' | 'neutral';

export const LENS_COLOR: Record<LensName, string> = {
  vehicle: colors.vehicle,
  road: colors.road,
  stoplight: colors.stoplight,
};

export const LENS_LABEL: Record<LensName, string> = {
  vehicle: 'The Vehicle',
  road: 'The Road',
  stoplight: 'The Stoplight',
};

export const SIGNAL_LABEL: Record<SignalKind, string> = {
  flow: 'Flow',
  friction: 'Friction',
  caution: 'Caution',
  neutral: 'Neutral',
};

/** Signal colours are not lens colours: flow is a calm teal, friction a warm coral, caution the gold. */
export const SIGNAL_COLOR: Record<SignalKind, string> = {
  flow: '#4FD1B5',
  friction: '#F0836B',
  caution: colors.sun,
  neutral: colors.parchmentMuted,
};

/** Maps the old text glyphs to a lens, so older screens can move over one at a time. */
export function lensFromGlyph(glyph: string): LensName | null {
  if (glyph === '◆') return 'vehicle';
  if (glyph === '▲') return 'road';
  if (glyph === '●') return 'stoplight';
  return null;
}

interface LensIconProps {
  lens: LensName;
  size?: number;
  color?: string;
}

/** Decorative: the lens name is always written next to it. */
export function LensIcon({ lens, size = 16, color }: LensIconProps) {
  const fill = color ?? LENS_COLOR[lens];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {lens === 'vehicle' ? <Polygon points="12,2 22,12 12,22 2,12" fill={fill} /> : null}
      {lens === 'road' ? <Polygon points="12,3 22,21 2,21" fill={fill} /> : null}
      {lens === 'stoplight' ? <Circle cx="12" cy="12" r="8.5" fill={fill} /> : null}
    </Svg>
  );
}

interface SignalMarkerProps {
  kind: SignalKind;
  size?: number;
  color?: string;
}

/** Decorative: the word Flow, Friction or Caution is always written next to it. */
export function SignalMarker({ kind, size = 16, color }: SignalMarkerProps) {
  const c = color ?? SIGNAL_COLOR[kind];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {kind === 'flow' ? (
        <>
          <Circle cx="12" cy="12" r="10" fill="none" stroke={c} strokeWidth={2.4} />
          <Path d="M7 12.5 L10.5 16 L17 8.5" fill="none" stroke={c} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : null}
      {kind === 'friction' ? (
        <>
          <Rect x="2.5" y="2.5" width="19" height="19" rx="3" fill="none" stroke={c} strokeWidth={2.4} />
          <Path d="M7 12 H17" stroke={c} strokeWidth={2.4} strokeLinecap="round" />
        </>
      ) : null}
      {kind === 'neutral' ? <Circle cx="12" cy="12" r="10" fill="none" stroke={c} strokeWidth={2.4} /> : null}
      {kind === 'caution' ? (
        <>
          <Polygon points="12,2 20.5,7 20.5,17 12,22 3.5,17 3.5,7" fill="none" stroke={c} strokeWidth={2.4} strokeLinejoin="round" />
          <Path d="M12 7.5 V13" stroke={c} strokeWidth={2.4} strokeLinecap="round" />
          <Circle cx="12" cy="16.4" r="1.3" fill={c} />
        </>
      ) : null}
    </Svg>
  );
}
