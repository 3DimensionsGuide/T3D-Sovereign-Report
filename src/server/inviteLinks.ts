/**
 * Signed, expiring invite links.
 *
 * An invite carries no birth data at all, only a lead number, two yes/no choices the sender made, and an
 * expiry, signed with a secret only the server knows:
 *
 *   <leadId>.<flags>.<expiry>.<signature>
 *
 * flags: 1 = the sender agreed to show their first name, 2 = the sender knows their birth time.
 * A link can not be guessed or edited, stops working after it expires, and stops working at once if the
 * sender deletes their data (the lead is gone). Nothing about an invite is written to the database.
 *
 * Secret: INVITE_LINK_SECRET if set, otherwise derived from REPORT_LINK_SECRET or STRIPE_WEBHOOK_SECRET
 * (the same fallbacks report links use). With none of them, invites can not be made or checked.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

export const INVITE_LINK_SECONDS = 30 * 24 * 60 * 60;

export const FLAG_NAME = 1;
export const FLAG_TIME_KNOWN = 2;

function key(): Buffer | null {
  const direct = process.env.INVITE_LINK_SECRET;
  if (direct && direct.length >= 16) return Buffer.from(direct, 'utf8');
  for (const name of ['REPORT_LINK_SECRET', 'STRIPE_WEBHOOK_SECRET']) {
    const v = process.env[name];
    if (v && v.length >= 16) return createHmac('sha256', v).update('t3d:invite-links:v1').digest();
  }
  return null;
}

function sign(leadId: number, flags: number, expiry: number, k: Buffer): string {
  return createHmac('sha256', k).update(`invite:v1:${leadId}:${flags}:${expiry}`).digest('hex');
}

export interface InviteChoices {
  showName: boolean;
  timeKnown: boolean;
}

/** The token for a sender, or null when no secret is configured. */
export function makeInviteToken(
  leadId: number, choices: InviteChoices, nowMs: number = Date.now(), ttlSeconds: number = INVITE_LINK_SECONDS,
): string | null {
  const k = key();
  if (!k || !Number.isInteger(leadId) || leadId < 1) return null;
  const flags = (choices.showName ? FLAG_NAME : 0) | (choices.timeKnown ? FLAG_TIME_KNOWN : 0);
  const expiry = Math.floor(nowMs / 1000) + ttlSeconds;
  return `${leadId}.${flags}.${expiry}.${sign(leadId, flags, expiry, k)}`;
}

export type InviteCheck =
  | { ok: true; leadId: number; choices: InviteChoices }
  | { ok: false; reason: 'malformed' | 'invalid' | 'expired' | 'unconfigured' };

export function checkInviteToken(token: unknown, nowMs: number = Date.now()): InviteCheck {
  const k = key();
  if (!k) return { ok: false, reason: 'unconfigured' };
  if (typeof token !== 'string') return { ok: false, reason: 'malformed' };
  const m = /^(\d{1,9})\.([0-3])\.(\d{1,12})\.([0-9a-f]{64})$/.exec(token);
  if (!m) return { ok: false, reason: 'malformed' };
  const leadId = Number(m[1]);
  const flags = Number(m[2]);
  const expiry = Number(m[3]);
  const given = Buffer.from(m[4], 'hex');
  const wanted = Buffer.from(sign(leadId, flags, expiry, k), 'hex');
  if (leadId < 1 || given.length !== wanted.length || !timingSafeEqual(given, wanted)) return { ok: false, reason: 'invalid' };
  if (expiry < Math.floor(nowMs / 1000)) return { ok: false, reason: 'expired' };
  return { ok: true, leadId, choices: { showName: (flags & FLAG_NAME) !== 0, timeKnown: (flags & FLAG_TIME_KNOWN) !== 0 } };
}
