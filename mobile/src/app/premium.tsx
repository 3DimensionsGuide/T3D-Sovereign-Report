import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { AccentView } from '@/components/AccentView';
import { FadeIn } from '@/components/FadeIn';
import { GoldButton } from '@/components/GoldButton';
import { LockIcon } from '@/components/LockIcon';
import { Pressable } from '@/components/Pressable';
import { Screen } from '@/components/Screen';
import { FREE_FEATURES, SUBSCRIPTIONS_OPEN, money, PREMIUM_FEATURES, PRICES, yearlySavingsPercent, type PremiumAccent } from '@/lib/premium';
import { usePremium } from '@/lib/usePremium';
import { useMeetTriadStore } from '@/store/useMeetTriadStore';
import { colors, fonts, guidance, radius, space } from '@/theme/tokens';

const ACCENT: Record<PremiumAccent, string> = { vehicle: colors.vehicle, road: colors.road, stoplight: colors.stoplight };
const GLYPH: Record<PremiumAccent, string> = { vehicle: '◆', road: '▲', stoplight: '●' };

// Apple's standard licence agreement applies until T3D has its own terms page.
const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

type Plan = 'yearly' | 'monthly';

export default function PremiumScreen() {
  const premium = usePremium();
  const setPremium = useMeetTriadStore((s) => s.setPremium);
  const [plan, setPlan] = useState<Plan>('yearly');
  const save = yearlySavingsPercent();

  // Version 1 is free for everyone: there is nothing to buy, so this screen is not shown.
  if (!SUBSCRIPTIONS_OPEN) return <Redirect href="/today" />;

  return (
    <Screen room="ritual">
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>‹  BACK</Text>
      </Pressable>

      <FadeIn>
        <Text style={styles.eyebrow}>T3D PREMIUM</Text>
        <Text accessibilityRole="header" style={styles.title}>Go deeper into your Triad</Text>
        <Text style={[guidance, styles.lede]}>
          Your chart is always free. Premium adds the long explanations, the timing and the daily practice.
        </Text>
      </FadeIn>

      {premium ? (
        <FadeIn delay={60}>
          <View style={styles.have} accessible accessibilityLabel="Premium is on in this developer preview.">
            <LockIcon size={18} />
            <Text style={styles.haveText}>Premium is on (developer preview).</Text>
          </View>
        </FadeIn>
      ) : null}

      <FadeIn delay={100}>
        <Text accessibilityRole="header" style={styles.section}>What Premium adds</Text>
        <View style={styles.stack}>
          {PREMIUM_FEATURES.map((f) => (
            <AccentView key={f.id} style={[styles.card, { borderLeftColor: ACCENT[f.accent] }]}>
              <Text style={[styles.cardEyebrow, { color: ACCENT[f.accent] }]}>{GLYPH[f.accent]}</Text>
              <Text style={styles.cardTitle}>{f.title}</Text>
              <Text style={styles.body}>{f.detail}</Text>
            </AccentView>
          ))}
        </View>
      </FadeIn>

      <FadeIn delay={140}>
        <Text accessibilityRole="header" style={styles.section}>Always free</Text>
        <View style={styles.free}>
          {FREE_FEATURES.map((t) => (
            <View key={t} style={styles.freeRow}>
              <Text style={styles.tick} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">✓</Text>
              <Text style={styles.freeText}>{t}</Text>
            </View>
          ))}
        </View>
      </FadeIn>

      <FadeIn delay={180}>
        <Text accessibilityRole="header" style={styles.section}>Choose a plan</Text>
        <View style={styles.stack} accessibilityRole="radiogroup">
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: plan === 'yearly' }}
            accessibilityLabel={`Yearly, ${money(PRICES.yearly)} a year, ${PRICES.trialDays} day free trial, saves ${save} percent`}
            onPress={() => setPlan('yearly')}
            style={[styles.plan, plan === 'yearly' && styles.planOn]}
          >
            <View style={[styles.radio, plan === 'yearly' && styles.radioOn]} />
            <View style={styles.planText}>
              <Text style={styles.planName}>Yearly · {money(PRICES.yearly)}</Text>
              <Text style={styles.planNote}>{PRICES.trialDays}-day free trial, then {money(PRICES.yearly)} a year</Text>
            </View>
            <Text style={styles.badge}>Save {save}%</Text>
          </Pressable>
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: plan === 'monthly' }}
            accessibilityLabel={`Monthly, ${money(PRICES.monthly)} a month`}
            onPress={() => setPlan('monthly')}
            style={[styles.plan, plan === 'monthly' && styles.planOn]}
          >
            <View style={[styles.radio, plan === 'monthly' && styles.radioOn]} />
            <View style={styles.planText}>
              <Text style={styles.planName}>Monthly · {money(PRICES.monthly)}</Text>
              <Text style={styles.planNote}>Billed every month</Text>
            </View>
          </Pressable>
        </View>
      </FadeIn>

      <FadeIn delay={220}>
        <View style={styles.stack}>
          <GoldButton label="Subscriptions open soon" onPress={() => undefined} disabled />
          <Text style={styles.small}>
            Subscriptions are not open yet, so nothing is charged and nothing is locked by mistake.
          </Text>
          <GoldButton label="Restore purchases" variant="ghost" onPress={() => undefined} disabled />
        </View>
      </FadeIn>

      <FadeIn delay={260}>
        <View style={styles.fine}>
          <Text style={styles.small}>
            Subscriptions renew automatically until you cancel. You will be able to cancel any time in your Apple ID settings.
          </Text>
          <Text style={styles.small}>
            Bought the Sovereign report? You get {PRICES.reportBuyerMonths} months of Premium free.
          </Text>
          <Text style={styles.small}>
            T3D is for reflection and entertainment. It does not predict events and is not medical, legal or financial advice.
          </Text>
          <GoldButton
            label="READ THE PRIVACY POLICY"
            variant="ghost"
            onPress={() => { void WebBrowser.openBrowserAsync('https://www.3dimensions.guide/privacy'); }}
          />
          <GoldButton
            label="TERMS OF USE"
            variant="ghost"
            onPress={() => { void WebBrowser.openBrowserAsync(TERMS_URL); }}
          />
        </View>
      </FadeIn>

      {__DEV__ ? (
        <Pressable accessibilityRole="switch" accessibilityState={{ checked: premium }} onPress={() => setPremium(!premium)} style={styles.dev}>
          <Text style={styles.devText}>Developer only: preview as Premium ({premium ? 'on' : 'off'})</Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { minHeight: 48, justifyContent: 'center', alignSelf: 'flex-start' },
  backText: { fontFamily: fonts.bodyBold, fontSize: 15, letterSpacing: 1.6, color: colors.gold },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 3, color: colors.parchmentMuted },
  title: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 34, lineHeight: 42, color: colors.parchment, marginTop: 4 },
  lede: { marginTop: space.sm },
  have: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.charcoal, borderRadius: radius.md, borderWidth: 1, borderColor: colors.gold, padding: space.md },
  haveText: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.gold },
  section: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 22, lineHeight: 28, color: colors.parchment, marginBottom: space.sm },
  stack: { gap: space.sm },
  card: { backgroundColor: colors.charcoal, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline, padding: space.md, gap: 4 },
  cardEyebrow: { fontFamily: fonts.bodyBold, fontSize: 15 },
  cardTitle: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 20, lineHeight: 26, color: colors.parchment },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.parchmentMuted },
  free: { gap: 10 },
  freeRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  tick: { fontFamily: fonts.bodyBold, fontSize: 17, lineHeight: 24, color: colors.gold },
  freeText: { flex: 1, fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.parchment },
  plan: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, backgroundColor: colors.charcoal, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline, padding: space.md },
  planOn: { borderColor: colors.gold, borderWidth: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.parchmentMuted },
  radioOn: { borderColor: colors.gold, backgroundColor: colors.gold },
  planText: { flex: 1, gap: 2 },
  planName: { fontFamily: fonts.bodyBold, fontSize: 17, color: colors.parchment },
  planNote: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.parchmentMuted },
  badge: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.obsidian, backgroundColor: colors.gold, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4, overflow: 'hidden' },
  small: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  fine: { gap: space.sm },
  dev: { minHeight: 48, justifyContent: 'center' },
  devText: { fontFamily: fonts.body, fontSize: 13, color: colors.parchmentMuted, textDecorationLine: 'underline' },
});
