import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { GoldButton } from '@/components/GoldButton';
import { isReduceMotion } from '@/lib/motion';
import { space } from '@/theme/tokens';

/**
 * The brand opening shown once the chart is calculated, before the reading starts.
 * The picture fades in slowly and settles; the button arrives after it so the eye lands on the picture first.
 * With Reduce Motion on, both appear at once.
 */
export function IntroReveal({ onContinue }: { onContinue: () => void }) {
  const picture = useSharedValue(0);
  const button = useSharedValue(0);

  useEffect(() => {
    if (isReduceMotion()) {
      picture.value = 1;
      button.value = 1;
      return;
    }
    picture.value = withTiming(1, { duration: 1100, easing: Easing.bezier(0.22, 1, 0.36, 1) });
    button.value = withDelay(1500, withTiming(1, { duration: 500 }));
  }, [picture, button]);

  const pictureStyle = useAnimatedStyle(() => ({
    opacity: picture.value,
    transform: [{ scale: 0.97 + 0.03 * picture.value }],
  }));
  const buttonStyle = useAnimatedStyle(() => ({ opacity: button.value }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={pictureStyle}>
        <Image
          source={require('../../assets/images/intro-t3d.jpg')}
          contentFit="contain"
          accessible
          accessibilityLabel="The 3 Dimensions. Align your vehicle. Follow your road. Obey the signals. Astrology, numerology, human design."
          style={styles.picture}
        />
      </Animated.View>
      <Animated.View style={buttonStyle}>
        <GoldButton label="Begin my reading" onPress={onContinue} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xl, paddingTop: 96 },
  picture: { width: '100%', aspectRatio: 1672 / 941 },
});
