import { StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { DURATION } from '@/lib/motion';
import { useShake } from '@/lib/useShake';
import { colors, fonts } from '@/theme/tokens';

/**
 * The red line that says what to fix. It fades in, shakes once when the problem appears or happens again,
 * and is announced by screen readers. The warning sign means it is a problem without relying on colour.
 */
export function ErrorLine({ text, signal = 0, style }: { text: string; signal?: number; style?: StyleProp<TextStyle> }) {
  const shake = useShake(true, `${text}|${signal}`);
  return (
    <Animated.Text
      entering={FadeIn.duration(DURATION.open)}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={[styles.text, style, shake]}
    >
      {'⚠  '}
      {text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({ text: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.danger } });
