/**
 * The report walkthrough: a recorded video in which the report somebody already bought is
 * explained to them, by the person who wrote it.
 *
 * Deliberately not a product row. Every product in src/lib/products/ maps to a generator that
 * builds a file the moment payment lands, and a walkthrough cannot work that way — somebody has
 * to record it. Forcing it through that pipeline would mean building a manual-fulfilment queue
 * for something with no customers yet, and worse, it would take the money before anyone had
 * agreed to do the work. The honest order is: they ask, you say yes, they pay, you record.
 *
 * It is also not advice, and the copy is careful about that for the same reason the whole product
 * is. Walking somebody through the document they are holding explains what is already written. It
 * does not put anyone in an advisory seat, which is what kept this offer honest enough to build.
 */

export interface WalkthroughOffer {
  /**
   * What it costs, as it should read on the page — "$120". Null switches the offer off
   * everywhere, which is the default: a price nobody has decided is not a price to advertise,
   * and an offer with a blank where the number goes is worse than no offer.
   */
  priceLabel: string | null;
  /** Roughly how long the recording runs. */
  minutes: number;
  /** When they can expect it, in words that survive a busy week. */
  turnaround: string;
}

export const WALKTHROUGH: WalkthroughOffer = {
  // ── Set this to switch the offer on. Nothing else here needs changing. ──
  priceLabel: null,
  minutes: 30,
  turnaround: 'within a week',
};

/** The offer is live only once it has a price. */
export function walkthroughAvailable(offer: WalkthroughOffer = WALKTHROUGH): boolean {
  return typeof offer.priceLabel === 'string' && offer.priceLabel.trim().length > 0;
}
