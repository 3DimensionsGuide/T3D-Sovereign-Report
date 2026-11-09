/**
 * The two addresses T3D answers on, in one place.
 *
 * They were bare literals in eleven files, which is how every "contact us" on the site — broken
 * downloads, checkout questions, feedback, a request to correct a birth time — ended up pointing
 * at the privacy address. That address is a commitment made in the privacy policy, and burying
 * refund requests in it serves neither.
 *
 * The split is by what the message is, not by who reads it. One mailbox may forward to the other;
 * that is a mail setting, and it does not change which address a page should print.
 */

/**
 * Everything that is not a data request: downloads, payments, the report itself, bugs, feedback,
 * corrections, and anything a person would call "support".
 */
export const SUPPORT_EMAIL = 'support@3dimensions.guide';

/**
 * Data requests and questions about the privacy policy, and nothing else. Named in the policy, so
 * it is the one address that has to keep meaning exactly what it says.
 */
export const PRIVACY_EMAIL = 'privacy@3dimensions.guide';

/**
 * Who T3D's own email comes from, when RESEND_FROM_EMAIL is not set. A sending identity rather
 * than somewhere to write to — replies to it land wherever the mailbox is pointed, which is why
 * both templates also invite a plain reply.
 */
export const REPORT_FROM = 'T3D Studio <reports@3dimensions.guide>';
