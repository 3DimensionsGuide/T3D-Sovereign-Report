import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Glass } from '@/components/Glass';
import { Pressable } from '@/components/Pressable';
import { doneNote, journeyTitle, journeyView } from '@/lib/journey';
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

  // The person can page back and forth through the steps; it opens on the first one not done yet.
  const [picked, setPicked] = useState<number | null>(null);
  const index = Math.min(Math.max(picked ?? v.firstOpen, 0), v.all.length - 1);
  const step = v.all[index]!;
  const go = (delta: number) => setPicked(Math.min(Math.max(index + delta, 0), v.all.length - 1));

  return (
    <Glass style={styles.card}>
      <View style={styles.head}>
        <Text accessibilityRole="header" style={styles.title}>{journeyTitle(index, v.all.length)}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Hide the first week card" onPress={dismiss} style={styles.close} hitSlop={8}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`Day ${index + 1} of ${v.all.length} of your first week${v.doneCount > 0 ? `, ${v.doneCount} done` : ''}`}
        accessibilityValue={{ min: 1, max: v.all.length, now: index + 1 }}
        style={styles.progressRow}
      >
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${((index + 1) / v.all.length) * 100}%` }]} />
        </View>
        <Text style={styles.count}>{doneNote(v.doneCount)}</Text>
      </View>
      <View style={styles.pager}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous step"
          accessibilityState={{ disabled: index === 0 }}
          disabled={index === 0}
          onPress={() => go(-1)}
          style={[styles.arrow, index === 0 && styles.arrowOff]}
        >
          <Text style={styles.chev}>‹</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Step ${index + 1} of ${v.all.length}${step.done ? ', done' : ''}. ${step.label}. ${step.detail}`}
          onPress={() => router.push(step.route as Href)}
          style={styles.step}
        >
          <Text style={styles.stepLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
            {step.done ? '✓  ' : ''}{step.label}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next step"
          accessibilityState={{ disabled: index === v.all.length - 1 }}
          disabled={index === v.all.length - 1}
          onPress={() => go(1)}
          style={[styles.arrow, index === v.all.length - 1 && styles.arrowOff]}
        >
          <Text style={styles.chev}>›</Text>
        </Pressable>
      </View>
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
  pager: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  arrow: { width: 44, minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  arrowOff: { opacity: 0.35 },
  step: {
    flex: 1, minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.md,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.line,
  },
  stepLabel: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.parchment },
  small: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  chev: { fontFamily: fonts.body, fontSize: 24, color: colors.parchmentMuted },
});
