import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from 'react-native';
import { LENS_TEXT, LensIcon } from '@/components/Lens';
import { buildTimeLordBar } from '@/lib/timeLordBar';
import { colors, fonts, space } from '@/theme/tokens';

interface Props {
  planet: string;
  startYear: number;
  endYear: number;
  yearsRemaining: number;
  next: string | null;
}

/**
 * The Time Lord's years as a bar that fills to where you are, with "You are here" written above it and
 * the next planet written at the end. The fill grows once when it appears, and not at all with Reduce Motion.
 */
export function TimeLordBar({ planet, startYear, endYear, yearsRemaining, next }: Props) {
  const model = buildTimeLordBar(planet, startYear, endYear, yearsRemaining, next);
  const [width, setWidth] = useState(0);
  const grow = useRef(new Animated.Value(0)).current;
  const fraction = model?.fraction ?? 0;

  useEffect(() => {
    if (width === 0) return;
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) {
        grow.setValue(1);
        return;
      }
      grow.setValue(0);
      Animated.timing(grow, { toValue: 1, duration: 900, delay: 100, useNativeDriver: true }).start();
    });
    return () => {
      cancelled = true;
    };
  }, [width, fraction, grow]);

  if (!model) return null;
  const fillX = grow.interpolate({ inputRange: [0, 1], outputRange: [-width, -width * (1 - model.fraction)] });
  const markX = grow.interpolate({ inputRange: [0, 1], outputRange: [0, width * model.fraction] });

  return (
    <View style={styles.card} accessible accessibilityRole="image" accessibilityLabel={model.spoken}>
      <Text style={styles.title}>{`${planet}: about ${model.yearsLeft} years left`}</Text>
      <View style={styles.markerRow} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <Animated.View style={[styles.marker, { transform: [{ translateX: markX }] }]}>
          <LensIcon lens="stoplight" size={14} color={LENS_TEXT.stoplight} />
          <Text style={styles.here}>You are here</Text>
        </Animated.View>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: width || '100%', transform: [{ translateX: fillX }] }]} />
      </View>
      <View style={styles.ends}>
        <Text style={styles.endText}>{startYear}</Text>
        <Text style={styles.endText}>{next ? `${endYear}, then ${next}` : String(endYear)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.charcoal, borderRadius: 22, borderWidth: 1, borderColor: colors.hairline,
    padding: space.md, gap: 8,
  },
  title: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.parchment },
  markerRow: { height: 20 },
  marker: { position: 'absolute', left: -7, top: 0, flexDirection: 'row', alignItems: 'center', gap: 6 },
  here: { fontFamily: fonts.bodyBold, fontSize: 13, color: LENS_TEXT.stoplight },
  track: { height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: colors.stoplight, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: 'rgba(200,62,62,0.55)' },
  ends: { flexDirection: 'row', justifyContent: 'space-between' },
  endText: { fontFamily: fonts.body, fontSize: 13, color: colors.parchmentMuted },
});
