import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { FadeIn } from '@/components/FadeIn';
import { GoldButton } from '@/components/GoldButton';
import { DayNumerologyCard } from '@/components/DayNumerologyCard';
import {
  ChartRequestError, requestDayNumerology, requestToday, type DailyTransitHit, type TodayResult,
} from '@/lib/api';
import type { DayNumerology } from '@/lib/dayNumerologyTypes';
import { localDateString } from '@/lib/useTimeline';
import {
  aspectWord, bodyName, contactSentence, houseTheme, moonGlyph, natalName, ordinal, phaseMeaning,
} from '@/lib/skyText';
import { Term } from '@/components/Explain';
import { TransitSheet } from '@/components/TransitSheet';
import { aspectId, houseId, natalId, planetId } from '@/lib/termIds';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, radius, space } from '@/theme/tokens';

const NATURE_LABEL = { flow: '◯  Flow', friction: '◼  Friction', neutral: '◇  Neutral' } as const;

function TransitRow({ hit, onSelect }: { hit: DailyTransitHit; onSelect: (hit: DailyTransitHit) => void }) {
  const phrase = `${bodyName(hit.transiting)} ${aspectWord(hit.aspect)} your ${natalName(hit.natal)}`;
  const detail = `${hit.orb.toFixed(1)}° from exact · ${hit.applying ? 'applying' : 'separating'}${hit.peak ? ' · peak' : ''}`;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${phrase}. ${NATURE_LABEL[hit.nature].replace(/[^A-Za-z]/g, '')}. ${detail}. Opens the full meaning.`}
      onPress={() => onSelect(hit)}
      style={({ pressed }) => [styles.transitRow, hit.nature === 'friction' && styles.transitFriction, pressed && { opacity: 0.8 }]}
    >
      <Text style={styles.transitPhrase}>
        <Term id={planetId(hit.transiting)}>{bodyName(hit.transiting)}</Term>{' '}
        <Term id={aspectId(hit.aspect)}>{aspectWord(hit.aspect)}</Term> your{' '}
        <Term id={natalId(hit.natal)}>{natalName(hit.natal)}</Term>
      </Text>
      <Text style={styles.transitDetail}>{detail}</Text>
      <Text style={styles.transitNature}>{NATURE_LABEL[hit.nature]}</Text>
      <Text style={styles.transitMore}>TAP FOR FULL MEANING ›</Text>
    </Pressable>
  );
}

export default function Today() {
  const profile = useT3DStore((state) => state.profile);
  const chart = useT3DStore((state) => state.chart);

  const [today, setToday] = useState<TodayResult | null>(null);
  const [dayNum, setDayNum] = useState<DayNumerology | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedHit, setSelectedHit] = useState<DailyTransitHit | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!profile || !chart) return;
    setError(null);
    // Numerology of the day loads alongside the sky; if it fails the sky still shows.
    requestDayNumerology(chart.leadId, profile.email, localDateString())
      .then(setDayNum)
      .catch(() => setDayNum(null));
    try {
      setToday(await requestToday(chart.leadId, profile.email));
    } catch (err) {
      setError(err instanceof ChartRequestError ? err.message : 'Something went wrong. Please try again.');
    }
  }, [profile, chart]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    load().finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <FadeIn>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>TODAY&apos;S SKY</Text>
          <Text accessibilityRole="header" style={styles.title}>{dateLabel}</Text>
          <Text style={styles.sub}>Read against your own chart. Pull down to refresh.</Text>
        </View>
      </FadeIn>

      {loading && !today ? (
        <View accessibilityLiveRegion="polite" style={styles.center}>
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.sub}>Reading today&apos;s sky…</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBox}>
          <Text accessibilityLiveRegion="polite" style={styles.errorText}>{'⚠  '}{error}</Text>
          <GoldButton label="TRY AGAIN" variant="ghost" onPress={onRefresh} loading={refreshing} />
        </View>
      ) : null}

      {today ? (
        <>
          <FadeIn delay={80}>
            <View style={[styles.card, { borderLeftColor: colors.stoplight }]}>
              <View style={styles.moonHead}>
                <Text accessibilityElementsHidden style={styles.moonGlyph}>{moonGlyph(today.moon.phase)}</Text>
                <View style={styles.flex}>
                  <Text style={styles.cardEyebrow}>THE MOON</Text>
                  <Text style={styles.cardTitle}>{today.moon.formatted}</Text>
                  <Text style={styles.body}>
                    <Term id="astro:phase">{today.moon.phase}</Term> · {today.moon.illuminationPercent}% lit
                  </Text>
                </View>
              </View>
              <Text style={styles.body}>{phaseMeaning(today.moon.waxing)}</Text>
              <Text style={styles.body}>
                Moving through your <Term id={houseId(today.moon.house)} style={styles.strong}>{ordinal(today.moon.house)} house</Term>:{' '}
                {houseTheme(today.moon.house)}.
              </Text>
              {today.moon.nextApplying ? (
                <Text style={styles.body}>
                  <Text style={styles.strong}>Next: </Text>
                  {contactSentence(today.moon.nextApplying, 'ahead')}.
                </Text>
              ) : null}
              {today.moon.lastSeparating ? (
                <Text style={styles.body}>
                  <Text style={styles.strong}>Just left: </Text>
                  {contactSentence(today.moon.lastSeparating, 'behind')}.
                </Text>
              ) : null}
            </View>
          </FadeIn>

          <FadeIn delay={160}>
            <View style={[styles.card, { borderLeftColor: colors.stoplight }]}>
              <Text style={styles.cardEyebrow}>THE SUN</Text>
              <Text style={styles.cardTitle}>{today.sun.formatted}</Text>
              <Text style={styles.body}>
                Lighting up your <Term id={houseId(today.sun.house)} style={styles.strong}>{ordinal(today.sun.house)} house</Term>:{' '}
                {houseTheme(today.sun.house)}.
              </Text>
              {today.retrograde.length ? (
                <Text style={styles.body}>
                  <Term id="astro:retrograde" style={styles.strong}>Retrograde now: </Term>
                  {today.retrograde.map((b, i) => (
                    <Text key={b}>
                      {i > 0 ? ', ' : ''}
                      <Term id={planetId(b)}>{`${bodyName(b)} ℞`}</Term>
                    </Text>
                  ))}
                </Text>
              ) : null}
            </View>
          </FadeIn>

          {dayNum ? (
            <FadeIn delay={200}>
              <DayNumerologyCard data={dayNum} />
            </FadeIn>
          ) : null}

          <FadeIn delay={240}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Active transits to your chart</Text>
              <Text style={styles.sub}>
                Tightest first. Within 1° is peak; within 3° is still active.
              </Text>
            </View>
            {today.transits.length ? (
              <View style={styles.transitList}>
                {today.transits.map((hit) => (
                  <TransitRow key={`${hit.transiting}-${hit.natal}-${hit.aspect}`} hit={hit} onSelect={setSelectedHit} />
                ))}
              </View>
            ) : (
              <Text style={styles.body}>
                A quiet sky today: no close contacts to your chart. That is a real reading, not missing data.
              </Text>
            )}
          </FadeIn>

          <FadeIn delay={320}>
            <View style={[styles.card, { borderLeftColor: colors.vehicle }]}>
              <Text style={styles.cardEyebrow}>YOUR VEHICLE DECIDES</Text>
              {today.vehicle.type ? (
                <Text style={styles.cardTitle}>{today.vehicle.type}</Text>
              ) : null}
              {today.vehicle.strategy ? (
                <Text style={styles.body}><Text style={styles.strong}>Strategy: </Text>{today.vehicle.strategy}</Text>
              ) : null}
              {today.vehicle.authority ? (
                <Text style={styles.body}><Text style={styles.strong}>Authority: </Text>{today.vehicle.authority}</Text>
              ) : null}
              <Text style={styles.body}>{today.reminder}</Text>
            </View>
          </FadeIn>
        </>
      ) : null}
      <TransitSheet hit={selectedHit} onClose={() => setSelectedHit(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { gap: 6, paddingTop: space.lg },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 3, color: colors.gold },
  title: { fontFamily: fonts.display, fontSize: 32, lineHeight: 40, color: colors.parchment },
  sub: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.parchmentMuted },
  center: { alignItems: 'center', gap: space.sm, paddingVertical: space.xl },
  errorBox: { gap: space.md },
  errorText: { fontFamily: fonts.body, fontSize: 15, color: colors.danger },
  card: {
    backgroundColor: colors.charcoal, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.hairline, borderLeftWidth: 4, padding: space.lg, gap: 10,
  },
  moonHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  moonGlyph: { fontSize: 44 },
  cardEyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2, color: colors.parchmentMuted },
  cardTitle: { fontFamily: fonts.display, fontSize: 24, color: colors.parchment },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  strong: { fontFamily: fonts.bodyBold, color: colors.parchment },
  sectionHead: { gap: 4, marginTop: space.sm, marginBottom: space.sm },
  sectionTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.parchment },
  transitList: { gap: 10 },
  transitRow: {
    backgroundColor: colors.charcoal, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.hairline, padding: space.md, gap: 4,
  },
  transitFriction: { borderColor: colors.stoplight },
  transitPhrase: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.parchment },
  transitDetail: { fontFamily: fonts.body, fontSize: 13, color: colors.parchmentMuted },
  transitMore: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.6, color: colors.gold, marginTop: 2 },
  transitNature: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 1, color: colors.parchment },
});
