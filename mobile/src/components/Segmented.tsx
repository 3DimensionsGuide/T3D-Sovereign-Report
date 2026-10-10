import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, TOUCH } from '@/theme/tokens';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  /** Optional drawn icon shown before the label. */
  icon?: ReactNode;
}

/** A row of mutually exclusive choices (like iOS segmented control), 52pt tall. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  compact = false,
}: {
  options: ReadonlyArray<SegmentOption<T>>;
  value: T;
  onChange: (next: T) => void;
  compact?: boolean;
}) {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={opt.label}
            onPress={() => onChange(opt.value)}
            style={({ pressed }) => [
              styles.item,
              compact && styles.compact,
              selected && styles.selected,
              pressed && !selected && styles.pressed,
            ]}
          >
            <View style={styles.inner}>
              {opt.icon}
              <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.label, selected && styles.labelSelected]}>{opt.label}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    padding: 4,
    borderRadius: radius.md,
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  item: {
    flex: 1,
    minHeight: TOUCH - 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm + 2,
  },
  compact: { minHeight: 44 },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  selected: { backgroundColor: colors.gold },
  pressed: { backgroundColor: colors.amethyst },
  label: { fontFamily: fonts.bodyMedium, fontSize: 13, letterSpacing: 0.4, color: colors.parchmentMuted },
  labelSelected: { fontFamily: fonts.bodyBold, color: colors.obsidian },
});
