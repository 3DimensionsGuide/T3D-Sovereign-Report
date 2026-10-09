import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, space } from '@/theme/tokens';

/** Shown when the server can't be reached and a saved copy is on screen. */
export function OfflineNote({ savedAt }: { savedAt: number | null }) {
  const when = savedAt
    ? new Date(savedAt).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })
    : null;
  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.box}>
      <Text style={styles.text}>
        {'◇  '}
        {when ? `Showing your saved copy from ${when}. ` : 'Showing your saved copy. '}
        We couldn{'’'}t reach the server. Pull down to check again.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.hairline,
    backgroundColor: colors.charcoal, padding: space.md,
  },
  text: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.parchmentMuted },
});
