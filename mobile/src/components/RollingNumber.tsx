import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, type TextStyle } from 'react-native';

interface Props {
  value: string;
  style?: TextStyle | TextStyle[];
}

/**
 * Shows a number and, when it changes, rolls the old one up and out and the new one in from below, once.
 * The first value just appears. With Reduce Motion on, it swaps with no movement. Opacity and transform only.
 */
export function RollingNumber({ value, style }: Props) {
  const [shown, setShown] = useState(value);
  const opacity = useRef(new Animated.Value(1)).current;
  const y = useRef(new Animated.Value(0)).current;
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) {
        setShown(value);
        return;
      }
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 120, useNativeDriver: true }),
        Animated.timing(y, { toValue: -10, duration: 120, useNativeDriver: true }),
      ]).start(() => {
        if (cancelled) return;
        setShown(value);
        y.setValue(10);
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
          Animated.timing(y, { toValue: 0, duration: 220, useNativeDriver: true }),
        ]).start();
      });
    });
    return () => {
      cancelled = true;
    };
  }, [value, opacity, y]);

  return (
    <Animated.Text accessibilityElementsHidden importantForAccessibility="no" style={[style, { opacity, transform: [{ translateY: y }] }]}>
      {shown}
    </Animated.Text>
  );
}
