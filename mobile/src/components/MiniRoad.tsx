import { useMemo } from 'react';
import Svg, { Polygon, Rect, Text as SvgText } from 'react-native-svg';
import { buildMiniRoad } from '@/lib/miniDrawings';
import { buildRoadStrip } from '@/lib/roadStrip';
import { useLocalDate } from '@/lib/useLocalDate';
import { useNumerology } from '@/lib/useNumerology';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts } from '@/theme/tokens';

/**
 * The four Pinnacles in miniature: the one you are in has a bold green outline and a triangle under it;
 * past ones are solid lines, the ones ahead are dashed. The numbers are written in the bars.
 */
export function MiniRoad() {
  const chart = useT3DStore((s) => s.chart);
  const profile = useT3DStore((s) => s.profile);
  const today = useLocalDate();
  const { data } = useNumerology(chart?.leadId, profile?.email.trim());
  const road = useMemo(() => {
    const model = data ? buildRoadStrip(data.pinnacles, data.challenges, today, null) : null;
    return model ? buildMiniRoad(model) : null;
  }, [data, today]);
  if (!road) return null;
  return (
    <Svg width={road.width} height={road.height} accessibilityRole="image" accessibilityLabel={road.spoken}>
      {road.bars.map((b, i) => (
        <Rect
          key={i}
          x={b.x + 1}
          y={road.barY}
          width={b.width - 2}
          height={road.barHeight}
          rx={4}
          fill={b.state === 'current' ? colors.amethyst : 'none'}
          stroke={b.state === 'current' ? colors.road : colors.parchmentMuted}
          strokeWidth={b.state === 'current' ? 2 : 1}
          strokeDasharray={b.state === 'future' ? '3 2' : undefined}
        />
      ))}
      {road.bars.map((b, i) => (
        <SvgText
          key={`n${i}`}
          x={b.x + b.width / 2}
          y={road.barY + road.barHeight / 2 + 4}
          fontSize={11}
          fontFamily={fonts.bodyBold}
          fill={colors.parchment}
          textAnchor="middle"
        >
          {String(b.number)}
        </SvgText>
      ))}
      {road.markerX !== null ? (
        <Polygon
          points={`${road.markerX - 5},${road.height - 3} ${road.markerX + 5},${road.height - 3} ${road.markerX},${road.height - 12}`}
          fill={colors.road}
        />
      ) : null}
    </Svg>
  );
}
