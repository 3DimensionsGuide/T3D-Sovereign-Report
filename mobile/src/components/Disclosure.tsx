import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/components/Pressable';
import { Chevron } from '@/components/Chevron';
import { select } from '@/lib/haptics';
import { animateLayout } from '@/lib/motion';
import { colors, fonts, space, TOUCH } from '@/theme/tokens';

interface Props {
  /** What the tap opens, in plain words: "How to use today", "More about the Moon". */
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

/**
 * A quiet "tap to read more" row. The label stays the same open or closed; only the chevron turns,
 * and the screen reader hears whether it is expanded. Keeps the daily screen short without hiding anything.
 */
export function Disclosure({ label, children, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${label}. ${open ? 'Expanded.' : 'Double tap to read.'}`}
        onPress={() => {
          select();
          animateLayout();
          setOpen((o) => !o);
        }}
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.label}>{label}</Text>
        <Chevron open={open} style={styles.chevron} />
      </Pressable>
      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: TOUCH },
  label: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.gold },
  chevron: { fontFamily: fonts.bodyBold, fontSize: 22, lineHeight: 24, color: colors.gold },
  body: { gap: space.sm },
});
