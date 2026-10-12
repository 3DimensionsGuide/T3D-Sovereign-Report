import Svg, { Polygon } from 'react-native-svg';
import { centerPoints } from '@/lib/centerShape';
import { colors } from '@/theme/tokens';

/**
 * One Center drawn as its own bodygraph shape: filled when it is defined, an outline when it is open.
 * Decorative: the Center's name and "(defined)" or "(open)" are always written beside it.
 */
export function CenterIcon({ id, defined, size = 28 }: { id: string; defined: boolean; size?: number }) {
  const points = centerPoints(id, 24, 2.5);
  if (!points) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Polygon
        points={points}
        fill={defined ? colors.vehicle : 'none'}
        stroke={colors.vehicle}
        strokeWidth={defined ? 1 : 1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
