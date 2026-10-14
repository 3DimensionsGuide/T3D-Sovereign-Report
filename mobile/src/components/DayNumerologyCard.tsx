import { NumberSigil } from '@/components/NumberSigil';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/components/Pressable';
import { select } from '@/lib/haptics';
import type { DayNumberMeaning, DayNumerology } from '@/lib/dayNumerologyTypes';
import { Term } from '@/components/Explain';
import { PersonalDial } from '@/components/PersonalDial';
import { RollingNumber } from '@/components/RollingNumber';
import { numberId } from '@/lib/termIds';
import { cycleLine, numberWord } from '@/lib/numberWords';
import { colors, fonts, radius, space } from '@/theme/tokens';

import { AccentView } from '@/components/AccentView';
import { animateLayout } from '@/lib/motion';
import { Chevron } from '@/components/Chevron';
function numberText(m: DayNumberMeaning): string {
  return m.root ? `${m.number}/${m.root}` : String(m.number);
}

/** `bare` leaves out the badge and title, for when the summary row above already shows them. */
function DayBlock({ kind, meaning, bare = false }: { kind: 'GLOBAL' | 'YOURS'; meaning: DayNumberMeaning; bare?: boolean }) {
  const title = kind === 'GLOBAL' ? 'UNIVERSAL DAY' : 'YOUR PERSONAL DAY';
  const caption = kind === 'GLOBAL' ? 'The energy of this date, felt by everyone' : 'The energy of this date, for you';
  return (
    <View
      accessibilityLabel={`${title} ${numberText(meaning)}, ${meaning.label}. ${meaning.theme} Key themes: ${meaning.keyThemes.join(', ')}. Lean in: ${meaning.leanIn} Watch for: ${meaning.watchFor}`}
      style={styles.block}
    >
      {bare ? (
        <Text style={styles.caption}>
          <Term id="num:personalday">{caption}</Term>
        </Text>
      ) : (
      <View style={styles.head}>
        <View style={styles.badge}>
          <NumberSigil text={numberText(meaning)} />
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
      )}
      <Text style={styles.body}>{meaning.theme}</Text>
      <View style={styles.chips}>
        {meaning.keyThemes.map((t) => (
          <View key={t} style={styles.chip}>
            <Text style={styles.chipText}>{t}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.body}>
        <Text style={styles.strong}>{'Lean in: '}</Text>
        {meaning.leanIn}
      </Text>
      <Text style={styles.body}>
        <Text style={styles.strong}>{'Watch for: '}</Text>
        {meaning.watchFor}
      </Text>
    </View>
  );
}

/**
 * Collapsed, this is one line: "Personal Day 6: Care". Tap it for your Personal Day in full,
 * the Universal Day and how the two blend.
 */
export function DayNumerologyCard({ data }: { data: DayNumerology }) {
  const [open, setOpen] = useState(false);
  const p = data.personal;
  return (
    <AccentView style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`The Road, number of the day. Personal Day ${numberText(p)}, ${p.label}. Personal Year ${data.personalYear}, Personal Month ${data.personalMonth}. ${open ? 'Expanded.' : 'Double tap to read more.'}`}
        onPress={() => {
          select();
          animateLayout();
          setOpen((o) => !o);
        }}
        style={({ pressed }) => [styles.summary, pressed && { opacity: 0.8 }]}
      >
        <View style={styles.badge}>
          <NumberSigil text={numberText(p)} />
          <RollingNumber value={numberText(p)} style={styles.badgeText} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.eyebrow}>PERSONAL DAY</Text>
          <Text style={styles.label}>{p.label}</Text>
        </View>
        <Chevron open={open} style={styles.chevron} />
      </Pressable>
      <View style={styles.dials}>
        <PersonalDial kind="Year" number={data.personalYear} text={String(data.personalYear)} word={numberWord(data.personalYear)} />
        <PersonalDial kind="Month" number={data.personalMonth} text={String(data.personalMonth)} word={numberWord(data.personalMonth)} />
        <PersonalDial kind="Day" number={p.number} text={numberText(p)} word={p.label} />
      </View>
      {open ? (
        <>
          <View style={styles.stack} accessibilityLabel="How your cycles stack">
            <Text style={styles.strong}>How your cycles stack</Text>
            <Text style={styles.body}>{cycleLine('Year', data.personalYear)}</Text>
            <Text style={styles.body}>{cycleLine('Month', data.personalMonth)}</Text>
          </View>
          <View style={styles.divider} />
          <DayBlock kind="YOURS" meaning={p} bare />
          <View style={styles.divider} />
          <DayBlock kind="GLOBAL" meaning={data.universal} />
          <Text style={styles.body}>{data.blend}</Text>
        </>
      ) : null}
    </AccentView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    backgroundColor: colors.charcoal, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.hairline, borderLeftWidth: 4, borderLeftColor: colors.road,
    padding: space.lg, gap: 14,
  },
  summary: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 56 },
  dials: { flexDirection: 'row', justifyContent: 'space-between', gap: space.sm },
  chevron: { fontFamily: fonts.bodyBold, fontSize: 24, lineHeight: 26, color: colors.gold },
  cardEyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2, color: colors.parchmentMuted },
  block: { gap: 10 },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  badge: {
    minWidth: 56, height: 56, borderRadius: 28, paddingHorizontal: 8, alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 24, color: colors.parchment },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2, color: colors.road },
  label: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 22, color: colors.parchment },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.parchmentMuted },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  strong: { fontFamily: fonts.bodyBold, color: colors.parchment },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 999, borderWidth: 1, borderColor: colors.hairline,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.parchment },
  stack: { gap: 6 },
  divider: { height: 1, backgroundColor: colors.hairline },
});
