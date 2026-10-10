import { useId } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

interface Props {
  color: string;
  /** Strength at the brightest point, 0 to 1. */
  opacity?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * A soft pool of colour that fades to nothing at every edge.
 * Replaces the old hard-edged purple circle, which cut across text when the page scrolled.
 * Purely decorative, so it is hidden from screen readers and ignores touches.
 */
export function Glow({ color, opacity = 0.6, style }: Props) {
  const id = `glow${useId().replace(/\W/g, '')}`;
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.fill, style]}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id={id} cx="50%" cy="0%" rx="75%" ry="100%" fx="50%" fy="0%">
            <Stop offset="0" stopColor={color} stopOpacity={opacity} />
            <Stop offset="0.45" stopColor={color} stopOpacity={opacity * 0.45} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, left: 0, right: 0, height: 420 },
});
