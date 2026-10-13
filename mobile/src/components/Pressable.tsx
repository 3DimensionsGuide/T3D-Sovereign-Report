import { forwardRef } from 'react';
import { Pressable as RNPressable, type PressableProps, type View } from 'react-native';

/**
 * Drop-in replacement for React Native's Pressable. Anything tappable dims a little
 * and dips a hair smaller while a finger is on it, so every control answers the touch. A screen's own pressed
 * style still wins because it is applied after this one.
 */
const PRESSED = { opacity: 0.8, transform: [{ scale: 0.985 }] } as const;

export const Pressable = forwardRef<View, PressableProps>(function Pressable({ style, ...rest }, ref) {
  return (
    <RNPressable
      ref={ref}
      {...rest}
      style={(state) => [state.pressed && !rest.disabled ? PRESSED : null, typeof style === 'function' ? style(state) : style]}
    />
  );
});
