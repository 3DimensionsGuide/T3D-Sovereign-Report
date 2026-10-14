import { yearRangeLabel } from '@/lib/teaser';
import { useCallback, useMemo, useRef, useState } from 'react';
import { splitCurrentMonth, splitPersonalDays, splitWeek } from '@/lib/timelineMonths';
import { SkeletonCards } from '@/components/Skeleton';
import { router, type Href } from 'expo-router';
import { ScrollView, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Pressable } from '@/components/Pressable';
import { Screen } from '@/components/Screen';
import { TimelinePinBar } from '@/components/TimelinePinBar';
import { pinnedMonthAt, showJumpToday, type PinSection } from '@/lib/timelinePin';
import { FadeIn } from '@/components/FadeIn';
import { GoldButton } from '@/components/GoldButton';
import { select } from '@/lib/haptics';
import { Disclosure } from '@/components/Disclosure';
import { ErrorState, LoadingState } from '@/components/StatusViews';
import { Segmented } from '@/components/Segmented';
import { aspectWord, bodyName, capFirst, houseTheme, natalName, ordinal } from '@/lib/skyText';
import { LENS_TEXT, LensIcon, LensLabel, SIGNAL_LABEL, SignalMarker, type LensName, type SignalKind } from '@/components/Lens';
import { CycleBar, SpineAxis, SpineKey, SpineRow, type SpineSeason } from '@/components/TimeSpine';
import { SignalRibbon } from '@/components/SignalRibbon';
import type { ActiveSeason, CycleWindow, TimelineEvent, TimelineKind, TimelineResult } from '@/lib/timelineTypes';
import { useTimeline } from '@/lib/useTimeline';
import { OfflineNote } from '@/components/OfflineNote';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, radius, space, guidance, themes, TOUCH } from '@/theme/tokens';
import { animateLayout } from '@/lib/motion';
import { Chevron } from '@/components/Chevron';
import { LockIcon } from '@/components/LockIcon';
import { VehicleToday } from '@/components/VehicleToday';
import { gateReadingForDay } from '@/lib/gateDay';
import { usePremium } from '@/lib/usePremium';
import { isEventLocked, isLaterMonthLocked } from '@/lib/timelineLock';
import { PremiumGate } from '@/components/PremiumGate';
import { dayTitleOf, RoadDayBlock, StoplightDayBlock, VehicleDayBlock } from '@/components/DayLenses';
import { RoadToday } from '@/components/RoadToday';
import { roadDayFor } from '@/lib/roadDay';

const T = themes.timeline;

/** A month takes the pinned bar over this far before its header reaches the top, so the bar never reads "Timeline" while a month is on screen. */
const BAR_HEIGHT = 120;
/** Slow transits shown before "Show all": the tightest few, since the list is sorted that way. */
const SEASONS_SHOWN = 3;

type Filter = 'all' | 'moon' | 'sky' | 'transits';
/** Timeline lenses. Vehicle shows the Sun's gate changes and the Moon's channel-completing days. */
type TimelineLens = 'all' | 'vehicle' | 'road' | 'stoplight';

const LENS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'vehicle', label: 'Vehicle', icon: (on: boolean) => <LensIcon lens="vehicle" size={13} color={on ? colors.obsidian : undefined} /> },
  { value: 'road', label: 'Road', icon: (on: boolean) => <LensIcon lens="road" size={13} color={on ? colors.obsidian : undefined} /> },
  { value: 'stoplight', label: 'Stoplight', icon: (on: boolean) => <LensIcon lens="stoplight" size={13} color={on ? colors.obsidian : undefined} /> },
] as const;

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'moon', label: 'Moon' },
  { value: 'sky', label: 'Sky' },
  { value: 'transits', label: 'Transits' },
] as const;

const FILTER_KINDS: Record<Filter, readonly TimelineKind[] | null> = {
  all: null,
  moon: ['lunation', 'eclipse'],
  sky: ['station', 'ingress'],
  transits: ['transit', 'return'],
};

const KIND_LABEL: Record<TimelineKind, string> = {
  lunation: 'Moon phase',
  eclipse: 'Eclipse',
  station: 'Station',
  ingress: 'Sign change',
  transit: 'Transit',
  return: 'Return',
  gate: 'Gate change',
};

