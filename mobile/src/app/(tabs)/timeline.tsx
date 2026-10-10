import { useMemo, useState } from 'react';
import { router, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { FadeIn } from '@/components/FadeIn';
import { GoldButton } from '@/components/GoldButton';
import { Segmented } from '@/components/Segmented';
import { aspectWord, bodyName, capFirst, houseTheme, natalName, ordinal } from '@/lib/skyText';
import { LENS_TEXT, LensIcon, LensLabel, SIGNAL_LABEL, SignalMarker, type LensName, type SignalKind } from '@/components/Lens';
import { SignalRibbon } from '@/components/SignalRibbon';
import type { ActiveSeason, CycleWindow, TimelineEvent, TimelineKind, TimelineResult } from '@/lib/timelineTypes';
import { useTimeline } from '@/lib/useTimeline';
import { OfflineNote } from '@/components/OfflineNote';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, radius, space } from '@/theme/tokens';

type Filter = 'all' | 'moon' | 'sky' | 'transits';

const FILTERS = [
  { value: 'all', label: 'ALL' },
  { value: 'moon', label: 'MOON' },
  { value: 'sky', label: 'SKY' },
  { value: 'transits', label: 'TRANSITS' },
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
};

const KIND_GLYPH: Record<TimelineKind, string> = {
  lunation: '☽',
  eclipse: '◉',
  station: '℞',
  ingress: '→',
  transit: '✦',
  return: '↻',
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
            Your {ordinal(p.house)} house ({p.sign}) is activated from {shortDate(p.startsOn)} to{' '}
            {shortDate(p.endsOn)}. {capFirst(houseTheme(p.house))}
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
        <CycleBlock title="Pinnacle" cycle={data.pinnacle.current} next={data.pinnacle.next} />
        <CycleBlock title="Challenge" cycle={data.challenge.current} next={data.challenge.next} />
        <GoldButton label="YOUR YEAR AHEAD ›" variant="ghost" onPress={() => router.push('/year' as Href)} />
      </Panel>
    </FadeIn>
  );
}

function CycleBlock({ title, cycle, next }: { title: string; cycle: CycleWindow; next: CycleWindow | null }) {
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
    </View>
  );
}

function SeasonRow({ s }: { s: ActiveSeason }) {
  const phrase = `${bodyName(s.body)} ${aspectWord(s.aspect)} your ${natalName(s.natal)}`;
  const reaches = s.exactAt.length > 0
    ? `Exact ${s.exactAt.map((a) => shortDate(localKey(new Date(a)))).join(', ')}`
    : `Closest ${s.closest.orb.toFixed(1)}° on ${shortDate(localKey(new Date(s.closest.at)))}, never quite exact`;
  return (
    <View
      accessible
      accessibilityLabel={`${phrase}. ${SIGNAL_LABEL[NATURE_KIND[s.nature]]}. In effect ${shortDate(s.windowStart)} to ${shortDate(s.windowEnd)}. ${reaches}.`}
      style={[styles.season, s.nature === 'friction' && styles.seasonFriction]}
    >
      <Text style={styles.seasonTitle}>{phrase}{s.lord ? '  ★' : ''}</Text>
      <Text style={styles.seasonMeta}>
        In effect {shortDate(s.windowStart)} to {shortDate(s.windowEnd)} · {reaches}
      </Text>
      <NatureTag nature={s.nature} />
    </View>
  );
}

