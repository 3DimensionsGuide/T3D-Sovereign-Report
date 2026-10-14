import { useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Polygon } from 'react-native-svg';
import { polygonPoints, sigilNumber, sigilShape } from '@/lib/numberSigil';
import { colors } from '@/theme/tokens';

/**
 * The drawing behind a Road number: a point, two circles, or a many-sided shape, in the Road's green,
 * with a second ring for the master numbers. It fills the badge it sits in and the numeral is written
 * over it, so it is decorative.
 */
export function NumberSigil({ text, color = colors.road }: { text: string; color?: string }) {
  const n = sigilNumber(text);
  const shape = n === null ? null : sigilShape(n);
  useId();
  if (!shape) return null;
  const stroke = { stroke: color, strokeWidth: 1.8, fill: 'none', strokeLinejoin: 'round' as const };
  return (
    <Svg
      style={StyleSheet.absoluteFill} viewBox="0 0 56 56"
      accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none"
    >
      <Circle cx={28} cy={28} r={26} {...stroke} opacity={shape.master ? 0.9 : 0.35} />
      {shape.master ? <Circle cx={28} cy={28} r={22.5} {...stroke} strokeWidth={0.9} opacity={0.6} /> : null}
      {shape.kind === 'point' ? <Circle cx={28} cy={28} r={3} fill={color} opacity={0.9} /> : null}
      {shape.kind === 'vesica' ? (
        <>
          <Circle cx={22} cy={28} r={11} {...stroke} />
          <Circle cx={34} cy={28} r={11} {...stroke} />
        </>
      ) : null}
      {shape.kind === 'polygon' ? <Polygon points={polygonPoints(shape.sides, 28, 28, 19)} {...stroke} /> : null}
    </Svg>
  );
}