const KIND_GLYPH: Record<TimelineKind, string> = {
  lunation: '☽',
  eclipse: '◉',
  station: '℞',
  ingress: '→',
  transit: '✦',
  return: '↻',
  gate: '◆',
};

const CONTACT_LABEL: Record<NonNullable<TimelineEvent['contact']>, string> = {
  electromagnetic: 'Completes your channel',
  companionship: 'A channel you hold',
  compromise: 'Compromise',
  amplified: 'Amplified',
  flavor: 'Adds a flavor',
};

const NATURE_KIND: Record<ActiveSeason['nature'], SignalKind> = { flow: 'flow', friction: 'friction', neutral: 'neutral' };

function NatureTag({ nature }: { nature: ActiveSeason['nature'] }) {
  return (
    <View style={styles.natureTag}>
      <SignalMarker kind={NATURE_KIND[nature]} size={14} />
      <Text style={styles.natureWord}>{SIGNAL_LABEL[NATURE_KIND[nature]]}</Text>
    </View>
  );
}

function numLabel(n: number): string {
  if (n === 11) return '11/2';
  if (n === 22) return '22/4';
  if (n === 33) return '33/6';
  return String(n);
}

function parseDay(isoDay: string): Date {
  const [y, m, d] = isoDay.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d);
}

