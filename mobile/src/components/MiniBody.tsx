import { useMemo } from 'react';
import Svg, { Polygon } from 'react-native-svg';
import { buildBodygraphChip } from '@/lib/bodygraphChip';
import { colors } from '@/theme/tokens';

/** The nine centers in miniature: defined ones filled, open ones outlined. Decorative: the facts are written beside it. */
export function MiniBody({ definedCenters, height = 64, focusId = null }: { definedCenters: readonly string[]; height?: number; focusId?: string | null }) {
  const chip = useMemo(() => buildBodygraphChip(definedCenters, null, [], height), [definedCenters, height]);
  return (
    <Svg width={chip.width} height={chip.height} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {chip.centers.map((c) => (
        <Polygon
          key={c.id}
          points={c.points}
          fill={c.defined ? colors.vehicle : 'none'}
          stroke={focusId === c.id ? colors.gold : c.defined ? colors.vehicle : colors.parchmentMuted}
          strokeWidth={focusId === c.id ? 2.4 : 1}
          opacity={focusId && focusId !== c.id ? 0.35 : 1}
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}
