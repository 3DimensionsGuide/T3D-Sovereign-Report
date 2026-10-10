import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Redirect, router, type Href } from 'expo-router';
import { Screen } from '@/components/Screen';
import { FadeIn } from '@/components/FadeIn';
import { GoldButton } from '@/components/GoldButton';
import { authorityId, planetId, STRATEGY_ID, typeId, profileId } from '@/lib/termIds';
import { BirthDataCard } from '@/components/BirthDataCard';
import { ReminderCard } from '@/components/ReminderCard';
import { TriadCard } from '@/components/TriadCard';
import { TriadPortrait } from '@/components/TriadPortrait';
import { BodygraphPanel, WheelPanel } from '@/components/ChartPanels';
import { OfflineNote } from '@/components/OfflineNote';
import { Segmented } from '@/components/Segmented';
import { useChartData } from '@/lib/useChartData';
import { formatLongitude } from '@/lib/api';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, space } from '@/theme/tokens';

const VIEW_OPTIONS = [
  { value: 'overview', label: 'Overview' },
  { value: 'wheel', label: 'Wheel' },
  { value: 'bodygraph', label: 'Bodygraph' },
] as const;

export default function Chart() {
  const chart = useT3DStore((state) => state.chart);
  const profile = useT3DStore((state) => state.profile);
  const [view, setView] = useState<'overview' | 'wheel' | 'bodygraph'>('overview');
  const drawing = useChartData(chart?.leadId, profile?.email.trim());

  if (!chart || !profile) return <Redirect href="/onboarding" />;

  const { humanDesign: hd, numerology: num, astrology: astro } = chart;
  const risingNote = profile.birthTimeKnown
    ? null
    : 'Rising sign uses 12:00 noon because no birth time was entered.';

  return (
    <Screen refreshing={drawing.refreshing} onRefresh={drawing.refresh}>
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
        <TriadPortrait chart={chart} />
      </FadeIn>

      <FadeIn delay={100}>
        <TriadCard
          accent={colors.vehicle}
          glyph="◆"
          metaphor="THE VEHICLE"
          system="Human Design"
          rows={[
            { label: 'Type', value: hd.type, valueId: typeId(hd.type) },
            { label: 'Strategy', value: hd.strategy, labelId: STRATEGY_ID },
            { label: 'Authority', value: hd.authority, valueId: authorityId(hd.authority), labelId: 'hd:authority' },
            { label: 'Profile', value: hd.profile, valueId: profileId(hd.profile.match(/\d\/\d/)?.[0] ?? hd.profile), labelId: 'hd:profile' },
          ]}
        />
      </FadeIn>

      <FadeIn delay={200}>
        <TriadCard
          accent={colors.road}
          glyph="▲"
          metaphor="THE ROAD"
          system="Numerology"
          rows={[
            { label: 'Life Path', value: String(num.lifePath), labelId: 'num:lifepath', valueId: `num:${num.lifePath}` },
            { label: 'Destiny', value: String(num.destiny), labelId: 'num:destiny', valueId: `num:${num.destiny}` },
            { label: 'Soul Urge', value: String(num.soulUrge), labelId: 'num:soulurge', valueId: `num:${num.soulUrge}` },
            { label: 'Personality', value: String(num.personality), labelId: 'num:personality', valueId: `num:${num.personality}` },
            { label: 'Hidden Passion', value: String(num.hiddenPassion), labelId: 'num:hiddenpassion', valueId: `num:${num.hiddenPassion}` },
            {
              label: 'Karmic Lessons',
              labelId: 'num:karmic',
              value: num.karmicLessons.length ? num.karmicLessons.join(', ') : 'None',
            },
          ]}
        />
      </FadeIn>

      <FadeIn delay={300}>
        <TriadCard
          accent={colors.stoplight}
          glyph="●"
          metaphor="THE STOPLIGHT"
          system="Astrology"
          rows={[
            { label: 'Tropical Sun', value: astro.tropicalSun.formatted, labelId: planetId('sun') },
            { label: 'Tropical Moon', value: astro.tropicalMoon.formatted, labelId: planetId('moon') },
            { label: 'Tropical Rising', value: formatLongitude(astro.tropicalAscendant), labelId: 'astro:ascendant' },
            { label: 'Sidereal Sun', value: astro.siderealSun.formatted, labelId: 'astro:sidereal' },
            { label: 'Sidereal Rising', value: formatLongitude(astro.siderealAscendant), labelId: 'astro:ascendant' },
          ]}
        />
        {risingNote ? <Text style={styles.note}>{risingNote}</Text> : null}
      </FadeIn>

      <FadeIn delay={360}>
        <BirthDataCard profile={profile} />
      </FadeIn>

      <FadeIn delay={400}>
        <ReminderCard />
      </FadeIn>

        </>
      ) : (
        <View style={styles.chartArea}>
          {drawing.offline && drawing.data ? <OfflineNote savedAt={drawing.savedAt} /> : null}
          {drawing.data ? (
            view === 'wheel' ? (
              <WheelPanel tropical={drawing.data.tropical} sidereal={drawing.data.sidereal} />
            ) : (
              <BodygraphPanel hd={drawing.data.humanDesign} />
            )
          ) : drawing.error ? (
            <View style={styles.centerBox}>
              <Text accessibilityRole="alert" style={styles.errorText}>{drawing.error}</Text>
              <GoldButton label="Try again" variant="ghost" onPress={drawing.retry} />
            </View>
          ) : (
            <View style={styles.centerBox} accessibilityLiveRegion="polite">
              <ActivityIndicator color={colors.gold} />
              <Text style={styles.note}>Drawing your chart…</Text>
            </View>
          )}
        </View>
      )}

      <FadeIn delay={400}>
        <View style={styles.actions}>
          <GoldButton label="Share your T3D card" onPress={() => router.push('/share-card' as Href)} />
          <GoldButton label="Glossary · tap any term" variant="ghost" onPress={() => router.push('/glossary')} />
          <GoldButton label="Edit birth details" variant="ghost" onPress={() => router.push('/onboarding')} />
        </View>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6, paddingTop: space.lg, paddingBottom: space.sm },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 3, color: colors.gold },
  name: { fontFamily: fonts.display, fontSize: 34, lineHeight: 42, color: colors.parchment },
  meta: { fontFamily: fonts.body, fontSize: 15, color: colors.parchmentMuted },
  note: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.parchmentMuted, marginTop: space.sm },
  actions: { marginTop: space.md, gap: 12 },
  chartArea: { marginTop: space.md },
  centerBox: { alignItems: 'center', gap: space.md, paddingVertical: space.xxl },
  errorText: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.danger, textAlign: 'center' },
});
