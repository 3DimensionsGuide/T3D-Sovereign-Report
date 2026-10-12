import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Term } from '@/components/Explain';
import { RollingNumber } from '@/components/RollingNumber';
import { LENS_TEXT } from '@/components/Lens';
import { DIAL_TICKS, dialAngle, dialBase, dialSpoken, tickPoint } from '@/lib/dials';
import { colors, fonts } from '@/theme/tokens';

const SIZE = 68;
const C = SIZE / 2;
const R = 27;

interface Props {
  kind: 'Year' | 'Month' | 'Day';
  number: number;
  /** The text shown in the middle: "6", or "11/2" for a master number. */
  text: string;
  /** The number's name, such as "Foundations", shown under the label. */
  word?: string;
}

/**
 * One nine-tick dial: the ticks are the nine numbers, today's tick is a larger dot, and a marker slides
 * round to it from the top (once, and not at all with Reduce Motion). The number is written in the
 * middle and the tick count is spoken, so the dial never carries the meaning alone.
 */
export function PersonalDial({ kind, number, text, word }: Props) {
  const angle = dialAngle(number);
  const spin = useRef(new Animated.Value(0)).current;
  const base = dialBase(number);

  useEffect(() => {
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) {
        spin.setValue(angle);
        return;
      }
      Animated.timing(spin, { toValue: angle, duration: 600, useNativeDriver: true }).start();
    });
    return () => {
      cancelled = true;
    };
  }, [angle, spin]);

  const rotate = spin.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });
  return (
    <View style={styles.wrap} accessible accessibilityRole="image" accessibilityLabel={word ? `${dialSpoken(kind, number)} ${word}.` : dialSpoken(kind, number)}>
      <View style={styles.dial}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <Circle cx={C} cy={C} r={R} fill="none" stroke={colors.hairline} strokeWidth={1.5} />
          {Array.from({ length: DIAL_TICKS }, (_, k) => {
            const p = tickPoint(k + 1, R, C, C);
            const now = k + 1 === base;
            return <Circle key={k} cx={p.x} cy={p.y} r={now ? 4.2 : 2} fill={now ? LENS_TEXT.road : colors.parchmentMuted} />;
          })}
        </Svg>
        <Animated.View pointerEvents="none" style={[styles.marker, { transform: [{ rotate }] }]}>
          <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            <Circle cx={C} cy={C - R} r={7} fill="none" stroke={colors.gold} strokeWidth={2} />
          </Svg>
        </Animated.View>
        <View style={styles.center} pointerEvents="none">
          <RollingNumber value={text} style={styles.number} />
        </View>
      </View>
      <Text maxFontSizeMultiplier={1.3} style={styles.label}>
        <Term id={kind === 'Year' ? 'num:personalyear' : kind === 'Month' ? 'num:personalmonth' : 'num:personalday'}>{kind}</Term>
      </Text>
      {word ? <Text maxFontSizeMultiplier={1.3} style={styles.word}>{word}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 2, flex: 1 },
  dial: { width: SIZE, height: SIZE },
  marker: { position: 'absolute', top: 0, left: 0, width: SIZE, height: SIZE },
  center: { position: 'absolute', top: 0, left: 0, width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  number: { fontFamily: fonts.display, fontSize: 20, color: colors.parchment },
  label: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.parchmentMuted },
  word: { fontFamily: fonts.bodyBold, fontSize: 13, lineHeight: 17, color: colors.parchment, textAlign: 'center' },
});
