import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { parallaxShift } from '@/lib/parallax';

/** Carries a background layer up at a fraction of the scroll speed. Decorative: ignores touches. */
export function ParallaxLayer({ scrollY, factor, children }: { scrollY: SharedValue<number>; factor: number; children: ReactNode }) {
  const style = useAnimatedStyle(() => {
    const y = scrollY.value;
    const shift = y <= 0 ? 0 : -Math.min(y, 220) * factor;
    return { transform: [{ translateY: shift }] };
  });
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      {children}
    </Animated.View>
  );
}
