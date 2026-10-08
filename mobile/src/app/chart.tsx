import { StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { FadeIn } from '@/components/FadeIn';
import { GoldButton } from '@/components/GoldButton';
import { TriadCard } from '@/components/TriadCard';
import { formatLongitude } from '@/lib/api';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, space } from '@/theme/tokens';

export default function Chart() {
  const chart = useT3DStore((state) => state.chart);
  const profile = useT3DStore((state) => state.profile);

  if (!chart || !profile) return <Redirect href="/onboarding" />;

  const { humanDesign: hd, numerology: num, astrology: astro } = chart;
  const risingNote = profile.birthTimeKnown
    ? null
    : 'Rising sign uses 12:00 noon because no birth time was entered.';

  return (
    <Screen>
      <FadeIn>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>YOUR T3D CHART</Text>
          <Text accessibilityRole="header" style={styles.name}>
            {profile.firstName} {profile.lastName}
          </Text>
          <Text style={styles.meta}>
            {profile.birthDate} · {profile.birthTimeKnown ? profile.birthTime : 'time unknown'} ·{' '}
            {profile.city}
          </Text>
        </View>
      </FadeIn>

      <FadeIn delay={100}>
        <TriadCard
          accent={colors.vehicle}
          glyph="◆"
          metaphor="THE VEHICLE"
          system="Human Design"
          rows={[
            { label: 'Type', value: hd.type },
            { label: 'Strategy', value: hd.strategy },
            { label: 'Authority', value: hd.authority },
            { label: 'Profile', value: hd.profile },
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
            { label: 'Life Path', value: String(num.lifePath) },
            { label: 'Destiny', value: String(num.destiny) },
            { label: 'Soul Urge', value: String(num.soulUrge) },
            { label: 'Personality', value: String(num.personality) },
            { label: 'Hidden Passion', value: String(num.hiddenPassion) },
            {
              label: 'Karmic Lessons',
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
            { label: 'Tropical Sun', value: astro.tropicalSun.formatted },
            { label: 'Tropical Moon', value: astro.tropicalMoon.formatted },
            { label: 'Tropical Rising', value: formatLongitude(astro.tropicalAscendant) },
            { label: 'Sidereal Sun', value: astro.siderealSun.formatted },
            { label: 'Sidereal Rising', value: formatLongitude(astro.siderealAscendant) },
          ]}
        />
        {risingNote ? <Text style={styles.note}>{risingNote}</Text> : null}
      </FadeIn>

      <FadeIn delay={400}>
        <View style={styles.actions}>
          <GoldButton label="EDIT BIRTH DETAILS" variant="ghost" onPress={() => router.push('/onboarding')} />
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
  actions: { marginTop: space.md },
});
