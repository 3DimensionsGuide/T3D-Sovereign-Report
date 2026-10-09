/**
 * "Decide together" reading for the T3D app (server-side only).
 *
 * Two people each decide through their own Strategy and Authority. This
 * builds the practical frame for doing that side by side: how each person's
 * clarity tends to arrive, how to bring a question to each of them, and a
 * short order of steps. It is a frame for a conversation, never a verdict on
 * a relationship and never a prediction.
 *
 * Nothing about the second person is stored: the route calculates, builds
 * this and returns it.
 */

import { pickAuthorityContent, pickAuthorityKey as pickContentAuthorityKey, pickTypeContent, pickTypeKey } from '@/lib/app/transitCard';
import { AUTHORITY_PROTOCOL } from '@/lib/report/tokens';

export type Pace = 'moment' | 'voice' | 'time' | 'cycle';

export interface TogetherPersonInput {
  label: string;
  type: string | null;
  authority: string | null;
  /** "depends" when the birth time is unknown and the answer changes across the day. */
  certainty: 'sure' | 'depends';
  /** Every Type and Authority pairing seen across the day, when certainty is "depends". */
  possibilities: string[];
}

export interface TogetherPerson {
  label: string;
  type: string | null;
  authority: string | null;
  strategy: string | null;
  prompt: string | null;
  paceText: string | null;
  certainty: 'sure' | 'depends';
  possibilities: string[];
}

export interface DecideTogether {
  people: [TogetherPerson, TogetherPerson];
  /** Null when a Type or Authority cannot be pinned down without an exact birth time. */
  tempo: { title: string; text: string } | null;
  approach: Array<{ forLabel: string; howToAsk: string; theirPart: string }> | null;
  steps: string[];
  road: string | null;
  note: string | null;
  closing: string;
}

const PACE_BY_AUTHORITY: Record<string, Pace> = {
  Sacral: 'moment',
  Splenic: 'moment',
  Ego: 'moment',
  'Self-Projected': 'voice',
  Emotional: 'time',
  None: 'time',
  Lunar: 'cycle',
};

const PACE_PHRASE: Record<Pace, string> = {
  moment: 'answer in the moment',
  voice: 'find clarity by speaking it aloud',
  time: 'reach clarity over time',
  cycle: 'reach clarity across a lunar cycle, about 28 days',
};

/** "Sam tends to answer in the moment" / "You tend to answer in the moment". */
function paceClause(label: string, pace: Pace): string {
  return `${label} ${label === 'You' ? 'tend' : 'tends'} to ${PACE_PHRASE[pace]}`;
}

function paceOf(authority: string | null): Pace | null {
  const key = pickContentAuthorityKey(authority);
  return key ? (PACE_BY_AUTHORITY[key] ?? null) : null;
}

function howToAsk(label: string, isYou: boolean, typeKey: string | null): string {
  if (isYou) {
    switch (typeKey) {
      case 'Generator':
      case 'Manifesting Generator':
        return 'The best way to bring you a decision is a clear yes-or-no question rather than a finished plan to approve, with time for your body to respond first.';
      case 'Projector':
        return 'The best way to bring you a decision is to ask what you see and mean it as an invitation. Advice you offer uninvited tends to meet resistance, while advice that is asked for tends to land.';
      case 'Manifestor':
        return 'Others tend to do best when you inform them before you act. Being told early tends to remove resistance for everyone involved.';
      case 'Reflector':
        return 'The best way to bring you a decision is in a calm, familiar setting, coming back to it on different days.';
      default:
        return 'Bring decisions to yourself through your own Strategy, and leave room for the answer to arrive in its own time.';
    }
  }
  switch (typeKey) {
    case 'Generator':
    case 'Manifesting Generator':
      return `Bring ${label} a clear yes-or-no question rather than a finished plan to approve, then wait for the response. ${label}'s answer tends to be most honest when it comes from the body first.`;
    case 'Projector':
      return `Ask ${label} directly what they see, and mean it as an invitation. Advice that ${label} offers uninvited tends to meet resistance, while advice that is asked for tends to land.`;
    case 'Manifestor':
      return `Expect ${label} to inform rather than to ask, and say early that you would like to be told before they act. Being informed tends to remove resistance for everyone involved.`;
    case 'Reflector':
      return `Give ${label} time and a calm, familiar setting, and come back to the question on different days. A Reflector's answer tends to be clearer the more environments and days it has been through.`;
    default:
      return `Ask ${label} through their own Strategy, and leave room for the answer to arrive in its own time.`;
  }
}

/** "You" reads as "you" in the middle of a sentence. */
function lowerMidYou(text: string): string {
  return text.replace(/([a-z,] )You\b/g, '$1you');
}

