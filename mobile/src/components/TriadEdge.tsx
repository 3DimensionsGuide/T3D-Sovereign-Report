import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme/tokens';

const HEIGHT = 3;

/**
 * A fine three-colour strip along the top of a card: amber, emerald, crimson.
 * It is the Triad's signature on My Chart. Decorative only: it ignores touches and is hidden from
 * screen readers. The card it sits in must have `overflow: 'hidden'` so the strip follows its rounded corners.
 */
export function TriadEdge() {
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.row}>
      <View style={[styles.part, { backgroundColor: colors.vehicle }]} />
      <View style={[styles.part, { backgroundColor: colors.road }]} />
      <View style={[styles.part, { backgroundColor: colors.stoplight }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { position: 'absolute', top: 0, left: 0, right: 0, height: HEIGHT, flexDirection: 'row' },
  part: { flex: 1 },
});
