import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { router, type Href } from 'expo-router';
import { Glass } from '@/components/Glass';
import { Pressable } from '@/components/Pressable';
import { dayOf, journeyHint, journeyView, stepSpoken } from '@/lib/journey';
import { useReduceMotion } from '@/lib/motion';
import { usePremium } from '@/lib/usePremium';
import { localDateString } from '@/lib/useTimeline';
import { useJourneyStore } from '@/store/useJourneyStore';
import { usePartnerStore } from '@/store/usePartnerStore';
import { usePracticeStore } from '@/store/usePracticeStore';
import { colors, fonts, space } from '@/theme/tokens';

/**
 * On Today, below the signal: one slim tile for a short guided plan, one step a day.
 * The whole tile opens the step. A row of numbered pills switches days; a finished day shows a tick.
 * Gold is used only for the tick and the current day, so the signal stays the page's one hero.
 */
export function JourneyCard() {
  const { startedOn, visited, dismissed, start, dismiss } = useJourneyStore();
  const premium = usePremium();
  const decisions = usePracticeStore((s) => s.decisions.length);
  const people = usePartnerStore((s) => s.people.length);
  const reduce = useReduceMotion();
  const today = localDateString();
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => { start(today); }, [start, today]);

  const v = journeyView({ startedOn: startedOn ?? today, today, dismissed, premium, visited, decisions, people });
  if (!v.show) return null;

  // It opens on the first step not done yet; tapping a number shows that day's step.
  const total = v.all.length;
  const index = Math.min(Math.max(picked ?? v.firstOpen, 0), total - 1);
  const step = v.all[index]!;

  return (
    <Glass style={styles.card}>
      <View style={styles.head}>
        <Text accessibilityRole="header" style={styles.top} numberOfLines={1}>
          <Text style={styles.gold}>Your first week</Text>
          {`  ·  ${dayOf(index, total)}`}
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Hide the first week card" onPress={dismiss} style={styles.close} hitSlop={8}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>

      {v.doneCount === 0 ? <Text style={styles.hint}>{journeyHint(total)}</Text> : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={stepSpoken(index, total, step)}
        onPress={() => router.push(step.route as Href)}
        style={styles.tile}
      >
        <Animated.View key={step.key} entering={reduce ? undefined : FadeIn.duration(220)} style={styles.tileText}>
          <Text style={styles.stepTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
            {step.done ? '✓  ' : ''}{step.label}
          </Text>
          <Text style={styles.detail} numberOfLines={1}>{step.detail}</Text>
        </Animated.View>
        <Text style={styles.chev}>›</Text>
      </Pressable>

      <View style={styles.pills} accessibilityRole="tablist">
        {v.all.map((s, i) => {
          const current = i === index;
          return (
            <Pressable
              key={s.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: current }}
              accessibilityLabel={`${dayOf(i, total)}, ${s.label}, ${s.done ? 'done' : 'not done yet'}`}
              onPress={() => setPicked(i)}
              style={styles.pillHit}
            >
              <View style={[styles.pill, s.done && styles.pillDone, current && styles.pillCurrent]}>
                <Text style={[styles.pillText, s.done && styles.pillTextDone, current && styles.pillTextCurrent]}>
                  {s.done ? '✓' : String(i + 1)}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </Glass>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: space.sm, paddingHorizontal: space.lg, gap: space.xs },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  top: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.parchmentMuted },
  gold: { fontFamily: fonts.bodyBold, color: colors.gold },
  close: { width: 52, height: 44, alignItems: 'flex-end', justifyContent: 'center' },
  closeText: { fontFamily: fonts.bodyMedium, fontSize: 17, color: colors.parchmentMuted },
  hint: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  tile: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: space.md },
  tileText: { flex: 1, gap: 2 },
  stepTitle: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 20, lineHeight: 27, color: colors.parchment },
  detail: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  chev: { fontFamily: fonts.body, fontSize: 24, color: colors.parchmentMuted },
  pills: { flexDirection: 'row', gap: space.sm },
  pillHit: { flex: 1, height: 48, justifyContent: 'center' },
  pill: { height: 26, borderRadius: 13, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  // Done: a gold outline with a gold tick. Current: the one solid gold pill. Moving to another day hands the solid fill over.
  pillDone: { borderColor: colors.gold },
  pillCurrent: { backgroundColor: colors.gold, borderColor: colors.gold },
  pillText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.parchmentMuted },
  pillTextDone: { color: colors.gold },
  pillTextCurrent: { color: colors.obsidian },
});
