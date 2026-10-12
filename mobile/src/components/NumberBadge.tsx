import { StyleSheet, Text, View } from 'react-native';
import { SIGNAL_COLOR } from '@/components/Lens';
import type { AspectNature } from '@/lib/api';
import { colors, fonts } from '@/theme/tokens';

/** A numbered mark: round for flow and neutral, square for friction. The number matches the wheel. Decorative: the row names the contact. */
export function NumberBadge({ n, nature, size = 26 }: { n: number; nature: AspectNature; size?: number }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.badge,
        { width: size, height: size, borderColor: SIGNAL_COLOR[nature], borderRadius: nature === 'friction' ? 5 : size / 2 },
      ]}
    >
      <Text style={styles.n}>{n}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.charcoal },
  n: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.parchment },
});
