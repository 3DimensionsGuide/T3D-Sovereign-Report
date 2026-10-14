import { StyleSheet, Text, View } from 'react-native';
import { Disclosure } from '@/components/Disclosure';
import { LensIcon } from '@/components/Lens';
import type { MoonDay, MoonDaySegment } from '@/lib/timelineTypes';
import { ordinal } from '@/lib/skyText';
import { colors, fonts, radius, space, themes } from '@/theme/tokens';

const T = themes.timeline;

const clock = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
const dayOf = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

/** When the Moon is in the sign, in the person's own time. */
export function moonWindow(s: Pick<MoonDaySegment, 'from' | 'until'>, dayWord = 'today'): string {
  const until = `${dayOf(s.until)}, ${clock(s.until)}`;
  return s.from ? `From ${clock(s.from)} ${dayWord} until ${until}` : `Until ${until}`;
}

function SignBlock({ s, index, total, dayWord }: { s: MoonDaySegment; index: number; total: number; dayWord: string }) {
  return (
    <View style={[styles.block, index > 0 && styles.divider]}>
      <Text style={styles.when}>
        {total > 1 ? `${index === 0 ? 'Earlier' : 'Later'} ${dayWord} · ` : ''}{moonWindow(s, dayWord)}
      </Text>
      <Text accessibilityRole="header" style={styles.title}>Moon in {s.sign}</Text>
      <Text style={styles.body}>
        The Moon moves through your {ordinal(s.house)} house, {s.houseName}: {s.houseTheme.charAt(0).toLowerCase()}{s.houseTheme.slice(1)}
      </Text>
      <Text style={styles.label}>What the day brings</Text>
      <Text style={styles.body}>{s.reading.theme}</Text>
      <Disclosure label="Show more">
        <Text style={styles.label}>Where it tips over</Text>
        <Text style={styles.body}>{s.reading.shadow}</Text>
        <Text style={styles.label}>What to do with it</Text>
        <Text style={styles.body}>{s.reading.guidance}</Text>
      </Disclosure>
    </View>
  );
}

/** The Stoplight lens's reading of one day: the Moon's sign (two when it changes sign) and the house it moves through. */
export function MoonToday({ day, dayLabel = null }: { day: MoonDay; dayLabel?: string | null }) {
  if (day.segments.length === 0) return null;
  const dayWord = dayLabel ? 'that day' : 'today';
  const title = dayLabel
    ? day.segments.length > 1 ? `The Moon's signs on ${dayLabel}` : `The Moon on ${dayLabel}`
    : day.segments.length > 1 ? "Today's Moon changes sign" : 'The Moon today';
  return (
    <View style={styles.panel}>
      <View style={styles.head}>
        <LensIcon lens="stoplight" size={13} />
        <Text accessibilityRole="header" style={styles.headText}>{title}</Text>
      </View>
      {day.segments.map((s, i) => (
        <SignBlock key={`${s.sign}-${s.until}`} s={s} index={i} total={day.segments.length} dayWord={dayWord} />
      ))}
      <Text style={styles.foot}>The Moon is weather, not a command. Your Strategy and Authority decide.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: space.md, padding: space.md, borderRadius: radius.lg, borderWidth: 1, borderColor: T.edge, backgroundColor: T.surface },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headText: { flex: 1, fontFamily: fonts.display, fontSize: 20, lineHeight: 26, color: colors.stoplight },
  block: { gap: 8 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.rule, paddingTop: space.md },
  when: { fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 20, color: colors.parchmentMuted },
  title: { fontFamily: fonts.bodyBold, fontSize: 18, lineHeight: 25, color: colors.parchment },
  label: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.gold, marginTop: 4 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.parchmentMuted },
  foot: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.parchmentMuted },
});
