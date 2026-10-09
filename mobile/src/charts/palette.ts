/** Chart colors — the T3D brand palette, kept in one place for the scene builders. */
export const chartColors = {
  obsidian: '#0B0B0C',
  charcoal: '#121214',
  purple: '#2E1A47',
  amethyst: '#1F1235',
  gold: '#D4AF37',
  vehicle: '#E5A93C',
  road: '#1F8A4D',
  stoplight: '#C83E3E',
  parchment: '#F5F5F3',
  muted: '#B9B7B2',
  /** Human Design convention: Personality = conscious (light), Design = unconscious (red). */
  personality: '#F5F5F3',
  design: '#E0605C',
  /** Aspect line colors (always also distinguished by dash style + legend). */
  flow: '#5FD39A',
  friction: '#F08A84',
  conjunction: '#D4AF37',
} as const;
