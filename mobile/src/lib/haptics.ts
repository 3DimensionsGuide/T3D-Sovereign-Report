import * as Haptics from 'expo-haptics';

/**
 * Small physical taps. Every call is safe to ignore: a phone with haptics off,
 * a simulator, or any error just means no tap.
 */
export function tap(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

/** A lighter "tick" for moving between choices, tabs and segments. */
export function select(): void {
  void Haptics.selectionAsync().catch(() => undefined);
}

/** A confirming double tap for finished actions like sharing. */
export function success(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}
