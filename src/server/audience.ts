/**
 * The marketing list, kept in step with the consent recorded on the lead.
 *
 * People confirmed, by typing a code back, that they want to hear from T3D, and until now nothing
 * sent to them. Resend's marketing side holds that list; this is the one place the two are
 * reconciled, so they cannot drift.
 *
 * Four fields go out and no more:
 *
 *     email, first name, whether they have bought, when they consented
 *
 * Never a birth date, time or place, never a chart result, and never the lead id — an id a third
 * party holds is an id that can be joined back to a person later. That limit is why this is a
 * handful of fields rather than a database sync.
 *
 * Both directions matter. Adding on confirmation is the easy half. Removing on unsubscribe is the
 * half people skip, and it is the one that counts: a database that still says emailOptIn after
 * somebody has unsubscribed is a database claiming consent that has been withdrawn.
 */

import { Resend } from 'resend';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { leads } from '@/server/db/schema';

/** Set to the Audience id from the Resend dashboard. Without it, none of this runs. */
function audienceId(): string | undefined {
  return process.env.RESEND_AUDIENCE_ID || undefined;
}

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

/** True when the list is configured. Callers use it to stay quiet rather than to fail. */
export function audienceConfigured(): boolean {
  return !!audienceId() && !!process.env.RESEND_API_KEY;
}

export type SyncResult = 'added' | 'skipped' | 'failed' | 'not-configured';

/**
 * Puts a confirmed contact on the list.
 *
 * Called from the confirmation itself, so the list and the column are written in one moment and
 * cannot fall out of step. A failure here never fails the confirmation: the person has given
 * consent, which is the part that must be recorded, and a list that is one contact behind is a
 * smaller problem than a consent that was not saved.
 */
export async function addConfirmedContact(leadId: number): Promise<SyncResult> {
  const id = audienceId();
  const resend = client();
  if (!id || !resend) return 'not-configured';

  try {
    const [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    // Only a confirmed address goes on the list. Anything else is a bug upstream, and sending to
    // it would be the exact thing double opt-in exists to prevent.
    if (!lead || !lead.email || !lead.emailOptIn) return 'skipped';

    await resend.contacts.create({
      audienceId: id,
      email: lead.email,
      firstName: lead.firstName ?? '',
      unsubscribed: false,
    });
    return 'added';
  } catch (error) {
    console.error('[T3D Audience] could not add a confirmed contact:', error instanceof Error ? error.message : 'unknown');
    return 'failed';
  }
}

/**
 * Records that somebody unsubscribed, by turning consent off on their row.
 *
 * Resend handles the unsubscribe link itself and tells us afterwards. Without this the database
 * would keep saying the person wants email, and the next list rebuild would put them back on it.
 *
 * Matched by address because that is all an unsubscribe event carries. Every lead sharing it is
 * turned off: one person may hold several charts, and they unsubscribed, not one of their rows.
 */
export async function recordUnsubscribe(email: string): Promise<number> {
  const address = email.trim().toLowerCase();
  if (!address || !address.includes('@')) return 0;

  const updated = await db.update(leads)
    .set({
      emailOptIn: false,
      // The time and source of the original consent are left alone. They are the record that it
      // was given, which stays true after it is withdrawn, and is what we would show if asked.
      updatedAt: new Date(),
    })
    .where(eq(leads.email, address))
    .returning({ id: leads.id });

  return updated.length;
}
