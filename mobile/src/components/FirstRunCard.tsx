import { StyleSheet, Text, View } from 'react-native';
import { GoldButton } from '@/components/GoldButton';
import { firstRunLine } from '@/lib/reveal';
import { useCoachStore } from '@/store/useCoachStore';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, radius, space } from '@/theme/tokens';

/**
 * The first thing on Today for a new person, in place of a tour: one card that says their own Type and
 * Authority and where to look first. It shows once; "Got it" dismisses it, and About can bring it back.
 */
export function FirstRunCard() {
  const hydrated = useCoachStore((s) => s.hydrated);
  const seen = useCoachStore((s) => s.seen);
  const finish = useCoachStore((s) => s.finish);
  const chart = useT3DStore((s) => s.chart);
  if (!hydrated || seen || !chart) return null;
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>WELCOME</Text>
      <Text accessibilityRole="header" style={styles.title}>{firstRunLine(chart)}</Text>
      <Text style={styles.body}>
        Start with the signal lamp below. Everything else opens one fold at a time. Any word with a dotted
        underline explains itself when you tap it.
      </Text>
      <GoldButton label="Got it" onPress={finish} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.goldEdge,
    padding: space.lg, gap: space.md,
  },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2, color: colors.gold },
  title: { fontFamily: fonts.display, fontSize: 24, lineHeight: 32, color: colors.parchment },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
});
