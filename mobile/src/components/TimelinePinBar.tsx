import { StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/components/Pressable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, space, TOUCH, themes } from '@/theme/tokens';

const T = themes.timeline;

/**
 * Pinned under the status bar while you read down the Timeline: names the month you are in and,
 * once you have scrolled well past the start, offers a way back to today.
 */
export function TimelinePinBar({ month, detail, onJumpToday }: { month: string | null; detail: string | null; onJumpToday: (() => void) | null }) {
  const top = useSafeAreaInsets().top;
  return (
    <View pointerEvents="box-none" style={[styles.bar, { top }]}>
      <View style={styles.text} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Text style={styles.month} numberOfLines={1}>{month ?? 'Timeline'}</Text>
        {detail ? <Text style={styles.detail} numberOfLines={1}>{detail}</Text> : null}
      </View>
      {onJumpToday ? (
        <Pressable
          onPress={onJumpToday}
          accessibilityRole="button"
          accessibilityLabel="Jump to today"
          style={({ pressed }) => [styles.jump, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.jumpText}>▲ Jump to today</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute', left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    paddingVertical: 6, paddingHorizontal: space.md, minHeight: TOUCH,
    borderBottomLeftRadius: radius.md, borderBottomRightRadius: radius.md,
    borderWidth: 1, borderTopWidth: 0, borderColor: T.edge,
    backgroundColor: T.surface,
  },
  text: { flex: 1, gap: 1 },
  month: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 17, color: colors.parchment },
  detail: { fontFamily: fonts.body, fontSize: 13, color: colors.parchmentMuted },
  jump: {
    minHeight: TOUCH, justifyContent: 'center', paddingHorizontal: space.md,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.gold,
  },
  jumpText: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.gold },
});
