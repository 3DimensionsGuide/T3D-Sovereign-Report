/**
 * "One lead per person." A new calculation reuses an existing lead when it is
 * the same email AND the same name AND the same birth date, time and place.
 * Anything different (a corrected birth time, another person on the same email)
 * stays a separate lead, so nobody's saved chart is overwritten by mistake.
 */

export interface LeadIdentity {
  email: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  birthDate: string;
  birthTime: string;
  city: string;
  country: string;
}

export interface StoredLead {
  id: number;
  email: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  birthData: { date: string; time: string; place: { city: string; country: string } };
  emailOptIn: boolean;
  emailOptInAt: Date | null;
  emailOptInSource: string | null;
  createdAt: Date;
}

const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

export function isSamePerson(row: StoredLead, who: LeadIdentity): boolean {
  return (
    norm(row.email) === norm(who.email) &&
    norm(row.firstName) === norm(who.firstName) &&
    norm(row.middleName) === norm(who.middleName) &&
    norm(row.lastName) === norm(who.lastName) &&
    row.birthData.date === who.birthDate &&
    row.birthData.time === who.birthTime &&
    norm(row.birthData.place.city) === norm(who.city) &&
    norm(row.birthData.place.country) === norm(who.country)
  );
}

/** The oldest matching lead, so the id people already hold (and any order) stays the one in use. */
export function findExistingLead(rows: StoredLead[], who: LeadIdentity): StoredLead | null {
  const matches = rows.filter((r) => isSamePerson(r, who));
  if (matches.length === 0) return null;
  return matches.reduce((a, b) => (a.createdAt.getTime() <= b.createdAt.getTime() ? a : b));
}

/** Consent only ever turns on from a calculation. Turning it off happens through unsubscribe. */
export function mergedOptIn(existing: boolean, requested: unknown): boolean {
  return existing || requested === true;
}

/** Where a marketing opt-in came from. Bump the version when the checkbox wording changes. */
export const OPT_IN_SOURCE_WEB_CALCULATOR = 'website-calculator-v1';

/**
 * The consent columns to write after a calculation. The time and source are stamped only
 * the first time consent turns on; a later calculation never rewrites them.
 */
export function optInFields(
  existing: { emailOptIn: boolean; emailOptInAt: Date | null; emailOptInSource: string | null } | null,
  requested: unknown,
  now: Date,
): { emailOptIn: boolean; emailOptInAt: Date | null; emailOptInSource: string | null } {
  const on = (existing?.emailOptIn ?? false) || requested === true;
  if (!on) return { emailOptIn: false, emailOptInAt: null, emailOptInSource: null };
  if (existing?.emailOptIn) {
    return {
      emailOptIn: true,
      emailOptInAt: existing.emailOptInAt,
      emailOptInSource: existing.emailOptInSource,
    };
  }
  return { emailOptIn: true, emailOptInAt: now, emailOptInSource: OPT_IN_SOURCE_WEB_CALCULATOR };
}
