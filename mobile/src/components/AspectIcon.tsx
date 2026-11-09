import Svg, { Circle } from 'react-native-svg';
import { SIGNAL_COLOR, SignalMarker, type SignalKind } from '@/components/Lens';

/**
 * Which signal an aspect's nature is, so the shape, the ring around it and anything else that
 * wants to say the same thing all say it the same way. A conjunction is neither flowing nor
 * frictional — what it does depends on the two planets — so it reads as neutral.
 */
export const FEEL_SIGNAL: Record<string, SignalKind> = {
  easy: 'flow',
  challenging: 'friction',
  blend: 'neutral',
};

export function feelSignal(feel: string): SignalKind {
  return FEEL_SIGNAL[feel] ?? 'neutral';
}

/**
 * The shape for an aspect, using the same shapes as the Today signal: a ringed check for an easy angle,
 * a square for a hard one and two overlapping circles for a blend. The words are always written beside it.
 */
export function AspectIcon({ feel, size = 26 }: { feel: string; size?: number }) {
  if (feel === 'easy') return <SignalMarker kind="flow" size={size} />;
  if (feel === 'challenging') return <SignalMarker kind="friction" size={size} />;
  // Neutral, not the lens red. The Stoplight's own colour sat too close to friction's coral for
  // the two to be told apart down a list, which made every aspect look like the same warning.
  const c = SIGNAL_COLOR.neutral;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Circle cx="9" cy="12" r="6.5" fill="none" stroke={c} strokeWidth={2.2} />
      <Circle cx="15" cy="12" r="6.5" fill="none" stroke={c} strokeWidth={2.2} />
    </Svg>
  );
}
export { SIGNAL_COLOR };
