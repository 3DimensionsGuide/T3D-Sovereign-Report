import type { VerdictKey } from './practiceTypes';
import type { LampState } from './triadTypes';

/**
 * Practice speaks in the same words as the rest of the app: Go, Slow, Pause.
 * Each of the three checks answers with one lamp, and the result is one lamp too.
 * The mapping is fixed and visible, never a hidden score.
 */

export type CheckKey = 'vehicle' | 'road' | 'stoplight';

const CHOICE_LAMP: Record<CheckKey, Record<string, LampState>> = {
  vehicle: { yes: 'go', unclear: 'slow', no: 'pause' },
  road: { toward: 'go', unsure: 'slow', away: 'pause' },
  stoplight: { green: 'go', yellow: 'slow', red: 'pause' },
};

/** The lamp a chosen answer lights, or null when nothing is chosen yet. */
export function lampForChoice(check: CheckKey, choiceId: string | undefined): LampState | null {
  if (!choiceId) return null;
  return CHOICE_LAMP[check][choiceId] ?? null;
}

/**
 * Proceed lights Go. "Look again" lights Slow. Both a held decision and a clear no light Pause, and the
 * sentence under the lamp says which of the two it is.
 */
export const VERDICT_LAMP: Record<VerdictKey, LampState> = {
  proceed: 'go',
  reconsider: 'slow',
  wait: 'pause',
  decline: 'pause',
};

export const LAMP_WORD: Record<LampState, string> = { go: 'Go', slow: 'Slow', pause: 'Pause' };
export const LAMP_PHRASE: Record<LampState, string> = {
  go: 'Your checks line up',
  slow: 'Go carefully',
  pause: 'Conditions favor waiting',
};

export const CHECK_NAME: Record<CheckKey, string> = {
  vehicle: 'Your Authority',
  road: 'Your Road',
  stoplight: 'The Stoplight',
};

/** One plain line for a screen reader: each check and its lamp, then the result. */
export function spokenChecks(answers: Partial<Record<CheckKey, string>>): string {
  const order: CheckKey[] = ['vehicle', 'road', 'stoplight'];
  return order
    .map((k) => {
      const lamp = lampForChoice(k, answers[k]);
      return `${CHECK_NAME[k]}: ${lamp ? LAMP_WORD[lamp] : 'not answered'}.`;
    })
    .join(' ');
}

/** Simple, visible rule: the Authority leads; the Road and the Stoplight add context. */
export function verdictFor(vehicle: string, road: string, light: string): VerdictKey {
  if (vehicle === 'no') return 'decline';
  if (vehicle === 'unclear') return 'wait';
  if (light === 'red') return 'wait';
  if (road === 'away') return 'reconsider';
  return 'proceed';
}
