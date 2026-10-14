import { API_BASE_URL } from '@/lib/api';

/**
 * Anonymous screen counts. Sends only the name of a screen, with no chart id, no email and
 * no device id. It never blocks or shows an error. This list matches src/lib/app/events.ts
 * on the server, which rejects anything else.
 */
const SCREENS = new Set([
  'today', 'chart', 'practice', 'readings', 'timeline', 'glossary',
  'method', 'onboarding', 'share-card', 'welcome', 'year', 'your-data', 'invite', 'rhythm',
]);

/** One-word moments, matching ACTIONS in src/lib/app/events.ts. */
const ACTIONS = new Set(['reveal_seen', 'paywall_seen', 'tribe_added', 'invite_sent', 'backup_exported', 'backup_restored', 'invite_viewed', 'invite_chart_started']);

const RESEND_AFTER_MS = 30_000;
const lastSent = new Map<string, number>();

/** Screens are counted at most once every 30 seconds; a moment is counted every time it happens. */
function send(event: string, once = true): void {
  if (once) {
    const now = Date.now();
    const last = lastSent.get(event);
    if (last !== undefined && now - last < RESEND_AFTER_MS) return;
    lastSent.set(event, now);
  }
  fetch(`${API_BASE_URL}/api/app/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event }),
  }).catch(() => undefined);
}

export function trackScreen(pathname: string): void {
  const name = pathname.replace(/^\/+/, '').split('/')[0] ?? '';
  if (SCREENS.has(name)) send(`screen_${name}`);
}

/** Counts one moment, such as a person added to My Tribe. Nothing about the person is sent. */
export function trackAction(name: string): void {
  if (ACTIONS.has(name)) send(`action_${name}`, false);
}
