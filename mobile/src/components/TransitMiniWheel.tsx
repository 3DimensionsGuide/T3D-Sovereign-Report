import { useEffect, useMemo, useRef } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Rect, Text as SvgText } from 'react-native-svg';
import { SIGNAL_COLOR, SIGNAL_LABEL, SignalMarker } from '@/components/Lens';
import type { DailyTransitHit } from '@/lib/api';
import { aspectWord, bodyName, natalName } from '@/lib/skyText';
import { select } from '@/lib/haptics';
import { buildTransitWheel, hasWheelPositions, type WheelChord } from '@/lib/transitWheel';
import { colors, fonts, space } from '@/theme/tokens';

const SIZE = 260;

function Mark({ chord }: { chord: WheelChord }) {
  const color = SIGNAL_COLOR[chord.nature];
  const r = 6;
  return chord.nature === 'friction' ? (
    <Rect x={chord.mx - r} y={chord.my - r} width={r * 2} height={r * 2} rx={2} fill={colors.charcoal} stroke={color} strokeWidth={2} />
  ) : (
    <Circle cx={chord.mx} cy={chord.my} r={r} fill={colors.charcoal} stroke={color} strokeWidth={2} />
  );
}

/**
 * Today's tightest contacts as lines between two rings: the sky outside, your chart inside. Flow is a
 * solid line with a round mark; friction is dashed with a square mark. Lines draw in tightest first
 * and the closest pulses once. The same facts are in the caption and in the list below.
 */
export function TransitMiniWheel({ hits, onSelect }: { hits: DailyTransitHit[]; onSelect: (hit: DailyTransitHit) => void }) {
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
  const top = hits.slice().sort((a, b) => a.orb - b.orb)[0];
  const topKind = top.nature;

  return (
    <View style={styles.wrap}>
      <View accessible accessibilityRole="image" accessibilityLabel={wheel.spoken} style={styles.figure}>
        <Svg width={SIZE} height={SIZE} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Circle cx={wheel.cx} cy={wheel.cy} r={wheel.outerR} fill="none" stroke={colors.hairline} strokeWidth={1.5} />
          <Circle cx={wheel.cx} cy={wheel.cy} r={wheel.innerR} fill="none" stroke={colors.hairline} strokeWidth={1.5} />
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
          {wheel.dots.map((d) => (
            <SvgText key={`${d.key}-l`} x={d.lx} y={d.ly + 4} fontSize={11} fontWeight="bold" fill={colors.parchment} textAnchor="middle">
              {d.label}
            </SvgText>
          ))}
          <SvgText x={wheel.cx} y={wheel.cy - 2} fontSize={11} fill={colors.parchmentMuted} textAnchor="middle">Sky outside</SvgText>
          <SvgText x={wheel.cx} y={wheel.cy + 13} fontSize={11} fill={colors.parchmentMuted} textAnchor="middle">You inside</SvgText>
        </Svg>
        {wheel.chords.map((c, i) => (
          <Animated.View
            key={c.key}
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { opacity: i === 0 ? Animated.multiply(drawn.current[i], pulse) : drawn.current[i] }]}
          >
            <Svg width={SIZE} height={SIZE} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
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
              <Mark chord={c} />
            </Svg>
          </Animated.View>
        ))}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <SignalMarker kind="flow" size={16} />
          <Text style={styles.legendText}>Flow: solid line</Text>
        </View>
        <View style={styles.legendItem}>
          <SignalMarker kind="friction" size={16} />
          <Text style={styles.legendText}>Friction: dashed line</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Closest: ${bodyName(top.transiting)} ${aspectWord(top.aspect)} your ${natalName(top.natal)}, ${top.orb.toFixed(1)} degrees from exact. ${SIGNAL_LABEL[topKind]}. Opens the full meaning.`}
        onPress={() => {
          select();
          onSelect(top);
        }}
        style={({ pressed }) => [styles.caption, pressed && { opacity: 0.8 }]}
      >
        <Text style={styles.captionText}>
          Closest: {bodyName(top.transiting)} {aspectWord(top.aspect)} your {natalName(top.natal)}, {top.orb.toFixed(1)}° from exact
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space.sm, marginBottom: space.md },
  figure: { width: SIZE, height: SIZE, position: 'relative' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { fontFamily: fonts.body, fontSize: 13, color: colors.parchment },
  caption: { minHeight: 48, justifyContent: 'center', paddingHorizontal: space.sm },
  captionText: { fontFamily: fonts.bodyMedium, fontSize: 15, lineHeight: 22, color: colors.gold, textAlign: 'center' },
});
