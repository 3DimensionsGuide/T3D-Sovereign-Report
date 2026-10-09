/**
 * The only things the app and the website may count. A screen name or a shared-card tag,
 * nothing about the person. The app keeps a matching screen list (mobile/src/lib/track.ts)
 * and the website keeps the card tags (src/components/RefBeacon.tsx). The server rejects
 * anything not on these lists.
 */

export const SCREENS = [
  'today', 'chart', 'practice', 'readings', 'timeline', 'glossary',
  'method', 'onboarding', 'share-card', 'welcome', 'year', 'your-data',
] as const;

/** Tags carried by links on shared cards (?ref=...). */
export const CARD_REFS = ['card-profile', 'card-today'] as const;

export const SCREEN_EVENTS: readonly string[] = SCREENS.map((s) => `screen_${s}`);
export const VISIT_EVENTS: readonly string[] = CARD_REFS.map((r) => `visit_${r}`);
export const APP_EVENTS: readonly string[] = [...SCREEN_EVENTS, ...VISIT_EVENTS];

export function isAppEvent(value: unknown): value is string {
  return typeof value === 'string' && APP_EVENTS.includes(value);
}