function tempoNote(a: { label: string; pace: Pace }, b: { label: string; pace: Pace }): { title: string; text: string } {
  const slow = (p: Pace) => p === 'time' || p === 'cycle';
  const hasCycle = a.pace === 'cycle' || b.pace === 'cycle';

  if (slow(a.pace) && slow(b.pace)) {
    return {
      title: 'You both need time',
      text: `${paceClause(a.label, a.pace)}, and ${paceClause(b.label, b.pace)}. Agree on a day to come back to the decision${hasCycle ? ', and for a big one allow for a full cycle' : ''}, and treat "not yet" from either of you as a complete answer.`,
    };
  }
  if (slow(a.pace) || slow(b.pace)) {
    const [slowP, fastP] = slow(a.pace) ? [a, b] : [b, a];
    const cycleNote = slowP.pace === 'cycle' ? ', and for a big decision allow for the full cycle' : '';
    const middle =
      fastP.pace === 'moment'
        ? 'A quick answer is real for the person who gives it and is not a deadline for the other.'
        : 'Give the one who finds clarity by speaking a listener who does not advise.';
    return {
      title: 'Different speeds',
      text: lowerMidYou(`${paceClause(slowP.label, slowP.pace)}, while ${paceClause(fastP.label, fastP.pace)}. ${middle} Agree on a time to come back to it${cycleNote}.`),
    };
  }
  if (a.pace === 'voice' || b.pace === 'voice') {
    const [voiceP, other] = a.pace === 'voice' ? [a, b] : [b, a];
    return {
      title: 'One of you thinks out loud',
      text: `${paceClause(voiceP.label, 'voice')}. Offer a listener who does not advise. ${other.label === 'You' ? 'You' : other.label} can then answer in ${other.label === 'You' ? 'your' : 'their'} own way, separately, afterwards.`,
    };
  }
  return {
    title: 'You both answer quickly',
    text: `${a.label} and ${b.label} both tend to answer in the moment. Say the question aloud first so you are both answering the same one, and check each answer on its own before comparing.`,
  };
}

export function buildDecideTogether(
  you: TogetherPersonInput,
  partner: TogetherPersonInput,
  road: { youLabel: string; youNumber: string; partnerLabel: string; partnerNumber: string } | null,
): DecideTogether {
  const person = (p: TogetherPersonInput): TogetherPerson => {
    const typeContent = pickTypeContent(p.type);
    const authContent = pickAuthorityContent(p.authority);
    const authKey = pickContentAuthorityKey(p.authority);
    const pace = paceOf(p.authority);
    const protocol = authKey ? (AUTHORITY_PROTOCOL[authKey] ?? AUTHORITY_PROTOCOL['None']) : null;
    return {
      label: p.label,
      type: typeContent?.type ?? p.type,
      authority: authContent ? `${authContent.authority}` : p.authority,
      strategy: typeContent?.strategy ?? null,
      prompt: protocol?.prompt ?? null,
      paceText: pace ? `Tends to ${PACE_PHRASE[pace]}` : null,
      certainty: p.certainty,
      possibilities: p.possibilities,
    };
  };

  const a = person(you);
  const b = person(partner);
  const sure = a.certainty === 'sure' && b.certainty === 'sure';
  const paceA = paceOf(you.authority);
  const paceB = paceOf(partner.authority);

  const tempo = sure && paceA && paceB ? tempoNote({ label: you.label, pace: paceA }, { label: partner.label, pace: paceB }) : null;

  const approach = sure
    ? [
        {
          forLabel: partner.label,
          howToAsk: howToAsk(partner.label, false, pickTypeKey(partner.type)),
          theirPart: pickTypeContent(partner.type)?.strategyPractice ?? '',
        },
        {
          forLabel: you.label,
          howToAsk: howToAsk(you.label, true, pickTypeKey(you.type)),
          theirPart: pickTypeContent(you.type)?.strategyPractice ?? '',
        },
      ]
    : null;

  let roadLine: string | null = null;
  if (road) {
    roadLine =
      road.youNumber === road.partnerNumber
        ? `Today you are both in a Personal Day ${road.youNumber}, so the Road is pointing you the same way.`
        : `Today ${road.youLabel} is in a Personal Day ${road.youNumber} and ${road.partnerLabel} is in a Personal Day ${road.partnerNumber}. These are different kinds of day, so one of you may be more ready than the other.`;
  }

  const note = sure
    ? null
    : 'One or both birth times are not exact, and the Type or Authority changes across that day. The guidance below is general until the exact time is known. An exact time from a birth certificate settles it.';

  return {
    people: [a, b],
    tempo,
    approach,
    steps: [
      'State the decision as one plain question, so you are both answering the same thing.',
      'Each of you checks your own Authority on your own, before comparing. Do not pool answers first.',
      'Share your answers in the way that suits each of you, as described above.',
      `Add context from the Road and the Stoplight.${roadLine ? ` ${roadLine}` : ''} Context informs the decision; it does not make it.`,
      'If one answer is a yes and the other is not yet, treat that as information. Hold the decision until you can both answer, or choose a smaller step that fits both of you.',
    ],
    road: roadLine,
    note,
    closing:
      'This is a frame for talking, not a verdict on the two of you. It describes tendencies and does not predict how a decision will turn out.',
  };
}
