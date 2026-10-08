/**
 * T3D design tokens — the 60-30-10 palette from the brand spec.
 *
 *  60% Dominance : obsidian / charcoal  (base, surfaces)
 *  30% Structure : royal purple / amethyst shadow (panels, atmosphere)
 *  10% Catalyst  : metallic gold (primary actions + success ONLY)
 *
 * Semantic triad (always paired with an icon glyph + text label,
 * never color alone):
 *  Vehicle (Human Design) = amber
 *  Road (Numerology)      = emerald
 *  Stoplight (Astrology)  = crimson
 */

export const colors = {
  obsidian: '#0B0B0C',
  charcoal: '#121214',

  purple: '#2E1A47',
  amethyst: '#1F1235',

  gold: '#D4AF37',
  sun: '#F2C94C',

  vehicle: '#E5A93C',
  road: '#1F8A4D',
  stoplight: '#C83E3E',

  /** Primary text on obsidian/charcoal — contrast above 15:1. */
  parchment: '#F5F5F3',
  /** Secondary text — still above 7:1 (WCAG AAA) on obsidian. */
  parchmentMuted: 'rgba(245,245,243,0.72)',
  hairline: 'rgba(245,245,243,0.14)',
  danger: '#FF8A8A',
} as const;

export const fonts = {
  display: 'PlayfairDisplay_600SemiBold',
  displayRegular: 'PlayfairDisplay_400Regular',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
} as const;

/** 4pt spacing scale. */
export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;

export const radius = { sm: 8, md: 14, lg: 22 } as const;

/** Apple's minimum comfortable touch target is 44pt; we use 52. */
export const TOUCH = 52;
