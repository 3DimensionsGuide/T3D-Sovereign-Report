import { StyleSheet, Text, View } from 'react-native';
import { Field } from '@/components/Field';
import { GoldButton } from '@/components/GoldButton';
import type { PracticeData } from '@/lib/practiceTypes';
import { localDateString } from '@/lib/useTimeline';
import { addDays, daysBetween, usePracticeStore } from '@/store/usePracticeStore';
import { colors, fonts, radius, space } from '@/theme/tokens';

const DAYS = 7;

function DayStrip({ startedOn, todayIndex }: { startedOn: string; todayIndex: number }) {
  const entries = usePracticeStore((s) => s.entries);
  return (
    <View style={styles.strip} accessibilityLabel={`Day ${Math.min(todayIndex + 1, DAYS)} of ${DAYS}`}>
      {Array.from({ length: DAYS }, (_, i) => {
        const entry = entries[addDays(startedOn, i)];
        const count = entry ? entry.done.filter(Boolean).length : 0;
        const state = count === 3 ? 'Complete' : count > 0 ? 'Partly done' : i > todayIndex ? 'Upcoming' : 'Not done';
        const isToday = i === todayIndex;
        return (
          <View
            key={i}
            accessible
            accessibilityLabel={`Day ${i + 1}: ${state}${isToday ? ', today' : ''}`}
            style={[styles.dot, count === 3 && styles.dotDone, isToday && styles.dotToday]}
          >
            <Text style={[styles.dotText, count === 3 && { color: colors.obsidian }]}>{count === 3 ? '✓' : i + 1}</Text>
          </View>
        );
      })}
    </View>
  );
}

function Today({ data, date }: { data: PracticeData; date: string }) {
  const entry = usePracticeStore((s) => s.entries[date]);
  const toggleCheckin = usePracticeStore((s) => s.toggleCheckin);
  const setAnswer = usePracticeStore((s) => s.setAnswer);
  return (
    <View style={{ gap: 14 }}>
      {data.experiment.checkins.map((c, i) => {
        const index = i as 0 | 1 | 2;
        const done = entry?.done[index] ?? false;
        return (
          <View key={c.when} style={[styles.checkin, done && { borderColor: colors.gold }]}>
            <Text style={styles.when}>{c.when.toUpperCase()}</Text>
            <Text style={styles.body}>{c.question}</Text>
            <Field
              label="What I noticed"
              value={entry?.answers[index] ?? ''}
              onChangeText={(t) => setAnswer(date, index, t)}
              multiline
              maxLength={400}
              textAlignVertical="top"
            />
            <GoldButton
              label={done ? '✓  Done (tap to undo)' : 'Mark done'}
              variant={done ? 'ghost' : 'gold'}
              onPress={() => toggleCheckin(date, index)}
            />
          </View>
        );
      })}
    </View>
  );
}

function Finale({ data, startedOn }: { data: PracticeData; startedOn: string }) {
  const entries = usePracticeStore((s) => s.entries);
  const review = usePracticeStore((s) => s.review);
  const setReview = usePracticeStore((s) => s.setReview);
  const restart = usePracticeStore((s) => s.restartExperiment);
  const start = usePracticeStore((s) => s.startExperiment);
  const full = Array.from({ length: DAYS }, (_, i) => entries[addDays(startedOn, i)]).filter((e) => e && e.done.every(Boolean)).length;
  const total = Array.from({ length: DAYS }, (_, i) => entries[addDays(startedOn, i)]).reduce(
    (n, e) => n + (e ? e.done.filter(Boolean).length : 0), 0,
  );
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>WEEK COMPLETE</Text>
      <Text accessibilityRole="header" style={styles.title}>{data.experiment.finale.title}</Text>
      <Text style={styles.body}>{data.experiment.finale.intro}</Text>
      <Text style={styles.small}>You completed {total} of 21 check-ins, with {full} full days.</Text>
      {data.experiment.finale.prompts.map((p, i) => (
        <Field
          key={p}
          label={p}
          value={review[i] ?? ''}
          onChangeText={(t) => setReview(i as 0 | 1 | 2, t)}
          multiline
          maxLength={600}
          textAlignVertical="top"
        />
      ))}
      <GoldButton label="Start a new week" onPress={() => start(localDateString())} />
      <GoldButton label="Close this experiment" variant="ghost" onPress={restart} />
    </View>
  );
}

export function SevenDay({ data }: { data: PracticeData }) {
  const startedOn = usePracticeStore((s) => s.startedOn);
  const start = usePracticeStore((s) => s.startExperiment);
  const restart = usePracticeStore((s) => s.restartExperiment);
  const today = localDateString();

  if (!startedOn) {
    return (
      <View style={styles.card}>
        <Text style={styles.eyebrow}>SEVEN-DAY EXPERIMENT{data.type ? ` · ${data.type.toUpperCase()}` : ''}</Text>
        <Text accessibilityRole="header" style={styles.title}>{data.experiment.title}</Text>
        <Text style={styles.body}>{data.experiment.premise}</Text>
        <Text style={styles.small}>Three short check-ins a day: morning, midday and evening. Your notes stay on this phone.</Text>
        <GoldButton label="Begin day 1" onPress={() => start(today)} />
      </View>
    );
  }

  const dayIndex = Math.max(0, daysBetween(startedOn, today));
  if (dayIndex >= DAYS) return <Finale data={data} startedOn={startedOn} />;

  return (
    <View style={{ gap: space.md }}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>{data.experiment.title.toUpperCase()}</Text>
        <Text accessibilityRole="header" style={styles.title}>Day {dayIndex + 1} of {DAYS}</Text>
        <DayStrip startedOn={startedOn} todayIndex={dayIndex} />
        <Text style={styles.small}>{data.experiment.premise}</Text>
      </View>
      <Today data={data} date={addDays(startedOn, dayIndex)} />
      <GoldButton label="Stop this experiment" variant="ghost" onPress={restart} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.charcoal, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline, padding: space.lg, gap: 14 },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2.2, color: colors.gold },
  title: { fontFamily: fonts.display, fontSize: 24, lineHeight: 31, color: colors.parchment },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.parchment },
  small: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.parchmentMuted },
  strip: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  dot: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.hairline },
  dotDone: { backgroundColor: colors.gold, borderColor: colors.gold },
  dotToday: { borderColor: colors.gold, borderWidth: 2 },
  dotText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.parchment },
  checkin: { backgroundColor: colors.charcoal, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline, padding: space.lg, gap: 12 },
  when: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.8, color: colors.gold },
});
