/**
 * The Sigil as a phone wallpaper. Two layouts:
 *  - lock: the clock sits in the top third, so the Sigil is placed lower and shown at full strength;
 *  - home: app icons cover most of the screen, so the Sigil is centred, a little smaller and dimmer.
 * The image is saved at the size of a current iPhone screen (1179 x 2556).
 */

export type WallpaperVariant = 'lock' | 'home';

/** Logical size of the card on screen; the saved image is scaled up to CAPTURE. */
export const WALLPAPER = { width: 240, height: 520 } as const;
export const WALLPAPER_CAPTURE = { width: 1179, height: 2556 } as const;

export interface WallpaperLayout {
  sigilSize: number;
  /** Distance from the top of the card to the top of the Sigil, in logical points. */
  top: number;
  opacity: number;
  /** Radius of the soft light behind the Sigil. */
  glowRadius: number;
}

export function wallpaperLayout(variant: WallpaperVariant): WallpaperLayout {
  if (variant === 'lock') return { sigilSize: 200, top: 200, opacity: 1, glowRadius: 167 };
  const sigilSize = 188;
  return { sigilSize, top: Math.round((WALLPAPER.height - sigilSize) / 2), opacity: 0.55, glowRadius: 167 };
}
