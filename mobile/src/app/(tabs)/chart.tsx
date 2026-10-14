import { useEffect, useState } from 'react';
import { SkeletonCards } from '@/components/Skeleton';
import { StyleSheet, Text, View } from 'react-native';
import { Redirect, router, useLocalSearchParams, type Href } from 'expo-router';
import { Screen } from '@/components/Screen';
import { FadeIn } from '@/components/FadeIn';
import { GoldButton } from '@/components/GoldButton';
import { ErrorState, LoadingState } from '@/components/StatusViews';
import { authorityId, planetId, STRATEGY_ID, typeId, profileId } from '@/lib/termIds';
import { Disclosure } from '@/components/Disclosure';
import { MiniBody } from '@/components/MiniBody';
import { MiniRoad } from '@/components/MiniRoad';
import { MiniWheel } from '@/components/MiniWheel';
import type { LensName } from '@/components/Lens';
import { BirthDataCard } from '@/components/BirthDataCard';
import { ReminderCard } from '@/components/ReminderCard';
import { HeadsUpCard } from '@/components/HeadsUpCard';
import { InviteCard } from '@/components/InviteCard';
import { Sigil } from '@/components/Sigil';
import { TriadMap } from '@/components/TriadMap';
import { TriadCard } from '@/components/TriadCard';
import { TriadPortrait } from '@/components/TriadPortrait';
import { BodygraphPanel, WheelPanel } from '@/components/ChartPanels';
import { useSkyNow } from '@/lib/useSkyNow';
import { OfflineNote } from '@/components/OfflineNote';
import { Segmented } from '@/components/Segmented';
import { useChartData } from '@/lib/useChartData';
import { formatLongitude } from '@/lib/api';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, guidance, radius, space, themes } from '@/theme/tokens';

const T = themes.chart;

const VIEW_OPTIONS = [
  { value: 'overview', label: 'Overview' },
  { value: 'wheel', label: 'Wheel' },
  { value: 'bodygraph', label: 'Bodygraph' },
] as const;

