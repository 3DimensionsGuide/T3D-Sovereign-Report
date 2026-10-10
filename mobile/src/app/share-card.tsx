import { useRef, useState } from 'react';
import { Platform, Share, StyleSheet, Switch, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { captureRef } from 'react-native-view-shot';
import { Screen } from '@/components/Screen';
import { GoldButton } from '@/components/GoldButton';
import { ProfileShareCard } from '@/components/ProfileShareCard';
import { StoryShareCard } from '@/components/StoryShareCard';
import { TodayShareCard } from '@/components/TodayShareCard';
import { Segmented } from '@/components/Segmented';
import { useTriadToday } from '@/lib/useTriadToday';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, space } from '@/theme/tokens';

type Kind = 'profile' | 'today';

const KINDS = [
  { value: 'profile', label: 'My Triad' },
  { value: 'today', label: 'Today' },
] as const;

type Shape = 'post' | 'story';
const SHAPES = [
  { value: 'post', label: 'Post' },
  { value: 'story', label: 'Story' },
] as const;

/** Each card type carries its own tag, so we can count visits that come from it. */
const LINKS: Record<Kind, string> = {
  profile: 'https://3dimensions.guide/?ref=card-profile',
  today: 'https://3dimensions.guide/?ref=card-today',
};

export default function ShareCard() {
  const chart = useT3DStore((s) => s.chart);
  const profile = useT3DStore((s) => s.profile);
  const cardRef = useRef<View>(null);
  const [kind, setKind] = useState<Kind>('profile');
  const [shape, setShape] = useState<Shape>('post');
  const tall = kind === 'profile' && shape === 'story';
  const triad = useTriadToday(chart?.leadId, profile?.email.trim());
  const [withName, setWithName] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!chart || !profile) return <Redirect href="/onboarding" />;

  async function onShare() {
    setError(null);
    setBusy(true);
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 1, width: 1080, height: tall ? 1920 : 1350, result: 'tmpfile' });
      const message = `${kind === 'today' ? 'My frame for today' : 'My T3D Triad'} · ${LINKS[kind]}`;
      await Share.share(Platform.OS === 'ios' ? { url: uri, message } : { message, url: uri });
    } catch {
      setError('We could not make the image. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function onShareLink() {
    setError(null);
    try {
      await Share.share({ message: LINKS[kind] });
    } catch {
      setError('We could not open the share sheet. Please try again.');
    }
  }

  const first = profile.firstName.trim();

  return (
    <Screen>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>Your T3D card</Text>
        <Text style={styles.small}>
          {kind === 'today'
            ? 'The card shows today’s date, your Type and Authority, your Personal Day and the main sky contact. It never shows your birth date, time, place or last name.'
            : 'The card shows your Type, Life Path and Sun sign. Choose Story for the tall Instagram Stories shape. It never shows your birth date, time, place or last name.'}
        </Text>
      </View>

      <Segmented options={KINDS} value={kind} onChange={setKind} compact />
      {kind === 'profile' ? <Segmented options={SHAPES} value={shape} onChange={setShape} compact /> : null}

      <View style={styles.preview}>
        {kind === 'today' ? (
          triad.data ? (
            <TodayShareCard ref={cardRef} data={triad.data} firstName={withName && first ? first : null} />
          ) : (
            <Text accessibilityLiveRegion="polite" style={styles.small}>
              {triad.error ?? 'Getting today’s frame…'}
            </Text>
          )
        ) : tall ? (
          <StoryShareCard
            ref={cardRef}
            chart={chart}
            firstName={withName && first ? first : null}
            birthTimeKnown={profile.birthTimeKnown}
          />
        ) : (
          <ProfileShareCard
            ref={cardRef}
            chart={chart}
            firstName={withName && first ? first : null}
            birthTimeKnown={profile.birthTimeKnown}
          />
        )}
      </View>

      {kind === 'profile' && !profile.birthTimeKnown ? (
        <Text style={styles.small}>Moon and Rising are left off because your birth time is not known.</Text>
      ) : null}

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Add my first name</Text>
        <Switch
          value={withName}
          onValueChange={setWithName}
          trackColor={{ false: '#6B6B73', true: colors.gold }} ios_backgroundColor="#6B6B73"
          accessibilityLabel="Add my first name"
        />
      </View>

      {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{'⚠  '}{error}</Text> : null}
      <GoldButton label="Share or save image" onPress={onShare} loading={busy} disabled={kind === 'today' && !triad.data} />
      <Text style={styles.small}>In the share sheet, choose “Save Image” to keep it in Photos.</Text>
      <GoldButton label="Share the link only" variant="ghost" onPress={onShareLink} />
      <Text style={styles.small}>
        Some apps, such as Notes, keep only the picture. Share the link on its own to add it there.
      </Text>
      <GoldButton label="BACK" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6, paddingTop: space.lg },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 38, color: colors.parchment },
  small: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.parchmentMuted },
  preview: { alignItems: 'center', marginVertical: space.md },
  switchRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  switchLabel: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.parchment },
  error: { fontFamily: fonts.body, fontSize: 15, color: colors.danger },
});
