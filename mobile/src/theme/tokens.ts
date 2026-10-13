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

  /** Smoked graphite: the luxury surface for cards, tabs and sheets. Neutral, so gold and the Triad colors carry the color. */
  surface: '#17161A',
  /** One step lighter, for a card sitting on a card. */
  surfaceRaised: '#201E24',
  /** A faint gold wash for the selected state of a tab or chip. */
  goldWash: 'rgba(212,175,55,0.12)',
  /** A fine gold edge for a card that is worth a second look. */
  goldEdge: 'rgba(212,175,55,0.30)',

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
  /** Off position of every switch. */
  switchOff: '#6B6B73',
} as const;

export const fonts = {
  display: 'PlayfairDisplay_600SemiBold',
  displayRegular: 'PlayfairDisplay_400Regular',
  displayItalic: 'PlayfairDisplay_400Regular_Italic',
  /** The guidance voice: soft italic for the lines that explain or invite, never for data or buttons. */
  voice: 'CormorantGaramond_500Medium_Italic',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
} as const;

/** The guidance voice as a ready-made text style, for the line under a page title. */
export const guidance = {
  fontFamily: 'CormorantGaramond_500Medium_Italic',
  fontSize: 20,
  lineHeight: 28,
  letterSpacing: 0.2,
  color: colors.parchmentMuted,
} as const;

/** Equal-width digits, so numbers that change (days, counts, scores) do not shift the text around them. */
export const tabular = { fontVariant: ['tabular-nums', 'lining-nums'] } as const;

/** 4pt spacing scale. */
export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;

export const radius = { sm: 8, md: 14, lg: 22 } as const;

/** Apple's minimum comfortable touch target is 44pt; we use 52. */
export const TOUCH = 52;

/**
 * The raised look for the one or two hero cards on a screen: a faint light edge along the top
 * and a soft purple glow underneath. Ordinary cards stay flat so the hero cards stand out.
 */
export const heroCard = {
  borderTopColor: 'rgba(245,245,243,0.42)',
  shadowColor: '#7A4CC2',
  shadowOpacity: 0.55,
  shadowRadius: 32,
  shadowOffset: { width: 0, height: 10 },
} as const;
