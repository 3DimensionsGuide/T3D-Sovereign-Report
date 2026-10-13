import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from 'react-native';
import { COLOR, Housing } from '@/components/SignalLamp';
import { success } from '@/lib/haptics';
import { LAMP_PHRASE, LAMP_WORD } from '@/lib/practiceLamps';
import type { LampState } from '@/lib/triadTypes';
import { colors, fonts, radius, space, themes } from '@/theme/tokens';

const T = themes.practice;

/**
 * The result of a decision: a lamp housing with the lit lamp, the word, and the sentence that says what it
 * means for this decision. It lights once with a soft haptic; with Reduce Motion on it simply appears.
 */
export function ResultLamp({ state, title, text, extra }: { state: LampState; title: string; text: string; extra?: string | null }) {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let cancelled = false;
    success();
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) fade.setValue(1);
      else Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    });
    return () => {
      cancelled = true;
    };
  }, [fade]);
  return (
    <Animated.View style={[styles.card, { opacity: fade, borderColor: COLOR[state] }]} accessibilityLiveRegion="polite">
      <View style={styles.top}>
        <Housing state={state} />
        <View style={styles.words}>
          <Text accessibilityRole="header" style={[styles.word, { color: COLOR[state] }]}>{LAMP_WORD[state]}</Text>
          <Text style={styles.phrase}>{LAMP_PHRASE[state]}</Text>
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{text}</Text>
      {extra ? <Text style={styles.small}>{extra}</Text> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10, padding: space.md, borderRadius: radius.md, backgroundColor: T.raised, borderWidth: 1 },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  words: { flex: 1, gap: 2 },
  word: { fontFamily: fonts.display, fontSize: 40, lineHeight: 46 },
  phrase: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 22, color: colors.parchment },
  title: { fontFamily: fonts.display, fontSize: 19, lineHeight: 26, color: colors.parchment },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.parchment },
  small: { fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 22, color: colors.parchmentMuted },
});
