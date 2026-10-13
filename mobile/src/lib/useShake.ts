import { useEffect, useRef } from 'react';
import { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { isReduceMotion } from '@/lib/motion';

/**
 * A short sideways shake, about a third of a second and never more than 6 points, that points the eye at the thing to fix.
 * It plays when `key` changes while `active` is true (never on first show), and not at all when Reduce Motion is on.
 * The message and the border colour still carry the meaning without it.
 */
export function useShake(active: boolean, key: unknown) {
  const x = useSharedValue(0);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!active || isReduceMotion()) return;
    x.value = withSequence(
      withTiming(-6, { duration: 45 }),
      withTiming(6, { duration: 70 }),
      withTiming(-4, { duration: 70 }),
      withTiming(3, { duration: 60 }),
      withTiming(0, { duration: 50 }),
    );
  }, [key, active, x]);
  return useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
}
