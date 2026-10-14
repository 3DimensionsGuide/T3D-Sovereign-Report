import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Glass } from '@/components/Glass';
import { Pressable } from '@/components/Pressable';
import { journeyTitle, journeyView } from '@/lib/journey';
import { usePremium } from '@/lib/usePremium';
import { localDateString } from '@/lib/useTimeline';
import { useJourneyStore } from '@/store/useJourneyStore';
import { usePartnerStore } from '@/store/usePartnerStore';
import { usePracticeStore } from '@/store/usePracticeStore';
import { colors, fonts, radius, space, TOUCH } from '@/theme/tokens';

/** On Today: up to three things worth trying in the first week, each opening the right tab. Calm, never a quiz. */
export function JourneyCard() {
  const { startedOn, visited, dismissed, start, dismiss } = useJourneyStore();
  const premium = usePremium();
  const decisions = usePracticeStore((s) => s.decisions.length);
  const people = usePartnerStore((s) => s.people.length);
  const today = localDateString();

  useEffect(() => { start(today); }, [start, today]);

  const v = journeyView({ startedOn: startedOn ?? today, today, dismissed, premium, visited, decisions, people });
  if (!v.show) return null;

  const next = v.steps.find((s) => !s.done) ?? null;
  const more = v.allDone ? 0 : v.total - v.doneCount - 1;

  return (
    <Glass style={styles.card}>
      <View style={styles.head}>
        <Text accessibilityRole="header" style={styles.title}>{journeyTitle(v)}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Hide the first week card" onPress={dismiss} style={styles.close} hitSlop={8}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`${v.doneCount} of ${v.total} done`}
        accessibilityValue={{ min: 0, max: v.total, now: v.doneCount }}
        style={styles.progressRow}
      >
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${(v.doneCount / v.total) * 100}%` }]} />
        </View>
        <Text style={styles.count}>{v.doneCount} of {v.total}</Text>
      </View>
      {next ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Next: ${next.label}. ${next.detail}${more > 0 ? ` ${more} more after this.` : ''}`}
          onPress={() => router.push(next.route as Href)}
          style={styles.step}
        >
          <Text style={styles.stepLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>{next.label}</Text>
          <Text style={styles.chev}>›</Text>
        </Pressable>
      ) : (
        <Text style={styles.small}>Everything here is yours to come back to.</Text>
      )}
    </Glass>
  );
}

const styles = StyleSheet.create({
  card: { borderColor: colors.goldEdge, paddingVertical: space.md, paddingHorizontal: space.lg, gap: space.sm },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  title: { flex: 1, fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 20, lineHeight: 27, color: colors.parchment },
  close: { width: TOUCH, height: 40, alignItems: 'flex-end', justifyContent: 'center' },
  closeText: { fontFamily: fonts.bodyMedium, fontSize: 17, color: colors.parchmentMuted },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.hairline, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.gold },
  count: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.parchmentMuted },
  step: {
    minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.md,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.line,
  },
  stepLabel: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.parchment },
  small: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  chev: { fontFamily: fonts.body, fontSize: 24, color: colors.parchmentMuted },
});
