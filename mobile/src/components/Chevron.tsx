import { useEffect } from 'react';
import { StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { DURATION, EASE, isReduceMotion } from '@/lib/motion';

/** The small › that turns a quarter turn when its card opens. It turns smoothly, or jumps when Reduce Motion is on. */
export function Chevron({ open, style }: { open: boolean; style?: StyleProp<TextStyle> }) {
  const turn = useSharedValue(open ? 1 : 0);
  useEffect(() => {
    turn.value = isReduceMotion() ? (open ? 1 : 0) : withTiming(open ? 1 : 0, { duration: DURATION.open, easing: EASE });
  }, [open, turn]);
  const animated = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value * 90}deg` }] }));
  return (
    <Animated.Text maxFontSizeMultiplier={1.3} accessibilityElementsHidden importantForAccessibility="no" style={[styles.base, style, animated]}>
      ›
    </Animated.Text>
  );
}

const styles = StyleSheet.create({ base: { textAlign: 'center' } });
