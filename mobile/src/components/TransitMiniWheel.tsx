import { useEffect, useMemo, useRef } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/components/Pressable';
import Svg, { Circle, Line, Rect, Text as SvgText } from 'react-native-svg';
import { SIGNAL_COLOR, SignalMarker } from '@/components/Lens';
import type { DailyTransitHit } from '@/lib/api';
import { select } from '@/lib/haptics';
import { buildTransitWheel, hasWheelPositions, MAX_WHEEL_CHORDS, type WheelChord } from '@/lib/transitWheel';
import { colors, fonts, space } from '@/theme/tokens';

const SIZE = 320;
const BADGE_R = 15;
const TARGET = 48;

function Badge({ chord }: { chord: WheelChord }) {
  const color = SIGNAL_COLOR[chord.nature];
  const r = BADGE_R;
  return (
    <>
      {chord.nature === 'friction' ? (
        <Rect x={chord.bx - r} y={chord.by - r} width={r * 2} height={r * 2} rx={6} fill={colors.charcoal} stroke={color} strokeWidth={2.6} />
      ) : (
        <Circle cx={chord.bx} cy={chord.by} r={r} fill={colors.charcoal} stroke={color} strokeWidth={2.6} />
      )}
      <SvgText x={chord.bx} y={chord.by + 5} fontSize={15} fontWeight="bold" fill={colors.parchment} textAnchor="middle">
        {String(chord.number)}
      </SvgText>
    </>
  );
}

/**
 * Today's three tightest contacts as numbered lines between two rings: the sky outside, your chart
 * inside. The numbers match the first rows of the list below. Flow is a solid line with a round
 * badge; friction is dashed with a square badge. Each badge sits outside the ring, spread apart, and is
 * a 48-point button that jumps to its row in the list. Lines draw in tightest first and the closest pulses once.
 */
export function TransitMiniWheel({ hits, onPickNumber }: { hits: DailyTransitHit[]; onPickNumber: (n: number) => void }) {
  const wheel = useMemo(() => buildTransitWheel(hits, SIZE), [hits]);
  const drawn = useRef<Animated.Value[]>([]);
  const pulse = useRef(new Animated.Value(1)).current;
  if (drawn.current.length < wheel.chords.length) {
    drawn.current = wheel.chords.map((_, i) => drawn.current[i] ?? new Animated.Value(0));
  }
  const signature = wheel.chords.map((c) => c.key).join('|');

  useEffect(() => {
    if (!wheel.chords.length) return;
    let cancelled = false;
    const values = drawn.current.slice(0, wheel.chords.length);
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) {
        values.forEach((v) => v.setValue(1));
        pulse.setValue(1);
        return;
      }
      values.forEach((v) => v.setValue(0));
      pulse.setValue(1);
      Animated.sequence([
        Animated.stagger(
          200,
          values.map((v) => Animated.timing(v, { toValue: 1, duration: 420, useNativeDriver: true })),
        ),
        Animated.timing(pulse, { toValue: 0.45, duration: 380, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 380, useNativeDriver: true }),
      ]).start();
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, pulse]);

  if (!hasWheelPositions(hits) || !wheel.chords.length) return null;
  const more = hits.length - wheel.chords.length;

  return (
    <View style={styles.wrap}>
      <View style={styles.figure}>
        <View accessible accessibilityRole="image" accessibilityLabel={wheel.spoken}>
        <Svg width={SIZE} height={SIZE} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Circle cx={wheel.cx} cy={wheel.cy} r={wheel.outerR} fill="none" stroke={colors.hairline} strokeWidth={1.5} />
          <Circle cx={wheel.cx} cy={wheel.cy} r={wheel.innerR} fill="none" stroke={colors.hairline} strokeWidth={1.5} />
          {wheel.ticks.map((t, i) => (
            <Line key={`t${i}`} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={colors.hairline} strokeWidth={1.5} />
          ))}
          {wheel.dots.map((d) => (
            <Circle
              key={d.key}
              cx={d.x}
              cy={d.y}
              r={4}
              fill={d.ring === 'outer' ? colors.parchment : 'none'}
              stroke={colors.parchment}
              strokeWidth={1.8}
            />
          ))}
          {wheel.dots.filter((d) => d.label).map((d) => (
            <SvgText key={`${d.key}-l`} x={d.lx} y={d.ly + 4} fontSize={11} fontWeight="bold" fill={colors.parchment} textAnchor="middle">
              {d.label}
            </SvgText>
          ))}
        </Svg>
        </View>
        {wheel.chords.map((c, i) => (
          <Animated.View
            key={c.key}
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { opacity: i === 0 ? Animated.multiply(drawn.current[i], pulse) : drawn.current[i] }]}
          >
            <Svg width={SIZE} height={SIZE} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <Line x1={c.x1} y1={c.y1} x2={c.bx} y2={c.by} stroke={SIGNAL_COLOR[c.nature]} strokeWidth={1.6} opacity={0.7} />
              <Line
                x1={c.x1}
                y1={c.y1}
                x2={c.x2}
                y2={c.y2}
                stroke={SIGNAL_COLOR[c.nature]}
                strokeWidth={c.strokeWidth}
                strokeLinecap="round"
                strokeDasharray={c.dashed ? '7 5' : undefined}
                opacity={c.opacity}
              />
              <Badge chord={c} />
            </Svg>
          </Animated.View>
        ))}
        {wheel.chords.map((c) => (
          <Pressable
            key={`hit-${c.key}`}
            accessibilityRole="button"
            accessibilityLabel={`Number ${c.number}: ${c.phrase}. Jumps to it in the list.`}
            onPress={() => {
              select();
              onPickNumber(c.number);
            }}
            style={{ position: 'absolute', left: c.bx - TARGET / 2, top: c.by - TARGET / 2, width: TARGET, height: TARGET }}
          />
        ))}
      </View>

      <Text maxFontSizeMultiplier={1.3} style={styles.rings}>Outer ring: today's sky. Inner ring: your chart.</Text>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <SignalMarker kind="flow" size={16} />
          <Text maxFontSizeMultiplier={1.3} style={styles.legendText}>Flow: solid line</Text>
        </View>
        <View style={styles.legendItem}>
          <SignalMarker kind="friction" size={16} />
          <Text maxFontSizeMultiplier={1.3} style={styles.legendText}>Friction: dashed line</Text>
        </View>
      </View>

      <Text maxFontSizeMultiplier={1.3} style={styles.rings}>
        {more > 0 ? `The ${wheel.chords.length} closest, numbered to match the list. ${more} more below.` : 'Numbered to match the list below.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space.sm, marginBottom: space.md },
  figure: { width: SIZE, height: SIZE, position: 'relative' },
  rings: { fontFamily: fonts.body, fontSize: 13, color: colors.parchmentMuted, textAlign: 'center' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { fontFamily: fonts.body, fontSize: 13, color: colors.parchment },
});
