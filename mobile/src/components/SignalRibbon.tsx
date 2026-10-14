import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/components/Pressable';
import { LensIcon, SIGNAL_LABEL, SignalMarker, type SignalKind } from '@/components/Lens';
import { DayDetail } from '@/components/DayDetail';
import type { TimelineEvent, TimelineResult } from '@/lib/timelineTypes';
import { colors, fonts, radius, space, tabular, themes } from '@/theme/tokens';

const T = themes.timeline;

/** The marker an event carries: eclipses are caution, transits carry their own nature, the rest carry none. */
export function eventSignal(e: TimelineEvent): SignalKind | null {
  if (e.kind === 'eclipse') return 'caution';
  if (e.kind === 'transit' || e.kind === 'return') {
    return e.nature === 'flow' ? 'flow' : e.nature === 'friction' ? 'friction' : 'neutral';
  }
  return null;
}

const PRIORITY: SignalKind[] = ['caution', 'friction', 'flow', 'neutral'];

/** The strongest signal among a day's events (caution, then friction, then flow, then neutral). */
export function daySignal(events: TimelineEvent[]): SignalKind | null {
  const found = new Set<SignalKind>();
  for (const e of events) {
    const s = eventSignal(e);
    if (s) found.add(s);
  }
  return PRIORITY.find((p) => found.has(p)) ?? null;
}

const CELL_W = 48;

function parseDay(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d);
}

function localKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface Props {
  data: TimelineResult;
  /** Told which day (0 is today) the person has tapped, so the rest of the screen can follow it. */
  onSelectDay?: (index: number) => void;
  /** Premium unlocks the meaning of future days and transits. */
  premium?: boolean;
}

/**
 * A scrolling ribbon of the next 60 days. Each day shows its date, its Personal Day number and the
 * strongest signal of the day as a shape plus a word in the detail below. Tap a day to read its events.
 */
export function SignalRibbon({ data, onSelectDay, premium = false }: Props) {
  const days = useMemo(() => {
    const byDay = new Map<string, TimelineEvent[]>();
    for (const e of data.events) {
      const k = localKey(new Date(e.at));
      byDay.set(k, [...(byDay.get(k) ?? []), e]);
    }
    return data.personal.map((p) => ({ key: p.date, personalDay: p.day, events: byDay.get(p.date) ?? [] }));
  }, [data]);

  const [selected, setSelected] = useState(0);
  const current = days[selected];
  if (!current) return null;
  const date = parseDay(current.key);
  const counts = (kind: SignalKind) => days.filter((d) => daySignal(d.events) === kind).length;

  return (
    <View style={styles.wrap}>
      <Text maxFontSizeMultiplier={1.15} accessibilityRole="header" style={styles.title}>The next 60 days</Text>
      <Text maxFontSizeMultiplier={1.15} style={styles.sub}>
        {counts('flow')} flow, {counts('friction')} friction and {counts('caution')} caution days. Swipe the ribbon and tap a day.
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ribbon}>
        {days.map((d, i) => {
          const sig = daySignal(d.events);
          const dt = parseDay(d.key);
          const isSel = i === selected;
          return (
            <Pressable
              key={d.key}
              accessibilityRole="button"
              accessibilityState={{ selected: isSel }}
              accessibilityLabel={`${dt.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}${i === 0 ? ', today' : ''}. ${sig ? SIGNAL_LABEL[sig] : 'Quiet'}. Personal Day ${d.personalDay}.`}
              onPress={() => { setSelected(i); onSelectDay?.(i); }}
              style={[styles.cell, isSel && styles.cellOn]}
            >
              <Text maxFontSizeMultiplier={1.15} style={styles.weekday}>{i === 0 ? 'Today' : dt.toLocaleDateString(undefined, { weekday: 'narrow' })}</Text>
              <Text maxFontSizeMultiplier={1.15} style={styles.dayNum}>{dt.getDate()}</Text>
              <View style={styles.markerSlot}>
                {sig ? <SignalMarker kind={sig} size={16} /> : d.events.some((e) => e.kind === 'gate') ? <LensIcon lens="vehicle" size={13} /> : <View style={styles.quiet} />}
              </View>
              <Text maxFontSizeMultiplier={1.15} style={styles.pd}>PD {d.personalDay}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <DayDetail
        data={data}
        index={selected}
        dayKey={current.key}
        todayKey={days[0]?.key ?? current.key}
        premium={premium}
        events={current.events}
        signalOf={eventSignal}
        title={date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        personalDay={current.personalDay}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  title: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 22, lineHeight: 29, color: colors.parchment },
  sub: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  ribbon: { gap: 6, paddingVertical: space.sm, paddingRight: space.md },
  cell: {
    width: CELL_W, minHeight: 88, alignItems: 'center', justifyContent: 'center', gap: 3,
    borderRadius: radius.md, borderWidth: 1, borderColor: T.edge, backgroundColor: T.surface,
  },
  cellOn: { borderColor: colors.gold, backgroundColor: T.wash },
  weekday: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.parchmentMuted },
  dayNum: { fontFamily: fonts.bodyBold, fontSize: 17, color: colors.parchment, ...tabular },
  markerSlot: { height: 18, alignItems: 'center', justifyContent: 'center' },
  quiet: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.hairline },
  pd: { fontFamily: fonts.body, fontSize: 12, color: colors.parchmentMuted, ...tabular },
  detail: {
    gap: 8, padding: space.md, borderRadius: radius.md, backgroundColor: T.surface,
    borderWidth: 1, borderColor: T.edge,
  },
  detailTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.parchment },
  eventLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  noMarker: { width: 15, height: 15 },
  eventText: { flex: 1, fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchment },
});
