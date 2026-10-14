import { useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Pressable } from '@/components/Pressable';
import { DURATION, EASE, isReduceMotion } from '@/lib/motion';
import { colors, fonts, radius, TOUCH } from '@/theme/tokens';
import { select } from '@/lib/haptics';
import { useRoomTheme } from '@/theme/RoomTheme';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  /** Optional drawn icon shown before the label. A function receives whether the option is selected, so the icon can stay readable on the gold pill. */
  icon?: ReactNode | ((selected: boolean) => ReactNode);
}

/** The label colour fades between its resting and selected colours in step with the sliding highlight. */
function SegmentLabel({ text, selected }: { text: string; selected: boolean }) {
  const on = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    on.value = isReduceMotion() ? (selected ? 1 : 0) : withTiming(selected ? 1 : 0, { duration: DURATION.open, easing: EASE });
  }, [selected, on]);
  const animated = useAnimatedStyle(() => ({ color: interpolateColor(on.value, [0, 1], [colors.parchmentMuted, colors.obsidian]) }));
  return (
    <Animated.Text numberOfLines={1} adjustsFontSizeToFit maxFontSizeMultiplier={1.15} style={[styles.label, selected && styles.labelSelected, animated]}>
      {text}
    </Animated.Text>
  );
}

/**
 * A row of mutually exclusive choices (like iOS segmented control), 52pt tall.
 * The gold highlight slides from the old choice to the new one, so the eye follows the change.
 */
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
  const spots = useRef<Record<string, { x: number; width: number }>>({});
  const [measured, setMeasured] = useState(0);
  const x = useSharedValue(0);
  const width = useSharedValue(0);
  const ready = useRef(false);

  useEffect(() => {
    const spot = spots.current[value];
    if (!spot) return;
    if (!ready.current || isReduceMotion()) {
      x.value = spot.x;
      width.value = spot.width;
      ready.current = true;
    } else {
      x.value = withTiming(spot.x, { duration: DURATION.open, easing: EASE });
      width.value = withTiming(spot.width, { duration: DURATION.open, easing: EASE });
    }
  }, [value, measured, x, width]);

  const pill = useAnimatedStyle(() => ({ width: width.value, transform: [{ translateX: x.value }], opacity: width.value > 0 ? 1 : 0 }));

  const th = useRoomTheme();
  return (
    <View style={[styles.frame, { backgroundColor: th.surface, borderColor: th.edge }]}>
      <View style={styles.row} accessibilityRole="tablist">
        <Animated.View pointerEvents="none" style={[styles.pill, pill]} />
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={opt.label}
              onLayout={(e) => {
                const { x: left, width: w } = e.nativeEvent.layout;
                const prev = spots.current[opt.value];
                if (!prev || prev.x !== left || prev.width !== w) {
                  spots.current[opt.value] = { x: left, width: w };
                  setMeasured((n) => n + 1);
                }
              }}
              onPress={() => {
                if (!selected) select();
                onChange(opt.value);
              }}
              style={({ pressed }) => [styles.item, compact && styles.compact, pressed && !selected && { backgroundColor: th.raised }]}
            >
              <View style={styles.inner}>
                {typeof opt.icon === 'function' ? opt.icon(selected) : opt.icon}
                <SegmentLabel text={opt.label} selected={selected} />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // The border sits on this outer frame so the highlight and the items share one coordinate space.
  frame: {
    borderRadius: radius.md,
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  row: { flexDirection: 'row', gap: 6, padding: 4 },
  pill: { position: 'absolute', top: 4, bottom: 4, left: 0, borderRadius: radius.sm + 2, backgroundColor: colors.gold },
  item: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 4,
    minHeight: TOUCH - 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm + 2,
  },
  compact: { minHeight: 48 },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: '100%' },
  pressed: { backgroundColor: colors.surface },
  label: { flexShrink: 1, fontFamily: fonts.bodyMedium, fontSize: 13, letterSpacing: 0.3, color: colors.parchmentMuted },
  labelSelected: { fontFamily: fonts.bodyBold, color: colors.obsidian },
});
