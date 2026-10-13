import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Chevron } from '@/components/Chevron';
import { LensIcon, SIGNAL_LABEL, SignalMarker, type SignalKind } from '@/components/Lens';
import { LockIcon } from '@/components/LockIcon';
import { Pressable } from '@/components/Pressable';
import { RoadDayBlock } from '@/components/DayLenses';
import { select } from '@/lib/haptics';
import { animateLayout } from '@/lib/motion';
import { gateReadingForDay } from '@/lib/gateDay';
import { isEventLocked } from '@/lib/timelineLock';
import type { TimelineEvent, TimelineResult } from '@/lib/timelineTypes';
import { colors, fonts, radius, space, themes } from '@/theme/tokens';

const T = themes.timeline;

interface Props {
  data: TimelineResult;
  /** 0 is today. */
  index: number;
  /** The day as YYYY-MM-DD. */
  dayKey: string;
  todayKey: string;
  premium: boolean;
  events: TimelineEvent[];
  signalOf: (e: TimelineEvent) => SignalKind | null;
  title: string;
  personalDay: number;
}

const ordinalHouse = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'}`;
const shortDay = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

/**
 * The card under the ribbon: the day's Personal Day and its events, each one a row that opens into
 * what it means. Today's readings are free; transits and future days are Premium, like the lists below.
 */
export function DayDetail({ data, index, dayKey, todayKey, premium, events, signalOf, title, personalDay }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => setOpenId(null), [dayKey]);
  const toggle = (id: string) => { select(); animateLayout(); setOpenId((cur) => (cur === id ? null : id)); };
  const gates = gateReadingForDay(data, index)?.gates ?? [];
  const personalOpen = openId === 'personal';

  return (
    <View style={styles.detail} accessibilityLiveRegion="polite">
      <Text maxFontSizeMultiplier={1.15} style={styles.title}>{title} · Personal Day {personalDay}</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: personalOpen }}
        accessibilityLabel={`Personal Day ${personalDay}. ${personalOpen ? 'Expanded.' : 'Double tap to read what it means.'}`}
        onPress={() => toggle('personal')}
        style={styles.row}
      >
        <View style={styles.rowHead}>
          <LensIcon lens="road" size={14} />
          <Text maxFontSizeMultiplier={1.15} style={styles.rowText}>
            Personal Day {personalDay}{data.dayMeanings?.[personalDay] ? ` · ${data.dayMeanings[personalDay]!.label}` : ''}
          </Text>
          {!premium && index > 0 ? <LockIcon size={16} /> : <Chevron open={personalOpen} style={styles.chevron} />}
        </View>
      </Pressable>
      {personalOpen ? <RoadDayBlock data={data} selectedDay={index} premium={premium} /> : null}

      {events.length === 0 ? (
        <Text maxFontSizeMultiplier={1.15} style={styles.quiet}>A quiet sky. Nothing close to your chart.</Text>
      ) : (
        events.map((e) => {
          const s = signalOf(e);
          const open = openId === e.id;
          const locked = isEventLocked(e.kind, dayKey, todayKey, premium);
          const gate = e.kind === 'gate' && e.gate ? gates.find((g) => g.gate === e.gate) : undefined;
          return (
            <View key={e.id}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
                accessibilityLabel={`${e.title}${s ? `, ${SIGNAL_LABEL[s]}` : ''}. ${locked ? 'Part of Premium.' : open ? 'Expanded.' : 'Double tap to read what it means.'}`}
                onPress={() => toggle(e.id)}
                style={styles.row}
              >
                <View style={styles.rowHead}>
                  {s ? <SignalMarker kind={s} size={15} /> : e.kind === 'gate' ? <LensIcon lens="vehicle" size={14} /> : <View style={styles.noMarker} />}
                  <Text maxFontSizeMultiplier={1.15} style={styles.rowText}>{e.title}{s ? ` · ${SIGNAL_LABEL[s]}` : ''}</Text>
                  {locked ? <LockIcon size={16} /> : <Chevron open={open} style={styles.chevron} />}
                </View>
              </Pressable>
              {open ? (
                locked ? (
                  <Text style={styles.lockNote}>
                    {index > 0 ? 'Looking ahead past today is part of Premium: the full meaning of every future event.' : 'The explanation of this transit is part of Premium.'} Subscriptions are not open yet.
                  </Text>
                ) : (
                  <View style={styles.body}>
                    <Text style={styles.bodyText}>{e.detail}</Text>
                    {gate ? (
                      <>
                        <Text style={styles.label}>What the Sun brings</Text>
                        <Text style={styles.bodyText}>{gate.reading.theme}</Text>
                        <Text style={styles.label}>Where it tips over</Text>
                        <Text style={styles.bodyText}>{gate.reading.shadow}</Text>
                        <Text style={styles.label}>What to do with it</Text>
                        <Text style={styles.bodyText}>{gate.reading.guidance}</Text>
                        <Text style={styles.label}>How it meets your chart</Text>
                        <Text style={styles.bodyText}>{gate.meets} {gate.advice}</Text>
                      </>
                    ) : null}
                    {e.house ? <Text style={styles.bodyText}>Your {ordinalHouse(e.house)} house is where this lands.</Text> : null}
                    {e.windowStart && e.windowEnd ? (
                      <Text style={styles.bodyText}>
                        Within 3° from {shortDay(e.windowStart)} to {shortDay(e.windowEnd)}
                        {e.peakStart && e.peakEnd ? `; within 1° from ${shortDay(e.peakStart)} to ${shortDay(e.peakEnd)}` : ''}.
                      </Text>
                    ) : null}
                  </View>
                )
              ) : null}
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  detail: { gap: 6, padding: space.md, borderRadius: radius.md, backgroundColor: T.surface, borderWidth: 1, borderColor: T.edge },
  title: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.parchment, marginBottom: 2 },
  row: { minHeight: 48, justifyContent: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.rule },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowText: { flex: 1, fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchment },
  chevron: { fontFamily: fonts.bodyBold, fontSize: 22, color: colors.gold, width: 24 },
  noMarker: { width: 15, height: 15 },
  quiet: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.parchmentMuted },
  body: { gap: 6, paddingBottom: space.sm },
  bodyText: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.parchmentMuted },
  label: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.gold, marginTop: 4 },
  lockNote: { fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 21, color: colors.gold, paddingBottom: space.sm },
});
