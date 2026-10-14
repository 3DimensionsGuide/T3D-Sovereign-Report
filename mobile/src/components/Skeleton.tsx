import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text, View, type DimensionValue } from 'react-native';
import { colors, fonts, radius, space } from '@/theme/tokens';

/** One softly pulsing placeholder bar. Stays still when Reduce Motion is on. */
function Bar({ width = '100%', height = 14, pulse }: { width?: DimensionValue; height?: number; pulse: Animated.Value }) {
  return <Animated.View style={[styles.bar, { width, height, opacity: pulse }]} />;
}

/**
 * Placeholder cards shown while a screen loads, in the shape of the cards that are coming,
 * so the page does not jump when the real content arrives. The words stay for screen readers.
 */
export function SkeletonCards({ count = 3, label }: { count?: number; label: string }) {
  const pulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled || reduce) return;
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 0.9, duration: 900, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0.45, duration: 900, useNativeDriver: true }),
        ]),
      );
      loop.start();
    });
    return () => {
      cancelled = true;
      loop?.stop();
    };
  }, [pulse]);

  return (
    <View accessibilityLiveRegion="polite" accessibilityLabel={label} style={styles.wrap}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={styles.card} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Bar width="38%" height={12} pulse={pulse} />
          <Bar width="72%" height={22} pulse={pulse} />
          <Bar pulse={pulse} />
          <Bar width="84%" pulse={pulse} />
        </View>
      ))}
      <Text style={styles.caption}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md },
  card: {
    backgroundColor: colors.charcoal, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.hairline, padding: space.lg, gap: 12,
  },
  bar: { borderRadius: 6, backgroundColor: colors.hairline },
  caption: { fontFamily: fonts.body, fontSize: 15, color: colors.parchmentMuted, textAlign: 'center', marginTop: 2 },
});
