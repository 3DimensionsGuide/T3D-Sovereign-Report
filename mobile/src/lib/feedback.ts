/**
 * "Send feedback": opens the person's own mail app with a ready subject and a short note.
 * The only extra detail added is the app version and phone system version, so a bug is easier to find.
 * Nothing about the person's chart, birth details or answers is included, and nothing is sent by the app itself.
 */
/**
 * Feedback is support, not a data request, so it goes to the support address. The website
 * keeps the same split in src/lib/contact.ts; the app is a separate project and cannot
 * import from it, so the two are kept in step by tests/app/contactEmail.test.ts.
 */
export const FEEDBACK_EMAIL = 'support@3dimensions.guide';

export function feedbackUrl(appVersion: string, system: string): string {
  const subject = 'T3D feedback';
  const body = [
    'What happened, or what would you like to see?',
    '',
    '',
    '',
    '---',
    `T3D ${appVersion} · ${system}`,
    'Please leave the line above so we know which version you are using. Nothing else about you is attached.',
  ].join('\n');
  return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
