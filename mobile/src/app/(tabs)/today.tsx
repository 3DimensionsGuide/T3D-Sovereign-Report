import { useCallback, useEffect, useRef, useState } from 'react';
import { SkeletonCards } from '@/components/Skeleton';
import { AccessibilityInfo, AppState, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/components/Pressable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Screen } from '@/components/Screen';
import { Fold } from '@/components/Fold';
import { FadeIn } from '@/components/FadeIn';
import { GoldButton } from '@/components/GoldButton';
import { ErrorState, LoadingState } from '@/components/StatusViews';
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
import { FirstRunCard } from '@/components/FirstRunCard';
import { JourneyCard } from '@/components/JourneyCard';
import { DayCheckIn } from '@/components/DayCheckIn';
import { useCoachStore } from '@/store/useCoachStore';
import { aspectWord, bodyName, natalName } from '@/lib/skyText';
import { Term } from '@/components/Explain';
import { TimeNote } from '@/components/TimeNote';
import { TriadTodayCard } from '@/components/TriadTodayCard';
import { SkyTally, TodaySignal } from '@/components/TodaySignal';
import { SignalLamp } from '@/components/SignalLamp';
import { RoadStrip } from '@/components/RoadStrip';
import { TriadSeal } from '@/components/TriadSeal';
import { SkyTodayCard } from '@/components/SkyTodayCard';
import { BodygraphChip } from '@/components/BodygraphChip';
import { MeetTriadCard } from '@/components/MeetTriadCard';
import { TransitMiniWheel } from '@/components/TransitMiniWheel';
import { NumberBadge } from '@/components/NumberBadge';
import { hasWheelPositions, MAX_WHEEL_CHORDS } from '@/lib/transitWheel';
import { select } from '@/lib/haptics';
import { SIGNAL_COLOR, SIGNAL_LABEL, SignalMarker, type SignalKind } from '@/components/Lens';
import type { TriadToday } from '@/lib/triadTypes';
import { TransitSheet } from '@/components/TransitSheet';
import { aspectId, natalId, planetId } from '@/lib/termIds';
import { PremiumGate } from '@/components/PremiumGate';
import { isTimingLocked } from '@/lib/premiumGates';
import { usePremium } from '@/lib/usePremium';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, radius, space, guidance } from '@/theme/tokens';

import { AccentView } from '@/components/AccentView';

const PULLED_KEY = 't3d-today-pulled-v1';
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

/** Transits shown before "Show all": the tightest few carry the day. */
const TRANSITS_SHOWN = 3;

const NATURE_KIND: Record<DailyTransitHit['nature'], SignalKind> = { flow: 'flow', friction: 'friction', neutral: 'neutral' };

