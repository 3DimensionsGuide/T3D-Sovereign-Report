/** Maps what the app already shows (names, keys, numbers) to glossary ids. */

export const planetId = (key: string): string => `astro:planet:${key}`;
export const aspectId = (key: string): string => `astro:aspect:${key}`;
export const houseId = (n: number): string => `astro:house:${n}`;
export const signId = (name: string): string => `astro:sign:${name}`;
export const gateId = (n: number): string => `hd:gate:${n}`;
export const channelId = (a: number, b: number): string => `hd:channel:${a}-${b}`;
export const centerId = (key: string): string => `hd:center:${key}`;
export const typeId = (name: string): string => `hd:type:${name}`;
export const profileId = (value: string): string => `hd:profile:${value}`;
export const numberId = (n: number): string => `num:${n}`;

/** Natal points on the Today screen include Rising and Midheaven. */
export function natalId(key: string): string {
  if (key === 'ascendant') return 'astro:ascendant';
  if (key === 'midheaven') return 'astro:midheaven';
  return planetId(key);
}

/** Authority text can be stored in several spellings. */
export function authorityId(authority: string): string {
  const a = authority.toLowerCase();
  if (a.includes('sacral')) return 'hd:authority:Sacral';
  if (a.includes('emotion') || a.includes('solar')) return 'hd:authority:Emotional';
  if (a.includes('splen')) return 'hd:authority:Splenic';
  if (a.includes('self')) return 'hd:authority:Self-Projected';
  if (a.includes('ego') || a.includes('heart')) return 'hd:authority:Ego';
  if (a.includes('lunar')) return 'hd:authority:Lunar';
  return 'hd:authority:None';
}

/** The Strategy line is a general concept entry, since wording varies by Type. */
export const STRATEGY_ID = 'hd:strategy';
