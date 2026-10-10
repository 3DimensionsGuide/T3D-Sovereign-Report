/**
 * One-time email codes that prove a person owns the address they typed.
 *
 * A 6-digit code is emailed. Only a keyed hash of it is stored, so a database
 * leak does not reveal live codes. Codes expire after 15 minutes and allow
 * 5 wrong guesses, after which a new code has to be requested.
 *
 * Secret: the same REPORT_LINK_SECRET / STRIPE_WEBHOOK_SECRET pair used for
 * download links (see reportLinks.ts). If neither exists no code is made.
 */

import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';

export const CODE_TTL_SECONDS = 15 * 60;
export const MAX_CODE_ATTEMPTS = 5;
/** A new code can be requested once a minute. */
export const RESEND_GAP_SECONDS = 60;

function key(): Buffer | null {
  const direct = process.env.REPORT_LINK_SECRET;
  if (direct && direct.length >= 16) {
    return createHmac('sha256', direct).update('t3d:email-codes:v1').digest();
  }
  const fallback = process.env.STRIPE_WEBHOOK_SECRET;
  if (fallback && fallback.length >= 16) {
    return createHmac('sha256', fallback).update('t3d:email-codes:v1').digest();
  }
  return null;
}

/** Six digits, leading zeros allowed. */
export function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

/** Keyed hash of a code for one lead and one address. Null when no secret is configured. */
export function hashCode(leadId: number, email: string, code: string): string | null {
  const k = key();
  if (!k) return null;
  return createHmac('sha256', k)
    .update(`code:v1:${leadId}:${email.trim().toLowerCase()}:${code}`)
    .digest('hex');
}

export interface CodeState {
  hash: string | null;
  expiresAt: Date | null;
  attempts: number;
}

export type CodeCheck = 'ok' | 'none' | 'expired' | 'locked' | 'wrong' | 'unconfigured';

export function checkCode(
  state: CodeState,
  leadId: number,
  email: string,
  given: string,
  now: Date = new Date(),
): CodeCheck {
  if (!key()) return 'unconfigured';
  if (!state.hash || !state.expiresAt) return 'none';
  if (state.expiresAt.getTime() < now.getTime()) return 'expired';
  if (state.attempts >= MAX_CODE_ATTEMPTS) return 'locked';
  const cleaned = given.replace(/\s+/g, '');
  if (!/^\d{6}$/.test(cleaned)) return 'wrong';
  const wanted = hashCode(leadId, email, cleaned);
  if (!wanted) return 'unconfigured';
  const a = Buffer.from(wanted, 'hex');
  const b = Buffer.from(state.hash, 'hex');
  return a.length === b.length && timingSafeEqual(a, b) ? 'ok' : 'wrong';
}

/** True when a code was issued less than RESEND_GAP_SECONDS ago. */
export function issuedTooRecently(expiresAt: Date | null, now: Date = new Date()): boolean {
  if (!expiresAt) return false;
  const issuedAt = expiresAt.getTime() - CODE_TTL_SECONDS * 1000;
  return now.getTime() - issuedAt < RESEND_GAP_SECONDS * 1000;
}
