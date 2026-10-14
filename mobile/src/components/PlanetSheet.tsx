import { useEffect, useState, type ReactNode } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/components/Pressable';
import { TriadLoader } from '@/components/TriadLoader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SignalMarker, SIGNAL_LABEL } from '@/components/Lens';
import { ChartRequestError, requestExplain, type DailyTransitHit, type TodayResult } from '@/lib/api';
import type { ExplainEntry } from '@/lib/explainTypes';
import { contactsFor, houseFor, retrogradeNote, signStage, TEMPO } from '@/lib/planetFacts';
import type { RingMark } from '@/lib/skyRing';
import { aspectWord, bodyName, houseTheme, natalName, ordinal } from '@/lib/skyText';
import { houseId, planetId, signId } from '@/lib/termIds';
import { useExplain } from '@/components/Explain';
import { usePremium } from '@/lib/usePremium';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, radius, space, TOUCH } from '@/theme/tokens';

const cache = new Map<string, ExplainEntry>();

function useEntry(id: string | null): ExplainEntry | null {
  const chart = useT3DStore((s) => s.chart);
  const profile = useT3DStore((s) => s.profile);
  const premium = usePremium();
  const [entry, setEntry] = useState<ExplainEntry | null>(null);
  useEffect(() => {
    if (!id || !chart || !profile) { setEntry(null); return; }
    const key = `${chart.leadId}|${id}|${premium ? 'p' : 'f'}`;
    const hit = cache.get(key);
    if (hit) { setEntry(hit); return; }
    let live = true;
    setEntry(null);
    requestExplain(chart.leadId, profile.email.trim(), id, premium)
      .then((e) => { cache.set(key, e); if (live) setEntry(e); })
      .catch(() => undefined);
    return () => { live = false; };
  }, [id, chart, profile, premium]);
  return entry;
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

/**
 * A bottom sheet for one body in today's sky: where it is, what it is, the style its sign gives it, the house of
 * the person's chart it moves through, how long it stays, and the contacts it makes to their chart today.
 * Pass null to hide it.
 */
export function PlanetSheet({
  mark, today, onClose, onSelectTransit,
}: {
  mark: RingMark | null;
  today: TodayResult;
  onClose: () => void;
  onSelectTransit?: (hit: DailyTransitHit) => void;
}) {
  const insets = useSafeAreaInsets();
  const { open } = useExplain();
  const chart = useT3DStore((s) => s.chart);
  const profile = useT3DStore((s) => s.profile);
  const planet = useEntry(mark ? planetId(mark.body) : null);
  const sign = useEntry(mark ? signId(mark.sign) : null);
  const asc = chart?.astrology.tropicalAscendant;
  const house = mark && typeof asc === 'number' && Number.isFinite(asc) ? houseFor(mark.longitude, asc) : null;
  /** Another sheet opens only after this one has finished closing. */
  const learn = (id: string) => {
    onClose();
    setTimeout(() => open(id), 400);
  };
  const contacts = mark ? contactsFor(mark.body, today.transits) : [];

  return (
    <Modal visible={mark !== null} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" style={styles.backdrop} onPress={onClose} />
        <View accessibilityViewIsModal style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
          <View style={styles.grabber} />
          <View style={styles.topBar}>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} style={styles.barButton}>
              <Text style={styles.barButtonText}>CLOSE ✕</Text>
            </Pressable>
          </View>
          {mark ? (
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <Text style={styles.eyebrow}>● THE SKY NOW · THE STOPLIGHT</Text>
              <Text accessibilityRole="header" style={styles.title}>{mark.glyph}  {mark.name} in {mark.sign}</Text>
              <Text style={styles.muted}>
                {mark.degree}° into {mark.sign}, {signStage(mark.degree)}.{mark.retrograde ? ' Retrograde ℞.' : ''}
              </Text>

              <Section label="WHAT IT IS">
                {planet ? (
                  <>
                    <Text style={styles.strong}>{planet.summary}</Text>
                    {planet.locked ? null : planet.body.slice(0, 1).map((p) => <Text key={p} style={styles.body}>{p}</Text>)}
                  </>
                ) : <TriadLoader />}
                <Pressable accessibilityRole="button" accessibilityLabel={`More about ${mark.name}`} onPress={() => learn(planetId(mark.body))} style={styles.linkRow}><Text style={styles.link}>{`More about ${mark.name}`}</Text></Pressable>
              </Section>

              <Section label={`THE STYLE OF ${mark.sign.toUpperCase()}`}>
                {sign ? (
                  <>
                    <Text style={styles.strong}>{sign.summary}</Text>
                    {sign.locked ? null : sign.body.slice(1).map((p) => <Text key={p} style={styles.body}>{p}</Text>)}
                  </>
                ) : <TriadLoader />}
                <Text style={styles.body}>
                  {`So ${mark.name} is working through ${mark.sign} today: the planet says what is happening, the sign says how it tends to happen.`}
                </Text>
              </Section>

              {mark.retrograde && retrogradeNote(mark.body) ? (
                <Section label="RETROGRADE">
                  <Text style={styles.body}>{retrogradeNote(mark.body)}</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel={'What retrograde means'} onPress={() => learn('astro:retrograde')} style={styles.linkRow}><Text style={styles.link}>{'What retrograde means'}</Text></Pressable>
                </Section>
              ) : null}

              <Section label="IN YOUR CHART">
                {house ? (
                  <>
                    <Text style={styles.body}>
                      {`${mark.name} is moving through your ${ordinal(house)} house: ${houseTheme(house)}.`}
                    </Text>
                    <Pressable accessibilityRole="button" accessibilityLabel={`About your ${ordinal(house)} house`} onPress={() => learn(houseId(house))} style={styles.linkRow}>
                      <Text style={styles.link}>{`About your ${ordinal(house)} house`}</Text>
                    </Pressable>
                    {profile && !profile.birthTimeKnown ? (
                      <Text style={styles.muted}>Houses are approximate without your exact birth time.</Text>
                    ) : null}
                  </>
                ) : (
                  <Text style={styles.muted}>Your houses need your birth chart. Open My Chart to load it.</Text>
                )}
                {planet?.yours ? <Text style={styles.body}>{`Your birth chart: ${planet.yours}`}</Text> : null}
              </Section>

              <Section label="HOW LONG IT STAYS">
                <Text style={styles.body}>{TEMPO[mark.body]}</Text>
              </Section>

              <Section label={`CONTACTS TO YOUR CHART TODAY`}>
                {contacts.length ? (
                  contacts.map((hit) => (
                    <Pressable
                      key={`${hit.natal}-${hit.aspect}`}
                      accessibilityRole="button"
                      accessibilityLabel={`${bodyName(hit.transiting)} ${aspectWord(hit.aspect)} your ${natalName(hit.natal)}. ${SIGNAL_LABEL[hit.nature]}. Opens the full meaning.`}
                      onPress={() => {
                        onClose();
                        // Wait for this sheet to finish closing before the next one opens.
                        setTimeout(() => onSelectTransit?.(hit), 400);
                      }}
                      style={({ pressed }) => [styles.contact, pressed && { opacity: 0.8 }]}
                    >
                      <Text style={styles.contactText}>{bodyName(hit.transiting)} {aspectWord(hit.aspect)} your {natalName(hit.natal)}</Text>
                      <View style={styles.nature}>
                        <SignalMarker kind={hit.nature === 'friction' ? 'friction' : hit.nature === 'flow' ? 'flow' : 'neutral'} size={14} />
                        <Text style={styles.muted}>{SIGNAL_LABEL[hit.nature === 'friction' ? 'friction' : hit.nature === 'flow' ? 'flow' : 'neutral']} · {hit.orb.toFixed(1)}° from exact · tap for the full meaning</Text>
                      </View>
                    </Pressable>
                  ))
                ) : (
                  <Text style={styles.body}>
                    {mark.name} makes no close contact to your chart today. That is a real reading: this planet is in the background of your day.
                  </Text>
                )}
              </Section>

              <Text style={styles.muted}>Planets are weather, not commands. Decide through your Strategy and Authority.</Text>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    maxHeight: '88%', backgroundColor: colors.charcoal, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg,
    borderWidth: 1, borderBottomWidth: 0, borderColor: colors.hairline, paddingTop: space.sm,
  },
  grabber: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.hairline },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: space.md },
  barButton: { minHeight: TOUCH - 4, minWidth: 96, justifyContent: 'center', alignItems: 'flex-end' },
  barButtonText: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 1.6, color: colors.parchmentMuted },
  content: { paddingHorizontal: space.lg, paddingBottom: space.lg, gap: space.md },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2, color: colors.stoplight },
  title: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 28, lineHeight: 35, color: colors.parchment },
  muted: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  section: { gap: 6 },
  label: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 1.6, color: colors.parchmentMuted },
  body: { fontFamily: fonts.body, fontSize: 17, lineHeight: 27, color: colors.parchment },
  strong: { fontFamily: fonts.bodyBold, fontSize: 17, lineHeight: 26, color: colors.parchment },
  link: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.gold },
  linkRow: { minHeight: TOUCH, justifyContent: 'center' },
  contact: {
    minHeight: 56, gap: 4, padding: space.md, borderRadius: radius.md, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.hairline,
  },
  contactText: { fontFamily: fonts.bodyMedium, fontSize: 17, color: colors.parchment },
  nature: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
});
