import { useRef, useState } from 'react';
import { Platform, Share, StyleSheet, Switch, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { captureRef } from 'react-native-view-shot';
import { Screen } from '@/components/Screen';
import { GoldButton } from '@/components/GoldButton';
import { ProfileShareCard } from '@/components/ProfileShareCard';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, space } from '@/theme/tokens';

export default function ShareCard() {
  const chart = useT3DStore((s) => s.chart);
  const profile = useT3DStore((s) => s.profile);
  const cardRef = useRef<View>(null);
  const [withName, setWithName] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!chart || !profile) return <Redirect href="/onboarding" />;

  async function onShare() {
    setError(null);
    setBusy(true);
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 1, width: 1080, height: 1350, result: 'tmpfile' });
      await Share.share(Platform.OS === 'ios' ? { url: uri } : { message: 'My T3D Triad · 3dimensions.guide', url: uri });
    } catch {
      setError('We could not make the image. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const first = profile.firstName.trim();

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>SHARE</Text>
        <Text accessibilityRole="header" style={styles.title}>Your T3D card</Text>
        <Text style={styles.small}>
          The card shows your Type, Life Path and Sun sign. It never shows your birth date, time, place or last name.
        </Text>
      </View>

      <View style={styles.preview}>
        <ProfileShareCard
          ref={cardRef}
          chart={chart}
          firstName={withName && first ? first : null}
          birthTimeKnown={profile.birthTimeKnown}
        />
      </View>

      {!profile.birthTimeKnown ? (
        <Text style={styles.small}>Moon and Rising are left off because your birth time is not known.</Text>
      ) : null}

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Add my first name</Text>
        <Switch
          value={withName}
          onValueChange={setWithName}
          trackColor={{ false: colors.hairline, true: colors.gold }}
          accessibilityLabel="Add my first name"
        />
      </View>

      {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{'⚠  '}{error}</Text> : null}
      <GoldButton label="SHARE OR SAVE IMAGE" onPress={onShare} loading={busy} />
      <Text style={styles.small}>In the share sheet, choose “Save Image” to keep it in Photos.</Text>
      <GoldButton label="BACK" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6, paddingTop: space.lg },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 3, color: colors.gold },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 38, color: colors.parchment },
  small: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.parchmentMuted },
  preview: { alignItems: 'center', marginVertical: space.md },
  switchRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  switchLabel: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.parchment },
  error: { fontFamily: fonts.body, fontSize: 15, color: colors.danger },
});
