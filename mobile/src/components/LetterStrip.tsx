import { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { select } from '@/lib/haptics';
import { LETTER_ITEM as ITEM, LETTER_PAD as STRIP_PAD, letterAt } from '@/lib/letterStrip';
import { colors, fonts, radius } from '@/theme/tokens';


/**
 * A vertical A to Z strip for the right edge of a long list. Tap a letter or slide a finger along the
 * strip to jump; a large letter appears beside it while you touch. VoiceOver users swipe up or down on it
 * to step through the letters.
 */
export function LetterStrip({ letters, onJump }: { letters: string[]; onJump: (letter: string) => void }) {
  const [active, setActive] = useState<string | null>(null);
  const [voiceIndex, setVoiceIndex] = useState(0);
  const last = useRef<string | null>(null);
  const lettersRef = useRef(letters);
  lettersRef.current = letters;
  const jumpRef = useRef(onJump);
  jumpRef.current = onJump;

  const go = (y: number) => {
    const list = lettersRef.current;
    const L = list[letterAt(y - STRIP_PAD, list.length)];
    if (!L) return;
    setActive(L);
    if (last.current !== L) {
      last.current = L;
      select();
      jumpRef.current(L);
    }
  };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => go(e.nativeEvent.locationY),
        onPanResponderMove: (e) => go(e.nativeEvent.locationY),
        onPanResponderRelease: () => { last.current = null; setActive(null); },
        onPanResponderTerminate: () => { last.current = null; setActive(null); },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const step = (delta: number) => {
    const next = Math.min(letters.length - 1, Math.max(0, voiceIndex + delta));
    setVoiceIndex(next);
    const L = letters[next];
    if (L) onJump(L);
  };

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      {active ? (
        <View pointerEvents="none" style={styles.bubble} accessibilityElementsHidden importantForAccessibility="no">
          <Text style={styles.bubbleText}>{active}</Text>
        </View>
      ) : null}
      <View
        {...pan.panHandlers}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Jump to letter"
        accessibilityValue={{ text: letters[voiceIndex] ?? '' }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
        style={styles.strip}
      >
        {letters.map((L) => (
          <View key={L} pointerEvents="none" style={styles.item}>
            <Text style={[styles.letter, active === L && styles.letterOn]}>{L}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, bottom: 0, right: 2, flexDirection: 'row', alignItems: 'center' },
  strip: { width: 30, paddingVertical: STRIP_PAD, borderRadius: radius.md, backgroundColor: 'rgba(18,18,20,0.72)' },
  item: { height: ITEM, alignItems: 'center', justifyContent: 'center' },
  letter: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.gold },
  letterOn: { color: colors.parchment },
  bubble: {
    width: 64,
    height: 64,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.amethyst,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  bubbleText: { fontFamily: fonts.display, fontSize: 34, color: colors.gold },
});
