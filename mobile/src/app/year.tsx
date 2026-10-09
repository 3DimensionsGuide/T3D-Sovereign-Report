import { useEffect, useRef } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoldButton } from '@/components/GoldButton';
import { OfflineNote } from '@/components/OfflineNote';
import { useTimeline } from '@/lib/useTimeline';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, radius, space, TOUCH } from '@/theme/tokens';

function dayLabel(isoDay: string): string {
  const [y, m, d] = isoDay.split('-').map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function YearAheadScreen() {
  const profile = useT3DStore((s) => s.profile);
  const chart = useT3DStore((s) => s.chart);
  const { data, error, loading, refreshing, refresh, retry, offline, savedAt } = useTimeline(chart?.leadId, profile?.email.trim(), 60);
  const y = data?.yearAhead;

  // A copy saved before this screen existed has no year ahead in it. Fetch a fresh one once, by itself.
  const triedRefresh = useRef(false);
  const missing = Boolean(data) && !y;
  useEffect(() => {
    if (missing && !offline && !triedRefresh.current) {
      triedRefresh.current = true;
      refresh();
    }
  }, [missing, offline, refresh]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← BACK</Text>
          </Pressable>
          <Text style={styles.eyebrow}>YOUR YEAR AHEAD</Text>
          <Text accessibilityRole="header" style={styles.title}>The year in one view</Text>

          {loading && !data ? <ActivityIndicator color={colors.gold} /> : null}
          {error && !data ? (
            <>
              <Text style={styles.body}>{error}</Text>
              <GoldButton label="TRY AGAIN" variant="ghost" onPress={retry} />
            </>
          ) : null}
          {offline && data ? <OfflineNote savedAt={savedAt} /> : null}

          {data && !y && (refreshing || !triedRefresh.current) ? <ActivityIndicator color={colors.gold} /> : null}
          {data && !y && !refreshing && triedRefresh.current ? (
            <>
              <Text style={styles.body}>
                We could not load your year ahead just now. Check your connection and try again.
              </Text>
              <GoldButton label="TRY AGAIN" variant="ghost" onPress={() => refresh()} />
            </>
          ) : null}

          {y ? (
            <>
              <Text style={styles.lede}>
                Your year runs from {dayLabel(y.startsOn)} to {dayLabel(y.endsOn)}. You are {y.age}.
              </Text>
              <View style={[styles.card, { borderLeftColor: colors.gold }]}>
                <Text style={styles.cardEyebrow}>THE SHORT VERSION</Text>
                <Text style={styles.body}>{y.summary}</Text>
              </View>

              <View style={[styles.card, { borderLeftColor: colors.stoplight }]}>
                <Text style={[styles.cardEyebrow, { color: colors.stoplight }]}>● THE TOPIC OF THE YEAR</Text>
                <Text accessibilityRole="header" style={styles.cardTitle}>
                  {y.topic.houseName} (house {y.topic.house}) in {y.topic.sign}
                </Text>
                <Text style={styles.body}>{y.topic.theme}</Text>
                <Text style={styles.cardTitle}>Lord of the Year: {y.topic.lord}</Text>
                {y.topic.lordQuote ? <Text style={styles.body}>{y.topic.lordQuote}</Text> : null}
              </View>

              <View style={[styles.card, { borderLeftColor: colors.road }]}>
                <Text style={[styles.cardEyebrow, { color: colors.road }]}>▲ THE PACE OF THE YEAR</Text>
                {y.pace.personalYear ? (
                  <>
                    <Text accessibilityRole="header" style={styles.cardTitle}>
                      Personal Year {y.pace.personalYear}{y.pace.word ? ` · ${y.pace.word}` : ''}
                    </Text>
                    {y.pace.line ? <Text style={styles.body}>{y.pace.line}</Text> : null}
                  </>
                ) : null}
                <Text style={styles.small}>Universal Year {y.pace.universalYear}.</Text>
              </View>

              <View style={[styles.card, { borderLeftColor: colors.vehicle }]}>
                <Text style={[styles.cardEyebrow, { color: colors.vehicle }]}>◆ THE LONGER CHAPTER</Text>
                {y.chapter.items.length === 0 ? (
                  <Text style={styles.body}>{y.chapter.none}</Text>
                ) : (
                  y.chapter.items.map((c) => (
                    <View key={c.name} style={styles.item}>
                      <Text accessibilityRole="header" style={styles.cardTitle}>{c.name}</Text>
                      <Text style={styles.small}>
                        {c.when === 'now' ? 'In this year' : 'Coming next year'} · ages {c.ages}
                      </Text>
                      <Text style={styles.body}>{c.text}</Text>
                    </View>
                  ))
                )}
              </View>

              <Text style={styles.small}>{y.closing}</Text>
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.obsidian },
  safe: { flex: 1 },
  content: { paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.md },
  back: { minHeight: TOUCH - 4, justifyContent: 'center', alignSelf: 'flex-start' },
  backText: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 1.6, color: colors.parchmentMuted },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 3, color: colors.gold },
  title: { fontFamily: fonts.display, fontSize: 34, lineHeight: 42, color: colors.parchment },
  lede: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.parchmentMuted },
  card: {
    backgroundColor: colors.charcoal, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline,
    borderLeftWidth: 4, padding: space.lg, gap: 10,
  },
  cardEyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2, color: colors.gold },
  cardTitle: { fontFamily: fonts.display, fontSize: 20, lineHeight: 27, color: colors.parchment },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.parchment },
  small: { fontFamily: fonts.body, fontSize: 13, lineHeight: 20, color: colors.parchmentMuted },
  item: { gap: 6 },
});
