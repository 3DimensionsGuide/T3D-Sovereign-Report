/**
 * Two more relationship pieces for the app's "You and them" screen:
 *  - open-center effects: how a center one person has defined tends to be felt by
 *    the other person, who has that center open (Human Design),
 *  - house overlays: where one person's planets fall in the other person's houses
 *    (whole-sign houses, tropical zodiac).
 *
 * Wording describes tendencies, never verdicts or scores. Formulas and prose stay
 * on the server. Nothing here stores or logs anything.
 */

import type { ChartData } from '@/server/engines/types';

// ─── OPEN-CENTER EFFECTS ────────────────────────────────────────────────────

export interface CenterKnowledge {
  /** Centers defined at every possible birth time (all of them when the time is known). */
  sure: ReadonlySet<string>;
  /** Centers defined at any possible birth time. */
  possible: ReadonlySet<string>;
}

export interface CenterEffectItem {
  center: string;
  theme: string;
  /** Who has the center defined, and who has it open, in plain words. */
  holders: string;
  /** What the person with the defined center brings. */
  brings: string;
  /** What the person with the open center tends to take in. */
  feels: string;
  watch: string;
  grows: string;
}

export interface CenterEffects {
  items: CenterEffectItem[];
  bothDefined: string[];
  bothOpen: string[];
  bothDefinedText: string;
  bothOpenText: string;
  leftOut: number;
  note: string | null;
  intro: string;
  closing: string;
}

interface Voice {
  /** The person with the open center, as a subject ("You", "Sam"). */
  r: string;
  /** Verb ending: "tend" for you, "tends" for a name. */
  t: string;
}

interface CenterText {
  name: string;
  theme: string;
  brings: string;
  feels: (v: Voice) => string;
  watch: (v: Voice) => string;
  grows: (v: Voice) => string;
}

const CENTER_ORDER = ['head', 'ajna', 'throat', 'g_center', 'heart', 'solar_plexus', 'sacral', 'spleen', 'root'] as const;

