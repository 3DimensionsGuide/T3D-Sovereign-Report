import { useId, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { GLASS_SHEEN_HEIGHT, glassFill } from '@/lib/glass';
import { colors, heroCard, radius, space } from '@/theme/tokens';

interface GlassProps {
  children: ReactNode;
  /** The gold glow and bright top edge, for the one or two main cards on a screen. */
  hero?: boolean;
  /** A touch more solid, for a card that sits on another card. */
  raised?: boolean;
  /** Overrides for padding, gap, layout or border colour. */
  style?: StyleProp<ViewStyle>;
}

/**
 * A frosted card: a see-through graphite fill, a soft light along the top and a fine light edge.
 * The sheen is decorative only, ignores touches and is hidden from screen readers.
 */
export function Glass({ children, hero = false, raised = false, style }: GlassProps) {
  const id = `sheen${useId().replace(/\W/g, '')}`;
  return (
    <View style={[styles.card, { backgroundColor: glassFill(raised) }, hero && heroCard, style]}>
      <View style={styles.sheen} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Svg width="100%" height="100%" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#F5F5F3" stopOpacity={0.1} />
              <Stop offset="1" stopColor="#F5F5F3" stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
        </Svg>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline,
    padding: space.lg, gap: space.md,
  },
  sheen: {
    position: 'absolute', top: 0, left: 0, right: 0, height: `${GLASS_SHEEN_HEIGHT * 100}%`,
    borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, overflow: 'hidden',
  },
});
