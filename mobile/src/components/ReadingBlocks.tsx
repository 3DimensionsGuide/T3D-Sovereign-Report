import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode, type RefObject } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LENS_COLOR, LENS_TEXT, LensIcon, type LensName } from '@/components/Lens';
import { capFirst } from '@/lib/skyText';
import { GoldButton } from '@/components/GoldButton';
import { OfflineNote } from '@/components/OfflineNote';
import { colors, fonts, radius, space } from '@/theme/tokens';

/**
 * Shared building blocks for the long-form readings (Vehicle, Road, Stoplight).
 * `accent` is the system colour: amber (Vehicle), emerald (Road), crimson (Stoplight).
 */

// ───────────── lens + jump-link context ─────────────

const LensContext = createContext<LensName>('vehicle');
export const ReadingLensProvider = LensContext.Provider;
export const useReadingLens = (): LensName => useContext(LensContext);

/** "YOUR MACHINERY" becomes "Your machinery". */
const sentence = (text: string): string => capFirst(text.toLowerCase());

interface JumpEntry { id: string; title: string; ref: RefObject<View | null> }
interface JumpContextValue {
  entries: JumpEntry[];
  register: (entry: JumpEntry) => void;
  unregister: (id: string) => void;
  jumpTo: (id: string) => void;
}

const JumpContext = createContext<JumpContextValue>({ entries: [], register: () => undefined, unregister: () => undefined, jumpTo: () => undefined });

/** Keeps the list of sections on screen and scrolls to one when asked. */
export function ReadingJumpProvider({
  scrollRef, scrollOffset, children,
}: { scrollRef: RefObject<ScrollView | null>; scrollOffset: MutableRefObject<number>; children: ReactNode }) {
  const [entries, setEntries] = useState<JumpEntry[]>([]);
  const register = useCallback((entry: JumpEntry) => {
    setEntries((list) => (list.some((e) => e.id === entry.id) ? list : [...list, entry]));
  }, []);
  const unregister = useCallback((id: string) => {
    setEntries((list) => list.filter((e) => e.id !== id));
  }, []);
  const jumpTo = useCallback((id: string) => {
    const entry = entries.find((e) => e.id === id);
    const scroller = scrollRef.current;
    if (!entry?.ref.current || !scroller) return;
    const host = scroller as unknown as { measureInWindow?: (cb: (x: number, y: number, w: number, h: number) => void) => void };
    if (typeof host.measureInWindow !== 'function') return;
    host.measureInWindow((_sx, scrollerTop) => {
      entry.ref.current?.measureInWindow((_x, top) => {
        const target = scrollOffset.current + (top - scrollerTop) - 12;
        scroller.scrollTo({ y: Math.max(0, target), animated: true });
      });
    });
  }, [entries, scrollRef, scrollOffset]);
  const value = useMemo(() => ({ entries, register, unregister, jumpTo }), [entries, register, unregister, jumpTo]);
  return <JumpContext.Provider value={value}>{children}</JumpContext.Provider>;
}

