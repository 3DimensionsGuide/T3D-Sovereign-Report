import { StyleSheet, Text, View } from 'react-native';
import type { DayNumberMeaning, DayNumerology } from '@/lib/dayNumerologyTypes';
import { Term } from '@/components/Explain';
import { numberId } from '@/lib/termIds';
import { colors, fonts, radius, space } from '@/theme/tokens';

function numberText(m: DayNumberMeaning): string {
  return m.root ? `${m.number}/${m.root}` : String(m.number);
}

function DayBlock({ kind, meaning }: { kind: 'GLOBAL' | 'YOURS'; meaning: DayNumberMeaning }) {
  const title = kind === 'GLOBAL' ? 'UNIVERSAL DAY' : 'YOUR PERSONAL DAY';
  const caption = kind === 'GLOBAL' ? 'The energy of this date, felt by everyone' : 'The energy of this date, for you';
  return (
    <View
      accessibilityLabel={`${title} ${numberText(meaning)}, ${meaning.label}. ${meaning.theme} Key themes: ${meaning.keyThemes.join(', ')}. Lean in: ${meaning.leanIn} Watch for: ${meaning.watchFor}`}
      style={styles.block}
    >
      <View style={styles.head}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{numberText(meaning)}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.eyebrow}>
            <Term id={kind === 'GLOBAL' ? 'num:universalday' : 'num:personalday'}>{title}</Term>
          </Text>
          <Text style={styles.label}>
            <Term id={numberId(meaning.number)}>{meaning.label}</Term>
          </Text>
          <Text style={styles.caption}>{caption}</Text>
        </View>
      </View>
      <Text style={styles.body}>{meaning.theme}</Text>
      <View style={styles.chips}>
        {meaning.keyThemes.map((t) => (
          <View key={t} style={styles.chip}>
            <Text style={styles.chipText}>{t}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.body}>
        <Text style={styles.strong}>{'▲  Lean in: '}</Text>
        {meaning.leanIn}
      </Text>
      <Text style={styles.body}>
        <Text style={styles.strong}>{'◼  Watch for: '}</Text>
        {meaning.watchFor}
      </Text>
    </View>
  );
}

export function DayNumerologyCard({ data }: { data: DayNumerology }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardEyebrow}>THE ROAD · NUMEROLOGY OF THE DAY</Text>
      <DayBlock kind="GLOBAL" meaning={data.universal} />
      <View style={styles.divider} />
      <DayBlock kind="YOURS" meaning={data.personal} />
      <Text style={styles.body}>{data.blend}</Text>
      <Text style={styles.caption}>
        <Term id="num:personalyear">Personal Year</Term> {data.personalYear} ·{' '}
        <Term id="num:personalmonth">Personal Month</Term> {data.personalMonth}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    backgroundColor: colors.charcoal, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.hairline, borderLeftWidth: 4, borderLeftColor: colors.road,
    padding: space.lg, gap: 14,
  },
  cardEyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2, color: colors.parchmentMuted },
  block: { gap: 10 },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  badge: {
    minWidth: 56, height: 56, borderRadius: 28, paddingHorizontal: 8, alignItems: 'center',
    justifyContent: 'center', borderWidth: 2, borderColor: colors.road,
  },
  badgeText: { fontFamily: fonts.display, fontSize: 24, color: colors.parchment },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2, color: colors.road },
  label: { fontFamily: fonts.display, fontSize: 22, color: colors.parchment },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.parchmentMuted },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  strong: { fontFamily: fonts.bodyBold, color: colors.parchment },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 999, borderWidth: 1, borderColor: colors.hairline,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.parchment },
  divider: { height: 1, backgroundColor: colors.hairline },
});
