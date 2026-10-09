/**
 * Signed, expiring links for report downloads.
 *
 * A download link carries the order number plus a token: `t=<expiry>.<signature>`.
 * The signature is an HMAC of the order number and expiry, made with a secret only
 * the server knows, so a link can not be guessed, edited to point at another order,
 * or used after it expires.
 *
 * Secret: REPORT_LINK_SECRET (recommended). If it is missing, a key is derived from
 * STRIPE_WEBHOOK_SECRET so downloads keep working. If neither exists, links can not
 * be made or checked, and downloads are refused.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

/** Emailed links stay valid for 30 days. */
export const EMAILED_LINK_SECONDS = 30 * 24 * 60 * 60;
/** Links given on the page right after paying stay valid for 15 minutes. */
export const PAGE_LINK_SECONDS = 15 * 60;

function key(): Buffer | null {
  const direct = process.env.REPORT_LINK_SECRET;
  if (direct && direct.length >= 16) return Buffer.from(direct, 'utf8');
  const fallback = process.env.STRIPE_WEBHOOK_SECRET;
  if (fallback && fallback.length >= 16) {
    return createHmac('sha256', fallback).update('t3d:report-links:v1').digest();
  }
  return null;
}

function sign(orderId: number, expiry: number, k: Buffer): string {
  return createHmac('sha256', k).update(`report:v1:${orderId}:${expiry}`).digest('hex');
}

/** Returns "<expiry>.<signature>", or null when no secret is configured. */
export function makeReportToken(orderId: number, ttlSeconds: number, nowMs: number = Date.now()): string | null {
  const k = key();
  if (!k || !Number.isInteger(orderId) || orderId < 1) return null;
  const expiry = Math.floor(nowMs / 1000) + ttlSeconds;
  return `${expiry}.${sign(orderId, expiry, k)}`;
}

export type TokenCheck = 'ok' | 'missing' | 'malformed' | 'expired' | 'invalid' | 'unconfigured';

export function checkReportToken(orderId: number, token: string | null, nowMs: number = Date.now()): TokenCheck {
  const k = key();
  if (!k) return 'unconfigured';
  if (!token) return 'missing';
  const match = /^(\d{1,12})\.([0-9a-f]{64})$/.exec(token);
  if (!match) return 'malformed';
  const expiry = Number(match[1]);
  const given = Buffer.from(match[2], 'hex');
  const wanted = Buffer.from(sign(orderId, expiry, k), 'hex');
  if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) return 'invalid';
  if (expiry < Math.floor(nowMs / 1000)) return 'expired';
  return 'ok';
}

/** Full download URL for an order. Returns null when no secret is configured. */
export function reportDownloadUrl(siteUrl: string, orderId: number, ttlSeconds: number): string | null {
  const token = makeReportToken(orderId, ttlSeconds);
  if (!token) return null;
  return `${siteUrl.replace(/\/$/, '')}/api/generate-report?orderId=${orderId}&t=${token}`;
}
