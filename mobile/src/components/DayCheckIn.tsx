import { StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Pressable } from '@/components/Pressable';
import { select } from '@/lib/haptics';
import { FEELINGS, FEELING_GLYPH, FEELING_WORD, type DayContext, type Feeling } from '@/lib/dayLog';
import { useDayLogStore } from '@/store/useDayLogStore';
import { Glass } from '@/components/Glass';
import { colors, fonts, radius, space, TOUCH } from '@/theme/tokens';

/**
 * "How did today land?" One tap, once a day, on the live day. Each answer is a shape and a word, never
 * color alone. Saved on this phone only; the sky and number of the day are saved with it.
 */
export function DayCheckIn({ date, ctx }: { date: string; ctx: DayContext }) {
  const entry = useDayLogStore((s) => s.log[date]);
  const setFeeling = useDayLogStore((s) => s.setFeeling);
  const count = useDayLogStore((s) => Object.keys(s.log).length);

  function choose(f: Feeling) {
    select();
    setFeeling(date, f, ctx);
  }

  return (
    <Glass style={styles.card}>
      <Text accessibilityRole="header" style={styles.title}>How did today land?</Text>
      <Text style={styles.body}>
        {entry ? `You marked today ${FEELING_WORD[entry.feeling].toLowerCase()}. Tap another to change it.` : 'One tap. Your answers stay on this phone.'}
      </Text>
      <View style={styles.row}>
        {FEELINGS.map((f) => {
          const on = entry?.feeling === f;
          return (
            <Pressable
              key={f}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${FEELING_WORD[f]}${on ? ', chosen' : ''}`}
              onPress={() => choose(f)}
              style={({ pressed }) => [styles.choice, on && styles.choiceOn, pressed && { opacity: 0.8 }]}
            >
              <Text style={[styles.glyph, on && styles.onText]}>{FEELING_GLYPH[f]}</Text>
              <Text style={[styles.word, on && styles.onText]}>{FEELING_WORD[f]}</Text>
            </Pressable>
          );
        })}
      </View>
      {count > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="See your rhythm"
          onPress={() => router.push('/rhythm' as Href)}
          style={({ pressed }) => [styles.link, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.linkText}>See your rhythm ({count} {count === 1 ? 'day' : 'days'} logged)</Text>
        </Pressable>
      ) : null}
    </Glass>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: colors.hairline,
    padding: space.lg, gap: space.sm,
  },
  title: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28, color: colors.parchment },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  row: { flexDirection: 'row', gap: 8, marginTop: 4 },
  choice: {
    flex: 1, minHeight: 64, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.hairline,
    alignItems: 'center', justifyContent: 'center', gap: 2, backgroundColor: colors.obsidian,
  },
  choiceOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  glyph: { fontFamily: fonts.bodyBold, fontSize: 20, color: colors.gold },
  word: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.parchment },
  onText: { color: colors.obsidian },
  link: { minHeight: TOUCH, justifyContent: 'center' },
  linkText: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.gold },
});
