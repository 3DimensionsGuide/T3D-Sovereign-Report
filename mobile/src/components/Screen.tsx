import type { MutableRefObject, ReactNode, RefObject } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useIsFocused } from 'expo-router';
import { useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Glow } from '@/components/Glow';
import { RoomArtLayer, SkySun } from '@/components/RoomArt';
import { ParallaxLayer } from '@/components/ParallaxLayer';
import { useReduceMotion } from '@/lib/motion';
import { PARALLAX } from '@/lib/parallax';
import { useSkyLook } from '@/lib/useSkyLook';
import { ROOMS, type RoomName } from '@/theme/rooms';
import { colors, space, themes } from '@/theme/tokens';
import { ROOM_THEME, RoomThemeContext } from '@/theme/RoomTheme';

/** Obsidian page with a soft amethyst glow at the top and a scrolling body. */
interface ScreenProps {
  children: ReactNode;
  /** Pass both to enable pull-to-refresh. */
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Lets a screen scroll itself (for jump links). */
  scrollRef?: RefObject<ScrollView | null>;
  /** Kept up to date with the current scroll position. */
  scrollOffset?: MutableRefObject<number>;
  /** Called on every scroll with the new vertical position. */
  onScrollY?: (y: number) => void;
  /** Drawn over the top of the scrolling body, for things that stay pinned. */
  overlay?: ReactNode;
  /** Which room this screen is: sets its light and line art. Defaults to the night sky. */
  room?: RoomName;
}

export function Screen({ children, refreshing = false, onRefresh, scrollRef, scrollOffset, onScrollY, overlay, room = 'sky' }: ScreenProps) {
  const { width } = useWindowDimensions();
  const focused = useIsFocused();
  const scrollY = useSharedValue(0);
  const reduce = useReduceMotion();
  const base = ROOMS[room];
  // Today's sky follows the time of day; every other room keeps its own fixed light.
  const sky = useSkyLook(room === 'sky');
  const isSky = room === 'sky';
  // By day the purple pool fades back so the warm light shows; at night it is the full purple.
  const glows = isSky
    ? [{ ...base.glows[0], opacity: base.glows[0].opacity * sky.purple }, ...(sky.glow.opacity > 0.005 ? [sky.glow] : [])]
    : base.glows;
  const artOpacity = isSky ? sky.starOpacity : 1;
  return (
    <RoomThemeContext.Provider value={themes[ROOM_THEME[room]]}>
    <View style={styles.root}>
      <ParallaxLayer scrollY={scrollY} factor={reduce ? 0 : PARALLAX.glow}>
        {glows.map((g, i) => (
          <Glow key={i} color={g.color} opacity={g.opacity} cx={g.cx} style={styles.glow} />
        ))}
      </ParallaxLayer>
      <ParallaxLayer scrollY={scrollY} factor={reduce ? 0 : PARALLAX.art}>
        <RoomArtLayer kind={base.art} color={base.artColor} width={width} opacity={artOpacity} paused={!focused} />
        {isSky ? <SkySun color={sky.glow.color} width={width} sun={sky.sun} /> : null}
      </ParallaxLayer>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView
          ref={scrollRef}
          scrollEventThrottle={16}
          onScroll={(e) => {
            const y = e.nativeEvent.contentOffset.y;
            scrollY.value = y;
            if (scrollOffset) scrollOffset.current = y;
            onScrollY?.(y);
          }}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
        {overlay}
      </SafeAreaView>
    </View>
    </RoomThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.obsidian },
  glow: { height: 460 },
  safe: { flex: 1 },
  content: { padding: space.lg, paddingBottom: space.xxl, gap: space.md },
});
