import { StyleSheet, Text, View } from 'react-native';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, radius, space } from '@/theme/tokens';

const COPY = {
  vehicle:
    'No birth time was entered, so 12:00 noon was used. Human Design depends on your exact birth time. Your Type, Authority, Profile, gates and lines may differ from your true design, so treat this reading as provisional until you add your birth time.',
  sky:
    'No birth time was entered, so 12:00 noon was used. Houses and your Rising sign are approximate. Your Sun sign, the planets and the sky itself are not affected.',
} as const;

/** A short notice that only shows when the person did not enter a birth time. */
export function TimeNote({ scope }: { scope: keyof typeof COPY }) {
  const profile = useT3DStore((s) => s.profile);
  if (!profile || profile.birthTimeKnown !== false) return null;
  return (
    <View accessibilityRole="alert" style={styles.box}>
      <Text style={styles.label}>◇  APPROXIMATE · NO BIRTH TIME</Text>
      <Text style={styles.body}>{COPY[scope]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: 6, padding: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.gold,
    backgroundColor: colors.amethyst,
  },
  label: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.8, color: colors.gold },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.parchment },
});
