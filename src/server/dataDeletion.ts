/**
 * What happens to a person's saved records when they ask to delete their data.
 *
 * A lead with no orders is removed completely. A lead with an order keeps only
 * the order (payment records are held for accounting and refunds), so its
 * personal details are blanked in place instead: name, email, birth details and
 * results all go.
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
  };
}
