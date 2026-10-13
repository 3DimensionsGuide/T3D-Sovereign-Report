import { teaser } from '@/lib/teaser';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/components/Pressable';
import { LENS_LABEL, LENS_TEXT, SIGNAL_COLOR, SignalMarker, type LensName, type SignalKind } from '@/components/Lens';
import { lensTap } from '@/lib/haptics';
import { MotionLensIcon } from '@/components/LensMotion';
import type { DailySignal, Lamp, LampState } from '@/lib/triadTypes';
import { colors, fonts, heroCard, radius, space } from '@/theme/tokens';

/**
 * The T3D signal lamp. A real three-lamp housing, top to bottom: Pause, Slow, Go.
 * Only the lit lamp is filled. Every lamp has its own shape AND a written word, so the meaning
 * never depends on colour: Go = ringed check, Slow = hexagon with a mark, Pause = square with a bar.
 * These are conditions, never a decision: the words say so.
 */
export const WORD: Record<LampState, string> = { go: 'Go', slow: 'Slow', pause: 'Pause' };
export const PHRASE: Record<LampState, string> = {
  go: 'Conditions are open',
  slow: 'Go carefully',
  pause: 'Conditions favor waiting',
};
export const SHAPE: Record<LampState, SignalKind> = { go: 'flow', slow: 'caution', pause: 'friction' };
export const COLOR: Record<LampState, string> = {
  go: SIGNAL_COLOR.flow, slow: SIGNAL_COLOR.caution, pause: SIGNAL_COLOR.friction,
};
const HOUSING_ORDER: LampState[] = ['pause', 'slow', 'go'];

/** The lit lamp breathes very slowly; with Reduce Motion on it stays still. */
function usePulse(): Animated.Value {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled || reduce) return;
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 0.72, duration: 1600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 1600, useNativeDriver: true }),
        ]),
      );
      loop.start();
    });
    return () => {
      cancelled = true;
      loop?.stop();
    };
  }, [pulse]);
  return pulse;
}

export function Housing({ state }: { state: LampState }) {
  const pulse = usePulse();
  return (
    <View style={styles.housing} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {HOUSING_ORDER.map((s) => {
        const lit = s === state;
        return (
          <Animated.View
            key={s}
            style={[
              styles.lamp,
              lit
                ? { borderColor: COLOR[s], backgroundColor: 'rgba(245,245,243,0.06)', shadowColor: COLOR[s], opacity: pulse }
                : styles.lampOff,
            ]}
          >
            <SignalMarker kind={SHAPE[s]} size={lit ? 34 : 26} color={lit ? COLOR[s] : 'rgba(245,245,243,0.28)'} />
          </Animated.View>
        );
      })}
    </View>
  );
}

/** "2 go, 1 pause": a plain count of the lens lamps, so the overall line needs no paragraph. */
export function lampTally(signal: DailySignal): string {
  const states = [signal.vehicle, signal.road, signal.stoplight].filter((l): l is Lamp => !!l).map((l) => l.state);
  const part = (s: LampState) => {
    const n = states.filter((x) => x === s).length;
    return n ? `${n} ${s}` : null;
  };
  return `${[part('go'), part('slow'), part('pause')].filter(Boolean).join(', ')}. Conditions, not a decision.`;
}

/**
 * One line per lens: shape, word and the start of the reason. Tap it to read the full sentence.
 * A lens with nothing to read is a plain line with no tap.
 */
