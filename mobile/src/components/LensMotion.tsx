import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';
import { LensIcon, type LensName } from '@/components/Lens';
import { LENS_MOTION } from '@/lib/lensMotion';

interface Props {
  lens: LensName;
  size?: number;
  color?: string;
  outline?: boolean;
  /** false = a still icon (share cards, and anywhere the picture must not move). */
  play?: boolean;
  /** Start invisible and fade in first, for a first appearance such as the seal. */
  enter?: boolean;
  /** Milliseconds to wait before playing, so several icons can go one after another. */
  delay?: number;
  /** Plays again whenever this changes, such as the lamp state of a day. */
  replayKey?: string | number | null;
}

/**
 * A lens icon that moves the way its lens moves (lib/lensMotion.ts): Vehicle pulses, Road slides
 * forward, Stoplight blinks. It plays once when it appears and again when `replayKey` changes.
 * Only opacity and transforms animate, and with Reduce Motion on the icon simply stays still.
 */
export function MotionLensIcon({ lens, size = 16, color, outline, play = true, enter = false, delay = 0, replayKey }: Props) {
  const opacity = useRef(new Animated.Value(enter && play ? 0 : 1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const shift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!play) {
      opacity.setValue(1);
      return undefined;
    }
    let cancelled = false;
    let running: Animated.CompositeAnimation | null = null;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) {
        opacity.setValue(1);
        scale.setValue(1);
        shift.setValue(0);
        return;
      }
      const spec = LENS_MOTION[lens];
      const leg = (value: Animated.Value, to: number, ms = spec.legMs) =>
        Animated.timing(value, { toValue: to, duration: ms, easing: Easing.inOut(Easing.quad), useNativeDriver: true });
      const steps: Animated.CompositeAnimation[] = [Animated.delay(delay)];

      if (enter) {
        opacity.setValue(0);
        steps.push(leg(opacity, 1, 320));
      }
      if (spec.kind === 'pulse') {
        for (let i = 0; i < spec.repeats; i += 1) {
          steps.push(Animated.parallel([leg(scale, 1.28), leg(opacity, 0.72)]));
          steps.push(Animated.parallel([leg(scale, 1), leg(opacity, 1)]));
        }
      } else if (spec.kind === 'slide') {
        shift.setValue(-size * 0.7);
        steps.push(Animated.timing(shift, { toValue: 0, duration: spec.legMs, easing: Easing.out(Easing.cubic), useNativeDriver: true }));
      } else {
        for (let i = 0; i < spec.repeats; i += 1) {
          steps.push(leg(opacity, 0.25));
          steps.push(leg(opacity, 1));
        }
      }
      running = Animated.sequence(steps);
      running.start();
    });
    return () => {
      cancelled = true;
      running?.stop();
      scale.setValue(1);
      shift.setValue(0);
      opacity.setValue(1);
    };
  }, [lens, play, enter, delay, replayKey, size, opacity, scale, shift]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateX: shift }, { scale }] }}>
      <LensIcon lens={lens} size={size} color={color} outline={outline} />
    </Animated.View>
  );
}
