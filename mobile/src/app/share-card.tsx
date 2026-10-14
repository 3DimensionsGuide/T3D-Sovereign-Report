import { useRef, useState } from 'react';
import { success } from '@/lib/haptics';
import { Platform, Share, StyleSheet, Switch, Text, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { captureRef } from 'react-native-view-shot';
import { Screen } from '@/components/Screen';
import { GoldButton } from '@/components/GoldButton';
import { ProfileShareCard } from '@/components/ProfileShareCard';
import { ChartRequestError, requestInviteCreate } from '@/lib/api';
import { cardInviteMessage } from '@/lib/invite';
import { trackAction } from '@/lib/track';
import { CarouselShareCard } from '@/components/CarouselShareCard';
import { SigilShareCard } from '@/components/SigilShareCard';
import { SigilWallpaper } from '@/components/SigilWallpaper';
import { WALLPAPER_CAPTURE, type WallpaperVariant } from '@/lib/wallpaper';
import { StoryShareCard } from '@/components/StoryShareCard';
import { TodayShareCard } from '@/components/TodayShareCard';
import { Segmented } from '@/components/Segmented';
import { LENSES, type Lens } from '@/lib/carouselSlides';
import { useNumerology } from '@/lib/useNumerology';
import { useTriadToday } from '@/lib/useTriadToday';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, space } from '@/theme/tokens';

type Kind = 'profile' | 'sigil' | 'wallpaper' | 'carousel' | 'today';

const KINDS = [
  { value: 'profile', label: 'My Triad' },
  { value: 'sigil', label: 'Sigil' },
  { value: 'wallpaper', label: 'Wallpaper' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'today', label: 'Today' },
] as const;

const SLIDES = [
  { value: 'vehicle', label: '1 Vehicle' },
  { value: 'road', label: '2 Road' },
  { value: 'stoplight', label: '3 Stoplight' },
] as const;

type Shape = 'post' | 'story';
const SHAPES = [
  { value: 'post', label: 'Post' },
  { value: 'story', label: 'Story' },
] as const;

const SCREENS = [
  { value: 'lock', label: 'Lock screen' },
  { value: 'home', label: 'Home screen' },
] as const;

/** Each card type carries its own tag, so we can count visits that come from it. */
const LINKS: Record<Kind, string> = {
  profile: 'https://3dimensions.guide/?ref=card-profile',
  sigil: 'https://3dimensions.guide/?ref=card-sigil',
  wallpaper: 'https://3dimensions.guide/',
  carousel: 'https://3dimensions.guide/?ref=card-carousel',
  today: 'https://3dimensions.guide/?ref=card-today',
};

