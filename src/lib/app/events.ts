/**
 * The only things the app may count. A screen name, nothing about the person.
 * The app keeps a matching list (mobile/src/lib/track.ts); the server rejects anything not on this one.
 */

export const SCREENS = [
  'today', 'chart', 'practice', 'readings', 'timeline', 'glossary',
  'method', 'onboarding', 'share-card', 'welcome', 'year', 'your-data',
] as const;

export const APP_EVENTS: readonly string[] = SCREENS.map((s) => `screen_${s}`);

export function isAppEvent(value: unknown): value is string {
  return typeof value === 'string' && APP_EVENTS.includes(value);
}
