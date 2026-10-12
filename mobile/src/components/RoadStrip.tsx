import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { LENS_COLOR, LENS_TEXT, LensIcon } from '@/components/Lens';
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
        <Text accessibilityRole="header" style={[styles.lens, { color: LENS_TEXT.road }]}>Where you are on the Road</Text>
        <Text accessibilityElementsHidden style={styles.chevron}>›</Text>
      </View>

      <View style={styles.stripWrap} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
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
              <Text style={[styles.segNumber, s.past && styles.dim]}>{s.number}</Text>
            </View>
          ))}
        </View>
        <View style={styles.challengeRow}>
          {model.segments.map((s) => (
            <View key={s.index} style={{ flex: s.widthPct, alignItems: 'center' }}>
              {s.challenge === null ? null : (
                <Text style={[styles.challenge, s.past && styles.dim]}>{`C${s.challenge}`}</Text>
              )}
            </View>
          ))}
        </View>
        <View style={styles.markerTrack}>
          <View style={[styles.marker, { left: `${model.markerPct}%` }]}>
            <LensIcon lens="road" size={16} color={LENS_TEXT.road} />
          </View>
        </View>
      </View>

      <Text style={styles.sentence}>{model.sentence}</Text>
      {model.match ? <Text style={styles.match}>{model.match}</Text> : null}
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
  challenge: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.parchmentMuted },
  markerTrack: { height: 18, position: 'relative' },
  marker: { position: 'absolute', top: 0, marginLeft: -8 },
  sentence: { fontFamily: fonts.bodyMedium, fontSize: 16, lineHeight: 23, color: colors.parchment },
  match: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: LENS_TEXT.road },
  chevron: { fontFamily: fonts.bodyBold, fontSize: 22, lineHeight: 24, color: colors.gold, marginLeft: 'auto' },
});
