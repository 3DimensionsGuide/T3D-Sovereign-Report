/**
 * T3D design tokens — the 60-30-10 palette from the brand spec.
 *
 *  60% Dominance : obsidian / charcoal  (base, surfaces)
 *  30% Structure : smoked bronze / graphite (panels, atmosphere)
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

  /** Smoked bronze: the soft warm glow behind each screen (was royal purple). */
  purple: '#2A2315',
  /** Graphite: same as `surface`, kept so older references keep working (was amethyst). */
  amethyst: '#17161A',

  /** Smoked graphite: the luxury surface for cards, tabs and sheets. Neutral, so gold and the Triad colors carry the color. */
  surface: '#17161A',
  /** One step lighter, for a card sitting on a card. */
  surfaceRaised: '#232127',
  /** A faint gold wash for the selected state of a tab or chip. */
  goldWash: 'rgba(212,175,55,0.12)',
  /** A clearly visible neutral outline for chips and buttons on a dark surface. */
  line: 'rgba(245,245,243,0.22)',
  /** A gold divider between table rows. */
  goldLine: 'rgba(212,175,55,0.17)',
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
 * and a soft gold glow underneath. Ordinary cards stay flat so the hero cards stand out.
 */
export const heroCard = {
  borderTopColor: 'rgba(245,245,243,0.42)',
  shadowColor: '#D4AF37',
  shadowOpacity: 0.32,
  shadowRadius: 32,
  shadowOffset: { width: 0, height: 10 },
} as const;

/**
 * One card, table and tab palette per tab, so each room feels like its own place.
 * Every palette is a near-black tinted toward one hue, with a fine edge in that hue.
 * Selected states keep the brand gold on every tab.
 *  Today     : graphite and gold (the original luxury look)
 *  Timeline  : evergreen. Green reads as growth and progress, the road ahead.
 *  Readings  : midnight sapphire. Deep blue reads as study, depth and trust.
 *  Practice  : copper espresso. Warm earth reads as ritual, energy and doing.
 *  My Chart  : platinum slate. Cool silver reads as identity and clarity.
 */
export interface RoomTheme {
  /** Card and panel background. */
  surface: string;
  /** A card on a card, and unselected chips. */
  raised: string;
  /** Outline of a card. */
  edge: string;
  /** Outline of a chip or button. */
  line: string;
  /** Divider between table rows. */
  rule: string;
  /** Fill of a selected chip or tab. */
  wash: string;
}

export const themes = {
  today: { surface: '#17161A', raised: '#232127', edge: 'rgba(212,175,55,0.30)', line: 'rgba(245,245,243,0.22)', rule: 'rgba(212,175,55,0.17)', wash: 'rgba(212,175,55,0.12)' },
  timeline: { surface: '#101A15', raised: '#182620', edge: 'rgba(96,200,150,0.30)', line: 'rgba(205,238,220,0.22)', rule: 'rgba(96,200,150,0.18)', wash: 'rgba(212,175,55,0.13)' },
  readings: { surface: '#10151F', raised: '#18202F', edge: 'rgba(128,166,232,0.30)', line: 'rgba(205,218,245,0.22)', rule: 'rgba(128,166,232,0.18)', wash: 'rgba(212,175,55,0.13)' },
  practice: { surface: '#1A1310', raised: '#281D17', edge: 'rgba(216,134,88,0.32)', line: 'rgba(246,226,212,0.22)', rule: 'rgba(216,134,88,0.20)', wash: 'rgba(212,175,55,0.13)' },
  chart: { surface: '#14161A', raised: '#1E2127', edge: 'rgba(205,212,226,0.30)', line: 'rgba(236,239,246,0.24)', rule: 'rgba(205,212,226,0.18)', wash: 'rgba(212,175,55,0.13)' },
} as const satisfies Record<string, RoomTheme>;

export type ThemeName = keyof typeof themes;
