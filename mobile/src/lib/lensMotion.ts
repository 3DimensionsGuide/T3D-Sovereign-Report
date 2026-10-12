/** Same three names as LensName in components/Lens.tsx; written out here so this file stays pure. */
type LensName = 'vehicle' | 'road' | 'stoplight';

/**
 * The lens motion language: each lens has ONE movement, used everywhere the lens appears.
 *   Vehicle   = a slow pulse   (energy)
 *   Road      = a slide forward (progress)
 *   Stoplight = a soft blink   (timing; plays again when the signal changes)
 * Haptics follow the same pattern, so a person can learn a lens by feel as well as by sight.
 * Pure data: the components in LensMotion.tsx and lib/haptics.ts read it.
 */
export type MotionKind = 'pulse' | 'slide' | 'blink';
export type LensHaptic = 'soft' | 'steps' | 'click';

export interface LensMotionSpec {
  kind: MotionKind;
  /** How the movement is described, for notes and tests. */
  meaning: string;
  /** Milliseconds for one leg of the movement. */
  legMs: number;
  /** How many times it plays each time it is triggered. */
  repeats: number;
}

export const LENS_MOTION: Record<LensName, LensMotionSpec> = {
  vehicle: { kind: 'pulse', meaning: 'energy', legMs: 700, repeats: 2 },
  road: { kind: 'slide', meaning: 'progress', legMs: 650, repeats: 1 },
  stoplight: { kind: 'blink', meaning: 'timing', legMs: 320, repeats: 2 },
};

export const LENS_HAPTIC: Record<LensName, LensHaptic> = {
  vehicle: 'soft', // one soft thud, like an engine turning over
  road: 'steps', // two light taps, one step after another
  stoplight: 'click', // one crisp click, like a signal changing
};
