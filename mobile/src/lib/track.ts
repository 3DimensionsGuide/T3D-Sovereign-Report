import { API_BASE_URL } from '@/lib/api';

/**
 * Anonymous screen counts. Sends only the name of a screen, with no chart id, no email and
 * no device id. It never blocks or shows an error. This list matches src/lib/app/events.ts
 * on the server, which rejects anything else.
 */
const SCREENS = new Set([
  'today', 'chart', 'practice', 'readings', 'timeline', 'glossary',
  'method', 'onboarding', 'share-card', 'welcome', 'year', 'your-data',
]);

const RESEND_AFTER_MS = 30_000;
const lastSent = new Map<string, number>();

export function trackScreen(pathname: string): void {
  const name = pathname.replace(/^\/+/, '').split('/')[0] ?? '';
  if (!SCREENS.has(name)) return;
  const event = `screen_${name}`;
  const now = Date.now();
  const last = lastSent.get(event);
  if (last !== undefined && now - last < RESEND_AFTER_MS) return;
  lastSent.set(event, now);
  fetch(`${API_BASE_URL}/api/app/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event }),
  }).catch(() => undefined);
}