export default function Chart() {
  const chart = useT3DStore((state) => state.chart);
  const profile = useT3DStore((state) => state.profile);
  const [view, setView] = useState<'overview' | 'wheel' | 'bodygraph'>('overview');
  const { view: requestedView, t: requestedAt } = useLocalSearchParams<{ view?: string; t?: string }>();
  // Today's bodygraph chip opens this tab straight on the bodygraph.
  useEffect(() => {
    if (requestedView === 'bodygraph' || requestedView === 'wheel') setView(requestedView);
  }, [requestedView, requestedAt]);
  const drawing = useChartData(chart?.leadId, profile?.email.trim());
  const skyNow = useSkyNow(chart?.leadId, profile?.email.trim());

  const openLens = (lens: LensName) => {
    router.push({ pathname: '/readings', params: { lens, t: String(Date.now()) } } as unknown as Href);
  };

  if (!chart || !profile) return <Redirect href="/onboarding" />;

  const { humanDesign: hd, numerology: num, astrology: astro } = chart;
  const risingNote = profile.birthTimeKnown
    ? null
    : 'Rising sign uses 12:00 noon because no birth time was entered.';

  return (
    <Screen room="observatory" refreshing={drawing.refreshing} onRefresh={drawing.refresh}>
      <FadeIn>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>YOUR T3D CHART</Text>
          <Text accessibilityRole="header" style={styles.name}>
            {[profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ')}
          </Text>
          <Text style={styles.meta}>
            {profile.birthDate} · {profile.birthTimeKnown ? profile.birthTime : 'time unknown'} ·{' '}
            {profile.city}
          </Text>
        </View>
      </FadeIn>

      <FadeIn delay={60}>
        <Segmented options={VIEW_OPTIONS} value={view} onChange={setView} />
      </FadeIn>

      {view === 'overview' ? (
        <>
      <FadeIn delay={80}>
        <TriadPortrait chart={chart} onOpenLens={openLens} />
      </FadeIn>

      <FadeIn delay={100}>
        <TriadCard
          accent={colors.vehicle}
          glyph="◆"
          metaphor="THE VEHICLE"
          system="Human Design"
          drawing={drawing.data ? <MiniBody definedCenters={drawing.data.humanDesign.definedCenters} /> : undefined}
          rows={[
            { label: 'Type', value: hd.type, valueId: typeId(hd.type) },
            { label: 'Strategy', value: hd.strategy, labelId: STRATEGY_ID },
            { label: 'Authority', value: hd.authority, valueId: authorityId(hd.authority), labelId: 'hd:authority' },
            { label: 'Profile', value: hd.profile, valueId: profileId(hd.profile.match(/\d\/\d/)?.[0] ?? hd.profile), labelId: 'hd:profile' },
          ]}
          onOpen={() => openLens('vehicle')}
          openLabel="Read your Vehicle reading"
        />
      </FadeIn>

      <FadeIn delay={200}>
        <TriadCard
          accent={colors.road}
          glyph="▲"
          metaphor="THE ROAD"
          system="Numerology"
          drawing={<MiniRoad />}
          rows={[
            { label: 'Life Path', value: String(num.lifePath), labelId: 'num:lifepath', valueId: `num:${num.lifePath}` },
            { label: 'Destiny', value: String(num.destiny), labelId: 'num:destiny', valueId: `num:${num.destiny}` },
            { label: 'Soul Urge', value: String(num.soulUrge), labelId: 'num:soulurge', valueId: `num:${num.soulUrge}` },
          ]}
          moreRows={[
            { label: 'Personality', value: String(num.personality), labelId: 'num:personality', valueId: `num:${num.personality}` },
            { label: 'Hidden Passion', value: String(num.hiddenPassion), labelId: 'num:hiddenpassion', valueId: `num:${num.hiddenPassion}` },
            {
              label: 'Karmic Lessons',
              labelId: 'num:karmic',
              value: num.karmicLessons.length ? num.karmicLessons.join(', ') : 'None',
            },
          ]}
          moreLabel="More numbers"
          onOpen={() => openLens('road')}
          openLabel="Read your Road reading"
        />
      </FadeIn>

      <FadeIn delay={300}>
        <TriadCard
          accent={colors.stoplight}
          glyph="●"
          metaphor="THE STOPLIGHT"
          system="Astrology"
          drawing={<MiniWheel astro={astro} />}
          rows={[
            { label: 'Sun', value: astro.tropicalSun.formatted, labelId: planetId('sun') },
            { label: 'Moon', value: astro.tropicalMoon.formatted, labelId: planetId('moon') },
            { label: 'Rising', value: formatLongitude(astro.tropicalAscendant), labelId: 'astro:ascendant' },
          ]}
          moreRows={[
            { label: 'Sidereal Sun', value: astro.siderealSun.formatted, labelId: 'astro:sidereal' },
            { label: 'Sidereal Rising', value: formatLongitude(astro.siderealAscendant), labelId: 'astro:ascendant' },
          ]}
          moreLabel="Sidereal lens"
          onOpen={() => openLens('stoplight')}
          openLabel="Read your Stoplight reading"
        />
        <Text style={styles.note}>
          Tropical leads here: it follows the seasons and is the Western standard. Sidereal is a second lens.
        </Text>
        {risingNote ? <Text style={styles.note}>{risingNote}</Text> : null}
      </FadeIn>

      <FadeIn delay={340}>
        <View style={styles.sigilCard}>
          <Text accessibilityRole="header" style={styles.sigilTitle}>Your Sigil</Text>
          <Sigil chart={chart} birthTimeKnown={profile.birthTimeKnown} size={240} />
          <Text style={[guidance, styles.sigilNote]}>
            Drawn only from your chart, so no two are alike: your Vehicle in the centre, your Road around it, and your Sun, Moon and Rising on the outer ring.
          </Text>
          <GoldButton label="Share your Sigil" variant="ghost" onPress={() => router.push({ pathname: '/share-card', params: { kind: 'sigil' } } as unknown as Href)} />
        </View>
      </FadeIn>

      <FadeIn delay={350}>
        <View style={styles.sigilCard}>
          <Text accessibilityRole="header" style={styles.sigilTitle}>Your Triad Map</Text>
          <Text style={[guidance, styles.sigilNote, styles.mapNote]}>
            Your whole chart, grouped by lens. Tap a circle to open its reading, or any fact to learn what it means.
          </Text>
          <TriadMap chart={chart} birthTimeKnown={profile.birthTimeKnown} onOpenLens={openLens} />
        </View>
      </FadeIn>

      <FadeIn delay={360}>
        <Disclosure label="Birth details, reminder and settings">
          <View style={styles.moreStack}>
            <BirthDataCard profile={profile} />
            <InviteCard />
            <ReminderCard />
            <HeadsUpCard />
            <GoldButton label="Edit birth details" variant="ghost" onPress={() => router.push('/onboarding')} />
          </View>
        </Disclosure>
      </FadeIn>

        </>
      ) : (
        <View style={styles.chartArea}>
          {drawing.offline && drawing.data ? <OfflineNote savedAt={drawing.savedAt} /> : null}
          {drawing.data ? (
            view === 'wheel' ? (
              <WheelPanel tropical={drawing.data.tropical} sidereal={drawing.data.sidereal} sky={skyNow.positions} />
            ) : (
              <BodygraphPanel hd={drawing.data.humanDesign} />
            )
          ) : drawing.error ? (
            <ErrorState message={drawing.error} onRetry={drawing.retry} />
          ) : (
            <SkeletonCards count={2} label="Drawing your chart…" />
          )}
        </View>
      )}

      <FadeIn delay={400}>
        <View style={styles.actions}>
          <GoldButton label="Share your T3D card" onPress={() => router.push('/share-card' as Href)} />
          <GoldButton label="Glossary · tap any term" variant="ghost" onPress={() => router.push('/glossary')} />
        </View>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6, paddingTop: space.lg, paddingBottom: space.sm },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 3, color: colors.parchmentMuted },
  name: { fontFamily: fonts.display, fontSize: 34, lineHeight: 42, color: colors.parchment },
  meta: { fontFamily: fonts.body, fontSize: 15, color: colors.parchmentMuted },
  note: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.parchmentMuted, marginTop: space.sm },
  moreStack: { gap: space.md },
  sigilCard: {
    alignItems: 'center', gap: space.md, padding: space.lg, marginTop: space.md,
    borderRadius: radius.lg, borderWidth: 1, borderColor: T.edge, backgroundColor: T.surface,
  },
  sigilTitle: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32, color: colors.parchment, alignSelf: 'flex-start' },
  sigilNote: { alignSelf: 'stretch' },
  mapNote: { fontSize: 17, lineHeight: 24 },
  actions: { marginTop: space.md, gap: 12 },
  chartArea: { marginTop: space.md },
  centerBox: { alignItems: 'center', gap: space.md, paddingVertical: space.xxl },
  errorText: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.danger, textAlign: 'center' },
});
