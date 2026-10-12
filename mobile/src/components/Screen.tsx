import type { MutableRefObject, ReactNode, RefObject } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Glow } from '@/components/Glow';
import { colors, space } from '@/theme/tokens';

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
}

export function Screen({ children, refreshing = false, onRefresh, scrollRef, scrollOffset, onScrollY, overlay }: ScreenProps) {
  return (
    <View style={styles.root}>
      <Glow color={colors.purple} opacity={0.7} style={styles.glow} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView
          ref={scrollRef}
          scrollEventThrottle={16}
          onScroll={scrollOffset || onScrollY ? (e) => {
            const y = e.nativeEvent.contentOffset.y;
            if (scrollOffset) scrollOffset.current = y;
            onScrollY?.(y);
          } : undefined}
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
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.obsidian },
  glow: { height: 460 },
  safe: { flex: 1 },
  content: { padding: space.lg, paddingBottom: space.xxl, gap: space.md },
});
