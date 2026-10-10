import { StyleSheet, Text, View } from 'react-native';
import { LENS_COLOR, LENS_LABEL, LensIcon, SIGNAL_LABEL, SignalMarker, type LensName, type SignalKind } from '@/components/Lens';
import type { DailyTransitHit, TodayResult } from '@/lib/api';
import type { TriadToday } from '@/lib/triadTypes';
import { aspectWord, bodyName, natalName } from '@/lib/skyText';
import { colors, fonts, radius, space } from '@/theme/tokens';

interface Props {
  today: TodayResult;
  triad: TriadToday | null;
  isToday: boolean;
}

const natureToSignal = (nature: DailyTransitHit['nature']): SignalKind =>
  nature === 'flow' ? 'flow' : nature === 'friction' ? 'friction' : 'neutral';

function Row({ lens, line, sub, signal }: { lens: LensName; line: string; sub: string | null; signal?: SignalKind }) {
  return (
    <View
      accessible
      accessibilityLabel={`${LENS_LABEL[lens]}${signal ? `, ${SIGNAL_LABEL[signal]}` : ''}. ${line}.${sub ? ` ${sub}` : ''}`}
      style={styles.row}
    >
      <View style={styles.rowHead}>
        <LensIcon lens={lens} size={13} />
        <Text style={[styles.lensName, { color: LENS_COLOR[lens] }]}>{LENS_LABEL[lens]}</Text>
        {signal ? (
          <View style={styles.signalTag}>
            <SignalMarker kind={signal} size={13} />
            <Text style={styles.signalWord}>{SIGNAL_LABEL[signal]}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.line}>{line}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  );
}

/**
 * The first thing on Today: one line per lens, the signal of the tightest sky contact,
 * and a tally of the day's flow, friction and retrogrades. Every marker is paired with its word.
 */
export function TodaySignal({ today, triad, isToday }: Props) {
  const top = today.transits[0] ?? null;
  const flow = today.transits.filter((t) => t.nature === 'flow').length;
  const friction = today.transits.filter((t) => t.nature === 'friction').length;
  const retro = today.retrograde.length;

  const vehicleLine = triad?.vehicle.strategy ?? today.vehicle.strategy ?? today.vehicle.type ?? 'Your Vehicle';
  const vehicleSub = triad?.vehicle.heading ?? today.vehicle.type;
  const skyLine = triad?.stoplight.lead
    ? triad.stoplight.lead.title
    : top
      ? `${bodyName(top.transiting)} ${aspectWord(top.aspect)} your ${natalName(top.natal)}`
      : 'A quiet sky';

  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.title}>{isToday ? 'Your signal today' : 'Your signal for this day'}</Text>
      <Row lens="vehicle" line={vehicleLine} sub={vehicleSub && vehicleSub !== vehicleLine ? vehicleSub : null} />
      {triad ? (
        <Row lens="road" line={`Personal Day ${triad.road.numberText}: ${triad.road.label}`} sub={`Lean in: ${triad.road.leanIn}`} />
      ) : null}
      <Row lens="stoplight" line={skyLine} sub={today.moon.formatted} signal={top ? natureToSignal(top.nature) : 'neutral'} />

      <View style={styles.tally} accessible accessibilityLabel={`In the sky: ${flow} flow, ${friction} friction, ${retro} retrograde.`}>
        <View style={styles.tallyItem}><SignalMarker kind="flow" size={14} /><Text style={styles.tallyText}>{flow} flow</Text></View>
        <View style={styles.tallyItem}><SignalMarker kind="friction" size={14} /><Text style={styles.tallyText}>{friction} friction</Text></View>
        <View style={styles.tallyItem}><SignalMarker kind="caution" size={14} /><Text style={styles.tallyText}>{retro} retrograde</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.charcoal, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline,
    padding: space.lg, gap: space.md,
  },
  title: { fontFamily: fonts.display, fontSize: 22, lineHeight: 29, color: colors.parchment },
  row: { gap: 4 },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  lensName: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 0.4 },
  signalTag: { flexDirection: 'row', alignItems: 'center', gap: 5, marginLeft: 'auto' },
  signalWord: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.parchment },
  line: { fontFamily: fonts.bodyMedium, fontSize: 17, lineHeight: 24, color: colors.parchment },
  sub: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.parchmentMuted },
  tally: {
    flexDirection: 'row', flexWrap: 'wrap', columnGap: space.md, rowGap: space.sm,
    paddingTop: space.md, borderTopWidth: 1, borderTopColor: colors.hairline,
  },
  tallyItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tallyText: { fontFamily: fonts.body, fontSize: 14, color: colors.parchmentMuted },
});
