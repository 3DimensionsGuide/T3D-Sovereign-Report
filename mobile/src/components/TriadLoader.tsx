import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming, type SharedValue,
} from 'react-native-reanimated';
import { LensIcon, type LensName } from '@/components/Lens';
import { useReduceMotion } from '@/lib/motion';

const ORDER: LensName[] = ['vehicle', 'road', 'stoplight'];
const LOOP_MS = 1800;

/**
 * The T3D wait indicator: the three lens shapes light one after another, like a signal changing
 * (Vehicle, then Road, then Stoplight), and repeat until the content arrives.
 * With Reduce Motion on, all three stay lit and still. Always say what is loading in the text beside it.
 */
export function TriadLoader({ size = 18 }: { size?: number }) {
  const phase = useSharedValue(0);
  const reduce = useReduceMotion();

  useEffect(() => {
    if (reduce) {
      cancelAnimation(phase);
      phase.value = 0;
      return;
    }
    phase.value = withRepeat(withTiming(3, { duration: LOOP_MS, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(phase);
  }, [phase, reduce]);

  return (
    <View
      style={[styles.row, { gap: Math.round(size * 0.6) }]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    >
      {ORDER.map((lens, i) => (
        <Shape key={lens} lens={lens} index={i} phase={phase} size={size} still={reduce} />
      ))}
    </View>
  );
}

function Shape({
  lens, index, phase, size, still,
}: { lens: LensName; index: number; phase: SharedValue<number>; size: number; still: boolean }) {
  const style = useAnimatedStyle(() => {
    // How close this shape is to being "the lit one" right now: 1 when it is its turn, falling to 0 a turn away.
    const raw = Math.abs(((phase.value - index + 4.5) % 3) - 1.5);
    const strength = still ? 1 : Math.max(0, 1 - raw);
    return { opacity: 0.35 + 0.65 * strength, transform: [{ scale: 0.88 + 0.2 * strength }] };
  });
  return (
    <Animated.View style={style}>
      <LensIcon lens={lens} size={size} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' } });
