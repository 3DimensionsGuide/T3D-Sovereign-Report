import { useEffect, useMemo } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from 'react-native';
import { LENS_LABEL, LENS_TEXT, LensIcon, type LensName } from '@/components/Lens';
import { TriadSeal } from '@/components/TriadSeal';
import { colors, fonts, space } from '@/theme/tokens';

const STEPS: { lens: LensName; line: string }[] = [
  { lens: 'vehicle', line: 'Reading how you are built' },
  { lens: 'road', line: 'Counting the numbers in your name and date' },
  { lens: 'stoplight', line: 'Placing the sky at the moment you were born' },
];

/**
 * Shown while the chart is being calculated: the three lenses light up one after another,
 * then all stay lit once the result has arrived. With Reduce Motion on, all three show at once.
 */
export function CalculatingView({ done }: { done: boolean }) {
  const lit = useMemo(() => STEPS.map(() => new Animated.Value(0.3)), []);

  useEffect(() => {
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) {
        lit.forEach((v) => v.setValue(1));
        return;
      }
      Animated.stagger(
        900,
        lit.map((v) => Animated.timing(v, { toValue: 1, duration: 500, useNativeDriver: true })),
      ).start();
    });
    return () => {
      cancelled = true;
      lit.forEach((v) => v.stopAnimation());
    };
  }, [lit]);

  useEffect(() => {
    if (done) lit.forEach((v) => v.setValue(1));
  }, [done, lit]);

  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite">
      <TriadSeal size={96} />
      <Text accessibilityRole="header" style={styles.title}>{done ? 'Your chart is ready' : 'Calculating your chart'}</Text>
      <View style={styles.rows}>
        {STEPS.map((s, i) => (
          <Animated.View key={s.lens} style={[styles.row, { opacity: lit[i] }]}>
            <LensIcon lens={s.lens} size={18} />
            <View style={styles.rowText}>
              <Text style={[styles.lens, { color: LENS_TEXT[s.lens] }]}>{LENS_LABEL[s.lens]}</Text>
              <Text style={styles.line}>{s.line}</Text>
            </View>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space.lg, paddingTop: space.xxl },
  title: { fontFamily: fonts.display, fontSize: 28, lineHeight: 36, color: colors.parchment, textAlign: 'center' },
  rows: { gap: space.lg, alignSelf: 'stretch', paddingHorizontal: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  rowText: { flex: 1, gap: 2 },
  lens: { fontFamily: fonts.bodyBold, fontSize: 14 },
  line: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchment },
});
