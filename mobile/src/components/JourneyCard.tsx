import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Glass } from '@/components/Glass';
import { GoldButton } from '@/components/GoldButton';
import { Pressable } from '@/components/Pressable';
import { JOURNEY_PURPOSE, doneNote, journeyHeading, journeyView, stepStatus } from '@/lib/journey';
import { usePremium } from '@/lib/usePremium';
import { localDateString } from '@/lib/useTimeline';
import { useJourneyStore } from '@/store/useJourneyStore';
import { usePartnerStore } from '@/store/usePartnerStore';
import { usePracticeStore } from '@/store/usePracticeStore';
import { colors, fonts, radius, space } from '@/theme/tokens';

/**
 * On Today, below the signal: a short guided plan for getting to know the app, one step a day.
 * A row of numbered days (a tick when done), the step for the chosen day, and a button that opens it.
 */
export function JourneyCard() {
  const { startedOn, visited, dismissed, start, dismiss } = useJourneyStore();
  const premium = usePremium();
  const decisions = usePracticeStore((s) => s.decisions.length);
  const people = usePartnerStore((s) => s.people.length);
  const today = localDateString();
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => { start(today); }, [start, today]);

  const v = journeyView({ startedOn: startedOn ?? today, today, dismissed, premium, visited, decisions, people });
  if (!v.show) return null;

  // It opens on the first step not done yet; tapping a day shows that day's step.
  const index = Math.min(Math.max(picked ?? v.firstOpen, 0), v.all.length - 1);
  const step = v.all[index]!;

  return (
    <Glass style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.eyebrow}>Your first week</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Hide the first week card" onPress={dismiss} style={styles.close} hitSlop={8}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>
      <Text accessibilityRole="header" style={styles.title}>{journeyHeading(v.all.length)}</Text>
      <Text style={styles.small}>{JOURNEY_PURPOSE}</Text>

      <View style={styles.days} accessibilityRole="tablist">
        {v.all.map((s, i) => {
          const current = i === index;
          return (
            <Pressable
              key={s.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: current }}
              accessibilityLabel={`Day ${i + 1}, ${s.label}, ${s.done ? 'done' : 'not done yet'}`}
              onPress={() => setPicked(i)}
              style={[styles.day, s.done && styles.dayDone, current && styles.dayCurrent]}
            >
              <Text style={[styles.dayText, s.done && styles.dayTextDone, current && !s.done && styles.dayTextCurrent]}>
                {s.done ? '✓' : String(i + 1)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.panel}>
        <View style={styles.statusRow}>
          <Text style={[styles.status, step.done && styles.statusDone]}>{stepStatus(index, step.done)}</Text>
          <Text style={styles.count}>{doneNote(v.doneCount, v.all.length)}</Text>
        </View>
        <Text style={styles.stepTitle}>{step.label}</Text>
        <Text style={styles.small}>{step.detail}</Text>
        <GoldButton
          label={step.done ? `${step.cta} again` : step.cta}
          variant={step.done ? 'ghost' : 'gold'}
          onPress={() => router.push(step.route as Href)}
        />
      </View>
    </Glass>
  );
}

const DAY = 48;

const styles = StyleSheet.create({
  card: { borderColor: colors.goldEdge, padding: space.lg, gap: space.md },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.gold },
  close: { width: 52, height: 40, alignItems: 'flex-end', justifyContent: 'center' },
  closeText: { fontFamily: fonts.bodyMedium, fontSize: 17, color: colors.parchmentMuted },
  title: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 22, lineHeight: 30, color: colors.parchment },
  small: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  day: {
    width: DAY, height: DAY, borderRadius: DAY / 2, borderWidth: 1, borderColor: colors.line,
    alignItems: 'center', justifyContent: 'center',
  },
  dayDone: { backgroundColor: colors.gold, borderColor: colors.gold },
  dayCurrent: { borderWidth: 2, borderColor: colors.gold },
  dayText: { fontFamily: fonts.bodyBold, fontSize: 17, color: colors.parchmentMuted },
  dayTextDone: { color: colors.obsidian },
  dayTextCurrent: { color: colors.gold },
  panel: { backgroundColor: colors.surfaceRaised, borderRadius: radius.md, padding: space.md, gap: space.sm },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  status: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.parchmentMuted },
  statusDone: { color: colors.gold },
  count: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.parchmentMuted },
  stepTitle: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 20, lineHeight: 27, color: colors.parchment },
});
