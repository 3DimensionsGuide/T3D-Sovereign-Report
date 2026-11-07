/**
 * Signed session tokens for the T3D app.
 *
 * The app used to prove who it was by sending a lead id and the person's email address on every
 * request. Neither is a secret: lead ids run 1, 2, 3 … and an email address is public. This replaces
 * that with a bearer token the server signs and nobody else can make:
 *
 *   <leadId>.<epoch>.<expiry>.<signature>
 *
 * epoch  the lead's session number (leads.session_epoch). Raising that number on the lead makes every
 *        token already handed out for it stop working — that is how "sign me out everywhere" and
 *        "delete my data" revoke access without keeping a list of live tokens anywhere.
 * expiry unix seconds. Past it the token is refused even if the signature is good.
 *
 * A token is only ever minted by /api/calculate-t3d, to the caller that just wrote that lead's row.
 * There is deliberately no endpoint that trades an email address for a token: someone who knows a
 * customer's email address still cannot reach their chart. An app with no token recalculates from the
 * birth details it already holds, which returns the same lead and a fresh token.
 *
 * The token carries no birth data, no name and no email address — only a lead number the server
 * looks up itself.
 *
 * Secret: APP_SESSION_SECRET if set, otherwise derived from REPORT_LINK_SECRET or
 * STRIPE_WEBHOOK_SECRET (the same fallbacks report links and invite links use). The derivation label
 * is specific to app sessions, so an invite token can never be read as a session token, or the
 * reverse, even though both can fall back to the same environment variable. With none of them set,
 * session tokens can not be made or checked, and the app routes answer 503 rather than letting
 * anyone in.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

/** How long a token lasts. The app refreshes it well before this by recalculating. */
export const APP_SESSION_SECONDS = 180 * 24 * 60 * 60;

const TOKEN_PATTERN = /^(\d{1,9})\.(\d{1,9})\.(\d{1,12})\.([0-9a-f]{64})$/;

function key(): Buffer | null {
  const direct = process.env.APP_SESSION_SECRET;
  if (direct && direct.length >= 16) return Buffer.from(direct, 'utf8');
  for (const name of ['REPORT_LINK_SECRET', 'STRIPE_WEBHOOK_SECRET']) {
    const v = process.env[name];
    if (v && v.length >= 16) return createHmac('sha256', v).update('t3d:app-sessions:v1').digest();
  }
  return null;
}

/** True when a secret is configured, so tokens can be made and checked. */
export function appSessionsConfigured(): boolean {
  return key() !== null;
}

function sign(leadId: number, epoch: number, expiry: number, k: Buffer): string {
  return createHmac('sha256', k).update(`app:v1:${leadId}:${epoch}:${expiry}`).digest('hex');
}

/** The token for one lead, or null when no secret is configured or the inputs are out of range. */
export function makeAppSessionToken(
  leadId: number,
  epoch: number,
  nowMs: number = Date.now(),
  ttlSeconds: number = APP_SESSION_SECONDS,
): string | null {
  const k = key();
  if (!k) return null;
  if (!Number.isInteger(leadId) || leadId < 1 || leadId > 999_999_999) return null;
  if (!Number.isInteger(epoch) || epoch < 1 || epoch > 999_999_999) return null;
  const expiry = Math.floor(nowMs / 1000) + ttlSeconds;
  return `${leadId}.${epoch}.${expiry}.${sign(leadId, epoch, expiry, k)}`;
}

export type AppSessionCheck =
  | { ok: true; leadId: number; epoch: number }
  | { ok: false; reason: 'malformed' | 'invalid' | 'expired' | 'unconfigured' };

/**
 * Checks a token's shape, signature and expiry. It does not touch the database, so it says nothing
 * about whether the lead still exists or whether its epoch still matches — src/server/appAuth.ts
 * does that part.
 */
export function checkAppSessionToken(token: unknown, nowMs: number = Date.now()): AppSessionCheck {
  const k = key();
  if (!k) return { ok: false, reason: 'unconfigured' };
  if (typeof token !== 'string') return { ok: false, reason: 'malformed' };
  const m = TOKEN_PATTERN.exec(token);
  if (!m) return { ok: false, reason: 'malformed' };
  const leadId = Number(m[1]);
  const epoch = Number(m[2]);
  const expiry = Number(m[3]);
  if (leadId < 1 || epoch < 1) return { ok: false, reason: 'malformed' };
  const given = Buffer.from(m[4], 'hex');
  const wanted = Buffer.from(sign(leadId, epoch, expiry, k), 'hex');
  if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) return { ok: false, reason: 'invalid' };
  if (expiry < Math.floor(nowMs / 1000)) return { ok: false, reason: 'expired' };
  return { ok: true, leadId, epoch };
}

/**
 * Pulls the token out of an Authorization header.
 *
 *   Authorization: Bearer 41.1.1794499200.9f3c…
 *
 * Returns null when the header is missing or is not a Bearer header. The scheme is matched without
 * regard to case, as HTTP requires.
 */
export function bearerToken(headers: { get(name: string): string | null }): string | null {
  const raw = headers.get('authorization');
  if (!raw) return null;
  const m = /^Bearer[ \t]+(\S+)$/i.exec(raw.trim());
  return m ? m[1] : null;
}
