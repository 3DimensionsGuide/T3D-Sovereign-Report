import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { AccentView } from '@/components/AccentView';
import { BodygraphChip } from '@/components/BodygraphChip';
import { DayNumerologyCard } from '@/components/DayNumerologyCard';
import { FadeIn } from '@/components/FadeIn';
import { GoldButton } from '@/components/GoldButton';
import { LENS_LABEL, LENS_TEXT, LensIcon, SIGNAL_COLOR, SignalMarker } from '@/components/Lens';
import { LockIcon } from '@/components/LockIcon';
import { RoadStrip } from '@/components/RoadStrip';
import { Screen } from '@/components/Screen';
import { SignalLamp } from '@/components/SignalLamp';
import { TransitMiniWheel } from '@/components/TransitMiniWheel';
import { TriadPortrait } from '@/components/TriadPortrait';
import { COLOR as LAMP_COLOR, SHAPE as LAMP_SHAPE, WORD as LAMP_WORD } from '@/components/SignalLamp';
import { select } from '@/lib/haptics';
import { localDateString } from '@/lib/localDate';
import { currentStop, decisionChecks, opensOn, STOPS, statusWord, stopStatus, TOTAL_DAYS, weekRecap, type StopStatus, type TriadStop } from '@/lib/meetTriad';
import { loadLiveBundle, savedLiveBundle, type TodayBundle } from '@/lib/todayBundle';
import { useLocalDate } from '@/lib/useLocalDate';
import { useMeetTriadHydrated, useMeetTriadStore } from '@/store/useMeetTriadStore';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, radius, space } from '@/theme/tokens';

function weekdayOf(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1).toLocaleDateString(undefined, { weekday: 'long' });
}

function StopMark({ status }: { status: StopStatus }) {
  if (status === 'done') return <SignalMarker kind="flow" size={18} />;
  if (status === 'premium') return <LockIcon size={18} />;
  if (status === 'open') {
    // A gold ring with a dot: ready for you. (Not the warning hexagon, which means Slow.)
    return (
      <Svg width={18} height={18} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Circle cx="12" cy="12" r="10" fill="none" stroke={colors.gold} strokeWidth={2.4} />
        <Circle cx="12" cy="12" r="4.5" fill={colors.gold} />
      </Svg>
    );
  }
  return <SignalMarker kind="neutral" size={18} color={colors.parchmentMuted} />;
}

function LensGlyph({ lens }: { lens: TriadStop['lens'] }) {
  if (lens === 'triad') {
    return (
      <View style={styles.trio}>
        <LensIcon lens="vehicle" size={9} />
        <LensIcon lens="road" size={9} />
        <LensIcon lens="stoplight" size={9} />
      </View>
    );
  }
  return (
    <View style={styles.glyph}>
      <LensIcon lens={lens} size={22} />
    </View>
  );
}

