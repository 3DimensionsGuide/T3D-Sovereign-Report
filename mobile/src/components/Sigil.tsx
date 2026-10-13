import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';
import type { ChartResult } from '@/lib/api';
import { useReduceMotion } from '@/lib/motion';
import { pointsAttr, RING_RADIUS, SIGIL_BOX, SIGIL_CENTER, sigilGeometry } from '@/lib/sigil';
import { colors } from '@/theme/tokens';

interface Props {
  chart: ChartResult;
  birthTimeKnown: boolean;
  size?: number;
  /** The layers appear one after another: Vehicle, then Road, then Stoplight. Keep false inside share images. */
  animate?: boolean;
}

/**
 * The T3D Sigil, drawn in layers so each lens can arrive in turn.
 * Decorative: it has one description for screen readers, and every fact in it is also written elsewhere on screen.
 */
export function Sigil({ chart, birthTimeKnown, size = 240, animate = false }: Props) {
  const g = sigilGeometry(chart, birthTimeKnown);
  const reduce = useReduceMotion();
  const play = animate && !reduce;
  const layer = (delay: number) => (play ? FadeIn.delay(delay).duration(800) : undefined);
  const box = { width: size, height: size };
  const svgProps = { width: size, height: size, viewBox: `0 0 ${SIGIL_BOX} ${SIGIL_BOX}` } as const;

  return (
    <View
      style={box}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Your T3D Sigil: a drawing made from your chart, with your Vehicle at the centre, your Road around it, and your Stoplight on the outer ring."
    >
      {/* The ring and the twelve signs. */}
      <Svg {...svgProps} style={StyleSheet.absoluteFill}>
        <Circle cx={SIGIL_CENTER} cy={SIGIL_CENTER} r={RING_RADIUS} fill={colors.amethyst} fillOpacity={0.55} stroke={colors.gold} strokeWidth={1.2} />
        {g.ticks.map((t, i) => (
          <Line key={i} x1={t.from.x} y1={t.from.y} x2={t.to.x} y2={t.to.y} stroke={colors.gold} strokeWidth={t.major ? 1 : 0.6} opacity={t.major ? 0.8 : 0.45} />
        ))}
      </Svg>

      {/* Vehicle: the diamonds and the Type mark. */}
      <Animated.View entering={layer(300)} style={StyleSheet.absoluteFill}>
        <Svg {...svgProps}>
          <Polygon points={pointsAttr(g.outerDiamond)} fill="none" stroke={colors.vehicle} strokeWidth={1.4} strokeLinejoin="round" />
          <Polygon points={pointsAttr(g.innerDiamond)} fill={colors.vehicle} fillOpacity={0.92} />
          {g.centre === 'dot' || g.centre === 'dotRing' ? <Circle cx={SIGIL_CENTER} cy={SIGIL_CENTER} r={2.4} fill={colors.obsidian} /> : null}
          {g.centre === 'dotRing' ? <Circle cx={SIGIL_CENTER} cy={SIGIL_CENTER} r={5} fill="none" stroke={colors.obsidian} strokeWidth={1} /> : null}
          {g.centre === 'ring' ? <Circle cx={SIGIL_CENTER} cy={SIGIL_CENTER} r={3.4} fill="none" stroke={colors.obsidian} strokeWidth={1.2} strokeDasharray="1.2 1.8" /> : null}
          {g.centre === 'bar' ? <Line x1={SIGIL_CENTER - 4} y1={SIGIL_CENTER} x2={SIGIL_CENTER + 4} y2={SIGIL_CENTER} stroke={colors.obsidian} strokeWidth={1.8} /> : null}
          {g.centre === 'tick' ? <Line x1={SIGIL_CENTER} y1={SIGIL_CENTER - 4} x2={SIGIL_CENTER} y2={SIGIL_CENTER + 4} stroke={colors.obsidian} strokeWidth={1.8} /> : null}
        </Svg>
      </Animated.View>

      {/* Road: the nested triangles. */}
      <Animated.View entering={layer(1100)} style={StyleSheet.absoluteFill}>
        <Svg {...svgProps}>
          {g.triangles.map((t, i) => (
            <Polygon key={i} points={pointsAttr(t.points)} fill="none" stroke={colors.road} strokeWidth={1.3} strokeLinejoin="round" opacity={t.opacity} />
          ))}
        </Svg>
      </Animated.View>

      {/* Stoplight: the lines between the planets, and the planets on the ring. */}
      <Animated.View entering={layer(1900)} style={StyleSheet.absoluteFill}>
        <Svg {...svgProps}>
          {g.chords.map((c, i) => (
            <Line key={i} x1={c.from.x} y1={c.from.y} x2={c.to.x} y2={c.to.y} stroke={colors.stoplight} strokeWidth={1} opacity={0.45} />
          ))}
          {g.planets.map((p) => (
            <Circle
              key={p.name}
              cx={p.at.x}
              cy={p.at.y}
              r={p.r}
              fill={p.name === 'Rising' ? colors.obsidian : colors.stoplight}
              stroke={colors.stoplight}
              strokeWidth={p.name === 'Rising' ? 1.4 : 0}
            />
          ))}
        </Svg>
      </Animated.View>
    </View>
  );
}
