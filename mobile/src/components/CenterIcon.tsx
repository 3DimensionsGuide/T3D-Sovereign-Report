import Svg, { Polygon } from 'react-native-svg';
import { bodyMap } from '@/lib/centerShape';
import { colors } from '@/theme/tokens';

const W = 30;
const H = 46;

/**
 * A tiny bodygraph with all nine Centers faint and the one you are reading drawn bold: filled amber when
 * it is defined, an amber outline when it is open. Where the Center sits tells Throat, Sacral and Root
 * apart, since all three are squares. Decorative: the name and "(defined)" or "(open)" are always written beside it.
 */
export function CenterIcon({ id, defined, scale = 1 }: { id: string; defined: boolean; scale?: number }) {
  const shapes = bodyMap(id, W, H);
  if (!shapes.some((s) => s.active)) return null;
  return (
    <Svg width={W * scale} height={H * scale} viewBox={`0 0 ${W} ${H}`} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {shapes.map((s) => (
        <Polygon
          key={s.id}
          points={s.points}
          fill={s.active && defined ? colors.vehicle : 'none'}
          stroke={s.active ? colors.vehicle : colors.parchmentMuted}
          strokeOpacity={s.active ? 1 : 0.5}
          strokeWidth={s.active ? 1.6 : 0.8}
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}