export default function ShareCard() {
  const chart = useT3DStore((s) => s.chart);
  const profile = useT3DStore((s) => s.profile);
  const cardRef = useRef<View>(null);
  // My Chart's Sigil button opens this screen on the Sigil card.
  const { kind: startKind } = useLocalSearchParams<{ kind?: string }>();
  const [kind, setKind] = useState<Kind>(startKind === 'sigil' ? 'sigil' : startKind === 'wallpaper' ? 'wallpaper' : 'profile');
  const [shape, setShape] = useState<Shape>('post');
  const [screen, setScreen] = useState<WallpaperVariant>('lock');
  const [lens, setLens] = useState<Lens>('vehicle');
  const tall = (kind === 'profile' || kind === 'sigil') && shape === 'story';
  const triad = useTriadToday(chart?.leadId, profile?.email.trim());
  // The Birth Number comes from the server's numerology reading, so the day of birth never leaves it.
  const numerology = useNumerology(chart?.leadId, profile?.email.trim());
  const birthNumber = numerology.data?.birthday?.number ?? null;
  const [withName, setWithName] = useState(false);
  const [withInvite, setWithInvite] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!chart || !profile) return <Redirect href="/onboarding" />;

  /** When the person lets friends compare charts, makes a fresh invite link and adds it under the message. */
  async function addInvite(base: string): Promise<string> {
    if (!withInvite || !chart || !profile) return base;
    const { url } = await requestInviteCreate(chart.leadId, profile.email.trim(), withName && profile.firstName.trim().length > 0, profile.birthTimeKnown !== false);
    return cardInviteMessage(base, url);
  }

  const failure = (e: unknown, fallback: string) => (e instanceof ChartRequestError ? e.message : fallback);

  async function onShare() {
    setError(null);
    setBusy(true);
    try {
      const size = kind === 'wallpaper' ? WALLPAPER_CAPTURE : { width: 1080, height: tall ? 1920 : 1350 };
      const uri = await captureRef(cardRef, { format: 'png', quality: 1, ...size, result: 'tmpfile' });
      const baseMessage = `${kind === 'today' ? 'My frame for today' : kind === 'sigil' ? 'My T3D Sigil' : kind === 'wallpaper' ? 'My T3D Sigil wallpaper' : kind === 'carousel' ? `My T3D Triad, ${LENSES.indexOf(lens) + 1} of 3` : 'My T3D Triad'} · ${LINKS[kind]}`;
      const message = await addInvite(baseMessage);
      const result = await Share.share(Platform.OS === 'ios' ? { url: uri, message } : { message, url: uri });
      if (result.action === Share.sharedAction) success();
      if (result.action === Share.sharedAction && withInvite) trackAction('invite_sent');
    } catch (e) {
      setError(failure(e, 'We could not make the image. Please try again.'));
    } finally {
      setBusy(false);
    }
  }

  async function onShareLink() {
    setError(null);
    try {
      const result = await Share.share({ message: await addInvite(LINKS[kind]) });
      if (result.action === Share.sharedAction && withInvite) trackAction('invite_sent');
    } catch (e) {
      setError(failure(e, 'We could not open the share sheet. Please try again.'));
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
            : kind === 'carousel'
            ? 'Three slides, one for each lens, made for an Instagram carousel. Pick a slide, save it, then post all three together. It never shows your birth date, time, place or last name.'
            : kind === 'wallpaper'
            ? 'Your Sigil as a wallpaper, with no text on it. Lock screen leaves room for the clock. Home screen is dimmer so your icons stay easy to read. In the share sheet choose “Save Image”, then set it as wallpaper from Photos.'
            : kind === 'sigil'
            ? 'Your Sigil is a drawing made from your chart, so no two are the same. The card shows it with your Type, Life Path and Sun sign. It never shows your birth date, time, place or last name.'
            : 'The card shows your Type, Life Path and Sun sign. Choose Story for the tall Instagram Stories shape. It never shows your birth date, time, place or last name.'}
        </Text>
      </View>

      <Segmented options={KINDS} value={kind} onChange={setKind} compact />
      {kind === 'carousel' ? <Segmented options={SLIDES} value={lens} onChange={setLens} compact /> : null}
      {kind === 'wallpaper' ? <Segmented options={SCREENS} value={screen} onChange={setScreen} compact /> : null}
      {kind !== 'today' && kind !== 'carousel' && kind !== 'wallpaper' ? <Segmented options={SHAPES} value={shape} onChange={setShape} compact /> : null}

      <View style={styles.preview}>
        {kind === 'today' ? (
          triad.data ? (
            <TodayShareCard ref={cardRef} data={triad.data} firstName={withName && first ? first : null} />
          ) : (
            <Text accessibilityLiveRegion="polite" style={styles.small}>
              {triad.error ?? 'Getting today’s frame…'}
            </Text>
          )
        ) : kind === 'carousel' ? (
          <CarouselShareCard
            ref={cardRef}
            lens={lens}
            chart={chart}
            birthTimeKnown={profile.birthTimeKnown}
            firstName={withName && first ? first : null}
            birthNumber={birthNumber}
          />
        ) : kind === 'wallpaper' ? (
          <SigilWallpaper ref={cardRef} chart={chart} variant={screen} birthTimeKnown={profile.birthTimeKnown} />
        ) : kind === 'sigil' ? (
          <SigilShareCard
            ref={cardRef}
            chart={chart}
            tall={tall}
            firstName={withName && first ? first : null}
            birthTimeKnown={profile.birthTimeKnown}
          />
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

      {kind !== 'today' && kind !== 'wallpaper' && !profile.birthTimeKnown ? (
        <Text style={styles.small}>Moon and Rising are left off because your birth time is not known.</Text>
      ) : null}

      {kind !== 'wallpaper' ? (
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Add my first name</Text>
        <Switch
          value={withName}
          onValueChange={setWithName}
          trackColor={{ false: colors.switchOff, true: colors.gold }} ios_backgroundColor={colors.switchOff}
          accessibilityLabel="Add my first name"
        />
      </View>
      ) : null}

      {kind !== 'wallpaper' ? (
        <>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Let friends compare charts with me</Text>
            <Switch
              value={withInvite}
              onValueChange={setWithInvite}
              trackColor={{ false: colors.switchOff, true: colors.gold }} ios_backgroundColor={colors.switchOff}
              accessibilityLabel="Let friends compare charts with me"
            />
          </View>
          {withInvite ? (
            <Text style={styles.small}>
              Adds a link under your post. Friends who open it see how their chart fits with yours. It never shows your birth date, time or place, and it stops working after 30 days.
            </Text>
          ) : null}
        </>
      ) : null}

      {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{'⚠  '}{error}</Text> : null}
      <GoldButton label={kind === 'carousel' ? `Share or save slide ${LENSES.indexOf(lens) + 1} of 3` : kind === 'wallpaper' ? 'Save wallpaper' : 'Share or save image'} onPress={onShare} loading={busy} disabled={(kind === 'today' && !triad.data) || (kind === 'carousel' && lens === 'road' && numerology.loading && birthNumber === null)} />
      <Text style={styles.small}>In the share sheet, choose “Save Image” to keep it in Photos.</Text>
      {kind !== 'wallpaper' ? (
        <>
      <GoldButton label="Share the link only" variant="ghost" onPress={onShareLink} />
      <Text style={styles.small}>
        Some apps, such as Notes, keep only the picture. Share the link on its own to add it there.
      </Text>
        </>
      ) : null}
      <GoldButton label="BACK" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6, paddingTop: space.lg },
  title: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 28, lineHeight: 35, color: colors.parchment },
  small: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  preview: { alignItems: 'center', marginVertical: space.md },
  switchRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  switchLabel: { fontFamily: fonts.bodyMedium, fontSize: 17, color: colors.parchment },
  error: { fontFamily: fonts.body, fontSize: 15, color: colors.danger },
});
