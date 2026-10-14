import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/components/Pressable';
import { router, type Href } from 'expo-router';
import { LensIcon } from '@/components/Lens';
import { lensTap } from '@/lib/haptics';
import { currentStop, showTodayCard, STOPS, TOTAL_DAYS } from '@/lib/meetTriad';
import { useLocalDate } from '@/lib/useLocalDate';
import { useMeetTriadHydrated, useMeetTriadStore } from '@/store/useMeetTriadStore';
import { glassFill } from '@/lib/glass';
import { colors, fonts, radius, space } from '@/theme/tokens';

/** The first-week card on Today. It starts the seven days the first time it shows, and goes away when the week is over. */
export function MeetTriadCard() {
  const hydrated = useMeetTriadHydrated();
  const { startedOn, done, premium, start } = useMeetTriadStore();
  const liveDate = useLocalDate();
  useEffect(() => {
    if (hydrated) start(liveDate);
  }, [hydrated, liveDate, start]);

  if (!hydrated || !showTodayCard(startedOn, liveDate, done, premium)) return null;
  const day = currentStop(startedOn ?? liveDate, liveDate);
  const stop = STOPS[day - 1]!;
  const summary = `Day ${day} of ${TOTAL_DAYS}: ${stop.title}. ${done.length} done.`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Meet your Triad. ${summary} Opens your first week.`}
      onPress={() => {
        lensTap('road');
        router.push('/meet-triad' as Href);
      }}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.shapes}>
        <LensIcon lens="vehicle" size={16} />
        <LensIcon lens="road" size={16} />
        <LensIcon lens="stoplight" size={16} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>Meet your Triad</Text>
        <Text style={styles.line}>{summary}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: glassFill(), borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline,
    padding: space.lg, flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 64,
  },
  shapes: { flexDirection: 'row', gap: 4 },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.gold },
  line: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchment },
  chevron: { fontFamily: fonts.bodyBold, fontSize: 22, color: colors.gold },
});
