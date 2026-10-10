import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Screen } from '@/components/Screen';
import { FadeIn } from '@/components/FadeIn';
import { GoldButton } from '@/components/GoldButton';
import { DayNumerologyCard } from '@/components/DayNumerologyCard';
import {
  ChartRequestError, requestDayNumerology, requestToday, requestTriadToday, type DailyTransitHit, type TodayResult,
} from '@/lib/api';
import type { DayNumerology } from '@/lib/dayNumerologyTypes';
import { localDateString } from '@/lib/localDate';
import { useLocalDate } from '@/lib/useLocalDate';
import { getCached, setCached } from '@/lib/persistentCache';
import { OfflineNote } from '@/components/OfflineNote';
import { ReminderPrompt } from '@/components/ReminderCard';
import {
  aspectWord, bodyName, contactSentence, houseTheme, moonGlyph, natalName, ordinal, phaseMeaning,
} from '@/lib/skyText';
import { Term } from '@/components/Explain';
import { TimeNote } from '@/components/TimeNote';
import { TriadTodayCard } from '@/components/TriadTodayCard';
import { TodaySignal } from '@/components/TodaySignal';
import { SIGNAL_COLOR, SIGNAL_LABEL, SignalMarker, type SignalKind } from '@/components/Lens';
import type { TriadToday } from '@/lib/triadTypes';
import { TransitSheet } from '@/components/TransitSheet';
import { aspectId, houseId, natalId, planetId } from '@/lib/termIds';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, radius, space } from '@/theme/tokens';

import { AccentView } from '@/components/AccentView';
const MIN_DATE = new Date(1950, 0, 1);
const MAX_DATE = new Date(2100, 11, 31);

/** The calendar day a Date falls on, at local noon (a steady anchor for that day's sky). */
function noonOf(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
}

function sameDay(a: Date, b: Date): boolean {
  return localDateString(a) === localDateString(b);
}

interface TodayBundle {
  today: TodayResult;
  dayNum: DayNumerology | null;
  triad: TriadToday | null;
}

/** If the app has been in the background this long, the live day reloads when it returns. */
const STALE_AFTER_MS = 30 * 60 * 1000;

const NATURE_KIND: Record<DailyTransitHit['nature'], SignalKind> = { flow: 'flow', friction: 'friction', neutral: 'neutral' };

