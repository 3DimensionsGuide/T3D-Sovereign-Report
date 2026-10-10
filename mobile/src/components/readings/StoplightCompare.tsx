import { StyleSheet, Text, View } from 'react-native';
import type { BigThreeLens } from '@/lib/stoplightTypes';
import { LENS_TEXT } from '@/components/Lens';
import { colors, fonts, radius, space } from '@/theme/tokens';

const SIGN_GLYPH: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

/** Tropical and sidereal Big Three side by side; differing signs are marked in words. */
export function StoplightCompare({ tropical, sidereal }: { tropical: BigThreeLens; sidereal: BigThreeLens }) {
  const rows = [
    ['Sun', tropical.sun.sign, sidereal.sun.sign],
    ['Moon', tropical.moon.sign, sidereal.moon.sign],
    ['Rising', tropical.rising.sign, sidereal.rising.sign],
  ] as const;
  return (
    <View style={styles.card} accessibilityRole="summary">
      <View style={styles.row}>
        <Text style={[styles.head, styles.label]}> </Text>
        <Text style={[styles.head, styles.col]}>Tropical</Text>
        <Text style={[styles.head, styles.col]}>Sidereal</Text>
      </View>
      {rows.map(([name, t, s]) => (
        <View key={name} style={styles.row}>
          <Text style={[styles.name, styles.label]}>{name}</Text>
          <Text style={[styles.sign, styles.col]}>{`${SIGN_GLYPH[t] ?? ''} ${t}`}</Text>
          <View style={styles.col}>
            <Text style={styles.sign}>{`${SIGN_GLYPH[s] ?? ''} ${s}`}</Text>
            {t !== s ? <Text style={styles.diff}>Different sign</Text> : <Text style={styles.same}>Same sign</Text>}
          </View>
        </View>
      ))}
    </View>
  );
}

const ELEMENT_ORDER = ['Fire', 'Earth', 'Air', 'Water'] as const;

/** How the Sun, Moon and Rising spread across the four elements. */
export function ElementBalance({ lens }: { lens: BigThreeLens }) {
  const els = [lens.sun.element, lens.moon.element, lens.rising.element].map((e) => e.charAt(0).toUpperCase() + e.slice(1).toLowerCase());
  return (
    <View style={styles.card} accessibilityRole="summary">
      {ELEMENT_ORDER.map((el) => {
        const n = els.filter((e) => e === el).length;
        return (
          <View key={el} style={styles.row}>
            <Text style={[styles.name, styles.label]}>{el}</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${(n / 3) * 100}%` }]} />
            </View>
            <Text style={styles.count}>{`${n} of 3`}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline,
    backgroundColor: colors.obsidian, padding: space.md, gap: space.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  label: { width: 64 },
  col: { flex: 1 },
  head: { fontFamily: fonts.bodyMedium, fontSize: 13, color: LENS_TEXT.stoplight },
  name: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.parchment },
  sign: { fontFamily: fonts.body, fontSize: 16, color: colors.parchment },
  diff: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.gold },
  same: { fontFamily: fonts.body, fontSize: 12, color: colors.parchment, opacity: 0.8 },
  track: { flex: 1, height: 10, borderRadius: 5, backgroundColor: colors.charcoal, overflow: 'hidden' },
  fill: { height: 10, backgroundColor: colors.stoplight },
  count: { width: 48, textAlign: 'right', fontFamily: fonts.body, fontSize: 13, color: colors.parchment },
});
