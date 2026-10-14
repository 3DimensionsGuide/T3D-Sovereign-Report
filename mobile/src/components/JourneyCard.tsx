import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Glass } from '@/components/Glass';
import { GoldButton } from '@/components/GoldButton';
import { Pressable } from '@/components/Pressable';
import { journeyTitle, journeyView } from '@/lib/journey';
import { usePremium } from '@/lib/usePremium';
import { localDateString } from '@/lib/useTimeline';
import { useJourneyStore } from '@/store/useJourneyStore';
import { usePartnerStore } from '@/store/usePartnerStore';
import { usePracticeStore } from '@/store/usePracticeStore';
import { colors, fonts, radius, space } from '@/theme/tokens';

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

  return (
    <Glass style={styles.card}>
      <Text style={styles.eyebrow}>Your first week</Text>
      <Text accessibilityRole="header" style={styles.title}>{journeyTitle(v)}</Text>
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
      {v.allDone ? (
        <>
          <Text style={styles.small}>Everything here is yours to come back to. Today is the place to start each day.</Text>
          <GoldButton label="Hide this" variant="ghost" onPress={dismiss} />
        </>
      ) : (
        <>
          {v.steps.map((s) => (
            <Pressable
              key={s.key}
              accessibilityRole="button"
              accessibilityLabel={`${s.label}. ${s.detail}`}
              onPress={() => router.push(s.route as Href)}
              style={styles.step}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.stepLabel}>{s.label}</Text>
                <Text style={styles.small}>{s.detail}</Text>
              </View>
              <Text style={styles.chev}>›</Text>
            </Pressable>
          ))}
          <GoldButton label="Hide this" variant="ghost" onPress={dismiss} />
        </>
      )}
    </Glass>
  );
}

const styles = StyleSheet.create({
  card: { borderColor: colors.goldEdge, padding: space.lg, gap: space.md },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.gold },
  title: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 24, lineHeight: 32, color: colors.parchment },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.hairline, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.gold },
  count: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.parchmentMuted },
  step: {
    minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.line,
  },
  stepLabel: { fontFamily: fonts.bodyMedium, fontSize: 17, lineHeight: 24, color: colors.parchment },
  small: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  chev: { fontFamily: fonts.body, fontSize: 24, color: colors.parchmentMuted },
});
