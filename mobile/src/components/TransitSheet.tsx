import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useExplain } from '@/components/Explain';
import { ChartRequestError, requestTransitCard, type DailyTransitHit } from '@/lib/api';
import type { TransitCardData, TransitNature } from '@/lib/transitCardTypes';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, radius, space, TOUCH } from '@/theme/tokens';

import { AccentView } from '@/components/AccentView';
const NATURE_GLYPH: Record<TransitNature, string> = { flow: '◯', friction: '◼', neutral: '◇' };

function Section({ label, children }: { label: string; children: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.body}>{children}</Text>
    </View>
  );
}

/** Bottom sheet with the full meaning of one transit. Pass null to hide it. */
export function TransitSheet({ hit, onClose }: { hit: DailyTransitHit | null; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { open } = useExplain();
  const profile = useT3DStore((s) => s.profile);
  const chart = useT3DStore((s) => s.chart);
  const [card, setCard] = useState<TransitCardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hit || !profile || !chart) {
      setCard(null);
      setError(null);
      return;
    }
    let live = true;
    setCard(null);
    setError(null);
    requestTransitCard(chart.leadId, profile.email, {
      transiting: hit.transiting,
      natal: hit.natal,
      aspect: hit.aspect,
      nature: hit.nature,
      orb: hit.orb,
      peak: hit.peak,
      applying: hit.applying,
    })
      .then((data) => { if (live) setCard(data); })
      .catch((e: unknown) => {
        if (live) setError(e instanceof ChartRequestError ? e.message : 'Could not load that transit.');
      });
    return () => { live = false; };
  }, [hit, profile, chart]);

  const learn = (id: string) => {
    onClose();
    // Wait for this sheet to finish closing before the next one opens.
    setTimeout(() => open(id), 400);
  };

  return (
    <Modal visible={hit !== null} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" style={styles.backdrop} onPress={onClose} />
        <View accessibilityViewIsModal style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
          <View style={styles.grabber} />
          <View style={styles.topBar}>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} style={styles.barButton}>
              <Text style={styles.barButtonText}>CLOSE ✕</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {card ? (
              <>
                <Text style={styles.eyebrow}>● TRANSIT · THE STOPLIGHT</Text>
                <Text accessibilityRole="header" style={styles.title}>{card.title}</Text>
                <Text style={styles.nature}>{NATURE_GLYPH[card.nature]}  {card.natureLine}</Text>
                <Text style={styles.muted}>{card.timingState}</Text>

                <Section label="WHAT IT IS">{card.whatItIs}</Section>
                <Section label="WHERE IT LANDS">{card.whereItLands}</Section>
                <Section label="HOW LONG IT LASTS">{card.howLong}</Section>
                <Section label="WORTH NOTICING">{card.invitation}</Section>

                <AccentView style={styles.meet}>
                  <Text style={styles.meetLabel}>MEET IT THROUGH STRATEGY & AUTHORITY</Text>
                  <Text style={styles.body}>{card.meetIt.frame}</Text>
                  {card.meetIt.strategy ? <Text style={styles.body}>{card.meetIt.strategy}</Text> : null}
                  {card.meetIt.authority ? <Text style={styles.body}>{card.meetIt.authority}</Text> : null}
                  {card.meetIt.cue ? <Text style={styles.muted}>{card.meetIt.cue}</Text> : null}
                </AccentView>

                <Text style={styles.muted}>{card.reminder}</Text>

                <Text style={styles.label}>LEARN THE TERMS</Text>
                <View style={styles.chipWrap}>
                  {card.related.map((id) => (
                    <Pressable
                      key={id}
                      accessibilityRole="button"
                      accessibilityLabel={`Explain ${id.split(':').pop()}`}
                      onPress={() => learn(id)}
                      style={styles.chip}
                    >
                      <Text style={styles.chipText}>{id.split(':').pop()?.replace(/^./, (c) => c.toUpperCase())}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : error ? (
              <View style={styles.center}>
                <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
              </View>
            ) : (
              <View style={styles.center} accessibilityLiveRegion="polite">
                <ActivityIndicator color={colors.gold} />
                <Text style={styles.muted}>Reading this transit…</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    maxHeight: '88%',
    backgroundColor: colors.charcoal,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.hairline,
    paddingTop: space.sm,
  },
  grabber: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.hairline },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: space.md },
  barButton: { minHeight: TOUCH - 4, minWidth: 96, justifyContent: 'center', alignItems: 'flex-end' },
  barButtonText: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 1.6, color: colors.parchmentMuted },
  content: { paddingHorizontal: space.lg, paddingBottom: space.lg, gap: space.md },
  center: { alignItems: 'center', gap: space.md, paddingVertical: space.xl },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2.4, color: colors.stoplight },
  title: { fontFamily: fonts.display, fontSize: 28, lineHeight: 35, color: colors.parchment },
  nature: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.parchment },
  muted: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.parchmentMuted },
  error: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.danger, textAlign: 'center' },
  section: { gap: 6 },
  label: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.8, color: colors.gold },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 25, color: colors.parchment },
  meet: {
    gap: 8,
    padding: space.md,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.vehicle,
    backgroundColor: colors.amethyst,
  },
  meetLabel: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.8, color: colors.vehicle },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    backgroundColor: colors.amethyst,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.parchment },
});
