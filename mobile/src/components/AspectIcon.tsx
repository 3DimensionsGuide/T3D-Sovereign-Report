import Svg, { Circle } from 'react-native-svg';
import { LENS_TEXT, SIGNAL_COLOR, SignalMarker } from '@/components/Lens';

/**
 * The shape for an aspect, using the same shapes as the Today signal: a ringed check for an easy angle,
 * a square for a hard one and two overlapping circles for a blend. The words are always written beside it.
 */
export function AspectIcon({ feel, size = 26 }: { feel: string; size?: number }) {
  if (feel === 'easy') return <SignalMarker kind="flow" size={size} />;
  if (feel === 'challenging') return <SignalMarker kind="friction" size={size} />;
  const c = LENS_TEXT.stoplight;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Circle cx="9" cy="12" r="6.5" fill="none" stroke={c} strokeWidth={2.2} />
      <Circle cx="15" cy="12" r="6.5" fill="none" stroke={c} strokeWidth={2.2} />
    </Svg>
  );
}
export { SIGNAL_COLOR };
