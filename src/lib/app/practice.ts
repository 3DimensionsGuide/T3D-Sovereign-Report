/**
 * Practice content for the T3D app (server-side only).
 *
 * Two things:
 *  - the Decision Protocol: the report's three-step check (Authority, then
 *    the Road, then the Stoplight), personalised to the person's Authority;
 *  - the Seven-Day Experiment: the report's Type-specific experiment with
 *    three daily check-ins.
 *
 * The app keeps the person's own answers on the phone. This file only
 * supplies the wording. T3D rule: decisions go through Strategy and
 * Authority; the sky is weather. Nothing here tells anyone what to do.
 */

import { AUTHORITY_PROTOCOL, TYPE_EXPERIMENT } from '@/lib/report/tokens';

export interface PracticeChoice {
  id: string;
  label: string;
}

export interface PracticeStep {
  key: 'vehicle' | 'road' | 'stoplight';
  system: string;
  title: string;
  prompt: string;
  instruction: string;
  signal: string;
  choices: PracticeChoice[];
}

export type VerdictKey = 'proceed' | 'reconsider' | 'wait' | 'decline';

export interface PracticeData {
  type: string | null;
  authority: string | null;
  authorityLabel: string;
  decide: {
    intro: string;
    pace: string;
    /** Days to wait before looking at an unclear decision again. */
    revisitDays: number;
    steps: PracticeStep[];
    verdicts: Record<VerdictKey, { title: string; text: string }>;
  };
  experiment: {
    title: string;
    premise: string;
    checkins: Array<{ when: 'Morning' | 'Midday' | 'Evening'; question: string }>;
    finale: { title: string; intro: string; prompts: string[] };
  };
}

const AUTHORITY_ORDER = ['Sacral', 'Emotional', 'Splenic', 'Self-Projected', 'Ego', 'Mental', 'Lunar', 'None'] as const;

export function pickAuthorityKey(authority: string | null): (typeof AUTHORITY_ORDER)[number] | null {
  if (!authority) return null;
  const a = authority.toLowerCase();
  return AUTHORITY_ORDER.find((k) => a.includes(k.toLowerCase())) ?? null;
}

const PACE: Record<string, { text: string; days: number }> = {
  Sacral: { text: 'Your answer comes in the moment. Ask a plain yes-or-no question and notice the response before your mind joins in.', days: 0 },
  Emotional: { text: 'Your clarity comes over time. Give a decision at least one full emotional wave, often a night or more, before you commit.', days: 2 },
  Splenic: { text: 'Your signal comes once, in the first moment, and is quiet. Do not wait for a second one; retrieve the first.', days: 0 },
  'Self-Projected': { text: 'Your clarity comes through your own voice. Say it aloud to someone who will listen without advising.', days: 0 },
  Ego: { text: 'Your clarity comes from your own willpower. Ask what you want, not what you should want.', days: 0 },
  Mental: { text: 'Your clarity comes from sounding it out in different places and conversations, over a few days.', days: 3 },
  Lunar: { text: 'Your clarity comes across a lunar cycle, about 28 days. Let a big decision sit through it.', days: 28 },
  None: { text: 'Your clarity comes from sampling different environments and conversations over time.', days: 3 },
};

const ROAD_CHOICES: PracticeChoice[] = [
  { id: 'toward', label: 'It moves toward my path' },
  { id: 'unsure', label: 'I am not sure' },
  { id: 'away', label: 'It moves away from my path' },
];

const LIGHT_CHOICES: PracticeChoice[] = [
  { id: 'green', label: 'Green: conditions support movement' },
  { id: 'yellow', label: 'Yellow: proceed with awareness' },
  { id: 'red', label: 'Red: wait for the signal to change' },
];

const VEHICLE_CHOICES: PracticeChoice[] = [
  { id: 'yes', label: 'A clear yes' },
  { id: 'unclear', label: 'Not clear yet' },
  { id: 'no', label: 'A clear no' },
];

