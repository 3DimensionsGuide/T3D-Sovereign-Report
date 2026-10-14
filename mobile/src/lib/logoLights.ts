/**
 * Where the three lights sit on the T3D logo, in the logo image's own pixels (694 x 506), and the
 * order they switch on. Pure numbers, so the layout can be tested.
 */
export const LOGO_SIZE = { width: 694, height: 506 } as const;

/** Centre column and radius of each light, top to bottom: red, amber, green. */
export const LOGO_LIGHTS = [
  { cx: 286, cy: 198.5, r: 27.5 },
  { cx: 286, cy: 280, r: 27.5 },
  { cx: 286, cy: 360.5, r: 27.5 },
] as const;

/** Halo radius around a lit light. */
export const LOGO_HALO = 54;

/** Switch-on order: the way a signal is read, top to bottom. */
export const LOGO_ORDER = [0, 1, 2] as const;
