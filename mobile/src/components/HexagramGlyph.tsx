import Svg, { Rect } from 'react-native-svg';
import { hexagramLines } from '@/lib/hexagram';
import { colors } from '@/theme/tokens';

interface Props {
  /** The gate number, 1 to 64. The hexagram is the same number. */
  gate: number;
  /** Height in points; the width follows. */
  size?: number;
  color?: string;
}

/**
 * The six-line hexagram for a Human Design gate: solid bars for yang lines, split bars for yin lines,
 * the first line at the bottom. Decorative, because the gate number is always written beside it.
 */
export function HexagramGlyph({ gate, size = 22, color = colors.vehicle }: Props) {
  const lines = hexagramLines(gate);
  if (!lines) return null;
  const barH = 2.4;
  const gap = 1.8;
  const width = 20;
  const height = 6 * barH + 5 * gap;
  const gapW = 4.4;
  const half = (width - gapW) / 2;
  return (
    <Svg
      width={(size * width) / height} height={size} viewBox={`0 0 ${width} ${height}`}
      accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    >
      {lines.map((solid, i) => {
        // Line 1 is at the bottom, so it is drawn last (lowest on the screen).
        const y = height - (i + 1) * barH - i * gap;
        return solid ? (
          <Rect key={i} x={0} y={y} width={width} height={barH} rx={1} fill={color} />
        ) : (
          <>
            <Rect key={`${i}a`} x={0} y={y} width={half} height={barH} rx={1} fill={color} />
            <Rect key={`${i}b`} x={half + gapW} y={y} width={half} height={barH} rx={1} fill={color} />
          </>
        );
      })}
    </Svg>
  );
}