export function buildPractice(
  vehicle: { type: string | null; authority: string | null },
  context: { lifePath: number | null; personalYear: number | null; sunSign: string | null },
): PracticeData {
  const key = pickAuthorityKey(vehicle.authority);
  const protocol = AUTHORITY_PROTOCOL[key ?? 'Sacral'] ?? AUTHORITY_PROTOCOL['Sacral']!;
  const pace = PACE[key ?? 'Sacral'] ?? PACE['Sacral']!;

  const lp = context.lifePath;
  const py = context.personalYear;
  const sun = context.sunSign;

  const roadInstruction = lp
    ? `Your Life Path ${lp} has a direction, a kind of question your life keeps asking. Does this decision move toward that question or away from it?${py ? ` In a Personal Year ${py}, what is this year asking for?` : ''}`
    : 'Your numbers describe a direction, a kind of question your life keeps asking. Does this decision move toward that question or away from it?';

  const stoplightInstruction = `${sun ? `Your ${sun} Sun shapes how you meet decisions by nature. ` : ''}${py ? `Your Personal Year ${py} sets the broader timing. ` : ''}Green means conditions support movement. Yellow means proceed with awareness. Red means wait for the signal to change.`;

  const typeKey = Object.keys(TYPE_EXPERIMENT).find((k) => k.toLowerCase() === (vehicle.type ?? '').toLowerCase()) ?? 'Generator';
  const experiment = TYPE_EXPERIMENT[typeKey] ?? TYPE_EXPERIMENT['Generator']!;
  const whens = ['Morning', 'Midday', 'Evening'] as const;

  return {
    type: vehicle.type,
    authority: vehicle.authority,
    authorityLabel: vehicle.authority ? `${vehicle.authority} Authority` : 'Your Authority',
    decide: {
      intro: 'When you have to choose, run it through three checks in this order. Your Authority leads. The Road and the Stoplight add context; they do not overrule it.',
      pace: pace.text,
      revisitDays: pace.days,
      steps: [
        {
          key: 'vehicle',
          system: 'THE VEHICLE',
          title: 'Check your Authority',
          prompt: protocol.prompt,
          instruction: protocol.instruction,
          signal: protocol.signal,
          choices: VEHICLE_CHOICES,
        },
        {
          key: 'road',
          system: 'THE ROAD',
          title: 'Run the pattern check',
          prompt: 'Does this choice align with where your numbers are pointing?',
          instruction: roadInstruction,
          signal: 'Alignment feels like a deepening. Misalignment often arrives as a quiet sense of going against the grain.',
          choices: ROAD_CHOICES,
        },
        {
          key: 'stoplight',
          system: 'THE STOPLIGHT',
          title: 'Read the current signal',
          prompt: 'What are the current conditions signaling?',
          instruction: stoplightInstruction,
          signal: 'Timing is not an excuse to avoid. It is information about when effort will meet the least resistance.',
          choices: LIGHT_CHOICES,
        },
      ],
      verdicts: {
        proceed: {
          title: 'Your checks line up',
          text: 'Your Authority gave a clear yes, and neither the Road nor the Stoplight argues against it. This is a decision you can commit to.',
        },
        reconsider: {
          title: 'Your Authority says yes, your Road says look again',
          text: 'Your Authority is clear, but the choice may pull away from your direction. Ask what the yes is really for before you commit.',
        },
        wait: {
          title: 'Hold this one for now',
          text: 'Either your Authority is not clear yet, or the timing is red. Waiting is part of the process, not a failure of it. Come back to it when the signal changes.',
        },
        decline: {
          title: 'Your Authority says no',
          text: 'A clear no from your Authority is an answer. It does not need a justification to be valid.',
        },
      },
    },
    experiment: {
      title: experiment.title,
      premise: experiment.premise,
      checkins: experiment.checkins.map((raw, i) => ({
        when: whens[i] ?? 'Evening',
        question: raw.replace(/^(Morning|Midday|Evening):\s*/, ''),
      })),
      finale: {
        title: 'Look back at the week',
        intro: 'After seven days, notice what shifted. That is more useful data than any insight written in a report.',
        prompts: [
          'What did you notice most about how you make decisions?',
          'Where did following your Strategy and Authority make things easier?',
          'Where did you override them, and what happened?',
        ],
      },
    },
  };
}
