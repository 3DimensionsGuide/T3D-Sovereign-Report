/**
 * Svix webhook signatures, which is what Resend signs its webhooks with.
 *
 * Kept apart from any route so it can be tested without a database: a route that reads the leads
 * table pulls in a connection the moment it is imported, and signature checking is arithmetic
 * that should be verifiable on its own. It is also the piece most worth testing properly — an
 * endpoint that acts on whatever it is handed, unsigned, acts for whoever asks.
 *
 * Svix signs `id.timestamp.body` with a base64 secret and sends one or more space-separated
 * signatures as `v1,<base64>`. Any one matching is enough, which is how a secret is rotated
 * without dropping events in the changeover.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

/** Five minutes, the window Svix uses, so a captured request cannot be replayed later. */
export const TOLERANCE_SECONDS = 300;

export function verifySvix(
  secret: string,
  id: string,
  timestamp: string,
  body: string,
  header: string,
  nowSeconds: number,
): boolean {
  if (!secret || !id || !timestamp || !header) return false;

  const sent = Number(timestamp);
  if (!Number.isFinite(sent) || Math.abs(nowSeconds - sent) > TOLERANCE_SECONDS) return false;

  const raw = secret.startsWith('whsec_') ? secret.slice(6) : secret;
  let expected: Buffer;
  try {
    expected = createHmac('sha256', Buffer.from(raw, 'base64')).update(`${id}.${timestamp}.${body}`).digest();
  } catch {
    return false;
  }

  for (const part of header.split(' ')) {
    const [version, value] = part.split(',');
    if (version !== 'v1' || !value) continue;
    let given: Buffer;
    try {
      given = Buffer.from(value, 'base64');
    } catch {
      continue;
    }
    // Length first: timingSafeEqual throws on a mismatch rather than returning false.
    if (given.length === expected.length && timingSafeEqual(given, expected)) return true;
  }
  return false;
}