function LensRow({ lens, lamp, missing }: { lens: LensName; lamp: Lamp | null; missing: string }) {
  const [open, setOpen] = useState(false);
  const word = lamp ? WORD[lamp.state] : 'Not read';
  const text = lamp ? lamp.reason : missing;
  const body = (
    <>
      <View style={styles.rowHead}>
        <MotionLensIcon lens={lens} size={13} replayKey={lamp?.state ?? null} />
        <Text maxFontSizeMultiplier={1.3} style={[styles.lensName, { color: LENS_TEXT[lens] }]}>{LENS_LABEL[lens]}</Text>
        <View style={styles.rowWord}>
          {lamp ? <SignalMarker kind={SHAPE[lamp.state]} size={14} color={COLOR[lamp.state]} /> : null}
          <Text maxFontSizeMultiplier={1.3} style={styles.rowWordText}>{word}</Text>
          {text ? <Text maxFontSizeMultiplier={1.3} style={[styles.chevron, open && { transform: [{ rotate: '90deg' }] }]}>›</Text> : null}
        </View>
      </View>
      {text ? <Text maxFontSizeMultiplier={1.3} style={styles.rowText} numberOfLines={open ? undefined : 1}>{open ? text : teaser(text, 40)}</Text> : null}
    </>
  );
  if (!text) {
    return <View accessible accessibilityLabel={`${LENS_LABEL[lens]}, ${word}.`} style={styles.row}>{body}</View>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      accessibilityLabel={`${LENS_LABEL[lens]}, ${word}. ${text} ${open ? 'Expanded.' : 'Double tap to read in full.'}`}
      onPress={() => {
        lensTap(lens);
        setOpen((o) => !o);
      }}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.75 }]}
    >
      {body}
    </Pressable>
  );
}

interface Props {
  signal: DailySignal;
  isToday: boolean;
}

export function SignalLamp({ signal, isToday }: Props) {
  const { overall } = signal;
  return (
    <View style={styles.card}>
      <Text maxFontSizeMultiplier={1.3} accessibilityRole="header" style={styles.title}>{isToday ? 'The signal today' : 'The signal for this day'}</Text>

      <View
        accessible
        accessibilityLiveRegion="polite"
        accessibilityLabel={`Overall signal: ${WORD[overall.state]}. ${PHRASE[overall.state]}. ${overall.reason}`}
        style={styles.hero}
      >
        <Housing state={overall.state} />
        <View style={styles.heroText}>
          <Text maxFontSizeMultiplier={1.3} style={[styles.word, { color: COLOR[overall.state] }]}>{WORD[overall.state]}</Text>
          <Text maxFontSizeMultiplier={1.3} style={styles.phrase}>{PHRASE[overall.state]}</Text>
          <Text maxFontSizeMultiplier={1.3} style={styles.reason}>{lampTally(signal)}</Text>
        </View>
      </View>

      <View style={styles.rows}>
        <LensRow lens="vehicle" lamp={signal.vehicle} missing="Your Vehicle needs your Human Design chart to read." />
        <LensRow lens="road" lamp={signal.road} missing="" />
        <LensRow lens="stoplight" lamp={signal.stoplight} missing="" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.charcoal, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline,
    padding: space.lg, gap: space.md,
    ...heroCard,
  },
  title: { fontFamily: fonts.display, fontSize: 22, lineHeight: 29, color: colors.parchment },
  hero: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  housing: {
    width: 64, paddingVertical: 8, gap: 8, alignItems: 'center',
    borderRadius: 32, backgroundColor: colors.obsidian, borderWidth: 1, borderColor: colors.hairline,
  },
  lamp: {
    width: 48, height: 48, borderRadius: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.9, shadowRadius: 10, shadowOffset: { width: 0, height: 0 },
  },
  lampOff: { borderColor: 'rgba(245,245,243,0.14)', backgroundColor: 'transparent', shadowOpacity: 0 },
  heroText: { flex: 1, gap: 4 },
  word: { fontFamily: fonts.display, fontSize: 40, lineHeight: 46 },
  phrase: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 22, color: colors.parchment },
  reason: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.parchmentMuted },
  rows: { gap: space.xs, paddingTop: space.sm, borderTopWidth: 1, borderTopColor: colors.hairline },
  row: { gap: 4, minHeight: 48, justifyContent: 'center' },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  lensName: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 0.4 },
  rowWord: { flexDirection: 'row', alignItems: 'center', gap: 5, marginLeft: 'auto' },
  rowWordText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.parchment },
  chevron: { fontFamily: fonts.bodyBold, fontSize: 20, lineHeight: 22, color: colors.gold, marginLeft: 2 },
  rowText: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.parchmentMuted },
});