function TransitRow({ hit, onSelect }: { hit: DailyTransitHit; onSelect: (hit: DailyTransitHit) => void }) {
  const phrase = `${bodyName(hit.transiting)} ${aspectWord(hit.aspect)} your ${natalName(hit.natal)}`;
  const detail = `${hit.orb.toFixed(1)}° from exact · ${hit.applying ? 'applying' : 'separating'}${hit.peak ? ' · peak' : ''}`;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${phrase}. ${SIGNAL_LABEL[NATURE_KIND[hit.nature]]}. ${detail}. Opens the full meaning.`}
      onPress={() => onSelect(hit)}
      style={({ pressed }) => [styles.transitRow, hit.nature === 'friction' && styles.transitFriction, pressed && { opacity: 0.8 }]}
    >
      <Text style={styles.transitPhrase}>
        <Term id={planetId(hit.transiting)}>{bodyName(hit.transiting)}</Term>{' '}
        <Term id={aspectId(hit.aspect)}>{aspectWord(hit.aspect)}</Term> your{' '}
        <Term id={natalId(hit.natal)}>{natalName(hit.natal)}</Term>
      </Text>
      <Text style={styles.transitDetail}>{detail}</Text>
      <View style={styles.transitNatureRow}>
        <SignalMarker kind={NATURE_KIND[hit.nature]} size={14} />
        <Text style={styles.transitNature}>{SIGNAL_LABEL[NATURE_KIND[hit.nature]]}</Text>
      </View>
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
  const [triad, setTriad] = useState<TriadToday | null>(null);
  const [selectedHit, setSelectedHit] = useState<DailyTransitHit | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);
  const [savedCopyAt, setSavedCopyAt] = useState<number | null>(null);
  /** Today's date on this phone; it changes at midnight so the screen loads the new day. */
  const liveDate = useLocalDate();
  const lastLoadedAt = useRef(0);
  /** null means the live day; otherwise the day the person jumped to. */
  const [viewDate, setViewDate] = useState<Date | null>(null);
  const isToday = viewDate === null;
  /** Newest request wins, so quickly stepping through days never shows an older day's data. */
  const requestId = useRef(0);

  const load = useCallback(async (opts?: { quiet?: boolean }) => {
    if (!profile || !chart) return;
    const mine = ++requestId.current;
    const stillCurrent = () => mine === requestId.current;
    const localDate = viewDate ? localDateString(viewDate) : liveDate;
    const at = viewDate ? noonOf(viewDate).toISOString() : undefined;
    const key = `today|${chart.leadId}|${localDate}|${at ?? 'live'}`;
    setError(null);

    // Show the saved copy of this exact day straight away, then refresh it from the server.
    const saved = await getCached<TodayBundle>(key);
    if (!stillCurrent()) return;
    if (saved) {
      setToday(saved.value.today);
      setDayNum(saved.value.dayNum);
      setTriad(saved.value.triad);
      setSavedCopyAt(saved.savedAt);
      setLoading(false);
    } else if (!opts?.quiet) {
      setToday(null);
      setDayNum(null);
      setTriad(null);
      setSavedCopyAt(null);
    }

    // Numerology of the day and the triad load alongside the sky; if they fail the sky still shows.
    const dayNumP = requestDayNumerology(chart.leadId, profile.email, localDate)
      .then((d) => { if (stillCurrent()) setDayNum(d); return d; })
      .catch(() => null);
    const triadP = requestTriadToday(chart.leadId, profile.email, localDate, at)
      .then((d) => { if (stillCurrent()) setTriad(d); return d; })
      .catch(() => null);
    try {
      const result = await requestToday(chart.leadId, profile.email, at);
      if (!stillCurrent()) return;
      setToday(result);
      setOffline(false);
      const [d, t] = await Promise.all([dayNumP, triadP]);
      if (!stillCurrent()) return;
      const savedAtNow = Date.now();
      lastLoadedAt.current = savedAtNow;
      setSavedCopyAt(savedAtNow);
      await setCached<TodayBundle>(key, { value: { today: result, dayNum: d, triad: t }, savedAt: savedAtNow });
    } catch (err) {
      if (!stillCurrent()) return;
      if (saved) {
        // Keep the saved copy on screen and say so, instead of an error with nothing to read.
        setOffline(true);
      } else {
        setError(err instanceof ChartRequestError ? err.message : 'Something went wrong. Please try again.');
      }
    }
  }, [profile, chart, viewDate, liveDate]);

  const goTo = useCallback((date: Date) => {
    if (date < MIN_DATE || date > MAX_DATE) return;
    setViewDate(sameDay(date, new Date()) ? null : noonOf(date));
  }, []);

  const step = useCallback((days: number) => {
    const base = viewDate ?? new Date();
    const next = new Date(base.getFullYear(), base.getMonth(), base.getDate() + days, 12, 0, 0);
    goTo(next);
  }, [viewDate, goTo]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setOffline(false);
    load().finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [load]);

  // Coming back to the app after a while on the live day: quietly refresh it.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && viewDate === null && Date.now() - lastLoadedAt.current > STALE_AFTER_MS) {
        void load({ quiet: true });
      }
    });
    return () => sub.remove();
  }, [viewDate, load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const shown = viewDate ?? new Date(`${liveDate}T12:00:00`);
  const dateLabel = shown.toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', ...(isToday ? {} : { year: 'numeric' }),
  });
  const relation = isToday
    ? null
    : localDateString(shown) < liveDate ? 'A DAY GONE BY' : 'A DAY AHEAD';
  const dayWord = isToday ? 'today' : 'this day';

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <FadeIn>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{isToday ? 'TODAY\u2019S SKY' : `THE SKY · ${relation}`}</Text>
          <Text accessibilityRole="header" style={styles.title}>{dateLabel}</Text>
          <Text style={styles.sub}>Read against your own chart. Pull down to refresh.</Text>
        </View>
        <View style={styles.dateBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous day"
            onPress={() => step(-1)}
            style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.stepText}>‹</Text>
          </Pressable>
          <View style={styles.pickerWrap}>
            <DateTimePicker
              value={shown}
              mode="date"
              display="compact"
              themeVariant="dark"
              minimumDate={MIN_DATE}
              maximumDate={MAX_DATE}
              onValueChange={(_event: unknown, value: Date) => goTo(value)}
              accessibilityLabel="Jump to a date"
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next day"
            onPress={() => step(1)}
            style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.stepText}>›</Text>
          </Pressable>
        </View>
        {!isToday ? (
          <GoldButton label="Back to today" variant="ghost" onPress={() => setViewDate(null)} />
        ) : null}
      </FadeIn>

      {loading && !today ? (
        <View accessibilityLiveRegion="polite" style={styles.center}>
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.sub}>Reading the sky…</Text>
        </View>
      ) : null}

      {today ? <ReminderPrompt /> : null}

      {offline && today ? <OfflineNote savedAt={savedCopyAt} /> : null}

      {error ? (
        <View style={styles.errorBox}>
          <Text accessibilityLiveRegion="polite" style={styles.errorText}>{'⚠  '}{error}</Text>
          <GoldButton label="Try again" variant="ghost" onPress={onRefresh} loading={refreshing} />
        </View>
      ) : null}

      {today ? (
        <>
          <TimeNote scope="sky" />
          <FadeIn delay={20}>
            <TodaySignal today={today} triad={triad} isToday={isToday} />
          </FadeIn>
          {triad ? (
            <FadeIn delay={60}>
              <TriadTodayCard data={triad} isToday={isToday} />
            </FadeIn>
          ) : null}

          <FadeIn delay={80}>
            <AccentView style={[styles.card, { borderLeftColor: colors.stoplight }]}>
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
              <Text style={styles.body}>{phaseMeaning(today.moon.waxing, today.moon.phase)}</Text>
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
            </AccentView>
          </FadeIn>

          <FadeIn delay={160}>
            <AccentView style={[styles.card, { borderLeftColor: colors.stoplight }]}>
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
            </AccentView>
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
                A quiet sky {dayWord}: no close contacts to your chart. That is a real reading, not missing data.
              </Text>
            )}
          </FadeIn>

          {!triad ? (
          <FadeIn delay={320}>
            <AccentView style={[styles.card, { borderLeftColor: colors.vehicle }]}>
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
            </AccentView>
          </FadeIn>
          ) : (
            <Text style={styles.body}>{today.reminder}</Text>
          )}
        </>
      ) : null}
      <TransitSheet hit={selectedHit} onClose={() => setSelectedHit(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { gap: 6, paddingTop: space.lg },
  dateBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm, marginVertical: space.sm },
  stepBtn: {
    width: 52, height: 52, borderRadius: radius.md, borderWidth: 1, borderColor: colors.hairline,
    backgroundColor: colors.charcoal, alignItems: 'center', justifyContent: 'center',
  },
  stepText: { fontFamily: fonts.bodyBold, fontSize: 28, lineHeight: 32, color: colors.gold },
  pickerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 52 },
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
  transitFriction: { borderColor: SIGNAL_COLOR.friction },
  transitNatureRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  transitPhrase: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.parchment },
  transitDetail: { fontFamily: fonts.body, fontSize: 13, color: colors.parchmentMuted },
  transitMore: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.6, color: colors.gold, marginTop: 2 },
  transitNature: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 0.4, color: colors.parchment },
});
