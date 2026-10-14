/**
 * The only things the app and the website may count. A screen name, a one-word moment (such as
 * "tribe_added") or a shared-card tag, nothing about the person. The app keeps a matching screen list (mobile/src/lib/track.ts)
 * and the website keeps the card tags (src/components/RefBeacon.tsx). The server rejects
 * anything not on these lists.
 */

export const SCREENS = [
  'today', 'chart', 'practice', 'readings', 'timeline', 'glossary',
  'method', 'onboarding', 'share-card', 'welcome', 'year', 'your-data', 'invite', 'rhythm',
] as const;

/** Moments worth counting, so you can see where people go and where they stop. Matches mobile/src/lib/track.ts. */
export const ACTIONS = [
  'reveal_seen', 'paywall_seen', 'tribe_added', 'invite_sent', 'backup_exported', 'backup_restored',
  'invite_viewed', 'invite_chart_started',
] as const;

/** Tags carried by links on shared cards (?ref=...). */
export const CARD_REFS = ['card-profile', 'card-today'] as const;

export const SCREEN_EVENTS: readonly string[] = SCREENS.map((s) => `screen_${s}`);
export const ACTION_EVENTS: readonly string[] = ACTIONS.map((a) => `action_${a}`);
export const VISIT_EVENTS: readonly string[] = CARD_REFS.map((r) => `visit_${r}`);
export const APP_EVENTS: readonly string[] = [...SCREEN_EVENTS, ...ACTION_EVENTS, ...VISIT_EVENTS];

export function isAppEvent(value: unknown): value is string {
  return typeof value === 'string' && APP_EVENTS.includes(value);
}
