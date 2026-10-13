import { StyleSheet, Text, View } from 'react-native';
import { AccentView } from '@/components/AccentView';
import type { RoadDay } from '@/lib/roadDay';
import { cycleLine } from '@/lib/numberWords';
import { colors, fonts, radius, space } from '@/theme/tokens';

function numberText(m: { number: number; root: number | null }): string {
  return m.root ? `${m.number}/${m.root}` : String(m.number);
}

/** The Road lens's reading of one Personal Day: the theme, where to lean in, what to watch, and how it sits in your month and year. */
export function RoadToday({ day, dayLabel }: { day: RoadDay; dayLabel?: string | null }) {
  const m = day.meaning;
  const title = dayLabel ? `Your Personal Day on ${dayLabel}` : 'Your Personal Day today';
  return (
    <AccentView
      style={styles.card}
      accessibilityLabel={`${title}: ${numberText(m)}, ${m.label}. ${m.theme} Lean in: ${m.leanIn} Watch for: ${m.watchFor}`}
    >
      <View style={styles.head}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{numberText(m)}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.eyebrow}>{dayLabel ? 'PERSONAL DAY' : 'PERSONAL DAY TODAY'}</Text>
          <Text style={styles.label}>{m.label}</Text>
        </View>
      </View>
      <Text style={styles.body}>{m.theme}</Text>
      <View style={styles.chips}>
        {m.keyThemes.map((t) => (
          <View key={t} style={styles.chip}>
            <Text style={styles.chipText}>{t}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.body}>
        <Text style={styles.strong}>{'Lean in: '}</Text>
        {m.leanIn}
      </Text>
      <Text style={styles.body}>
        <Text style={styles.strong}>{'Watch for: '}</Text>
        {m.watchFor}
      </Text>
      <View style={styles.divider} />
      <Text style={styles.strong}>How it sits in your cycles</Text>
      <Text style={styles.body}>{cycleLine('Year', day.year)}</Text>
      <Text style={styles.body}>{cycleLine('Month', day.month)}</Text>
    </AccentView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.goldEdge, borderLeftWidth: 4, borderLeftColor: colors.road,
    padding: space.lg, gap: 12,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  badge: {
    minWidth: 56, height: 56, borderRadius: 28, paddingHorizontal: 8, alignItems: 'center',
    justifyContent: 'center', borderWidth: 2, borderColor: colors.road,
  },
  badgeText: { fontFamily: fonts.display, fontSize: 24, color: colors.parchment },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2, color: colors.road },
  label: { fontFamily: fonts.display, fontSize: 22, color: colors.parchment },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  strong: { fontFamily: fonts.bodyBold, color: colors.parchment },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: colors.hairline, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.parchment },
  divider: { height: 1, backgroundColor: colors.hairline },
});
