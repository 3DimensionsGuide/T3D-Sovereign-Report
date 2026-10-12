import { StyleSheet, Text, View } from 'react-native';
import type { NameColumn } from '@/lib/numerologyTypes';
import { describeColumns, emptyColumns, passionColumn } from '@/lib/nameColumns';
import { colors, fonts, radius, space } from '@/theme/tokens';

/**
 * Your full birth name with every letter under its number, 1 to 9. The tallest column is marked with a
 * triangle and an empty one with a dashed outline and a dash, so the meaning never rests on colour alone.
 */
export function NameColumns({ columns }: { columns: readonly NameColumn[] }) {
  const top = passionColumn(columns);
  const empty = emptyColumns(columns);
  return (
    <View style={styles.wrap} accessible accessibilityLabel={describeColumns(columns)}>
      <View style={styles.row}>
        {columns.map((c) => {
          const isTop = c.number === top;
          const isEmpty = c.count === 0;
          return (
            <View key={c.number} style={[styles.col, isTop && styles.colTop, isEmpty && styles.colEmpty]}>
              <Text style={styles.mark} maxFontSizeMultiplier={1.2}>{isTop ? '▲' : isEmpty ? '–' : ' '}</Text>
              <Text style={[styles.num, isTop && styles.numTop]} maxFontSizeMultiplier={1.3}>{c.number}</Text>
              <View style={styles.letters}>
                {c.letters.map((l, i) => (
                  <Text key={i} style={styles.letter} maxFontSizeMultiplier={1.3}>{l}</Text>
                ))}
              </View>
              <Text style={styles.count} maxFontSizeMultiplier={1.3}>{c.count}</Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.key} maxFontSizeMultiplier={1.4}>
        {top ? `▲ Most letters: ${top}, your Hidden Passion.` : ''}
        {empty.length ? `${top ? '\n' : ''}– Empty: ${empty.join(', ')}, your Karmic ${empty.length === 1 ? 'Lesson' : 'Lessons'}.` : `${top ? '\n' : ''}No column is empty, so you have no Karmic Lessons.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: space.sm, padding: space.sm, borderRadius: radius.md, backgroundColor: colors.charcoal,
    borderWidth: 1, borderColor: colors.hairline,
  },
  row: { flexDirection: 'row', gap: 3, alignItems: 'stretch' },
  col: {
    flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: radius.sm, borderWidth: 1,
    borderColor: 'transparent', gap: 2,
  },
  colTop: { borderColor: colors.road, backgroundColor: 'rgba(31,138,77,0.14)' },
  colEmpty: { borderColor: colors.hairline, borderStyle: 'dashed' },
  mark: { fontFamily: fonts.bodyBold, fontSize: 10, lineHeight: 12, color: colors.road },
  num: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.parchmentMuted },
  numTop: { color: colors.parchment },
  letters: { flexGrow: 1, alignItems: 'center', gap: 1, minHeight: 20 },
  letter: { fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 18, color: colors.parchment },
  count: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.parchmentMuted, marginTop: 4 },
  key: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.parchmentMuted },
});