function shortDate(isoDay: string): string {
  return parseDay(isoDay).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function longDate(isoDay: string): string {
  return parseDay(isoDay).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

function localKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function timeOf(at: string): string {
  return new Date(at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** The Moon leaves a gate within hours, so it gets a clock time; the Sun gets a date. */
function untilLabel(e: TimelineEvent): string {
  if (!e.until) return '';
  const end = new Date(e.until);
  if (e.body !== 'moon') return shortDate(localKey(end));
  const sameDay = localKey(end) === localKey(new Date(e.at));
  return sameDay ? timeOf(e.until) : `${shortDate(localKey(end))}, ${timeOf(e.until)}`;
}

function Panel({ children, label, lens }: { children: React.ReactNode; label: string; lens: LensName }) {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHead}>
        <LensIcon lens={lens} size={13} />
        <Text accessibilityRole="header" style={[styles.panelLabel, { color: LENS_TEXT[lens] }]}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

function YearCard({ data }: { data: TimelineResult }) {
  const today = data.personal[0];
  const py = today?.year;
  const meaning = py ? data.numberMeanings[py] : undefined;
  const p = data.profection;
  return (
    <FadeIn>
      <Panel label="Your year" lens="road">
        <View style={styles.block}>
          <Text style={styles.blockTitle}>
            Lord of the Year: {bodyName(p.lord)}
          </Text>
          <Text style={styles.blockBody}>
            Your {ordinal(p.house)} house ({p.sign}) is activated from{' '}
            {yearRangeLabel(p.startsOn, p.endsOn, (d, withYear) =>
              d.toLocaleDateString(undefined, withYear ? { month: 'short', day: 'numeric', year: 'numeric' } : { month: 'short', day: 'numeric' }))}
            . {capFirst(houseTheme(p.house))}
          </Text>
        </View>
        {py ? (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>
              Personal Year {numLabel(py)}{meaning ? ` · ${meaning.word}` : ''}
            </Text>
            <Text style={styles.blockBody}>
              {meaning?.line} Personal Month {numLabel(today!.month)}. Universal Year {numLabel(data.universalYear)}.
            </Text>
          </View>
        ) : null}
        <Disclosure label={`Pinnacle ${numLabel(data.pinnacle.current.number)} and Challenge ${numLabel(data.challenge.current.number)}`}>
          <CycleBlock title="Pinnacle" cycle={data.pinnacle.current} next={data.pinnacle.next} today={localKey(new Date())} />
          <CycleBlock title="Challenge" cycle={data.challenge.current} next={data.challenge.next} today={localKey(new Date())} />
        </Disclosure>
        <GoldButton label="Your year ahead ›" variant="ghost" onPress={() => router.push('/year' as Href)} />
      </Panel>
    </FadeIn>
  );
}

function CycleBlock({ title, cycle, next, today }: { title: string; cycle: CycleWindow; next: CycleWindow | null; today: string }) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>
        {cycle.label}: {numLabel(cycle.number)}{cycle.theme ? ` · ${cycle.theme}` : ''}
      </Text>
      <Text style={styles.blockBody}>
        {cycle.terrain}
        {cycle.endsOn
          ? ` Ages ${cycle.startAge}–${cycle.endAge}, until ${shortDate(cycle.endsOn)}${next ? `, then your ${title.toLowerCase()} becomes ${numLabel(next.number)}` : ''}.`
          : ` From age ${cycle.startAge} onward.`}
      </Text>
      <CycleBar name={title} current={cycle} next={next} today={today} />
    </View>
  );
}

function spineSeason(s: ActiveSeason, i: number): SpineSeason {
  const reaches = s.exactAt.length > 0
    ? `Exact ${s.exactAt.map((a) => shortDate(localKey(new Date(a)))).join(', ')}`
    : `Closest ${s.closest.orb.toFixed(1)}° on ${shortDate(localKey(new Date(s.closest.at)))}, never quite exact`;
  return {
    key: `${s.body}-${s.natal}-${s.aspect}-${i}`,
    title: `${bodyName(s.body)} ${aspectWord(s.aspect)} your ${natalName(s.natal)}`,
    nature: NATURE_KIND[s.nature],
    windowStart: s.windowStart,
    windowEnd: s.windowEnd,
    exactAt: s.exactAt,
    lord: s.lord,
    meta: `In effect ${shortDate(s.windowStart)} to ${shortDate(s.windowEnd)}. ${reaches}.`,
  };
}

function EventRow({ e, open, onToggle, locked, future }: { e: TimelineEvent; open: boolean; onToggle: () => void; locked: boolean; future: boolean }) {
  const flags: string[] = [];
  if (e.lord) flags.push('★ Lord of the Year');
  if (e.profectedHouse) flags.push('⌂ Your profected house');
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      accessibilityLabel={
        locked
          ? `${timeOf(e.at)}. ${e.title}. ${open ? 'The explanation is part of Premium. Subscriptions are not open yet.' : 'Part of Premium. Double tap to learn more.'}`
          : `${timeOf(e.at)}. ${e.title}. ${open ? e.detail : 'Double tap for details.'}`
      }
      style={({ pressed }) => [styles.event, pressed && styles.eventPressed]}
    >
      <View style={styles.eventHead}>
        <Text style={styles.eventGlyph}>{KIND_GLYPH[e.kind]}</Text>
        <View style={styles.eventTitleWrap}>
          <Text style={styles.eventKind}>{KIND_LABEL[e.kind]} · {timeOf(e.at)}</Text>
          <Text style={styles.eventTitle}>{e.title}</Text>
        </View>
        {locked ? <View style={styles.lockWrap}><LockIcon size={18} /></View> : <Chevron open={open} style={styles.chevron} />}
      </View>
      {e.kind === 'transit' || e.kind === 'return' ? (
        <NatureTag nature={e.nature} />
      ) : null}
      {e.kind === 'gate' && e.contact ? (
        <View style={styles.natureTag}>
          <Text style={styles.contactGlyph}>{e.contact === 'electromagnetic' ? '✦' : e.contact === 'amplified' ? '▲' : '●'}</Text>
          <Text style={styles.natureWord}>{CONTACT_LABEL[e.contact]}</Text>
        </View>
      ) : null}
      {flags.length ? <Text style={styles.eventFlags}>{flags.join('   ')}</Text> : null}
      {open && locked ? (
        <View style={styles.eventBody}>
          <View style={styles.lockedBox}>
            <LockIcon size={18} />
            <Text style={styles.lockedText}>{future ? 'Looking ahead past today is part of Premium: the full meaning of every future event. Subscriptions are not open yet.' : 'The explanation of this transit is part of Premium. Subscriptions are not open yet.'}</Text>
          </View>
          <GoldButton label="See what Premium includes" variant="ghost" onPress={() => router.push('/premium' as Href)} />
        </View>
      ) : null}
      {open && !locked ? (
        <View style={styles.eventBody}>
          <Text style={styles.blockBody}>{e.detail}</Text>
          {e.kind === 'gate' && e.until ? (
            <Text style={styles.blockBody}>
              Line {e.line} on entering. The {e.body === 'moon' ? 'Moon' : 'Sun'} stays in Gate {e.gate} until {untilLabel(e)}.
            </Text>
          ) : null}
          {e.house ? (
            <Text style={styles.blockBody}>
              Your {ordinal(e.house)} house: {houseTheme(e.house)}
            </Text>
          ) : null}
          {e.windowStart && e.windowEnd ? (
            <Text style={styles.blockBody}>
              Within 3° from {shortDate(e.windowStart)} to {shortDate(e.windowEnd)}
              {e.peakStart && e.peakEnd ? `; within 1° from ${shortDate(e.peakStart)} to ${shortDate(e.peakEnd)}` : ''}.
            </Text>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

export default function Timeline() {
  const profile = useT3DStore((s) => s.profile);
  const chart = useT3DStore((s) => s.chart);
  const premium = usePremium();
  const { data, error, loading, refreshing, refresh, retry, offline, savedAt } = useTimeline(chart?.leadId, profile?.email.trim(), 60);
  const [filter, setFilter] = useState<Filter>('all');
  const [lens, setLens] = useState<TimelineLens>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  /** The day tapped in the ribbon at the top (0 is today). The Vehicle reading follows it. */
  const [selectedDay, setSelectedDay] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [showAllPersonal, setShowAllPersonal] = useState(false);
  /** The Personal Day row that is open, by date. */
  const [openPersonal, setOpenPersonal] = useState<string | null>(null);
  const [showAllSeasons, setShowAllSeasons] = useState(false);
  const [openMonths, setOpenMonths] = useState<string[]>([]);

  // Where each month's block sits on the page, so a pinned bar can name the month being read.
  const scrollRef = useRef<ScrollView>(null);
  const sectionBox = useRef(new Map<string, { y: number; h: number; more: boolean }>());
  const moreY = useRef(0);
  const [pinMonth, setPinMonth] = useState<string | null>(null);
  const [jumpVisible, setJumpVisible] = useState(false);
  const onSectionLayout = (key: string, more: boolean) => (e: LayoutChangeEvent) => {
    sectionBox.current.set(key, { y: e.nativeEvent.layout.y, h: e.nativeEvent.layout.height, more });
  };
  const absSections = (): PinSection[] =>
    [...sectionBox.current.entries()]
      .map(([key, b]) => ({ key, top: b.y + (b.more ? moreY.current : 0), headHeight: -BAR_HEIGHT, bottom: b.y + (b.more ? moreY.current : 0) + b.h }))
      .sort((a, b) => a.top - b.top);
  const listTop = (): number | null => {
    const b = sectionBox.current.get('now');
    return b ? b.y : null;
  };
  const onScrollY = useCallback((y: number) => {
    const key = pinnedMonthAt(absSections(), y);
    setPinMonth((prev) => (prev === key ? prev : key));
    const jump = showJumpToday(y, listTop());
    setJumpVisible((prev) => (prev === jump ? prev : jump));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const jumpToday = () => {
    const top = listTop();
    if (top !== null) scrollRef.current?.scrollTo({ y: Math.max(0, top - space.md), animated: true });
  };

  const groups = useMemo(() => {
    if (!data) return [];
    // The Vehicle lens only ever lists gate changes, and its filter row is hidden, so a filter picked under
    // All or Stoplight (Moon, Sky, Transits) must not carry over and empty it.
    const kinds = lens === 'vehicle' ? null : FILTER_KINDS[filter];
    const byDay = new Map<string, TimelineEvent[]>();
    for (const e of data.events) {
      if (kinds && !kinds.includes(e.kind)) continue;
      if (lens === 'stoplight' && e.kind === 'gate') continue;
      if (lens === 'vehicle' && e.kind !== 'gate') continue;
      const key = localKey(new Date(e.at));
      const list = byDay.get(key) ?? [];
      list.push(e);
      byDay.set(key, list);
    }
    return [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [data, filter, lens]);

  const split = useMemo(() => splitCurrentMonth(groups, localKey(new Date())), [groups]);
  const thisYear = new Date().getFullYear();
  const monthTitle = (key: string) => {
    const d = parseDay(`${key}-01`);
    const name = d.toLocaleDateString(undefined, { month: 'long' });
    return d.getFullYear() === thisYear ? name : `${name} ${d.getFullYear()}`;
  };
  const nowMonthKey = localKey(new Date()).slice(0, 7);
  // The first block is stored as 'now'; the month it shows is this month.
  const pinMonthKey = pinMonth === 'now' || pinMonth === null ? nowMonthKey : pinMonth;
  const dayCount = (key: string) => groups.filter(([d]) => d.startsWith(key)).length;
  const personalSplit = useMemo(() => (data ? splitPersonalDays(data.personal, localKey(new Date())) : { week: [], rest: [] }), [data]);
  const weekSplit = useMemo(() => splitWeek(split.now, localKey(new Date())), [split]);
  const visibleGroups = weekSplit.week;
  const restDays = weekSplit.rest.length;
  const laterDays = split.later.length + restDays;
  const toggleMonth = (key: string) => {
    animateLayout();
    setOpenMonths((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
    setOpenId(null);
  };


  const dayTitle = (iso?: string) => (iso ? parseDay(iso).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : 'that day');

  const personalByDate = useMemo(() => {
    const m = new Map<string, number>();
    data?.personal.forEach((p) => m.set(p.date, p.day));
    return m;
  }, [data]);

  const renderDay = ([day, events]: [string, TimelineEvent[]]) => (
              <View key={day} style={styles.day}>
                <View style={styles.dayHead}>
                  <View style={[styles.node, day === groups[0]?.[0] && styles.nodeFirst]} />
                  <Text accessibilityRole="header" style={styles.dayTitle}>{longDate(day)}</Text>
                  {lens === 'all' && personalByDate.get(day) ? (
                    <Text style={styles.dayBadge}>Personal Day {numLabel(personalByDate.get(day)!)}</Text>
                  ) : null}
                </View>
                {events.map((e) => (
                  <EventRow
                    key={e.id}
                    e={e}
                    open={openId === e.id}
                    locked={isEventLocked(e.kind, day, localKey(new Date()), premium)}
                    future={day > localKey(new Date())}
                    onToggle={() => { animateLayout(); setOpenId(openId === e.id ? null : e.id); }}
                  />
                ))}
              </View>
  );

  return (
    <Screen room="road"
      refreshing={refreshing}
      onRefresh={refresh}
      scrollRef={scrollRef}
      onScrollY={onScrollY}
      overlay={
        lens !== 'road' && data && (pinMonth || jumpVisible) ? (
          <TimelinePinBar
            month={pinMonth ? monthTitle(pinMonthKey) : null}
            detail={pinMonth ? `${dayCount(pinMonthKey)} ${dayCount(pinMonthKey) === 1 ? 'day' : 'days'} with events` : null}
            onJumpToday={jumpVisible ? jumpToday : null}
          />
        ) : null
      }
    >
      <FadeIn>
        <View style={styles.header}>
          <LensLabel lens="road">The road ahead</LensLabel>
          <Text accessibilityRole="header" style={styles.title}>Timeline</Text>
          <Text style={guidance}>This week first, measured against your own chart. The rest of the month and later months are under Show more.</Text>
        </View>
      </FadeIn>

      {loading && !data ? (
        <SkeletonCards label="Reading the sky…" />
      ) : error && !data ? (
        <ErrorState message={error} onRetry={retry} />
      ) : data ? (
        <>
          {offline ? <OfflineNote savedAt={savedAt} /> : null}
          <FadeIn delay={40}>
            <SignalRibbon data={data} onSelectDay={setSelectedDay} premium={premium} />
          </FadeIn>
          <FadeIn delay={60}>
            <Segmented
              options={LENS_OPTIONS}
              value={lens}
              onChange={(l) => { setLens(l); setOpenId(null); }}
              compact
            />
          </FadeIn>
          {lens === 'all' || lens === 'road' ? (
            <FadeIn><RoadDayBlock data={data} selectedDay={selectedDay} premium={premium} /></FadeIn>
          ) : null}

          {lens === 'all' ? (
            <FadeIn><VehicleDayBlock data={data} selectedDay={selectedDay} premium={premium} /></FadeIn>
          ) : null}

          {lens === 'all' || lens === 'stoplight' ? (
            <FadeIn><StoplightDayBlock data={data} selectedDay={selectedDay} premium={premium} /></FadeIn>
          ) : null}

          {lens === 'all' || lens === 'road' ? <YearCard data={data} /> : null}

          {lens === 'road' ? (
            <Panel label="Your Personal Days" lens="road">
              {(showAllPersonal ? [...personalSplit.week, ...personalSplit.rest] : personalSplit.week).map((d) => (
                <View key={d.date}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded: openPersonal === d.date }}
                    accessibilityLabel={`${shortDate(d.date)}, Personal Day ${numLabel(d.day)}. ${openPersonal === d.date ? 'Expanded.' : 'Double tap to read this day.'}`}
                    onPress={() => { select(); animateLayout(); setOpenPersonal((cur) => (cur === d.date ? null : d.date)); }}
                    style={({ pressed }) => [styles.personalRow, pressed && { opacity: 0.8 }]}
                  >
                    <Text style={styles.personalDate}>{shortDate(d.date)}</Text>
                    <View style={styles.personalRight}>
                      <Text style={styles.dayBadge}>Personal Day {numLabel(d.day)}</Text>
                      <Chevron open={openPersonal === d.date} style={styles.personalChevron} />
                    </View>
                  </Pressable>
                  {openPersonal === d.date ? (
                    d.date !== localKey(new Date()) && !premium ? (
                      <PremiumGate
                        title={`Your Personal Day on ${dayTitleOf(d.date)}`}
                        detail="Today's Personal Day reading is free. Look ahead with Premium: the theme, where to lean in and what to watch, for each day."
                      />
                    ) : (() => {
                      const rd = roadDayFor(data, data.personal.findIndex((p) => p.date === d.date));
                      return rd ? <RoadToday day={rd} dayLabel={d.date === localKey(new Date()) ? null : dayTitleOf(d.date)} /> : (
                        <Text style={styles.footnote}>The full reading for this day is not saved on this phone yet. Pull down to refresh the Timeline.</Text>
                      );
                    })()
                  ) : null}
                </View>
              ))}
              {personalSplit.rest.length > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: showAllPersonal }}
                  onPress={() => { animateLayout(); setShowAllPersonal((v) => !v); }}
                  style={({ pressed }) => [styles.showMore, pressed && { opacity: 0.8 }]}
                >
                  <Text style={styles.showMoreText}>{showAllPersonal ? 'Show less' : 'Show more'}</Text>
                </Pressable>
              ) : null}
              <Text style={styles.footnote}>The week ahead first; the rest of the month is under Show more. Tap a day to read it. Pick Stoplight to see the sky events.</Text>
            </Panel>
          ) : null}

          {(lens === 'all' || lens === 'stoplight') && data.seasons.length > 0 ? (
            <FadeIn delay={100}>
              <Panel label="Slow transits in effect" lens="stoplight">
                <SpineAxis from={localKey(new Date(data.from))} to={localKey(new Date(data.to))} fromLabel="Today" toLabel={shortDate(localKey(new Date(data.to)))} />
                <SpineKey />
                {(showAllSeasons ? data.seasons : data.seasons.slice(0, SEASONS_SHOWN)).map((s, i) => (
                  <SpineRow key={`${s.body}-${s.natal}-${s.aspect}-${i}`} s={spineSeason(s, i)} from={localKey(new Date(data.from))} to={localKey(new Date(data.to))} />
                ))}
                {data.seasons.length > SEASONS_SHOWN ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded: showAllSeasons }}
                    accessibilityLabel={showAllSeasons ? 'Show fewer slow transits' : `Show all ${data.seasons.length} slow transits`}
                    onPress={() => { select(); animateLayout(); setShowAllSeasons((v) => !v); }}
                    style={styles.showMore}
                  >
                    <Text style={styles.showMoreText}>{showAllSeasons ? 'Show fewer' : `Show all ${data.seasons.length}`}</Text>
                  </Pressable>
                ) : null}
                <Text style={styles.footnote}>
                  Each bar runs from when the planet comes within 3° of your chart to when it leaves. ★ marks your Lord of the Year.
                </Text>
              </Panel>
            </FadeIn>
          ) : null}

          {lens === 'road' ? null : (
          <>
          {lens === 'vehicle' && selectedDay > 0 ? (
            <VehicleDayBlock data={data} selectedDay={selectedDay} premium={premium} />
          ) : lens === 'vehicle' ? (
            data.gateToday && data.gateToday.gates.length > 0 ? (
              <>
                <VehicleToday data={data.gateToday} />
                <Text style={styles.sub}>
                  Coming up: the Sun in every new gate, and the days the Moon completes one of your channels.
                </Text>
              </>
            ) : (
              <Text style={styles.sub}>
                The Sun in every new gate, and the days the Moon completes one of your channels. Conditions, not decisions: your Strategy and Authority decide.
              </Text>
            )
          ) : (
            <FadeIn delay={160}>
              <Segmented options={FILTERS} value={filter} onChange={(f) => { setFilter(f); setOpenId(null); }} compact />
            </FadeIn>
          )}

          {groups.length === 0 ? (
            <Text style={styles.sub}>
              {lens === 'vehicle'
                ? 'No gate changes to show. Your Human Design gates may be missing, so recalculate your chart.'
                : 'Nothing in this filter over the next 60 days.'}
            </Text>
          ) : (
            <View onLayout={onSectionLayout('now', false)} style={styles.monthBlock}>
              <View style={styles.monthHead}>
                <Text accessibilityRole="header" style={styles.monthName}>{monthTitle(nowMonthKey)}</Text>
                <Text style={styles.monthCount}>This week</Text>
              </View>
              {visibleGroups.length === 0 ? (
                <Text style={styles.sub}>Nothing in this filter this week.</Text>
              ) : (
                visibleGroups.map((g) => renderDay(g))
              )}
            </View>
          )}

          {laterDays > 0 ? (
            <View style={styles.moreWrap} onLayout={(e) => { moreY.current = e.nativeEvent.layout.y; }}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: showMore }}
                onPress={() => { animateLayout(); setShowMore((v) => !v); setOpenId(null); }}
                style={({ pressed }) => [styles.showMore, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.showMoreText}>{showMore ? 'Show less' : 'Show more'}</Text>
              </Pressable>
              {showMore && restDays > 0 ? (
                <View style={styles.monthBlock} onLayout={onSectionLayout(nowMonthKey, true)}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded: openMonths.includes(nowMonthKey) }}
                    accessibilityLabel={`Rest of ${monthTitle(nowMonthKey)}, ${restDays} ${restDays === 1 ? 'day' : 'days'} with events. ${openMonths.includes(nowMonthKey) ? 'Expanded.' : 'Double tap to open.'}`}
                    onPress={() => toggleMonth(nowMonthKey)}
                    style={({ pressed }) => [styles.monthBtn, pressed && { opacity: 0.8 }]}
                  >
                    <Text style={styles.monthName}>Rest of {monthTitle(nowMonthKey)}</Text>
                    <Text style={styles.monthCount}>{restDays} {restDays === 1 ? 'day' : 'days'}</Text>
                    <Chevron open={openMonths.includes(nowMonthKey)} style={styles.monthChevron} />
                  </Pressable>
                  {openMonths.includes(nowMonthKey) ? weekSplit.rest.map((g) => renderDay(g)) : null}
                </View>
              ) : null}
              {showMore
                ? split.laterMonths.map((key) => {
                    const open = openMonths.includes(key);
                    const days = split.later.filter(([d]) => d.startsWith(key));
                    return (
                      <View key={key} style={styles.monthBlock} onLayout={onSectionLayout(key, true)}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityState={{ expanded: open }}
                          accessibilityLabel={`${monthTitle(key)}, ${days.length} ${days.length === 1 ? 'day' : 'days'} with events. ${open ? 'Expanded.' : 'Double tap to open.'}`}
                          onPress={() => toggleMonth(key)}
                          style={({ pressed }) => [styles.monthBtn, pressed && { opacity: 0.8 }]}
                        >
                          <Text style={styles.monthName}>{monthTitle(key)}</Text>
                          <Text style={styles.monthCount}>{days.length} {days.length === 1 ? 'day' : 'days'}</Text>
                          {isLaterMonthLocked(premium) ? <LockIcon size={18} /> : <Chevron open={open} style={styles.monthChevron} />}
                        </Pressable>
                        {open ? (
                          isLaterMonthLocked(premium) ? (
                            <PremiumGate title={`${monthTitle(key)} and later months`} detail="The rest of this month is free. Look further ahead with Premium: every sky event and gate change, month by month." />
                          ) : days.map((g) => renderDay(g))
                        ) : null}
                      </View>
                    );
                  })
                : null}
            </View>
          ) : null}

          </>
          )}

          <Text style={styles.reminder}>{data.reminder}</Text>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  moreWrap: { gap: space.md },
  monthBlock: { gap: space.md },
  monthHead: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md },
  monthBtn: {
    minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: space.sm,
    paddingHorizontal: space.md, borderRadius: radius.md, borderWidth: 1,
    borderColor: T.edge, backgroundColor: T.surface,
  },
  monthName: { flex: 1, fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 20, color: colors.parchment },
  monthCount: { fontFamily: fonts.body, fontSize: 14, color: colors.parchmentMuted },
  monthChevron: { fontFamily: fonts.bodyBold, fontSize: 24, lineHeight: 26, color: colors.gold },
  showMore: { minHeight: 48, justifyContent: 'center', alignSelf: 'flex-start' },
  showMoreText: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.gold },
  header: { gap: 6, paddingTop: space.lg, paddingBottom: space.sm },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 3, color: colors.parchmentMuted },
  title: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 34, lineHeight: 42, color: colors.parchment },
  sub: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  center: { alignItems: 'center', gap: space.md, paddingVertical: space.xxl },
  error: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.danger, textAlign: 'center' },
  panel: {
    gap: space.md,
    padding: space.md,
    borderRadius: radius.lg,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.edge,
  },
  panelHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  panelLabel: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 20, lineHeight: 26 },
  natureTag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  contactGlyph: { fontSize: 13, color: colors.vehicle },
  natureWord: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.parchment },
  block: { gap: 4 },
  blockTitle: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.parchment },
  blockBody: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  footnote: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.parchmentMuted },
  day: { gap: space.sm, marginTop: space.sm, marginLeft: 8, paddingLeft: 18, borderLeftWidth: 2, borderLeftColor: 'rgba(31,138,77,0.55)' },
  dayHead: { gap: 2 },
  node: { position: 'absolute', left: -28, top: 7, width: 14, height: 14, borderRadius: 7, backgroundColor: colors.obsidian, borderWidth: 3, borderColor: '#1F8A4D' },
  nodeFirst: { backgroundColor: colors.gold, borderColor: colors.gold },
  dayTitle: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 20, color: colors.parchment },
  personalRow: { minHeight: TOUCH, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  personalRight: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  personalChevron: { fontFamily: fonts.bodyBold, fontSize: 22, lineHeight: 24, color: colors.gold },
  personalDate: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.parchment },
  dayBadge: { fontFamily: fonts.bodyMedium, fontSize: 13, letterSpacing: 0.6, color: colors.gold },
  event: {
    gap: 6,
    minHeight: 56,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.edge,
  },
  eventPressed: { backgroundColor: T.surface },
  eventHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  eventGlyph: { width: 28, fontSize: 22, color: colors.gold, textAlign: 'center' },
  eventTitleWrap: { flex: 1, gap: 2 },
  eventKind: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.parchmentMuted },
  eventTitle: { fontFamily: fonts.bodyMedium, fontSize: 16, lineHeight: 22, color: colors.parchment },
  lockWrap: { width: 24, alignItems: 'center', justifyContent: 'center' },
  lockedBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: space.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.gold, borderStyle: 'dashed',
  },
  lockedText: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 15, lineHeight: 22, color: colors.gold },
  chevron: { fontFamily: fonts.bodyBold, fontSize: 20, color: colors.parchmentMuted, width: 24, textAlign: 'center' },
  eventNature: { fontFamily: fonts.bodyMedium, fontSize: 13, letterSpacing: 0.5, color: colors.parchmentMuted },
  eventFlags: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.gold },
  eventBody: { gap: 6, paddingTop: 4 },
  reminder: {
    fontFamily: fonts.displayRegular, fontVariant: ['lining-nums'],
    fontSize: 15,
    lineHeight: 23,
    color: colors.parchmentMuted,
    textAlign: 'center',
    marginTop: space.lg,
  },
});
