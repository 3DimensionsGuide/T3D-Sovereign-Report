import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { GoldButton } from '@/components/GoldButton';
import { OfflineNote } from '@/components/OfflineNote';
import { colors, fonts, radius, space } from '@/theme/tokens';

/**
 * Shared building blocks for the long-form readings (Vehicle, Road, Stoplight).
 * `accent` is the system colour: amber (Vehicle), emerald (Road), crimson (Stoplight).
 */

export function Block({ label, text }: { label: string; text: string | null | undefined }) {
  if (!text) return null;
  return (
    <View style={styles.block}>
      <Text style={styles.blockLabel}>{label}</Text>
      <Text style={styles.body}>{text}</Text>
    </View>
  );
}

export function Bullets({ label, items }: { label: string; items: readonly string[] }) {
  if (!items.length) return null;
  return (
    <View style={styles.block}>
      <Text style={styles.blockLabel}>{label}</Text>
      {items.map((t) => (
        <View key={t} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={[styles.body, styles.bulletText]}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

export function Chips({ label, items }: { label: string; items: readonly string[] }) {
  if (!items.length) return null;
  return (
    <View style={styles.block}>
      <Text style={styles.blockLabel}>{label}</Text>
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
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
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
  const darkText = accent === colors.vehicle;
  return (
    <View style={[styles.card, now && { borderColor: accent, borderWidth: 2 }]}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${title}. ${subtitle ?? ''}${now ? ' Active now.' : ''} ${open ? 'Expanded.' : 'Double tap to read.'}`}
        style={({ pressed }) => [styles.cardHead, pressed && styles.pressed]}
      >
        <View style={[styles.badge, { backgroundColor: accent }]}>
          <Text style={[styles.badgeText, darkText && { color: colors.obsidian }]} numberOfLines={1} adjustsFontSizeToFit>
            {badge}
          </Text>
        </View>
        <View style={styles.headText}>
          {now ? <Text style={styles.nowTag}>ACTIVE NOW</Text> : null}
          <Text style={styles.cardTitle}>{title}</Text>
          {subtitle ? <Text style={styles.cardSub} numberOfLines={open ? undefined : 2}>{subtitle}</Text> : null}
        </View>
        <Text style={styles.chevron}>{open ? '–' : '+'}</Text>
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
        <GoldButton label="TRY AGAIN" variant="ghost" onPress={onRetry} />
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
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 3, color: colors.gold },
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 17, color: '#FFFFFF' },
  headText: { flex: 1, gap: 2 },
  nowTag: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.6, color: colors.gold },
  cardTitle: { fontFamily: fonts.bodyBold, fontSize: 17, lineHeight: 23, color: colors.parchment },
  cardSub: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.parchmentMuted },
  chevron: { fontFamily: fonts.bodyBold, fontSize: 22, color: colors.parchmentMuted, width: 24, textAlign: 'center' },
  cardBody: { gap: space.md, paddingHorizontal: space.md, paddingBottom: space.md },
  noteText: { paddingTop: space.md },
  block: { gap: 4 },
  blockLabel: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.8, color: colors.gold },
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
