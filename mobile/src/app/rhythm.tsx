import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable } from '@/components/Pressable';
import {
  FEELINGS, FEELING_GLYPH, FEELING_WORD, MIN_FOR_PATTERNS, daysToPatterns, findPatterns, monthlyCounts,
  recentEntries, weeklyRecap,
} from '@/lib/dayLog';
import { useLocalDate } from '@/lib/useLocalDate';
import { useDayLogStore } from '@/store/useDayLogStore';
import { colors, fonts, radius, space, TOUCH } from '@/theme/tokens';

/** Weekday letter for a YYYY-MM-DD date. */
function weekdayLetter(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'narrow' });
}

export default function Rhythm() {
  const log = useDayLogStore((s) => s.log);
  const today = useLocalDate();
  const total = Object.keys(log).length;
  const week = weeklyRecap(log, today);
  const month = monthlyCounts(log, today);
  const patterns = findPatterns(log);
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(`${today}T12:00:00`);
    d.setDate(d.getDate() - (6 - i));
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { date, entry: log[date] };
  });
  const loggedRecent = recentEntries(log, today, 7).length;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text accessibilityRole="header" style={styles.title}>Your rhythm</Text>
          <Text style={styles.body}>
            What you marked each day, and what the sky and numbers were doing. These are your own notes, kept on this phone. They
            show what you noticed, not what will happen.
          </Text>

          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.cardTitle}>The last seven days</Text>
            <View style={styles.week}>
              {last7.map(({ date, entry }) => (
                <View
                  key={date}
                  accessible
                  accessibilityLabel={`${date}: ${entry ? FEELING_WORD[entry.feeling] : 'not logged'}`}
                  style={styles.day}
                >
                  <Text style={styles.dayLetter}>{weekdayLetter(date)}</Text>
                  <Text style={[styles.dayGlyph, !entry && { color: colors.parchmentMuted }]}>{entry ? FEELING_GLYPH[entry.feeling] : '·'}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.body}>
              {week.kind === 'week' ? week.line : `Log at least 3 days in a week to see its summary. You have ${loggedRecent} so far.`}
            </Text>
            <Text style={styles.legend}>
              {FEELINGS.map((f) => `${FEELING_GLYPH[f]} ${FEELING_WORD[f]}`).join('   ')}
            </Text>
          </View>

          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.cardTitle}>The last 28 days</Text>
            <Text style={styles.body}>
              {month.logged === 0
                ? 'Nothing logged yet. Mark a day on Today.'
                : `You logged ${month.logged} of 28 days: ${FEELINGS.map((f) => `${month.counts[f]} ${FEELING_WORD[f].toLowerCase()}`).join(', ')}.`}
            </Text>
          </View>

          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.cardTitle}>Patterns so far</Text>
            {total < MIN_FOR_PATTERNS ? (
              <Text style={styles.body}>
                Patterns appear once you have logged {MIN_FOR_PATTERNS} days. {daysToPatterns(log)} to go. Fewer notes than that
                would only show chance.
              </Text>
            ) : patterns.length === 0 ? (
              <Text style={styles.body}>
                Nothing stands out yet. That is a real result: your days have not split clearly by number, signal or Moon sign. Keep
                logging and check again.
              </Text>
            ) : (
              <>
                {patterns.map((p) => (
                  <View key={p.id} style={styles.pattern}>
                    <Text style={styles.patternLead}>{p.lean === 'clearer' ? '○ Tends clearer' : '● Tends heavier'}</Text>
                    <Text style={styles.body}>{p.text}</Text>
                  </View>
                ))}
                <Text style={styles.legend}>
                  Small counts can be chance. Treat these as things to watch, not rules.
                </Text>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.obsidian },
  safe: { flex: 1 },
  content: { padding: space.lg, gap: space.md, paddingBottom: space.xl * 2 },
  back: { minHeight: TOUCH - 4, justifyContent: 'center', alignSelf: 'flex-start' },
  backText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.parchmentMuted },
  title: { fontFamily: fonts.display, fontSize: 32, lineHeight: 40, color: colors.parchment },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline,
    padding: space.lg, gap: space.sm,
  },
  cardTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.parchment },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: 4, minWidth: 36 },
  dayLetter: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.parchmentMuted },
  dayGlyph: { fontFamily: fonts.bodyBold, fontSize: 22, color: colors.gold },
  legend: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.parchmentMuted },
  pattern: { gap: 2, paddingTop: 4 },
  patternLead: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.gold },
});
