import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing, FadeIn, FadeInRight, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { GoldButton } from '@/components/GoldButton';
import { Glow } from '@/components/Glow';
import { LENS_LABEL, LENS_TEXT, type LensName } from '@/components/Lens';
import { MotionLensIcon } from '@/components/LensMotion';
import { TriadSeal } from '@/components/TriadSeal';
import { useReduceMotion } from '@/lib/motion';
import { useCoachStore } from '@/store/useCoachStore';
import { colors, fonts, guidance, space } from '@/theme/tokens';

const LENSES: { lens: LensName; line: string }[] = [
  { lens: 'vehicle', line: 'How you are built' },
  { lens: 'road', line: 'Where you are headed' },
  { lens: 'stoplight', line: 'When to move' },
];
const PAGES = 3;

/**
 * A short first-time tour: three screens, each showing one idea with one small movement.
 * 1. the three lenses, 2. what each one answers, 3. how to learn any term. It shows once, can be skipped
 * at any point, and with Reduce Motion on nothing moves.
 */
export function CoachTour() {
  const hydrated = useCoachStore((s) => s.hydrated);
  const seen = useCoachStore((s) => s.seen);
  const finish = useCoachStore((s) => s.finish);
  const reduce = useReduceMotion();
  const [page, setPage] = useState(0);

  // Replaying from About starts again at the first screen.
  useEffect(() => {
    if (!seen) setPage(0);
  }, [seen]);

  if (!hydrated || seen) return null;
  const last = page === PAGES - 1;
  const enter = reduce ? undefined : FadeInRight.duration(360).easing(Easing.bezier(0.22, 1, 0.36, 1));

  return (
    <Modal visible transparent animationType={reduce ? 'none' : 'fade'} onRequestClose={finish} accessibilityViewIsModal>
      <View style={styles.backdrop}>
        {/* A solid page, so nothing from the screen underneath shows through the words. */}
        <Glow color={colors.purple} opacity={0.7} style={styles.glow} />
        <View style={styles.sheet}>
          <Text style={styles.count} accessibilityLiveRegion="polite">{`${page + 1} of ${PAGES}`}</Text>
          <Animated.View key={page} entering={enter} style={styles.page}>
            {page === 0 ? <PageOne /> : page === 1 ? <PageTwo /> : <PageThree />}
          </Animated.View>
          <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {Array.from({ length: PAGES }, (_, i) => (
              <View key={i} style={[styles.dot, i === page && styles.dotOn]} />
            ))}
          </View>
          <View style={styles.actions}>
            <GoldButton label={last ? 'Show me my day' : 'Next'} onPress={() => (last ? finish() : setPage(page + 1))} />
            {last ? null : <GoldButton label="Skip" variant="ghost" onPress={finish} />}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function PageOne() {
  return (
    <>
      <TriadSeal size={120} animate />
      <Text accessibilityRole="header" style={styles.title}>Three lenses, one you.</Text>
      <Text style={guidance}>Your chart is read through three lenses that work together.</Text>
    </>
  );
}

function PageTwo() {
  return (
    <>
      <Text accessibilityRole="header" style={styles.title}>Each lens answers a question.</Text>
      <View style={styles.rows}>
        {LENSES.map((l, i) => (
          <View key={l.lens} style={styles.row} accessible accessibilityLabel={`${LENS_LABEL[l.lens]}. ${l.line}.`}>
            <MotionLensIcon lens={l.lens} size={26} enter delay={i * 600} />
            <View style={styles.rowText}>
              <Text style={[styles.lens, { color: LENS_TEXT[l.lens] }]}>{LENS_LABEL[l.lens]}</Text>
              <Text style={styles.line}>{l.line}</Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

function PageThree() {
  const pulse = useSharedValue(0);
  const reduce = useReduceMotion();
  useEffect(() => {
    if (reduce) return;
    // Two soft rings around the word, enough to say "this one", then still.
    pulse.value = withDelay(500, withRepeat(withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 0 })), 2));
  }, [pulse, reduce]);
  const ring = useAnimatedStyle(() => ({ opacity: 0.7 * (1 - pulse.value), transform: [{ scale: 1 + 0.5 * pulse.value }] }));
  return (
    <>
      <Text accessibilityRole="header" style={styles.title}>Tap any term.</Text>
      <Animated.View entering={FadeIn.delay(300).duration(400)} style={styles.sample} accessible accessibilityLabel="Your authority is Sacral. A term with a dotted underline.">
        <Text style={styles.sampleText}>Your authority is </Text>
        <View>
          <Text style={[styles.sampleText, styles.term]}>Sacral</Text>
          <Animated.View pointerEvents="none" style={[styles.ring, ring]} />
        </View>
      </Animated.View>
      <Text style={guidance}>Anything with a dotted underline opens a plain-language explanation.</Text>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.obsidian, justifyContent: 'center', padding: space.lg },
  glow: { height: 460 },
  sheet: { gap: space.lg },
  count: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.parchmentMuted, letterSpacing: 1 },
  page: { gap: space.lg, minHeight: 300, justifyContent: 'center' },
  title: { fontFamily: fonts.display, fontSize: 34, lineHeight: 42, color: colors.parchment },
  rows: { gap: space.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  rowText: { flex: 1, gap: 2 },
  lens: { fontFamily: fonts.bodyBold, fontSize: 15 },
  line: { fontFamily: fonts.displayRegular, fontSize: 22, lineHeight: 30, color: colors.parchment },
  sample: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingVertical: space.sm },
  sampleText: { fontFamily: fonts.displayRegular, fontSize: 24, lineHeight: 32, color: colors.parchment },
  term: {
    color: colors.gold, textDecorationLine: 'underline', textDecorationStyle: 'dotted', textDecorationColor: colors.gold,
  },
  ring: { position: 'absolute', left: -10, right: -10, top: -4, bottom: -4, borderRadius: 18, borderWidth: 1.5, borderColor: colors.gold },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.hairline },
  dotOn: { backgroundColor: colors.gold },
  actions: { gap: space.sm },
});