const CENTER_TEXT: Record<(typeof CENTER_ORDER)[number], CenterText> = {
  head: {
    name: 'Head',
    theme: 'inspiration and mental pressure',
    brings: 'a steady stream of inspiration and things to wonder about',
    feels: (v) => `${v.r} ${v.t} to pick up those questions and may feel a pull to work them out.`,
    watch: (v) => `It can turn into chasing answers that are not really ${v.r === 'You' ? 'yours' : 'theirs'} to solve.`,
    grows: (v) => `Noticing which questions belong to whom lets ${v.r} act as a clear filter for what is truly inspiring.`,
  },
  ajna: {
    name: 'Ajna',
    theme: 'how ideas are processed',
    brings: 'a settled way of thinking things through',
    feels: (v) => `${v.r} ${v.t} to absorb those ideas and may feel pressed to take a firm position.`,
    watch: (v) => `It can lead to sounding more certain than ${v.r} actually feel${v.r === 'You' ? '' : 's'}.`,
    grows: (v) => `Staying open lets ${v.r} look at an idea from many sides without locking into one.`,
  },
  throat: {
    name: 'Throat',
    theme: 'voice and expression',
    brings: 'a steady voice and a consistent way of expressing',
    feels: (v) => `${v.r} ${v.t} to feel a pull to speak up or draw attention when close to it.`,
    watch: () => 'The urge can come out as talking over others or filling every silence.',
    grows: (v) => `Waiting for the right moment or an invitation tends to help ${v.r === 'You' ? 'your' : 'their'} words land better.`,
  },
  g_center: {
    name: 'G Center',
    theme: 'identity, direction and love',
    brings: 'a steady sense of direction, identity and love',
    feels: (v) => `${v.r} ${v.t} to mirror that direction and adapt to it while close by.`,
    watch: (v) => `It can feel like needing the other person to know where ${v.r === 'You' ? 'you are' : 'they are'} headed, or holding tight to a person or a place.`,
    grows: (v) => `Treating identity as something that can flex lets ${v.r} enjoy many places and people without needing one fixed label.`,
  },
  heart: {
    name: 'Heart',
    theme: 'willpower, worth and drive',
    brings: 'steady willpower and drive',
    feels: (v) => `${v.r} ${v.t} to feel a pull to prove ${v.r === 'You' ? 'yourself' : 'themselves'} or to compete.`,
    watch: () => 'It can lead to promises that are hard to keep and to pushing past a comfortable limit.',
    grows: (v) => `Seeing that there is nothing to prove helps ${v.r} judge what is truly worth ${v.r === 'You' ? 'your' : 'their'} effort.`,
  },
  solar_plexus: {
    name: 'Solar Plexus',
    theme: 'emotions and the emotional wave',
    brings: 'an emotional wave with its own highs and lows',
    feels: (v) => `${v.r} ${v.t} to take in that wave and feel it strongly, bright moods and low ones both.`,
    watch: () => 'It can lead to smoothing things over to keep the peace, or to taking the other person’s mood personally.',
    grows: (v) => `Stepping away to settle lets ${v.r} see a mood for what it is, and be a calm mirror for it.`,
  },
  sacral: {
    name: 'Sacral',
    theme: 'life force and capacity for work',
    brings: 'steady life force and capacity for work',
    feels: (v) => `${v.r} ${v.t} to borrow that energy and keep going past ${v.r === 'You' ? 'your' : 'their'} own limit.`,
    watch: () => 'It can be hard to tell when enough is enough.',
    grows: (v) => `Learning when to rest shows ${v.r} where ${v.r === 'You' ? 'your' : 'their'} own energy is best spent.`,
  },
  spleen: {
    name: 'Spleen',
    theme: 'instinct, safety and well-being',
    brings: 'a steady instinct for safety and well-being',
    feels: (v) => `${v.r} ${v.t} to feel more secure and settled around them.`,
    watch: () => 'That borrowed security can make it hard to leave a situation that is no longer good.',
    grows: (v) => `Seeing where the safety comes from helps ${v.r} judge what is right for ${v.r === 'You' ? 'you' : 'them'} without leaning on it.`,
  },
  root: {
    name: 'Root',
    theme: 'pressure, stress and pace',
    brings: 'a steady way of handling pressure and deadlines',
    feels: (v) => `${v.r} ${v.t} to feel that pressure and speed up.`,
    watch: () => 'It can lead to rushing to be done with it, and to small mistakes.',
    grows: (v) => `Sitting with the urgency, and noticing it is not all ${v.r === 'You' ? 'yours' : 'theirs'}, lets ${v.r} stay calm.`,
  },
};

type CenterState = 'yes' | 'no' | 'maybe';

function centerState(k: CenterKnowledge, center: string): CenterState {
  if (k.sure.has(center)) return 'yes';
  if (k.possible.has(center)) return 'maybe';
  return 'no';
}

function unknownTimeWords(known: { you: boolean; them: boolean }): string | null {
  if (!known.you && !known.them) return 'both of your birth times are not known';
  if (!known.you) return 'your birth time is not known';
  if (!known.them) return 'their birth time is not known';
  return null;
}

const isYouLabel = (label: string) => label.trim().toLowerCase() === 'you';

