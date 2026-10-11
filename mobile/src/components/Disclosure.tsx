import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { select } from '@/lib/haptics';
import { colors, fonts, space } from '@/theme/tokens';

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
          setOpen((o) => !o);
        }}
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.chevron, open && { transform: [{ rotate: '90deg' }] }]}>›</Text>
      </Pressable>
      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 },
  label: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.gold },
  chevron: { fontFamily: fonts.bodyBold, fontSize: 22, lineHeight: 24, color: colors.gold },
  body: { gap: space.sm },
});