function TransitRow({
  hit, number, focused, innerRef, onSelect,
}: {
  hit: DailyTransitHit; number?: number; focused?: boolean; innerRef?: (node: View | null) => void; onSelect: (hit: DailyTransitHit) => void;
}) {
  const phrase = `${bodyName(hit.transiting)} ${aspectWord(hit.aspect)} your ${natalName(hit.natal)}`;
  const detail = `${hit.orb.toFixed(1)}° from exact · ${hit.applying ? 'applying' : 'separating'}${hit.peak ? ' · peak' : ''}`;
  return (
    <Pressable
      ref={innerRef}
      accessibilityRole="button"
      accessibilityLabel={`${number ? `Number ${number}. ` : ''}${phrase}. ${SIGNAL_LABEL[NATURE_KIND[hit.nature]]}. ${detail}. Opens the full meaning.`}
      onPress={() => onSelect(hit)}
      style={({ pressed }) => [styles.transitRow, hit.nature === 'friction' && styles.transitFriction, focused && styles.transitFocused, pressed && { opacity: 0.8 }]}
    >
      <View style={styles.transitHead}>
        {number ? <NumberBadge n={number} nature={hit.nature} /> : null}
        <Text style={[styles.transitPhrase, styles.flexText]}>
        <Term id={planetId(hit.transiting)}>{bodyName(hit.transiting)}</Term>{' '}
        <Term id={aspectId(hit.aspect)}>{aspectWord(hit.aspect)}</Term> your{' '}
        <Term id={natalId(hit.natal)}>{natalName(hit.natal)}</Term>
        </Text>
      </View>
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
  const coachSeen = useCoachStore((s) => s.seen);
  const profile = useT3DStore((state) => state.profile);
  const chart = useT3DStore((state) => state.chart);
  const premium = usePremium();

  const [today, setToday] = useState<TodayResult | null>(null);
  const [dayNum, setDayNum] = useState<DayNumerology | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [triad, setTriad] = useState<TriadToday | null>(null);
  const [selectedHit, setSelectedHit] = useState<DailyTransitHit | null>(null);
  const [allTransits, setAllTransits] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // The "pull down to refresh" hint shows until the person has pulled once. null = not read yet.
  const [pulledBefore, setPulledBefore] = useState<boolean | null>(null);
  useEffect(() => {
    AsyncStorage.getItem(PULLED_KEY)
      .then((v) => setPulledBefore(v === '1'))
      .catch(() => setPulledBefore(true));
  }, []);
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
    // A day that is behind Premium is not fetched at all.
    if (isTimingLocked(viewDate ?? new Date(), premium)) {
      setToday(null);
      setDayNum(null);
      setTriad(null);
      setError(null);
      setOffline(false);
      return;
    }
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
  }, [profile, chart, viewDate, liveDate, premium]);

  // A different day starts with the short list again.
  useEffect(() => setAllTransits(false), [viewDate, liveDate]);

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
    setPulledBefore(true);
    AsyncStorage.setItem(PULLED_KEY, '1').catch(() => {});
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const shown = viewDate ?? new Date(`${liveDate}T12:00:00`);
  const dateLabel = shown.toLocaleDateString(undefined, {
    // No year here: the date pill under the title always shows the full date with its year.
    weekday: 'long', month: 'long', day: 'numeric',
  });
  const relation = isToday
    ? null
    : localDateString(shown) < liveDate ? 'A DAY GONE BY' : 'A DAY AHEAD';
  const locked = isTimingLocked(shown, premium);
  const dayWord = isToday ? 'today' : 'this day';
  const scrollRef = useRef<ScrollView | null>(null);
  const scrollOffset = useRef(0);
  const rowRefs = useRef<Record<number, View | null>>({});
  const [focusNum, setFocusNum] = useState<number | null>(null);
  const focusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (focusTimer.current) clearTimeout(focusTimer.current); }, []);

  /** A numbered badge on the wheel: scroll to its row in the list and mark it for a moment. */
  const pickNumber = useCallback((n: number) => {
    const row = rowRefs.current[n];
    const scroller = scrollRef.current;
    setFocusNum(n);
    if (focusTimer.current) clearTimeout(focusTimer.current);
    focusTimer.current = setTimeout(() => setFocusNum(null), 3000);
    if (!row || !scroller) return;
    const host = scroller as unknown as { measureInWindow?: (cb: (x: number, y: number, w: number, h: number) => void) => void };
    if (typeof host.measureInWindow !== 'function') return;
    host.measureInWindow((_sx, scrollerTop) => {
      row.measureInWindow((_x, top) => {
        scroller.scrollTo({ y: Math.max(0, scrollOffset.current + (top - scrollerTop) - 12), animated: true });
      });
    });
    AccessibilityInfo.announceForAccessibility(`Showing number ${n} in the list.`);
  }, []);

  const numbered = today ? hasWheelPositions(today.transits) : false;

  return (
    <Screen room="sky" refreshing={refreshing} onRefresh={onRefresh} scrollRef={scrollRef} scrollOffset={scrollOffset}>
      <FadeIn>
        <View style={styles.header}>
          <View style={styles.eyebrowRow}>
            <Text style={[styles.eyebrow, styles.flexText]}>{isToday ? 'TODAY\u2019S SKY' : `THE SKY · ${relation}`}</Text>
            {/* The person's own seal: a lens they have no data for is drawn hollow. */}
            <TriadSeal
              size={36}
              animate
              lenses={triad?.signal
                ? { vehicle: !!triad.signal.vehicle, road: !!triad.signal.road, stoplight: !!triad.signal.stoplight }
                : undefined}
            />
          </View>
          <Text accessibilityRole="header" style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{dateLabel}</Text>
          <Text style={guidance}>{pulledBefore === false ? 'Read against your own chart. Pull down to refresh.' : 'Read against your own chart.'}</Text>
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

      {locked ? (
        <PremiumGate title="Past and future days" detail="Look back and look ahead in Today’s Sky, not only today. Today stays free." />
      ) : null}

      {loading && !today && !locked ? (
        <SkeletonCards label="Reading the sky…" />
      ) : null}

      {today ? <FirstRunCard /> : null}

      {today && coachSeen ? <ReminderPrompt /> : null}

      {today && coachSeen ? <JourneyCard /> : null}

      {offline && today ? <OfflineNote savedAt={savedCopyAt} /> : null}

      {error && !locked ? (
        <ErrorState message={error} onRetry={onRefresh} retrying={refreshing} />
      ) : null}

      {today ? (
        <>
          <TimeNote scope="sky" />
          {triad?.signal ? (
            <FadeIn delay={10}>
              <SignalLamp signal={triad.signal} isToday={isToday} />
            </FadeIn>
          ) : (
            <FadeIn delay={20}>
              <TodaySignal today={today} triad={triad} isToday={isToday} />
            </FadeIn>
          )}
          {isToday ? (
            <DayCheckIn
              date={liveDate}
              ctx={{
                personalDay: dayNum?.personal.number ?? null,
                signal: triad?.signal?.overall.state ?? null,
                moonSign: today.moon.sign ?? null,
              }}
            />
          ) : null}
          {isToday ? <MeetTriadCard /> : null}
          {triad ? (
            <FadeIn delay={40}>
              <TriadTodayCard data={triad} isToday={isToday} />
            </FadeIn>
          ) : null}
          <Fold id="today-road" lens="road" title="The road today" hint="Your personal day and where you are on the road">
          <RoadStrip date={localDateString(shown)} personalYear={dayNum?.personalYear ?? null} />

          {dayNum ? (
            <FadeIn delay={200}>
              <DayNumerologyCard data={dayNum} />
            </FadeIn>
          ) : null}

          </Fold>

          <Fold id="today-sky" lens="stoplight" title="The sky today" hint="The Moon, the planets and the transits to your chart">
          <FadeIn delay={80}>
            <SkyTodayCard today={today} onSelectTransit={setSelectedHit} />
          </FadeIn>

          <FadeIn delay={240}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Active transits to your chart</Text>
              <Text style={styles.sub}>
                Tightest first. Within 1° is peak; within 3° is still active.
              </Text>
              {triad?.signal ? <SkyTally today={today} bare /> : null}
            </View>
            {today.transits.length ? (
              <View style={styles.transitList}>
                <TransitMiniWheel hits={today.transits} onPickNumber={pickNumber} />
                {(allTransits ? today.transits : today.transits.slice(0, TRANSITS_SHOWN)).map((hit, i) => (
                  <TransitRow key={`${hit.transiting}-${hit.natal}-${hit.aspect}`} hit={hit} number={numbered && i < MAX_WHEEL_CHORDS ? i + 1 : undefined} focused={numbered && i + 1 === focusNum} innerRef={(node) => { rowRefs.current[i + 1] = node; }} onSelect={setSelectedHit} />
                ))}
                {today.transits.length > TRANSITS_SHOWN ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded: allTransits }}
                    accessibilityLabel={allTransits ? 'Show fewer transits' : `Show all ${today.transits.length} transits`}
                    onPress={() => {
                      select();
                      setAllTransits((v) => !v);
                    }}
                    style={({ pressed }) => [styles.showAll, pressed && { opacity: 0.7 }]}
                  >
                    <Text style={styles.showAllText}>
                      {allTransits ? 'Show fewer' : `Show all ${today.transits.length}`}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : (
              <Text style={styles.body}>
                A quiet sky {dayWord}: no close contacts to your chart. That is a real reading, not missing data.
              </Text>
            )}
          </FadeIn>

          </Fold>

          <Fold id="today-vehicle" lens="vehicle" title="The vehicle today" hint="The gates the Sun and Moon are in today">
          <FadeIn delay={120}>
            <BodygraphChip today={today} />
          </FadeIn>

          </Fold>

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
  header: { gap: 6, paddingTop: space.lg },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  flexText: { flex: 1 },
  dateBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm, marginVertical: space.sm },
  stepBtn: {
    width: 52, height: 52, borderRadius: radius.md, borderWidth: 1, borderColor: colors.hairline,
    backgroundColor: colors.charcoal, alignItems: 'center', justifyContent: 'center',
  },
  stepText: { fontFamily: fonts.bodyBold, fontSize: 28, lineHeight: 32, color: colors.gold },
  pickerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 52 },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 3, color: colors.parchmentMuted },
  title: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 32, lineHeight: 40, color: colors.parchment },
  sub: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  center: { alignItems: 'center', gap: space.sm, paddingVertical: space.xl },
  errorBox: { gap: space.md },
  errorText: { fontFamily: fonts.body, fontSize: 15, color: colors.danger },
  card: {
    backgroundColor: colors.charcoal, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.hairline, borderLeftWidth: 4, padding: space.lg, gap: 10,
  },
  cardEyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2, color: colors.parchmentMuted },
  cardTitle: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 24, color: colors.parchment },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  strong: { fontFamily: fonts.bodyBold, color: colors.parchment },
  sectionHead: { gap: 4, marginTop: space.sm, marginBottom: space.sm },
  sectionTitle: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 22, color: colors.parchment },
  transitList: { gap: 10 },
  showAll: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  showAllText: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.gold },
  transitRow: {
    backgroundColor: colors.charcoal, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.hairline, padding: space.md, gap: 4,
  },
  transitFocused: { borderColor: colors.gold, borderWidth: 2.5 },
  transitFriction: { borderColor: SIGNAL_COLOR.friction },
  transitNatureRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  transitHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  transitPhrase: { fontFamily: fonts.bodyMedium, fontSize: 17, color: colors.parchment },
  transitDetail: { fontFamily: fonts.body, fontSize: 13, color: colors.parchmentMuted },
  transitMore: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 1.6, color: colors.parchmentMuted, marginTop: 2 },
  transitNature: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 0.3, color: colors.parchment },
});