export function buildCenterEffects(
  you: CenterKnowledge,
  them: CenterKnowledge,
  labels: { you: string; them: string },
  timesKnown: { you: boolean; them: boolean },
): CenterEffects {
  const items: CenterEffectItem[] = [];
  const bothDefined: string[] = [];
  const bothOpen: string[] = [];
  let leftOut = 0;
  const youIsYou = isYouLabel(labels.you);
  const youName = youIsYou ? 'You' : labels.you;
  const themName = labels.them;

  for (const key of CENTER_ORDER) {
    const text = CENTER_TEXT[key];
    const a = centerState(you, key);
    const b = centerState(them, key);
    if (a === 'maybe' || b === 'maybe') {
      leftOut += 1;
      continue;
    }
    if (a === 'yes' && b === 'yes') {
      bothDefined.push(text.name);
    } else if (a === 'no' && b === 'no') {
      bothOpen.push(text.name);
    } else {
      const youDefine = a === 'yes';
      const receiverIsYou = !youDefine && youIsYou;
      const voice: Voice = {
        r: youDefine ? themName : youName,
        t: receiverIsYou ? 'tend' : 'tends',
      };
      const definer = youDefine ? youName : themName;
      const definerHas = youDefine && youIsYou ? 'have' : 'has';
      const receiverHas = !youDefine && youIsYou ? 'have' : 'has';
      items.push({
        center: text.name,
        theme: text.theme,
        holders: `${definer} ${definerHas} it defined. ${voice.r} ${receiverHas} it open.`,
        brings: `${definer} tends to bring ${text.brings}.`.replace(/^You tends/, 'You tend'),
        feels: text.feels(voice),
        watch: text.watch(voice),
        grows: text.grows(voice),
      });
    }
  }

  const why = unknownTimeWords(timesKnown);
  const note = why
    ? leftOut > 0
      ? `Because ${why}, ${leftOut} ${leftOut === 1 ? 'center' : 'centers'} cannot be told apart and ${leftOut === 1 ? 'is' : 'are'} left out. What is listed holds for every hour of the day.`
      : `Because ${why}, we checked every hour of the day. What is listed holds for all of them.`
    : null;

  return {
    items,
    bothDefined,
    bothOpen,
    bothDefinedText:
      'When you both have a center defined, each of you tends to bring your own steady way of operating there. Neither tends to take in or amplify the other, which can feel familiar and calm.',
    bothOpenText:
      'When you both have a center open, it tends to be quiet between the two of you. Together you may both pick up whatever is around you there, such as the mood of a busy room, and notice the same thing at the same time.',
    leftOut,
    note,
    intro:
      'A defined center is a steady source. An open center takes in what is around it and tends to amplify it. Where one of you is defined and the other is open, the open person often feels the other’s energy strongly.',
    closing:
      'These are tendencies in how your two designs meet, not a verdict on the relationship. An open center is also where a person can learn the most, and each of you still decides through your own Strategy and Authority.',
  };
}

// ─── HOUSE OVERLAYS ─────────────────────────────────────────────────────────

export type OverlayBody = 'sun' | 'moon' | 'venus' | 'mars' | 'jupiter' | 'saturn';

export interface HouseOverlayItem {
  line: string;
  house: number;
  theme: string;
  text: string;
}

export interface HouseOverlayGroup {
  title: string;
  items: HouseOverlayItem[];
}

export interface HouseOverlays {
  groups: HouseOverlayGroup[];
  note: string | null;
  intro: string;
  closing: string;
}

const OVERLAY_BODIES: Array<{ body: OverlayBody; name: string }> = [
  { body: 'sun', name: 'Sun' },
  { body: 'moon', name: 'Moon' },
  { body: 'venus', name: 'Venus' },
  { body: 'mars', name: 'Mars' },
  { body: 'jupiter', name: 'Jupiter' },
  { body: 'saturn', name: 'Saturn' },
];

const HOUSE_TOPIC: Record<number, { theme: string; topic: string }> = {
  1: { theme: 'Self and presence', topic: 'self-image and presence' },
  2: { theme: 'Money and values', topic: 'money and what is valued' },
  3: { theme: 'Everyday talk', topic: 'everyday talk and learning' },
  4: { theme: 'Home and family', topic: 'home and family' },
  5: { theme: 'Romance and play', topic: 'romance, play and creativity' },
  6: { theme: 'Daily routines', topic: 'daily routines and work habits' },
  7: { theme: 'Close partnership', topic: 'close partnership and commitment' },
  8: { theme: 'Shared resources', topic: 'shared resources and deep trust' },
  9: { theme: 'Big ideas and travel', topic: 'big ideas, travel and belief' },
  10: { theme: 'Work and direction', topic: 'work, direction and public life' },
  11: { theme: 'Friends and hopes', topic: 'friends, groups and hopes' },
  12: { theme: 'Rest and inner life', topic: 'rest, solitude and the inner world' },
};

function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

/** The whole-sign house (1 to 12) a point falls in, counted from the sign of the Ascendant. */
export function wholeSignHouseOf(longitude: number, ascendant: number): number {
  const sign = (lon: number) => Math.floor((((lon % 360) + 360) % 360) / 30);
  return ((sign(longitude) - sign(ascendant) + 12) % 12) + 1;
}