export default function MeetYourTriad() {
  const profile = useT3DStore((s) => s.profile);
  const chart = useT3DStore((s) => s.chart);
  const hydrated = useMeetTriadHydrated();
  const { startedOn, done, premium, start, markDone, setPremium } = useMeetTriadStore();
  const liveDate = useLocalDate();
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [bundle, setBundle] = useState<TodayBundle | null>(null);
  const [failed, setFailed] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const scrollOffset = useRef(0);
  const cardRefs = useRef<Record<number, View | null>>({});

  /** Bring an opened stop to the top of the screen, once the one above it has folded away. */
  const scrollTo = useCallback((day: number) => {
    setTimeout(() => {
      const card = cardRefs.current[day];
      const scroller = scrollRef.current as unknown as { measureInWindow?: (cb: (x: number, y: number, w: number, h: number) => void) => void } | null;
      if (!card || !scroller || typeof scroller.measureInWindow !== 'function') return;
      scroller.measureInWindow((_sx, scrollerTop) => {
        card.measureInWindow((_x, top) => {
          scrollRef.current?.scrollTo({ y: Math.max(0, scrollOffset.current + (top - scrollerTop) - 12), animated: true });
        });
      });
    }, 120);
  }, []);

  useEffect(() => {
    if (hydrated) start(liveDate);
  }, [hydrated, liveDate, start]);

  const load = useCallback(async () => {
    if (!chart || !profile) return;
    setFailed(false);
    const saved = await savedLiveBundle(chart.leadId, liveDate);
    if (saved) setBundle(saved);
    try {
      setBundle(await loadLiveBundle(chart.leadId, profile.email.trim(), liveDate));
    } catch {
      if (!saved) setFailed(true);
    }
  }, [chart, profile, liveDate]);
  useEffect(() => {
    void load();
  }, [load]);

  const began = startedOn ?? liveDate;
  // In a developer build, the Premium preview also opens every stop, so Days 4 to 7 can be checked on day one.
  const clockDate = __DEV__ && premium ? opensOn(began, TOTAL_DAYS) : liveDate;
  const now = currentStop(began, clockDate);
  const statuses = useMemo(
    () => STOPS.map((s) => stopStatus(s, began, clockDate, done, premium)),
    [began, clockDate, done, premium],
  );
  const doneCount = statuses.filter((s) => s === 'done').length;

  function content(stop: TriadStop, status: StopStatus) {
    const locked = status === 'premium';
    const tail = (
      <View style={styles.tryBox}>
        <Text style={styles.tryLabel}>Try it today</Text>
        <Text style={styles.body}>{stop.tryIt}</Text>
      </View>
    );
    if (status === 'soon') {
      return <Text style={styles.body}>This stop opens on {weekdayOf(opensOn(began, stop.day))}. Come back then.</Text>;
    }
    if (locked) {
      return (
        <>
          <Text style={styles.body}>{stop.blurb}</Text>
          {stop.day === 4 && bundle ? (
            <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.preview}>
              <TransitMiniWheel hits={bundle.today.transits} onPickNumber={() => undefined} />
            </View>
          ) : null}
          {stop.day === 5 ? (
            <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.preview}>
              <RoadStrip date={liveDate} personalYear={bundle?.dayNum?.personalYear ?? null} />
            </View>
          ) : null}
          <View style={styles.premiumNote}>
            <LockIcon size={16} />
            <Text style={styles.premiumText}>Part of Premium, which opens days 4 to 7. Subscriptions are not open yet.</Text>
          </View>
        </>
      );
    }
    switch (stop.day) {
      case 1:
        return (
          <>
            <Text style={styles.body}>{stop.blurb}</Text>
            {bundle?.today.vehicle.type ? (
              <Text style={styles.strong}>
                {[bundle.today.vehicle.type, bundle.today.vehicle.authority && `${bundle.today.vehicle.authority} Authority`].filter(Boolean).join(' · ')}
              </Text>
            ) : null}
            <BodygraphChip today={bundle?.today} />
            {bundle?.today.vehicle.strategy ? <Text style={styles.body}>Strategy: {bundle.today.vehicle.strategy}</Text> : null}
            {tail}
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.body}>{stop.blurb}</Text>
            {bundle?.dayNum ? <DayNumerologyCard data={bundle.dayNum} /> : <Text style={styles.body}>Loading your numbers…</Text>}
            <RoadStrip date={liveDate} personalYear={bundle?.dayNum?.personalYear ?? null} />
            {tail}
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.body}>{stop.blurb}</Text>
            {bundle?.triad?.signal ? <SignalLamp signal={bundle.triad.signal} isToday /> : <Text style={styles.body}>The signal is not available just now. Pull down on Today to refresh.</Text>}
            {tail}
          </>
        );
      case 4:
        return (
          <>
            <Text style={styles.body}>{stop.blurb}</Text>
            {bundle ? <TransitMiniWheel hits={bundle.today.transits} onPickNumber={() => router.push('/today' as Href)} /> : null}
            {tail}
            <GoldButton label="Open today’s transits" variant="ghost" onPress={() => router.push('/today' as Href)} />
          </>
        );
      case 5:
        return (
          <>
            <Text style={styles.body}>{stop.blurb}</Text>
            {tail}
            <GoldButton label="Open your Timeline" variant="ghost" onPress={() => router.push('/timeline' as Href)} />
          </>
        );
      case 6: {
        const checks = decisionChecks(bundle?.triad?.signal);
        return (
          <>
            <Text style={styles.body}>{stop.blurb}</Text>
            <View style={styles.checks}>
              {checks.map((c) => (
                <View
                  key={c.lens}
                  accessible
                  accessibilityLabel={`Check ${c.step}, ${LENS_LABEL[c.lens]}. ${c.question} ${c.state ? `${LAMP_WORD[c.state]}. ${c.reason}` : 'Not read just now.'}`}
                  style={styles.check}
                >
                  <View style={styles.checkHead}>
                    <Text style={styles.checkStep}>{c.step}</Text>
                    <LensIcon lens={c.lens} size={14} />
                    <Text style={[styles.checkLens, { color: LENS_TEXT[c.lens] }]}>{LENS_LABEL[c.lens]}</Text>
                    <View style={styles.checkWord}>
                      {c.state ? <SignalMarker kind={LAMP_SHAPE[c.state]} size={14} color={LAMP_COLOR[c.state]} /> : null}
                      <Text style={styles.checkWordText}>{c.state ? LAMP_WORD[c.state] : 'Not read'}</Text>
                    </View>
                  </View>
                  <Text style={styles.checkQuestion}>{c.question}</Text>
                  {c.reason ? <Text style={styles.checkReason}>{c.reason}</Text> : null}
                </View>
              ))}
            </View>
            <Text style={styles.body}>These are conditions, not a decision. The choice is still yours.</Text>
            {tail}
            <GoldButton label="Open Practice" variant="ghost" onPress={() => router.push('/practice' as Href)} />
          </>
        );
      }
      default:
        return (
          <>
            <Text style={styles.body}>{stop.blurb}</Text>
            {chart ? <TriadPortrait chart={chart} /> : null}
            <Text style={styles.body}>{weekRecap(done)}</Text>
            {tail}
            <GoldButton label="Open My Chart" variant="ghost" onPress={() => router.push('/chart' as Href)} />
          </>
        );
    }
  }

  return (
    <Screen scrollRef={scrollRef} scrollOffset={scrollOffset}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← BACK</Text>
      </Pressable>
      <FadeIn>
        <Text style={styles.eyebrow}>MEET YOUR TRIAD</Text>
        <Text accessibilityRole="header" style={styles.title}>Seven days, three lenses</Text>
        <Text style={styles.sub}>
          One stop opens each day. Day {now} of {TOTAL_DAYS} · {doneCount} done.
        </Text>
      </FadeIn>

      {failed ? (
        <View style={styles.errorBox}>
          <Text accessibilityRole="alert" style={styles.body}>We could not load today’s reading. Check your connection and try again.</Text>
          <GoldButton label="Try again" variant="ghost" onPress={() => void load()} />
        </View>
      ) : null}

      {STOPS.map((stop, i) => {
        const status = statuses[i]!;
        const open = openDay === stop.day;
        const accent = stop.lens === 'triad' ? colors.gold : stop.lens === 'vehicle' ? colors.vehicle : stop.lens === 'road' ? colors.road : colors.stoplight;
        return (
          <FadeIn key={stop.day} delay={40 * i}>
            <View ref={(node) => { cardRefs.current[stop.day] = node; }} collapsable={false}>
            <AccentView style={[styles.card, status === 'premium' && styles.cardLocked, stop.day === now && styles.cardNow]} accent={accent}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
                accessibilityLabel={`Day ${stop.day}, ${stop.title}. ${statusWord(status)}.${stop.day === now ? ' Today.' : ''}`}
                onPress={() => {
                  select();
                  setOpenDay(open ? null : stop.day);
                  if (!open) scrollTo(stop.day);
                }}
                style={({ pressed }) => [styles.head, pressed && { opacity: 0.8 }]}
              >
                <LensGlyph lens={stop.lens} />
                <View style={styles.flex}>
                  <Text style={[styles.dayLabel, { color: stop.lens === 'triad' ? colors.gold : LENS_TEXT[stop.lens] }]}>
                    Day {stop.day}{stop.day === now ? ' · today' : ''}
                  </Text>
                  <Text style={styles.stopTitle}>{stop.title}</Text>
                </View>
                <View style={styles.statusCol}>
                  <StopMark status={status} />
                  <Text style={styles.statusWord}>{statusWord(status)}</Text>
                </View>
              </Pressable>
              {open ? <View style={styles.content}>{content(stop, status)}</View> : null}
              {open && status === 'open' ? (
                <GoldButton
                  label={`Mark day ${stop.day} done`}
                  onPress={() => {
                    markDone(stop.day);
                    setOpenDay(null);
                  }}
                />
              ) : null}
            </AccentView>
            </View>
          </FadeIn>
        );
      })}

      {__DEV__ ? (
        <Pressable accessibilityRole="switch" accessibilityState={{ checked: premium }} onPress={() => setPremium(!premium)} style={styles.dev}>
          <Text style={styles.devText}>Developer only: preview as Premium, all stops open ({premium ? 'on' : 'off'})</Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  back: { minHeight: 48, justifyContent: 'center', alignSelf: 'flex-start' },
  backText: { fontFamily: fonts.bodyBold, fontSize: 14, letterSpacing: 1, color: colors.gold },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 2, color: colors.gold },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 38, color: colors.parchment, marginTop: 4 },
  sub: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.parchmentMuted, marginTop: 6 },
  card: {
    backgroundColor: colors.charcoal, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline,
    padding: space.lg, gap: space.md,
  },
  cardNow: { borderColor: colors.gold },
  cardLocked: { opacity: 0.92 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56 },
  glyph: { width: 30, alignItems: 'center' },
  trio: { flexDirection: 'row', gap: 1, width: 30, justifyContent: 'center' },
  dayLabel: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 0.4 },
  stopTitle: { fontFamily: fonts.display, fontSize: 20, lineHeight: 26, color: colors.parchment },
  statusCol: { alignItems: 'center', gap: 2, minWidth: 64 },
  statusWord: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.parchment, textAlign: 'center' },
  content: { gap: space.md },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.parchment },
  strong: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 24, color: colors.parchment },
  tryBox: { gap: 4, borderTopWidth: 1, borderTopColor: colors.hairline, paddingTop: space.md },
  tryLabel: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.gold },
  preview: { opacity: 0.45 },
  premiumNote: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  premiumText: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 15, lineHeight: 22, color: colors.gold },
  checks: { gap: space.sm },
  check: { gap: 4, borderLeftWidth: 2, borderLeftColor: colors.hairline, paddingLeft: space.md },
  checkHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkStep: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.gold, width: 14 },
  checkLens: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 0.4 },
  checkWord: { flexDirection: 'row', alignItems: 'center', gap: 5, marginLeft: 'auto' },
  checkWordText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.parchment },
  checkQuestion: { fontFamily: fonts.bodyBold, fontSize: 15, lineHeight: 22, color: colors.parchment },
  checkReason: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.parchmentMuted },
  errorBox: { gap: space.sm },
  dev: { minHeight: 48, justifyContent: 'center', alignItems: 'center' },
  devText: { fontFamily: fonts.body, fontSize: 13, color: SIGNAL_COLOR.neutral },
});