/** A scrolling strip of the sections in the reading below. Tap one to jump to it. */
export function ReadingContents() {
  const { entries, jumpTo } = useContext(JumpContext);
  const lens = useReadingLens();
  if (entries.length < 3) return null;
  return (
    <View style={styles.contents}>
      <Text style={[styles.contentsLabel, { color: LENS_TEXT[lens] }]}>In this reading</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.contentsRow}>
        {entries.map((e) => (
          <Pressable
            key={e.id}
            accessibilityRole="button"
            accessibilityLabel={`Jump to ${e.title}`}
            onPress={() => jumpTo(e.id)}
            style={({ pressed }) => [styles.contentsChip, { borderColor: LENS_COLOR[lens] }, pressed && styles.pressed]}
          >
            <Text numberOfLines={1} style={styles.contentsChipText}>{e.title}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

export function Block({ label, text }: { label: string; text: string | null | undefined }) {
  const lens = useReadingLens();
  if (!text) return null;
  return (
    <View style={styles.block}>
      <Text style={[styles.blockLabel, { color: LENS_TEXT[lens] }]}>{sentence(label)}</Text>
      <Text style={styles.body}>{text}</Text>
    </View>
  );
}

export function Bullets({ label, items }: { label: string; items: readonly string[] }) {
  const lens = useReadingLens();
  if (!items.length) return null;
  return (
    <View style={styles.block}>
      <Text style={[styles.blockLabel, { color: LENS_TEXT[lens] }]}>{sentence(label)}</Text>
      {items.map((t) => (
        <View key={t} style={styles.bulletRow}>
          <Text style={[styles.bulletDot, { color: LENS_TEXT[lens] }]}>•</Text>
          <Text style={[styles.body, styles.bulletText]}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

export function Chips({ label, items }: { label: string; items: readonly string[] }) {
  const lens = useReadingLens();
  if (!items.length) return null;
  return (
    <View style={styles.block}>
      <Text style={[styles.blockLabel, { color: LENS_TEXT[lens] }]}>{sentence(label)}</Text>
      <View style={styles.chipWrap}>
        {items.map((t) => (
          <View key={t} style={styles.chip}>
            <Text style={styles.chipText}>{t}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function SectionTitle({ eyebrow, title, note }: { eyebrow: string; title: string; note?: string }) {
  const lens = useReadingLens();
  const jump = useContext(JumpContext);
  const ref = useRef<View>(null);
  const { register, unregister } = jump;
  useEffect(() => {
    register({ id: title, title, ref });
    return () => unregister(title);
  }, [title, register, unregister]);
  return (
    <View ref={ref} collapsable={false} style={styles.sectionHead}>
      <View style={styles.eyebrowRow}>
        <LensIcon lens={lens} size={11} />
        <Text style={[styles.eyebrow, { color: LENS_TEXT[lens] }]}>{sentence(eyebrow)}</Text>
      </View>
      <Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>
      {note ? <Text style={styles.sub}>{note}</Text> : null}
    </View>
  );
}

/** A plain card with a short paragraph. */
export function NoteCard({ text }: { text: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <Text style={[styles.body, styles.noteText]}>{text}</Text>
      </View>
    </View>
  );
}

export function Footnote({ text }: { text: string }) {
  return <Text style={styles.footnote}>{text}</Text>;
}

/** A card that opens to reveal the full interpretation. */
export function Accordion({
  accent, badge, title, subtitle, defaultOpen = false, now = false, children,
}: {
  accent: string;
  badge: string;
  title: string;
  subtitle?: string | null;
  defaultOpen?: boolean;
  now?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={[styles.card, now && { borderColor: accent, borderWidth: 2 }]}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${title}. ${subtitle ?? ''}${now ? ' Active now.' : ''} ${open ? 'Expanded.' : 'Double tap to read.'}`}
        style={({ pressed }) => [styles.cardHead, pressed && styles.pressed]}
      >
        <View style={[styles.badge, { borderColor: accent }]}>
          <Text style={styles.badgeText} numberOfLines={1} adjustsFontSizeToFit>
            {badge}
          </Text>
        </View>
        <View style={styles.headText}>
          {now ? <Text style={styles.nowTag}>Active now</Text> : null}
          <Text style={styles.cardTitle}>{title}</Text>
          {subtitle ? <Text style={styles.cardSub} numberOfLines={open ? undefined : 2}>{subtitle}</Text> : null}
        </View>
        <Text style={[styles.chevron, open && { transform: [{ rotate: '90deg' }] }]}>›</Text>
      </Pressable>
      {open ? <View style={styles.cardBody}>{children}</View> : null}
    </View>
  );
}

/** Loading / error wrapper shared by the readings. */
export function ReadingStatus({
  loading, error, hasData, loadingText, onRetry, offline = false, savedAt = null, children,
}: {
  loading: boolean;
  error: string | null;
  hasData: boolean;
  loadingText: string;
  onRetry: () => void;
  /** True when the server could not be reached and a saved copy is showing. */
  offline?: boolean;
  savedAt?: number | null;
  children: ReactNode;
}) {
  if (loading && !hasData) {
    return (
      <View style={styles.center} accessibilityLiveRegion="polite">
        <ActivityIndicator color={colors.gold} />
        <Text style={styles.sub}>{loadingText}</Text>
      </View>
    );
  }
  if (error && !hasData) {
    return (
      <View style={styles.center}>
        <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
        <GoldButton label="Try again" variant="ghost" onPress={onRetry} />
      </View>
    );
  }
  return hasData ? (
    <>
      {offline ? <OfflineNote savedAt={savedAt} /> : null}
      {children}
    </>
  ) : null;
}

const styles = StyleSheet.create({
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 0.3 },
  contents: { gap: 6 },
  contentsLabel: { fontFamily: fonts.bodyBold, fontSize: 13 },
  contentsRow: { gap: 8, paddingRight: space.md },
  contentsChip: { minHeight: 44, maxWidth: 190, paddingHorizontal: 14, justifyContent: 'center', borderRadius: radius.md, borderWidth: 1, backgroundColor: colors.charcoal },
  contentsChipText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.parchment },
  sub: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.parchmentMuted },
  center: { alignItems: 'center', gap: space.md, paddingVertical: space.xxl },
  error: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.danger, textAlign: 'center' },
  sectionHead: { gap: 6, marginTop: space.lg },
  sectionTitle: { fontFamily: fonts.display, fontSize: 24, lineHeight: 30, color: colors.parchment },
  footnote: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.parchmentMuted },
  card: {
    borderRadius: radius.lg,
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.hairline,
    overflow: 'hidden',
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, minHeight: 64 },
  pressed: { backgroundColor: colors.amethyst },
  badge: {
    minWidth: 48,
    height: 48,
    paddingHorizontal: 8,
    borderRadius: 24,
    borderWidth: 2,
    backgroundColor: colors.amethyst,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 17, color: colors.parchment },
  headText: { flex: 1, gap: 2 },
  nowTag: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.gold },
  cardTitle: { fontFamily: fonts.bodyBold, fontSize: 17, lineHeight: 23, color: colors.parchment },
  cardSub: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.parchmentMuted },
  chevron: { fontFamily: fonts.bodyBold, fontSize: 22, color: colors.parchmentMuted, width: 24, textAlign: 'center' },
  cardBody: { gap: space.md, paddingHorizontal: space.md, paddingBottom: space.md },
  noteText: { paddingTop: space.md },
  block: { gap: 4 },
  blockLabel: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 0.2 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 25, color: colors.parchment },
  bulletRow: { flexDirection: 'row', gap: 8 },
  bulletDot: { fontFamily: fonts.body, fontSize: 16, lineHeight: 25, color: colors.gold },
  bulletText: { flex: 1 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.amethyst,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.parchment },
});
