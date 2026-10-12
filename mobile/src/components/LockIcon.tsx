import Svg, { Path, Rect } from 'react-native-svg';
import { colors } from '@/theme/tokens';

/** A padlock. Decorative: "Premium" is always written beside it. */
export function LockIcon({ size = 16, color = colors.gold }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Path d="M7 11 V8 a5 5 0 0 1 10 0 V11" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
      <Rect x="4.5" y="11" width="15" height="10.5" rx="2.5" fill="none" stroke={color} strokeWidth={2.4} />
    </Svg>
  );
}
