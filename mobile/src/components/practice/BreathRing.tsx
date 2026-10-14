import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LensIcon } from '@/components/Lens';
import { GoldButton } from '@/components/GoldButton';
import { colors, fonts, radius, themes } from '@/theme/tokens';

const T = themes.practice;

const BREATHS = 3;
const COUNT_MS = 4000;
const SIZE = 132;

/**
 * A slow breathing ring for the Sacral check. Tapping the button plays three breaths once (four seconds in,
 * four seconds out), then rests. Only opacity and transform move. With Reduce Motion on, the ring stays
 * still and the words carry the pacing.
 */
export function BreathRing() {
  const progress = useRef(new Animated.Value(0)).current;
  const [reduce, setReduce] = useState(false);
  const [step, setStep] = useState(-1); // -1 = not started, 0..(2*BREATHS-1) running, 2*BREATHS = finished
  const total = BREATHS * 2;
  const running = step >= 0 && step < total;
  const finished = step >= total;

  useEffect(() => {
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((r) => alive && setReduce(r));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    const inhale = step % 2 === 0;
    const anim = Animated.timing(progress, {
      toValue: inhale ? 1 : 0,
      duration: COUNT_MS,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    });
    anim.start(({ finished: ok }) => {
      if (ok) setStep((s) => s + 1);
    });
    return () => anim.stop();
  }, [step, running, progress]);

  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.62, 1] });
  const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });

  const word = running ? (step % 2 === 0 ? 'Breathe in' : 'Breathe out') : finished ? 'Now ask' : 'Ready';
  const breathNo = running ? Math.floor(step / 2) + 1 : 0;

  return (
    <View style={styles.wrap}>
      <View
        accessible
        accessibilityLabel="Breathing guide"
        accessibilityLiveRegion="polite"
        accessibilityValue={{ text: running ? `${word}, breath ${breathNo} of ${BREATHS}` : word }}
        style={styles.stage}
      >
        <Animated.View style={[styles.ring, !reduce && { opacity, transform: [{ scale }] }]} />
        <View style={styles.center}>
          <LensIcon lens="vehicle" size={20} />
          <Text maxFontSizeMultiplier={1.3} style={styles.word}>{word}</Text>
          {running ? <Text maxFontSizeMultiplier={1.3} style={styles.count}>{`Breath ${breathNo} of ${BREATHS}`}</Text> : null}
        </View>
      </View>
      <Text maxFontSizeMultiplier={1.3} style={styles.note}>
        {finished
          ? 'Put your question in plain yes-or-no words and notice the first response in your body.'
          : reduce
            ? `Breathe in slowly for four counts and out for four. Do this ${BREATHS} times, then ask your question.`
            : 'Optional. Three slow breaths settle the mind so your body answers first.'}
      </Text>
      {!reduce && !running ? (
        <GoldButton label={finished ? 'Breathe again' : 'Take three slow breaths'} variant="ghost" onPress={() => { progress.setValue(0); setStep(0); }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.md, backgroundColor: colors.obsidian, borderWidth: 1, borderColor: T.edge },
  stage: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: 3, borderColor: colors.vehicle, backgroundColor: 'rgba(229,169,60,0.10)' },
  center: { alignItems: 'center', gap: 3 },
  word: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.parchment },
  count: { fontFamily: fonts.body, fontSize: 13, color: colors.parchmentMuted },
  note: { alignSelf: 'stretch', fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted, textAlign: 'center' },
});