function planetEffect(body: OverlayBody, mover: string, receiver: string, receiverIsYou: boolean): string {
  const tend = receiverIsYou ? 'tend' : 'tends';
  switch (body) {
    case 'sun':
      return `${mover} tends to light up this area for ${receiver}, bringing attention and energy to it.`;
    case 'moon':
      return `${receiver} ${tend} to feel emotionally at home in this area around ${mover}, and moods can show up here.`;
    case 'venus':
      return `This area tends to feel warmer and easier for ${receiver} with ${mover}.`;
    case 'mars':
      return `${mover} tends to stir this area up for ${receiver}, bringing energy and drive, and sometimes friction.`;
    case 'jupiter':
      return `${mover} tends to encourage ${receiver} here and help this area open up.`;
    case 'saturn':
      return 'This area tends to be taken seriously between you: steady and lasting, and sometimes heavy.';
  }
}

export function buildHouseOverlays(
  you: ChartData,
  them: ChartData,
  labels: { you: string; them: string },
  timesKnown: { you: boolean; them: boolean },
): HouseOverlays {
  const youIsYou = isYouLabel(labels.you);
  const youName = youIsYou ? 'You' : labels.you;
  const youPoss = youIsYou ? 'Your' : `${labels.you}'s`;
  const themPoss = `${labels.them}'s`;

  const build = (
    mover: ChartData, receiver: ChartData,
    moverName: string, moverPoss: string, receiverName: string, receiverPoss: string,
    receiverIsYou: boolean, moverTimeKnown: boolean,
  ): HouseOverlayItem[] => {
    const out: HouseOverlayItem[] = [];
    for (const { body, name } of OVERLAY_BODIES) {
      // The Moon travels too far in a day to place without a birth time.
      if (body === 'moon' && !moverTimeKnown) continue;
      const house = wholeSignHouseOf(mover[body].longitude, receiver.houses.ascendant);
      const info = HOUSE_TOPIC[house]!;
      out.push({
        line: `${moverPoss} ${name} in ${receiverPoss.toLowerCase() === 'your' ? 'your' : receiverPoss} ${ordinal(house)} house`,
        house,
        theme: info.theme,
        text:
          `This is the area of ${info.topic}. ` +
          planetEffect(body, moverName, receiverName, receiverIsYou),
      });
    }
    return out;
  };

  const groups: HouseOverlayGroup[] = [];
  const leftOutWho: string[] = [];

  if (timesKnown.you) {
    groups.push({
      title: `${themPoss.replace(/^Them's/, 'Their')} planets in your houses`,
      items: build(them, you, labels.them, themPoss, youName, youIsYou ? 'your' : `${labels.you}'s`, youIsYou, timesKnown.them),
    });
  } else {
    leftOutWho.push(youIsYou ? 'your' : `${labels.you}'s`);
  }
  if (timesKnown.them) {
    groups.push({
      title: `${youIsYou ? 'Your' : `${labels.you}'s`} planets in ${themPoss} houses`,
      items: build(you, them, youName, youPoss, labels.them, themPoss, false, timesKnown.you),
    });
  } else {
    leftOutWho.push(themPoss);
  }

  const moonLeft = (!timesKnown.you || !timesKnown.them);
  const parts: string[] = [];
  if (leftOutWho.length > 0) {
    parts.push(
      `Houses depend on the birth time of the person whose houses are being used, so ${leftOutWho.join(' and ')} houses are left out because that birth time is not known.`,
    );
  }
  if (moonLeft && groups.length > 0) {
    parts.push('A Moon is left out where its owner’s birth time is not known, because the Moon moves too far in a day to place reliably.');
  }

  return {
    groups,
    note: parts.length > 0 ? parts.join(' ') : null,
    intro:
      'A house overlay shows where in life one person’s planets land in the other person’s chart. It points to the areas of life where each of you tends to be felt most by the other.',
    closing:
      'These show where you may tend to affect each other, using whole-sign houses and the tropical zodiac. They are tendencies, not verdicts, and most pairs have both easy and demanding areas.',
  };
}
