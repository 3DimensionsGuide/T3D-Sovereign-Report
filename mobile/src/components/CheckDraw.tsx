import { useEffect } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { EASE, isReduceMotion } from '@/lib/motion';
import { colors } from '@/theme/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const RING = 2 * Math.PI * 10;
const MARK = 26;

/**
 * A ring that draws itself, then a mark inside it. A check means it worked; an exclamation mark means it did not.
 * The shape differs, so the meaning never rests on colour alone. Decorative: the words beside it carry the meaning.
 * With Reduce Motion on it appears already drawn.
 */
export function CheckDraw({ kind, size = 28 }: { kind: 'success' | 'error'; size?: number }) {
  const ring = useSharedValue(0);
  const mark = useSharedValue(0);
  useEffect(() => {
    if (isReduceMotion()) {
      ring.value = 1;
      mark.value = 1;
      return;
    }
    ring.value = 0;
    mark.value = 0;
    ring.value = withTiming(1, { duration: 320, easing: EASE });
    mark.value = withDelay(180, withTiming(1, { duration: 260, easing: EASE }));
  }, [kind, ring, mark]);

  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: RING * (1 - ring.value) }));
  const markProps = useAnimatedProps(() => ({ strokeDashoffset: MARK * (1 - mark.value) }));
  const color = kind === 'success' ? colors.gold : colors.danger;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <AnimatedCircle
        cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round"
        strokeDasharray={RING} animatedProps={ringProps} rotation={-90} origin="12, 12"
      />
      {kind === 'success' ? (
        <AnimatedPath
          d="M7.5 12.5 L10.8 15.8 L16.8 8.8" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={MARK} animatedProps={markProps}
        />
      ) : (
        <AnimatedPath
          d="M12 7.2 L12 13.2 M12 16.6 L12 16.7" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round"
          strokeDasharray={MARK} animatedProps={markProps}
        />
      )}
    </Svg>
  );
}
