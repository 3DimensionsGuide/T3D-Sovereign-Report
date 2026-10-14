import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LensIcon, LENS_TEXT, type LensName } from '@/components/Lens';
import { Pressable } from '@/components/Pressable';
import { Chevron } from '@/components/Chevron';
import { select } from '@/lib/haptics';
import { animateLayout } from '@/lib/motion';
import { colors, fonts, radius, space } from '@/theme/tokens';

const KEY = 't3d-fold-v1:';

interface Props {
  /** Stable name, so the open or closed choice is remembered between visits. */
  id: string;
  lens: LensName;
  title: string;
  /** One line saying what is inside, shown while the fold is closed. */
  hint: string;
  /** A short flag shown in the header while the fold is closed, such as "Day 2 of 7". */
  badge?: string | null;
  children: ReactNode;
}

/**
 * A card that keeps a long page short: one tappable header, the content underneath when opened.
 * It remembers whether the person left it open. The lens shape and a text label carry the meaning,
 * never colour alone.
 */
export function Fold({ id, lens, title, hint, badge, children }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let live = true;
    AsyncStorage.getItem(KEY + id)
      .then((v) => { if (live && v === '1') setOpen(true); })
      .catch(() => undefined);
    return () => { live = false; };
  }, [id]);

  const toggle = () => {
    select();
    const next = !open;
    animateLayout();
    setOpen(next);
    AsyncStorage.setItem(KEY + id, next ? '1' : '0').catch(() => undefined);
  };

  return (
    <View style={open ? styles.openWrap : styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${title}. ${badge && !open ? `${badge}, today's stop. ` : ''}${hint}. ${open ? 'Expanded.' : 'Double tap to open.'}`}
        onPress={toggle}
        style={styles.head}
      >
        <LensIcon lens={lens} size={16} />
        <View style={styles.headText}>
          <Text style={[styles.title, { color: LENS_TEXT[lens] }]}>{title}</Text>
          {!open ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
        {badge && !open ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
        <Chevron open={open} style={styles.chevron} />
      </Pressable>
      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline,
    backgroundColor: colors.charcoal, paddingHorizontal: space.lg, paddingVertical: space.sm,
  },
  // Open: no outer box, so the cards inside keep their full width and are not boxed twice.
  openWrap: { gap: space.sm },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 56 },
  headText: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.bodyBold, fontSize: 16 },
  hint: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.parchmentMuted },
  chevron: { fontFamily: fonts.bodyBold, fontSize: 24, lineHeight: 26, color: colors.parchmentMuted },
  badge: { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.gold, paddingHorizontal: 10, minHeight: 28, justifyContent: 'center' },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.gold },
  body: { gap: space.md },
});
