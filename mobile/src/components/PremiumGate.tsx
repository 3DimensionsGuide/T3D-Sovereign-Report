import { StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { GoldButton } from '@/components/GoldButton';
import { LockIcon } from '@/components/LockIcon';
import { colors, fonts, radius, space } from '@/theme/tokens';

/** The note a locked feature shows in place of its content: what it is, and a way to see Premium. */
export function PremiumGate({ title, detail }: { title: string; detail: string }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.box} accessible accessibilityLabel={`${title} is part of Premium. Subscriptions are not open yet. ${detail}`}>
        <LockIcon size={20} />
        <View style={styles.text}>
          <Text accessibilityRole="header" style={styles.title}>{title} is part of Premium</Text>
          <Text style={styles.detail}>{detail}</Text>
          <Text style={styles.detail}>Subscriptions are not open yet.</Text>
        </View>
      </View>
      <GoldButton label="See what Premium includes" variant="ghost" onPress={() => router.push('/premium' as Href)} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md },
  box: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: space.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.gold, borderStyle: 'dashed',
  },
  text: { flex: 1, gap: 6 },
  title: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 20, lineHeight: 27, color: colors.gold },
  detail: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchment },
});
