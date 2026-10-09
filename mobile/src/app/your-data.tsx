import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoldButton } from '@/components/GoldButton';
import { ChartRequestError, requestDeleteMyData } from '@/lib/api';
import { clearReminder } from '@/lib/reminder';
import { clearAllCached } from '@/lib/persistentCache';
import { usePartnerStore } from '@/store/usePartnerStore';
import { usePracticeStore } from '@/store/usePracticeStore';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, radius, space, TOUCH } from '@/theme/tokens';

interface Section {
  glyph: string;
  accent: string;
  title: string;
  paragraphs: string[];
}

const SECTIONS: Section[] = [
  {
    glyph: '◌',
    accent: colors.parchmentMuted,
    title: 'A reflection tool',
    paragraphs: [
      'T3D is for self-understanding and entertainment. Astrology, Human Design and numerology are interpretive traditions. They do not predict events, and they are not medical, psychological, legal or financial advice.',
      'If something here touches a health, money or legal decision, please talk with a qualified professional. T3D is for people 13 and older.',
    ],
  },
  {
    glyph: '●',
    accent: colors.gold,
    title: 'Where your information lives',
    paragraphs: [
      'On our server: your name, email, birth date, time and place, and your calculated chart, so your readings load each time.',
      'On this phone only: your decision log, your 7-day check-ins, and the other person you decide with. We never receive these.',
    ],
  },
];

export default function YourData() {
  const profile = useT3DStore((s) => s.profile);
  const chart = useT3DStore((s) => s.chart);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteEverything() {
    setError(null);
    setBusy(true);
    try {
      if (chart?.leadId && profile?.email) {
        await requestDeleteMyData(chart.leadId, profile.email);
      }
      // Only clear the phone after the server confirmed, so a failed attempt can be retried.
      useT3DStore.getState().reset();
      usePartnerStore.getState().clearPartner();
      usePracticeStore.getState().clearAll();
      await clearAllCached();
      await clearReminder();
      router.replace('/onboarding' as Href);
    } catch (err) {
      setError(err instanceof ChartRequestError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function confirmDelete() {
    Alert.alert(
      'Delete all your data?',
      'This removes your details and chart from our server and clears your decision log and check-ins from this phone. It cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete everything', style: 'destructive', onPress: () => { void deleteEverything(); } },
      ],
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← BACK</Text>
          </Pressable>
          <Text style={styles.eyebrow}>ABOUT T3D</Text>
          <Text accessibilityRole="header" style={styles.title}>About and your data</Text>

          {SECTIONS.map((s) => (
            <View key={s.title} style={[styles.card, { borderLeftColor: s.accent }]}>
              <Text style={[styles.cardEyebrow, { color: s.accent }]}>{s.glyph}</Text>
              <Text accessibilityRole="header" style={styles.cardTitle}>{s.title}</Text>
              {s.paragraphs.map((p) => (
                <Text key={p} style={styles.body}>{p}</Text>
              ))}
            </View>
          ))}

          <GoldButton
            label="READ THE PRIVACY POLICY"
            variant="ghost"
            onPress={() => { void WebBrowser.openBrowserAsync('https://www.3dimensions.guide/privacy'); }}
          />

          <View style={[styles.card, { borderLeftColor: colors.danger }]}>
            <Text style={[styles.cardEyebrow, { color: colors.danger }]}>✕</Text>
            <Text accessibilityRole="header" style={styles.cardTitle}>Delete my data</Text>
            <Text style={styles.body}>
              Removes your details and chart from our server and clears your decision log, check-ins
              and saved person from this phone. Payment records, if you bought a report, are kept
              without your personal details. Payment and email providers keep their own records.
            </Text>
            {error ? (
              <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Delete my data"
              accessibilityState={{ disabled: busy, busy }}
              disabled={busy}
              onPress={confirmDelete}
              style={[styles.deleteButton, busy && styles.deleteBusy]}
            >
              <Text style={styles.deleteText}>{busy ? 'DELETING…' : 'DELETE MY DATA'}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.obsidian },
  safe: { flex: 1 },
  content: { paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.md },
  back: { minHeight: TOUCH - 4, justifyContent: 'center', alignSelf: 'flex-start' },
  backText: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 1.6, color: colors.parchmentMuted },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 3, color: colors.gold },
  title: { fontFamily: fonts.display, fontSize: 34, lineHeight: 42, color: colors.parchment },
  card: {
    backgroundColor: colors.charcoal, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline,
    borderLeftWidth: 4, padding: space.lg, gap: 10,
  },
  cardEyebrow: { fontFamily: fonts.bodyBold, fontSize: 20 },
  cardTitle: { fontFamily: fonts.display, fontSize: 22, lineHeight: 29, color: colors.parchment },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.parchment },
  error: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.danger },
  deleteButton: {
    minHeight: TOUCH, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.danger,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.lg, marginTop: space.sm,
  },
  deleteBusy: { opacity: 0.5 },
  deleteText: { fontFamily: fonts.bodyBold, fontSize: 14, letterSpacing: 1.6, color: colors.danger },
});
