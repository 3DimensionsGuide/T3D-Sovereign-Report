import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

interface Props extends Omit<ViewProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** Overrides the accent color; otherwise the style's borderLeftColor is used. */
  accent?: string;
  children?: ReactNode;
}

const BAR = 4;

/**
 * A rounded card with a colored bar down its left edge.
 *
 * A thick colored left border on a rounded box curves into a crescent at the
 * top and bottom corners. This draws the bar as a straight strip clipped by the
 * card's own rounded corners, so the edge stays clean. Pass the same style you
 * would have given a View with `borderLeftWidth: 4` and a `borderLeftColor`.
 */
export function AccentView({ style, accent, children, ...rest }: Props) {
  const flat = StyleSheet.flatten(style) ?? {};
  const { borderLeftColor, borderLeftWidth: _w, padding, paddingLeft, paddingHorizontal, ...others } = flat;
  const color = accent ?? (borderLeftColor as string | undefined) ?? '#D4AF37';
  const baseLeft = paddingLeft ?? paddingHorizontal ?? padding ?? 0;
  const left = (typeof baseLeft === 'number' ? baseLeft : 0) + BAR;
  return (
    <View
      {...rest}
      style={[others, padding !== undefined && { padding }, paddingHorizontal !== undefined && { paddingHorizontal }, { paddingLeft: left, overflow: 'hidden' }]}
    >
      <View pointerEvents="none" style={[styles.bar, { backgroundColor: color }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: BAR },
});
