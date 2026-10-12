import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/components/Pressable';
import { useRouter, type Href } from 'expo-router';
import { LENS_COLOR, LENS_TEXT, LensIcon, SIGNAL_COLOR } from '@/components/Lens';
import { MotionLensIcon } from '@/components/LensMotion';
import { lensTap } from '@/lib/haptics';
import { buildRoadStrip } from '@/lib/roadStrip';
import { useNumerology } from '@/lib/useNumerology';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, radius, space } from '@/theme/tokens';

interface Props {
  /** The calendar day being shown, YYYY-MM-DD. */
  date: string;
  /** That day's Personal Year number, when known. */
  personalYear: number | null;
}

/**
 * The Road as a strip: the four Pinnacles along a life, the Challenge beside each, and a marker
 * for where you are. Numbers are written on the strip and the current phase is written out in a
 * sentence, so nothing depends on colour. Tap it to open the Timeline.
 */
export function RoadStrip({ date, personalYear }: Props) {
  const router = useRouter();
  const chart = useT3DStore((s) => s.chart);
  const profile = useT3DStore((s) => s.profile);
  const { data } = useNumerology(chart?.leadId, profile?.email.trim());

  const model = useMemo(
    () => (data ? buildRoadStrip(data.pinnacles, data.challenges, date, personalYear) : null),
    [data, date, personalYear],
  );
  const [trackWidth, setTrackWidth] = useState(0);
  const slide = useRef(new Animated.Value(0)).current;
  const markerPct = model?.markerPct ?? 0;
  useEffect(() => {
    if (!model || trackWidth === 0) return;
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) {
        slide.setValue(1);
        return;
      }
      slide.setValue(0);
      Animated.timing(slide, { toValue: 1, duration: 900, delay: 150, useNativeDriver: true }).start();
    });
    return () => {
      cancelled = true;
    };
  }, [model, trackWidth, markerPct, slide]);
  if (!model) return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`The Road. ${model.spokenSummary} Opens your timeline.`}
      onPress={() => {
        lensTap('road');
        router.push('/timeline' as Href);
      }}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.head}>
        <MotionLensIcon lens="road" size={13} />
        <Text maxFontSizeMultiplier={1.3} accessibilityRole="header" style={[styles.lens, { color: LENS_TEXT.road }]}>Where you are on the Road</Text>
        <Text maxFontSizeMultiplier={1.3} accessibilityElementsHidden style={styles.chevron}>›</Text>
      </View>

      <View style={styles.stripWrap} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={styles.markerTrack} onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}>
          <Animated.View
            style={[
              styles.marker,
              {
                left: 0,
                opacity: slide.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 1] }),
                transform: [{ translateX: slide.interpolate({ inputRange: [0, 1], outputRange: [0, (model.markerPct / 100) * trackWidth] }) }],
              },
            ]}
          >
            <View style={{ transform: [{ rotate: '180deg' }] }}>
              <LensIcon lens="road" size={16} color={LENS_TEXT.road} />
            </View>
          </Animated.View>
        </View>
        <View style={styles.strip}>
          {model.segments.map((s) => (
            <View
              key={s.index}
              style={[
                styles.segment,
                { flex: s.widthPct },
                s.current ? styles.segmentNow : s.past ? styles.segmentPast : styles.segmentAhead,
              ]}
            >
              <Text maxFontSizeMultiplier={1.3} style={[styles.segNumber, s.past && styles.dim]}>{s.number}</Text>
            </View>
          ))}
        </View>
        <View style={styles.challengeRow}>
          {model.segments.map((s) => (
            <View key={s.index} style={{ flex: s.widthPct, alignItems: 'center' }}>
              {s.challenge === null ? null : (
                <View style={[styles.bump, s.past && styles.dim, s.current && styles.bumpNow]}>
                  <Text maxFontSizeMultiplier={1.3} style={styles.challenge}>{`C${s.challenge}`}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      <Text maxFontSizeMultiplier={1.3} style={styles.sentence}>{model.sentence}</Text>
      {model.match ? <Text maxFontSizeMultiplier={1.3} style={styles.match}>{model.match}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.charcoal, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline,
    padding: space.lg, gap: space.sm,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  lens: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 0.3, flexShrink: 1 },
  stripWrap: { gap: 4, paddingTop: space.xs },
  strip: { flexDirection: 'row', gap: 3 },
  segment: {
    height: 34, minWidth: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  segmentAhead: { borderColor: LENS_COLOR.road, backgroundColor: 'transparent' },
  segmentPast: { borderColor: 'rgba(31,138,77,0.45)', backgroundColor: 'rgba(31,138,77,0.14)' },
  segmentNow: { borderColor: LENS_TEXT.road, borderWidth: 2, backgroundColor: 'rgba(31,138,77,0.5)' },
  segNumber: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.parchment },
  dim: { opacity: 0.7 },
  challengeRow: { flexDirection: 'row', gap: 3 },
  challenge: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.parchment },
  bump: {
    minWidth: 26, height: 22, borderRadius: 5, borderWidth: 1.5, borderColor: SIGNAL_COLOR.friction,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  bumpNow: { borderColor: colors.gold, borderWidth: 2 },
  markerTrack: { height: 18, position: 'relative' },
  marker: { position: 'absolute', top: 0, marginLeft: -8 },
  sentence: { fontFamily: fonts.bodyMedium, fontSize: 16, lineHeight: 23, color: colors.parchment },
  match: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: LENS_TEXT.road },
  chevron: { fontFamily: fonts.bodyBold, fontSize: 22, lineHeight: 24, color: colors.gold, marginLeft: 'auto' },
});
