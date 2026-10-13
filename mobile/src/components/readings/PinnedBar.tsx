import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, space, themes } from '@/theme/tokens';

const T = themes.readings;

/**
 * The shared frame for the small drawing pinned to the top of a reading once the full one has scrolled out of view.
 * Decorative: the same facts are written in the reading, so it is hidden from screen readers.
 */
export function PinnedBar({ visual, title, line, lineColor }: { visual: ReactNode; title: string; line: string; lineColor: string }) {
  // The bar is positioned from the very top of the screen, so it starts right under the status bar and camera area.
  // It sits flush there, so no reading text can show in a gap above it.
  const top = useSafeAreaInsets().top;
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.bar, { top }]}>
      {visual}
      <View style={styles.text}>
        <Text style={styles.type} numberOfLines={1}>{title}</Text>
        <Text style={[styles.line, { color: lineColor }]} numberOfLines={1}>{line}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute', left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    paddingVertical: 8, paddingHorizontal: space.md,
    borderBottomLeftRadius: radius.md, borderBottomRightRadius: radius.md,
    borderWidth: 1, borderTopWidth: 0, borderColor: T.edge,
    // Fully solid, so reading text never shows through.
    backgroundColor: T.surface,
  },
  text: { flex: 1, gap: 2 },
  type: { fontFamily: fonts.display, fontSize: 16, color: colors.parchment },
  line: { fontFamily: fonts.bodyMedium, fontSize: 13 },
});
