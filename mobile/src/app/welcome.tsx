import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, type Href } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Screen } from '@/components/Screen';
import { FadeIn } from '@/components/FadeIn';
import { GoldButton } from '@/components/GoldButton';
import { LensLabel } from '@/components/Lens';
import { TriadSeal } from '@/components/TriadSeal';
import { ChartRequestError, requestBirthPreview } from '@/lib/api';
import type { BirthPreview } from '@/lib/previewTypes';
import { colors, fonts, radius, space } from '@/theme/tokens';

import { AccentView } from '@/components/AccentView';
const pad = (n: number) => String(n).padStart(2, '0');
const toDateString = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** First screen: a taste of the reading from a birth date alone. Nothing is saved. */
export default function Welcome() {
  const [today] = useState(() => new Date());
  const [birthDate, setBirthDate] = useState(new Date(1990, 0, 1, 12, 0));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<BirthPreview | null>(null);

  async function onShow() {
    setError(null);
    const cutoff = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    if (birthDate > cutoff) {
      setError('T3D is for people 13 and older, so we can’t create a profile for this birth date.');
      return;
    }
    setLoading(true);
    try {
      setPreview(await requestBirthPreview(toDateString(birthDate)));
    } catch (err) {
      setError(err instanceof ChartRequestError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function goOn() {
    router.push({ pathname: '/onboarding', params: { birthDate: toDateString(birthDate) } } as Href);
  }

  return (
    <Screen>
      <FadeIn>
        <View style={styles.hero}>
          <TriadSeal size={92} />
          <Text style={styles.eyebrow}>The 3 Dimensions</Text>
          <Text accessibilityRole="header" style={styles.title}>
            Your vehicle,{'\n'}your road,{'\n'}your timing.
          </Text>
          <Text style={styles.lede}>
            Start with your birth date and see a first piece of your reading. No sign-up, and we
            save nothing at this step.
          </Text>
        </View>
      </FadeIn>

      <FadeIn delay={120}>
        <View style={styles.pickerRow}>
          <Text style={styles.pickerLabel}>Birth date</Text>
          <DateTimePicker value={birthDate} mode="date" display="compact" themeVariant="dark"
            maximumDate={today} onValueChange={(_e: unknown, v: Date) => { setBirthDate(v); setPreview(null); setError(null); }}
            accessibilityLabel="Birth date" />
        </View>
        {error ? (
          <Text accessibilityLiveRegion="polite" style={styles.error}>{'⚠  '}{error}</Text>
        ) : null}
        {!preview ? (
          <View style={styles.actions}>
            <GoldButton label="See my first look" onPress={onShow} loading={loading} />
          </View>
        ) : null}
      </FadeIn>

      {preview ? (
        <FadeIn>
          <View style={styles.results} accessibilityLiveRegion="polite">
            <AccentView style={[styles.card, { borderLeftColor: colors.road }]}>
              <LensLabel lens="road">The Road · Life Path {preview.lifePath.number}</LensLabel>
              <Text accessibilityRole="header" style={styles.cardTitle}>{preview.lifePath.name}</Text>
              <Text style={styles.body}>{preview.lifePath.direction}</Text>
              <Text style={styles.body}>{preview.lifePath.plain}</Text>
            </AccentView>

            <AccentView style={[styles.card, { borderLeftColor: colors.stoplight }]}>
              <LensLabel lens="stoplight">The Stoplight · Sun in {preview.sun.sign}</LensLabel>
              <Text accessibilityRole="header" style={styles.cardTitle}>{preview.sun.sign}, {preview.sun.element}</Text>
              <Text style={styles.body}>{preview.sun.orientation}</Text>
              {preview.sun.cusp ? (
                <Text style={styles.note}>
                  Your birth date falls on the day the Sun changes sign, so your birth time and place
                  will confirm your Sun sign.
                </Text>
              ) : null}
            </AccentView>

            <AccentView style={[styles.card, { borderLeftColor: colors.vehicle }]}>
              <LensLabel lens="vehicle">The Vehicle · waiting for your details</LensLabel>
              <Text accessibilityRole="header" style={styles.cardTitle}>Your full chart adds</Text>
              {preview.locked.map((line) => (
                <Text key={line} style={styles.body}>◇  {line}</Text>
              ))}
            </AccentView>

            <View style={styles.actions}>
              <GoldButton label="Create my full chart" onPress={goOn} />
            </View>
          </View>
        </FadeIn>
      ) : null}

      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Read our privacy policy"
        onPress={() => { void WebBrowser.openBrowserAsync('https://www.3dimensions.guide/privacy'); }}
        style={styles.linkRow}
      >
        <Text style={styles.link}>Read our privacy policy</Text>
      </Pressable>
      <Text style={styles.fine}>
        T3D is a reflection tool for self-understanding and entertainment. It does not predict
        events and is not medical, legal or financial advice. T3D is for people 13 and older.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: space.md, paddingTop: space.lg },
  eyebrow: { fontFamily: fonts.bodyMedium, fontSize: 15, letterSpacing: 0.5, color: colors.gold },
  title: { fontFamily: fonts.display, fontSize: 38, lineHeight: 46, color: colors.parchment },
  lede: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.parchmentMuted },
  pickerRow: {
    minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    gap: space.md, marginTop: space.lg,
  },
  pickerLabel: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.parchment },
  actions: { marginTop: space.md },
  error: { fontFamily: fonts.body, fontSize: 15, color: colors.danger, marginTop: space.sm },
  results: { gap: space.md, marginTop: space.md },
  card: {
    backgroundColor: colors.charcoal, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline,
    borderLeftWidth: 4, padding: space.lg, gap: 10,
  },
  cardEyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 1.6 },
  cardTitle: { fontFamily: fonts.display, fontSize: 24, lineHeight: 31, color: colors.parchment },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.parchment },
  note: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.parchmentMuted },
  linkRow: { minHeight: 48, justifyContent: 'center', marginTop: space.md },
  link: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.gold, textDecorationLine: 'underline' },
  fine: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.parchmentMuted, marginBottom: space.lg },
});
