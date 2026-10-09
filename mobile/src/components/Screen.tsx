import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, space } from '@/theme/tokens';

/** Obsidian page with a soft amethyst glow at the top and a scrolling body. */
interface ScreenProps {
  children: ReactNode;
  /** Pass both to enable pull-to-refresh. */
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function Screen({ children, refreshing = false, onRefresh }: ScreenProps) {
  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={styles.glow} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView
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
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.obsidian },
  glow: {
    position: 'absolute',
    top: -220,
    alignSelf: 'center',
    width: 520,
    height: 520,
    borderRadius: 260,
    backgroundColor: colors.amethyst,
    opacity: 0.85,
  },
  safe: { flex: 1 },
  content: { padding: space.lg, paddingBottom: space.xxl, gap: space.md },
});
