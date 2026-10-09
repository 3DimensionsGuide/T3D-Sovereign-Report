import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from 'react';
import {
  ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View,
  type StyleProp, type TextStyle, type ViewStyle,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChartRequestError, requestExplain } from '@/lib/api';
import type { ExplainEntry, GlossaryGroup } from '@/lib/explainTypes';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, radius, space, TOUCH } from '@/theme/tokens';

export const GROUP_ACCENT: Record<GlossaryGroup, string> = {
  'Human Design': colors.vehicle,
  Astrology: colors.stoplight,
  Numerology: colors.road,
  Timing: colors.gold,
};

const GROUP_GLYPH: Record<GlossaryGroup, string> = {
  'Human Design': '◆',
  Astrology: '●',
  Numerology: '▲',
  Timing: '◷',
};

interface ExplainContextValue {
  open: (id: string) => void;
}

const ExplainContext = createContext<ExplainContextValue>({ open: () => undefined });

export function useExplain(): ExplainContextValue {
  return useContext(ExplainContext);
}

/** Entries don't change during a session, so keep them. */
const cache = new Map<string, ExplainEntry>();

export function ExplainProvider({ children }: { children: ReactNode }) {
  const profile = useT3DStore((s) => s.profile);
  const chart = useT3DStore((s) => s.chart);
  const insets = useSafeAreaInsets();

  const [trail, setTrail] = useState<string[]>([]);
  const [entry, setEntry] = useState<ExplainEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scroller = useRef<ScrollView>(null);

  const currentId = trail[trail.length - 1] ?? null;
  const leadId = chart?.leadId;
  const email = profile?.email.trim();

  const open = useCallback((id: string) => setTrail([id]), []);
  const goTo = useCallback((id: string) => setTrail((t) => [...t, id]), []);
  const back = useCallback(() => setTrail((t) => t.slice(0, -1)), []);
  const close = useCallback(() => setTrail([]), []);

  useEffect(() => {
    if (!currentId || !leadId || !email) {
      setEntry(null);
      return;
    }
    const key = `${leadId}|${currentId}`;
    const hit = cache.get(key);
    if (hit) {
      setEntry(hit);
      setError(null);
      setLoading(false);
      scroller.current?.scrollTo({ y: 0, animated: false });
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    setEntry(null);
    requestExplain(leadId, email, currentId)
      .then((e) => {
        cache.set(key, e);
        if (active) setEntry(e);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof ChartRequestError ? err.message : 'Something went wrong. Please try again.');
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [currentId, leadId, email]);

  const value = useMemo(() => ({ open }), [open]);
  const accent = entry ? GROUP_ACCENT[entry.group] : colors.gold;

  return (
    <ExplainContext.Provider value={value}>
      {children}
      <Modal
        visible={currentId !== null}
        transparent
        animationType="slide"
        onRequestClose={close}
        statusBarTranslucent
      >
        <View style={styles.overlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close explanation"
            style={styles.backdrop}
            onPress={close}
          />
          <View
            accessibilityViewIsModal
            style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, space.md) }]}
          >
            <View style={styles.grabber} />
            <View style={styles.topBar}>
              {trail.length > 1 ? (
                <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={back} style={styles.barButton}>
                  <Text style={styles.barButtonText}>← BACK</Text>
                </Pressable>
              ) : (
                <View style={styles.barButton} />
              )}
              <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={close} style={styles.barButton}>
                <Text style={styles.barButtonText}>CLOSE ✕</Text>
              </Pressable>
            </View>

            <ScrollView ref={scroller} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              {loading ? (
                <View style={styles.center} accessibilityLiveRegion="polite">
                  <ActivityIndicator color={colors.gold} />
                  <Text style={styles.muted}>Looking that up…</Text>
                </View>
              ) : error ? (
                <View style={styles.center}>
                  <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
                </View>
              ) : entry ? (
                <>
                  <Text style={[styles.eyebrow, { color: accent }]}>
                    {GROUP_GLYPH[entry.group]}  {entry.group.toUpperCase()}
                  </Text>
                  <Text accessibilityRole="header" style={styles.title}>{entry.title}</Text>
                  <Text style={styles.summary}>{entry.summary}</Text>
                  {entry.body.map((p) => (
                    <Text key={p} style={styles.body}>{p}</Text>
                  ))}
                  {entry.yours ? (
                    <View style={[styles.yours, { borderLeftColor: accent }]}>
                      <Text style={styles.yoursLabel}>IN YOUR CHART</Text>
                      <Text style={styles.body}>{entry.yours}</Text>
                    </View>
                  ) : null}
                  {entry.relatedEntries.length ? (
                    <View style={styles.related}>
                      <Text style={styles.yoursLabel}>RELATED</Text>
                      <View style={styles.chipWrap}>
                        {entry.relatedEntries.map((r) => (
                          <Pressable
                            key={r.id}
                            accessibilityRole="button"
                            accessibilityLabel={`Explain ${r.title}`}
                            onPress={() => goTo(r.id)}
                            style={styles.chip}
                          >
                            <Text style={styles.chipText}>{r.title}</Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  ) : null}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Browse all terms"
                    onPress={() => {
                      close();
                      router.push('/glossary');
                    }}
                    style={styles.browse}
                  >
                    <Text style={styles.browseText}>BROWSE ALL TERMS</Text>
                  </Pressable>
                </>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ExplainContext.Provider>
  );
}

/** Inline text you can tap to learn what it means. */
export function Term({
  id, children, style,
}: {
  id: string;
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  const { open } = useExplain();
  return (
    <Text
      accessibilityRole="button"
      accessibilityHint="Opens an explanation"
      onPress={() => open(id)}
      style={[styles.term, style]}
    >
      {children}
    </Text>
  );
}

/** A whole row or chip you can tap to learn what it means. */
export function TermPressable({
  id, children, style, label,
}: {
  id: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  label?: string;
}) {
  const { open } = useExplain();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Opens an explanation"
      onPress={() => open(id)}
      style={({ pressed }) => [style, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    maxHeight: '82%',
    backgroundColor: colors.charcoal,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.hairline,
    paddingTop: space.sm,
  },
  grabber: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.hairline },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: space.md },
  barButton: { minHeight: TOUCH - 4, minWidth: 96, justifyContent: 'center' },
  barButtonText: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 1.6, color: colors.parchmentMuted },
  content: { paddingHorizontal: space.lg, paddingBottom: space.lg, gap: space.md },
  center: { alignItems: 'center', gap: space.md, paddingVertical: space.xl },
  muted: { fontFamily: fonts.body, fontSize: 15, color: colors.parchmentMuted },
  error: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.danger, textAlign: 'center' },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2.4 },
  title: { fontFamily: fonts.display, fontSize: 28, lineHeight: 35, color: colors.parchment },
  summary: { fontFamily: fonts.bodyMedium, fontSize: 17, lineHeight: 25, color: colors.parchment },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 25, color: colors.parchment },
  yours: {
    gap: 6,
    padding: space.md,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    backgroundColor: colors.amethyst,
  },
  yoursLabel: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.8, color: colors.gold },
  related: { gap: 8 },
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
  browse: {
    minHeight: TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    marginTop: space.sm,
  },
  browseText: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 2, color: colors.parchment },
  term: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    textDecorationColor: colors.gold,
  },
  pressed: { opacity: 0.7 },
});
