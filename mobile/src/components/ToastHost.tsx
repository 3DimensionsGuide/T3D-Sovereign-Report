import { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckDraw } from '@/components/CheckDraw';
import { Pressable } from '@/components/Pressable';
import { DURATION, EASE, isReduceMotion } from '@/lib/motion';
import { useToastStore, type Toast } from '@/store/useToastStore';
import { colors, fonts, heroCard, radius, space } from '@/theme/tokens';

const SHOW_MS = 2800;

/**
 * Where confirmations appear: a small pill under the status bar that slides down, draws its check, then leaves.
 * It lives at the top of the app, so it stays visible when the screen underneath changes.
 */
export function ToastHost() {
  const current = useToastStore((s) => s.toast);
  const insets = useSafeAreaInsets();
  const [shown, setShown] = useState<Toast | null>(null);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!current) {
      progress.value = isReduceMotion() ? 0 : withTiming(0, { duration: DURATION.press * 2, easing: EASE });
      return;
    }
    setShown(current);
    progress.value = isReduceMotion() ? 1 : withTiming(1, { duration: DURATION.open, easing: EASE });
    void AccessibilityInfo.announceForAccessibility(current.text);
    const timer = setTimeout(() => useToastStore.getState().hide(current.id), SHOW_MS);
    return () => clearTimeout(timer);
  }, [current, progress]);

  const animated = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * -18 }],
  }));

  if (!shown) return null;
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { top: insets.top + space.sm }]}>
      <Animated.View style={animated} pointerEvents={current ? 'auto' : 'none'}>
        <Pressable
          accessibilityRole="alert"
          accessibilityLabel={`${shown.kind === 'success' ? 'Done' : 'Problem'}. ${shown.text}`}
          onPress={() => useToastStore.getState().hide(shown.id)}
          style={[styles.pill, shown.kind === 'error' && styles.pillError]}
        >
          <CheckDraw key={shown.id} kind={shown.kind} />
          <Text maxFontSizeMultiplier={1.3} style={styles.text}>{shown.text}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: space.md, right: space.md, alignItems: 'center', zIndex: 50 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm, maxWidth: 520,
    minHeight: 48, paddingVertical: 10, paddingHorizontal: space.md,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.charcoal,
    ...heroCard,
  },
  pillError: { borderColor: colors.danger },
  text: { flexShrink: 1, fontFamily: fonts.bodyBold, fontSize: 15, lineHeight: 21, color: colors.parchment },
});
