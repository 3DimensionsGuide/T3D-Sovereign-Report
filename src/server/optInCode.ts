/**
 * Issue and confirm the email code behind the marketing opt-in.
 * Consent is recorded only when the right code is given back.
 */

import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { leads } from '@/server/db/schema';
import { sendOptInCodeEmail } from '@/lib/email/sendOptInCodeEmail';
import { optInFields } from '@/server/leadMatch';
import {
  CODE_TTL_SECONDS, checkCode, generateCode, hashCode, issuedTooRecently, type CodeCheck,
} from '@/server/emailCode';

export type IssueResult = 'sent' | 'failed' | 'too-soon' | 'already-opted-in' | 'not-found';

/** Makes a new code for the lead, stores its hash, and emails it. */
export async function issueOptInCode(leadId: number, email: string): Promise<IssueResult> {
  const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));
  if (!lead || lead.email.toLowerCase() !== email.trim().toLowerCase()) return 'not-found';
  if (lead.emailOptIn) return 'already-opted-in';
  if (issuedTooRecently(lead.optInCodeExpiresAt)) return 'too-soon';

  const code = generateCode();
  const hash = hashCode(lead.id, lead.email, code);
  if (!hash) return 'failed';

  await db.update(leads).set({
    optInCodeHash: hash,
    optInCodeExpiresAt: new Date(Date.now() + CODE_TTL_SECONDS * 1000),
    optInCodeAttempts: 0,
  }).where(eq(leads.id, lead.id));

  try {
    await sendOptInCodeEmail({ to: lead.email, firstName: lead.firstName, code });
    return 'sent';
  } catch (error: unknown) {
    console.error('[OptIn] Could not send the code email:', error instanceof Error ? error.message : 'unknown');
    return 'failed';
  }
}

export type ConfirmResult = CodeCheck | 'not-found' | 'already-opted-in';

/** Checks a code. On a match, records consent with its time and source. */
export async function confirmOptInCode(leadId: number, email: string, code: string): Promise<ConfirmResult> {
  const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));
  if (!lead || lead.email.toLowerCase() !== email.trim().toLowerCase()) return 'not-found';
  if (lead.emailOptIn) return 'already-opted-in';

  const result = checkCode(
    { hash: lead.optInCodeHash, expiresAt: lead.optInCodeExpiresAt, attempts: lead.optInCodeAttempts },
    lead.id, lead.email, code,
  );

  if (result === 'ok') {
    await db.update(leads).set({
      ...optInFields(lead, true, new Date()),
      optInCodeHash: null,
      optInCodeExpiresAt: null,
      optInCodeAttempts: 0,
      updatedAt: new Date(),
    }).where(eq(leads.id, lead.id));
  } else if (result === 'wrong') {
    await db.update(leads).set({ optInCodeAttempts: lead.optInCodeAttempts + 1 }).where(eq(leads.id, lead.id));
  }
  return result;
}
