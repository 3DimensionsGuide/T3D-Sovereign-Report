/**
 * "What brings you here?" on the welcome screen. The answer only chooses where the first-run card
 * points the person; it is saved on this phone and sent nowhere.
 */

export type Intent = 'self' | 'decide' | 'timing' | 'together';

export const INTENTS: ReadonlyArray<{ id: Intent; label: string }> = [
  { id: 'self', label: 'Understand myself' },
  { id: 'decide', label: 'Make a decision' },
  { id: 'timing', label: 'Find the right timing' },
  { id: 'together', label: 'Understand a relationship' },
];

export interface IntentPlan {
  /** One sentence for the first-run card. */
  line: string;
  /** Where the button goes, or null when there is nothing to open (the answer is already on Today). */
  href: '/practice' | '/timeline' | null;
  button: string | null;
}

export function isIntent(v: unknown): v is Intent {
  return v === 'self' || v === 'decide' || v === 'timing' || v === 'together';
}

/** Practice is Premium, so a free person is told where the answer starts rather than sent to a locked tab. */
export function intentPlan(intent: Intent, premium: boolean): IntentPlan {
  switch (intent) {
    case 'self':
      return { line: 'You came to understand yourself. Start with your Type and Authority above, then open the road and the sky below.', href: null, button: null };
    case 'decide':
      return premium
        ? { line: 'You came to make a decision. The Decide tool runs it through your Authority, your Road and the sky.', href: '/practice', button: 'Open Decide' }
        : { line: 'You came to make a decision. Your Authority is the place to start, and today’s signal tells you what the timing is like.', href: null, button: null };
    case 'timing':
      return { line: 'You came for timing. The signal lamp below reads today, and the Timeline looks ahead.', href: '/timeline', button: 'Open the Timeline' };
    case 'together':
      return premium
        ? { line: 'You came to understand a relationship. Together reads two charts side by side.', href: '/practice', button: 'Open Together' }
        : { line: 'You came to understand a relationship. Invite someone from My Chart to see the two of you side by side.', href: null, button: null };
  }
}
