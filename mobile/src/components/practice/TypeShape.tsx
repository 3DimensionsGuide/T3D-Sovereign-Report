import Svg, { Circle, Ellipse, Line, Path, Polygon } from 'react-native-svg';
import type { TypeShapeKind } from '@/lib/typeShapes';
import { colors } from '@/theme/tokens';

/**
 * A simple drawing of how each Type's energy is described: Generators open and enveloping, Manifesting Generators
 * the same but moving forward, Manifestors closed and pushing out, Projectors narrow and focused, Reflectors a
 * dashed ring that samples. A small diamond (the Vehicle shape) sits at the centre. With no known Type the
 * shape is a dashed outline. Decorative: the Type is always written beside it.
 */
export function TypeShape({ kind, size = 72 }: { kind: TypeShapeKind | null; size?: number }) {
  const c = colors.vehicle;
  const sw = 2;
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {kind === null ? <Circle cx="32" cy="32" r="22" fill="none" stroke={colors.parchmentMuted} strokeWidth={sw} strokeDasharray="4 5" /> : null}
      {kind === 'generator' ? (
        <>
          <Ellipse cx="32" cy="32" rx="26" ry="22" fill="none" stroke={c} strokeWidth={sw} />
          <Ellipse cx="32" cy="32" rx="17" ry="14" fill="none" stroke={c} strokeWidth={1} opacity={0.6} />
        </>
      ) : null}
      {kind === 'mg' ? (
        <>
          <Ellipse cx="29" cy="32" rx="23" ry="20" fill="none" stroke={c} strokeWidth={sw} />
          <Path d="M48 22 L58 32 L48 42" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : null}
      {kind === 'manifestor' ? (
        <>
          <Circle cx="32" cy="32" r="14" fill="none" stroke={c} strokeWidth={3} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const r = (a * Math.PI) / 180;
            return (
              <Line key={a} x1={32 + Math.cos(r) * 19} y1={32 + Math.sin(r) * 19} x2={32 + Math.cos(r) * 28} y2={32 + Math.sin(r) * 28}
                stroke={c} strokeWidth={sw} strokeLinecap="round" />
            );
          })}
        </>
      ) : null}
      {kind === 'projector' ? (
        <Path d="M32 4 C 46 20, 46 44, 32 60 C 18 44, 18 20, 32 4 Z" fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      ) : null}
      {kind === 'reflector' ? (
        <Circle cx="32" cy="32" r="25" fill="none" stroke={c} strokeWidth={sw} strokeDasharray="2 6" strokeLinecap="round" />
      ) : null}
      {kind !== null ? <Polygon points="32,26 38,32 32,38 26,32" fill={c} /> : null}
    </Svg>
  );
}
