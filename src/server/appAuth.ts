/**
 * One access check for every app route.
 *
 *   const auth = await authenticateApp(request);
 *   if (!auth.ok) return auth.response;
 *   const lead = auth.lead;
 *
 * Until now each of the fourteen app routes repeated the same seven lines: read a lead id and an
 * email address out of the body, load the lead, compare the email. That is now in one place, and it
 * reads a signed token instead (src/server/appTokens.ts).
 *
 * Every failure answers with the identical 401 body, whatever went wrong — no token, a forged one,
 * an expired one, a revoked one, or a lead that is no longer there. Nothing about a lead can be
 * learned by trying, and the app does the same thing in all five cases: build a fresh session from
 * the birth details it already holds.
 *
 * A forged or malformed token is recorded as a guess, so repeated attempts lock the caller out of
 * the app routes through the authFail bucket. A token that is merely expired or revoked is not: that
 * is a normal app with an old token, not someone poking at the door.
 */

import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { leads, type Lead } from '@/server/db/schema';
import { bearerToken, checkAppSessionToken } from '@/server/appTokens';
import { noteAccessFailure } from '@/server/rateLimit';

/** Sent back for every kind of access failure, so none of them can be told apart. */
const UNAUTHORIZED = {
  success: false,
  error: 'Your session has expired. Please open the app again to refresh it.',
  /** The app's signal to mint a new session and retry once, rather than show this message. */
  reauth: true,
} as const;

const UNCONFIGURED = {
  success: false,
  error: 'The app is not available right now. Please try again later.',
} as const;

const noStore = { 'Cache-Control': 'no-store' };

export type AppAuth =
  | { ok: true; lead: Lead }
  | { ok: false; response: NextResponse };

function unauthorized(): NextResponse {
  return NextResponse.json(UNAUTHORIZED, { status: 401, headers: noStore });
}

/**
 * Checks the Authorization header and loads that lead.
 *
 * Returns the lead's row on success, or the response to send back. Callers must return
 * `auth.response` untouched — it is already the right status and body.
 */
export async function authenticateApp(request: Request): Promise<AppAuth> {
  const check = checkAppSessionToken(bearerToken(request.headers));

  if (!check.ok) {
    if (check.reason === 'unconfigured') {
      console.error('[T3D] No APP_SESSION_SECRET (or REPORT_LINK_SECRET / STRIPE_WEBHOOK_SECRET) is set, so the app cannot sign in.');
      return { ok: false, response: NextResponse.json(UNCONFIGURED, { status: 503, headers: noStore }) };
    }
    // A bad signature or a token of the wrong shape is somebody trying it on; an expired one is not.
    if (check.reason === 'invalid' || check.reason === 'malformed') await noteAccessFailure(request);
    return { ok: false, response: unauthorized() };
  }

  const rows = await db.select().from(leads).where(eq(leads.id, check.leadId)).limit(1);
  const lead = rows[0];

  // The lead is gone, or its sessions were revoked after this token was signed.
  if (!lead || lead.sessionEpoch !== check.epoch) return { ok: false, response: unauthorized() };

  return { ok: true, lead };
}
