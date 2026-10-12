import * as Haptics from 'expo-haptics';
import type { LensName } from '@/components/Lens';
import { LENS_HAPTIC } from '@/lib/lensMotion';

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

/**
 * A tap that belongs to a lens, matching its motion: Vehicle a soft thud, Road two light steps,
 * Stoplight one crisp click. See lib/lensMotion.ts.
 */
export function lensTap(lens: LensName): void {
  const kind = LENS_HAPTIC[lens];
  if (kind === 'soft') {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => undefined);
  } else if (kind === 'steps') {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    setTimeout(() => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }, 110);
  } else {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid).catch(() => undefined);
  }
}
