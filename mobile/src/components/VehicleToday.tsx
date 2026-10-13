import { StyleSheet, Text, View } from 'react-native';
import { AccentView } from '@/components/AccentView';
import { LensIcon } from '@/components/Lens';
import type { GateToday, GateTodayResult } from '@/lib/timelineTypes';
import { colors, fonts, radius, space } from '@/theme/tokens';

const clock = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
const day = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

/** When the Sun is in the gate, in the person's own time. */
export function gateWindow(g: Pick<GateToday, 'from' | 'until'>, dayWord = 'today'): string {
  const until = `${day(g.until)}, ${clock(g.until)}`;
  return g.from ? `From ${clock(g.from)} ${dayWord} until ${until}` : `Until ${until}`;
}

function GateBlock({ g, index, total, dayLabel }: { g: GateToday; index: number; total: number; dayLabel: string | null }) {
  const dayWord = dayLabel ? 'that day' : 'today';
  return (
    <AccentView style={[styles.gate, { borderLeftColor: colors.vehicle }]}>
      <Text style={styles.when}>
        {total > 1 ? (index === 0 ? `Earlier ${dayWord}` : `Later ${dayWord}`) : (dayLabel ?? 'Today')} · {gateWindow(g, dayWord)}
      </Text>
      <Text accessibilityRole="header" style={styles.gateTitle}>Gate {g.gate}: {g.name}</Text>
      <Text style={styles.body}>{g.meaning} It sits in the {g.center} Center, and the Sun is in line {g.line}.</Text>
      <Text style={styles.label}>What the Sun brings</Text>
      <Text style={styles.body}>{g.reading.theme}</Text>
      <Text style={styles.label}>Where it tips over</Text>
      <Text style={styles.body}>{g.reading.shadow}</Text>
      <Text style={styles.label}>What to do with it</Text>
      <Text style={styles.body}>{g.reading.guidance}</Text>
      <Text style={styles.label}>How it meets your chart</Text>
      <Text style={styles.body}>{g.meets} {g.advice}</Text>
    </AccentView>
  );
}

/**
 * Top of the Vehicle lens: the Sun's gate(s) today, what each means, how it meets this chart,
 * and what to do with it, anchored in the person's own Strategy and Authority. Conditions, never decisions.
 */
export function VehicleToday({ data, dayLabel = null }: { data: GateTodayResult; dayLabel?: string | null }) {
  if (data.gates.length === 0) return null;
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <LensIcon lens="vehicle" size={13} />
        <Text accessibilityRole="header" style={styles.headText}>
          {dayLabel ? (data.gates.length > 1 ? `The gates the Sun crosses on ${dayLabel}` : `The gate the Sun is in on ${dayLabel}`) : data.gates.length > 1 ? 'The gates the Sun crosses today' : 'The gate the Sun is in today'}
        </Text>
      </View>
      {data.gates.map((g, i) => <GateBlock key={g.gate} g={g} index={i} total={data.gates.length} dayLabel={dayLabel} />)}
      {data.strategy || data.authority ? (
        <View style={styles.anchor}>
          <Text style={styles.label}>Your anchor</Text>
          {data.strategy ? <Text style={styles.body}>{data.strategy}</Text> : null}
          {data.authority ? <Text style={styles.body}>{data.authority}</Text> : null}
          <Text style={styles.foot}>Gates are conditions, not decisions. Your Strategy and Authority decide.</Text>
        </View>
      ) : (
        <Text style={styles.foot}>Gates are conditions, not decisions. Your Strategy and Authority decide.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headText: { fontFamily: fonts.display, fontSize: 22, lineHeight: 30, color: colors.vehicle },
  gate: { gap: 8, padding: space.lg, borderRadius: radius.md, borderLeftWidth: 4, borderWidth: 1, borderColor: colors.goldEdge, backgroundColor: colors.surface },
  when: { fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 20, color: colors.parchmentMuted },
  gateTitle: { fontFamily: fonts.display, fontSize: 22, lineHeight: 30, color: colors.parchment },
  label: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.gold, marginTop: 4 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.parchment },
  anchor: { gap: 6 },
  foot: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.parchmentMuted },
});
