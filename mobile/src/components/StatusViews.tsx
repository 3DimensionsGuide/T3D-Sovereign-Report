import { StyleSheet, Text, View } from 'react-native';
import { GoldButton } from '@/components/GoldButton';
import { TriadLoader } from '@/components/TriadLoader';
import { colors, fonts, radius, space } from '@/theme/tokens';

/**
 * The one look for "something went wrong": a plain sentence that says what happened
 * and what to do, then a Try again button. Used by every screen that loads from the server.
 */
export function ErrorState({
  message, onRetry, retrying = false,
}: {
  message: string;
  onRetry: () => void;
  retrying?: boolean;
}) {
  return (
    <View style={styles.errorBox}>
      <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.errorText}>
        {'⚠  '}
        {message}
      </Text>
      <GoldButton label="Try again" variant="ghost" onPress={onRetry} loading={retrying} />
    </View>
  );
}

/** The one look for a short wait where cards are not the right shape: a spinner and a line of words. */
export function LoadingState({ label }: { label: string }) {
  return (
    <View style={styles.loading} accessibilityLiveRegion="polite" accessibilityLabel={label}>
      <TriadLoader />
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  errorBox: {
    gap: space.md, padding: space.lg, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.charcoal,
  },
  errorText: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.danger },
  loading: { alignItems: 'center', gap: space.sm, paddingVertical: space.lg },
  loadingText: { fontFamily: fonts.body, fontSize: 14, color: colors.parchmentMuted, textAlign: 'center' },
});
