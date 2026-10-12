/** Sky vocabulary shared by pure helpers (no imports, so tests can load it directly). */
export type SkyBody =
  | 'moon' | 'sun' | 'mercury' | 'venus' | 'mars'
  | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto';
export type NatalPointName =
  | 'sun' | 'moon' | 'mercury' | 'venus' | 'mars'
  | 'jupiter' | 'saturn' | 'ascendant' | 'midheaven';
export type DailyAspect = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
export type AspectNature = 'flow' | 'friction' | 'neutral';