function EventRow({ e, open, onToggle }: { e: TimelineEvent; open: boolean; onToggle: () => void }) {
  const flags: string[] = [];
  if (e.lord) flags.push('★ Lord of the Year');
  if (e.profectedHouse) flags.push('⌂ Your profected house');
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      accessibilityLabel={`${timeOf(e.at)}. ${e.title}. ${open ? e.detail : 'Double tap for details.'}`}
      style={({ pressed }) => [styles.event, pressed && styles.eventPressed]}
    >
      <View style={styles.eventHead}>
        <Text style={styles.eventGlyph}>{KIND_GLYPH[e.kind]}</Text>
        <View style={styles.eventTitleWrap}>
          <Text style={styles.eventKind}>{KIND_LABEL[e.kind]} · {timeOf(e.at)}</Text>
          <Text style={styles.eventTitle}>{e.title}</Text>
        </View>
        <Text style={styles.chevron}>{open ? '–' : '+'}</Text>
      </View>
      {e.kind === 'transit' || e.kind === 'return' ? (
        <NatureTag nature={e.nature} />
      ) : null}
      {flags.length ? <Text style={styles.eventFlags}>{flags.join('   ')}</Text> : null}
      {open ? (
        <View style={styles.eventBody}>
          <Text style={styles.blockBody}>{e.detail}</Text>
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
  const { data, error, loading, refreshing, refresh, retry, offline, savedAt } = useTimeline(chart?.leadId, profile?.email.trim(), 60);
  const [filter, setFilter] = useState<Filter>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const groups = useMemo(() => {
    if (!data) return [];
    const kinds = FILTER_KINDS[filter];
    const byDay = new Map<string, TimelineEvent[]>();
    for (const e of data.events) {
      if (kinds && !kinds.includes(e.kind)) continue;
      const key = localKey(new Date(e.at));
      const list = byDay.get(key) ?? [];
      list.push(e);
      byDay.set(key, list);
    }
    return [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [data, filter]);

  const personalByDate = useMemo(() => {
    const m = new Map<string, number>();
    data?.personal.forEach((p) => m.set(p.date, p.day));
    return m;
  }, [data]);

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <FadeIn>
        <View style={styles.header}>
          <LensLabel lens="road">The road ahead</LensLabel>
          <Text accessibilityRole="header" style={styles.title}>Timeline</Text>
          <Text style={styles.sub}>The next 60 days, measured against your own chart.</Text>
        </View>
      </FadeIn>

      {loading && !data ? (
        <View style={styles.center} accessibilityLiveRegion="polite">
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.sub}>Reading the sky…</Text>
        </View>
      ) : error && !data ? (
        <View style={styles.center}>
          <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
          <GoldButton label="TRY AGAIN" variant="ghost" onPress={retry} />
        </View>
      ) : data ? (
        <>
          {offline ? <OfflineNote savedAt={savedAt} /> : null}
          <FadeIn delay={40}>
            <SignalRibbon data={data} />
          </FadeIn>
          <YearCard data={data} />

          {data.seasons.length > 0 ? (
            <FadeIn delay={100}>
              <Panel label="Seasons in effect" lens="stoplight">
                {data.seasons.map((s, i) => (
                  <SeasonRow key={`${s.body}-${s.natal}-${s.aspect}-${i}`} s={s} />
                ))}
                <Text style={styles.footnote}>
                  Slow planets within 3° of your chart. ★ marks your Lord of the Year.
                </Text>
              </Panel>
            </FadeIn>
          ) : null}

          <FadeIn delay={160}>
            <Segmented options={FILTERS} value={filter} onChange={(f) => { setFilter(f); setOpenId(null); }} compact />
          </FadeIn>

          {groups.length === 0 ? (
            <Text style={styles.sub}>Nothing in this filter over the next 60 days.</Text>
          ) : (
            groups.map(([day, events]) => (
              <View key={day} style={styles.day}>
                <View style={styles.dayHead}>
                  <View style={[styles.node, day === groups[0]?.[0] && styles.nodeFirst]} />
                  <Text accessibilityRole="header" style={styles.dayTitle}>{longDate(day)}</Text>
                  {personalByDate.get(day) ? (
                    <Text style={styles.dayBadge}>Personal Day {numLabel(personalByDate.get(day)!)}</Text>
                  ) : null}
                </View>
                {events.map((e) => (
                  <EventRow
                    key={e.id}
                    e={e}
                    open={openId === e.id}
                    onToggle={() => setOpenId(openId === e.id ? null : e.id)}
                  />
                ))}
              </View>
            ))
          )}

          <Text style={styles.reminder}>{data.reminder}</Text>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6, paddingTop: space.lg, paddingBottom: space.sm },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 3, color: colors.gold },
  title: { fontFamily: fonts.display, fontSize: 34, lineHeight: 42, color: colors.parchment },
  sub: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  center: { alignItems: 'center', gap: space.md, paddingVertical: space.xxl },
  error: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.danger, textAlign: 'center' },
  panel: {
    gap: space.md,
    padding: space.md,
    borderRadius: radius.lg,
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  panelHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  panelLabel: { fontFamily: fonts.display, fontSize: 20, lineHeight: 26 },
  natureTag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  natureWord: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.parchment },
  block: { gap: 4 },
  blockTitle: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.parchment },
  blockBody: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  footnote: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.parchmentMuted },
  season: {
    gap: 4,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.amethyst,
    borderLeftWidth: 4,
    borderLeftColor: '#4FD1B5',
  },
  seasonFriction: { borderLeftColor: '#F0836B' },
  seasonTitle: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.parchment },
  seasonMeta: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.parchmentMuted },
  seasonNature: { fontFamily: fonts.bodyMedium, fontSize: 13, letterSpacing: 0.5, color: colors.parchment },
  day: { gap: space.sm, marginTop: space.sm, marginLeft: 8, paddingLeft: 18, borderLeftWidth: 2, borderLeftColor: 'rgba(31,138,77,0.55)' },
  dayHead: { gap: 2 },
  node: { position: 'absolute', left: -28, top: 7, width: 14, height: 14, borderRadius: 7, backgroundColor: colors.obsidian, borderWidth: 3, borderColor: '#1F8A4D' },
  nodeFirst: { backgroundColor: colors.gold, borderColor: colors.gold },
  dayTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.parchment },
  dayBadge: { fontFamily: fonts.bodyMedium, fontSize: 13, letterSpacing: 0.6, color: colors.gold },
  event: {
    gap: 6,
    minHeight: 56,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  eventPressed: { backgroundColor: colors.amethyst },
  eventHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  eventGlyph: { width: 28, fontSize: 22, color: colors.gold, textAlign: 'center' },
  eventTitleWrap: { flex: 1, gap: 2 },
  eventKind: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.parchmentMuted },
  eventTitle: { fontFamily: fonts.bodyMedium, fontSize: 16, lineHeight: 22, color: colors.parchment },
  chevron: { fontFamily: fonts.bodyBold, fontSize: 20, color: colors.parchmentMuted, width: 24, textAlign: 'center' },
  eventNature: { fontFamily: fonts.bodyMedium, fontSize: 13, letterSpacing: 0.5, color: colors.parchmentMuted },
  eventFlags: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.gold },
  eventBody: { gap: 6, paddingTop: 4 },
  reminder: {
    fontFamily: fonts.displayRegular,
    fontSize: 15,
    lineHeight: 23,
    color: colors.parchmentMuted,
    textAlign: 'center',
    marginTop: space.lg,
  },
});
