/**
 * What happens to a person's saved records when they ask to delete their data.
 *
 * A lead with no orders is removed completely. A lead with an order keeps only
 * the order (payment records are held for accounting and refunds), so its
 * personal details are blanked in place instead: name, email, birth details and
 * results all go.
 *
 * A blanked row keeps its id, so the route also raises its session number
 * (leads.session_epoch), which stops every app session token already handed out for it.
 * See src/server/appTokens.ts.
 */

export interface DeletionPlan {
  removeIds: number[];
  blankIds: number[];
}

export function planDeletion(leadIds: number[], idsWithOrders: ReadonlySet<number>): DeletionPlan {
  const removeIds: number[] = [];
  const blankIds: number[] = [];
  for (const id of leadIds) (idsWithOrders.has(id) ? blankIds : removeIds).push(id);
  return { removeIds, blankIds };
}

/**
 * True for a record already emptied by a deletion.
 *
 * Such a row keeps its id and its order, and carries placeholder birth data: 1 January of year 1,
 * midnight, at 0,0. That is still a valid birth moment as far as the engines are concerned, so
 * anything that recalculates charts in bulk will happily produce one for it and report it as
 * differing from the empty result stored — which is true, and meaningless. Tools that sweep the
 * leads table should skip these rather than count them.
 */
export function isBlankedLead(lead: { email?: string | null }): boolean {
  return typeof lead.email === 'string' && lead.email.endsWith('@deleted.invalid');
}

/** Values written over a record that has to stay because an order points to it. */
export function blankedLead(id: number) {
  return {
    email: `deleted-${id}@deleted.invalid`,
    firstName: 'Deleted',
    lastName: 'Deleted',
    middleName: null,
    birthData: {
      date: '0001-01-01',
      time: '00:00',
      place: { city: '', country: '', latitude: 0, longitude: 0, timezone: 'UTC' },
    },
    results: { astrology: {}, numerology: {}, humanDesign: {} },
    emailOptIn: false,
    emailOptInAt: null,
    emailOptInSource: null,
    optInCodeHash: null,
    optInCodeExpiresAt: null,
    optInCodeAttempts: 0,
  };
}
