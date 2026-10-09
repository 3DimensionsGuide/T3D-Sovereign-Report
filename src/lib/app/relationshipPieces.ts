/**
 * The other relationship pieces for the app's "You and them" screen:
 *  - Human Design channel connections (electromagnetic, companionship,
 *    dominance, compromise) between two charts,
 *  - a numerology pair reading (Life Path and Personal Year),
 *  - astrology synastry (main cross-chart connections, tropical).
 *
 * All wording describes tendencies, never verdicts or scores. Formulas and
 * prose stay on the server. Nothing here stores or logs anything.
 */

import { UNIQUE_CHANNELS } from '@/server/engines/human_design';
import type { ChartData } from '@/server/engines/types';

// ─── HUMAN DESIGN CHANNEL CONNECTIONS ───────────────────────────────────────

export type ConnectionKind = 'electromagnetic' | 'companionship' | 'dominance' | 'compromise';

export interface GateKnowledge {
  /** Gates held at every possible birth time (all gates when the time is known). */
  sure: ReadonlySet<number>;
  /** Gates held at any possible birth time. */
  possible: ReadonlySet<number>;
}

export interface ChannelConnection {
  kind: ConnectionKind;
  channel: string;
  gates: [number, number];
  centers: string;
  /** Who holds what, in plain words. */
  holders: string;
}

export interface ConnectionKindInfo {
  kind: ConnectionKind;
  title: string;
  mark: string;
  what: string;
  feels: string;
  watch: string;
}

export interface HdConnections {
  kinds: ConnectionKindInfo[];
  items: ChannelConnection[];
  /** Connections that could not be told apart because a birth time is not known. */
  leftOut: number;
  note: string | null;
  closing: string;
}

const KIND_INFO: Record<ConnectionKind, Omit<ConnectionKindInfo, 'kind'>> = {
  electromagnetic: {
    title: 'Electromagnetic',
    mark: 'Spark',
    what: 'One of you holds one end of a channel and the other holds the opposite end. Together you complete it.',
    feels: 'Often felt as chemistry and pull, and sometimes as friction. It tends to be energetic and alive between you.',
    watch: 'Chemistry is not the same as compatibility. The pull can feel strong and still not tell you whether something is right for you. Check it with your own Strategy and Authority.',
  },
  companionship: {
    title: 'Companionship',
    mark: 'Same road',
    what: 'You both have the same channel fully defined.',
    feels: 'Often felt as ease, familiarity and being understood without explaining. You tend to move through this theme in a similar way.',
    watch: 'It can feel quiet rather than exciting. Some people mistake that calm for something missing.',
  },
  dominance: {
    title: 'Dominance',
    mark: 'One brings it',
    what: 'One of you has the whole channel defined and the other has neither gate.',
    feels: 'The person with the channel tends to bring that energy steadily. The other person tends to take it in, learn from it and may feel it strongly.',
    watch: 'The channel is part of how they are made, so it is not something to change in them. It helps to see it as theirs, and to notice how much of it you want around you.',
  },
  compromise: {
    title: 'Compromise',
    mark: 'Pull',
    what: 'One of you has the whole channel and the other has just one of its gates.',
    feels: 'The person with one gate may want to do it their own way, while the whole channel tends to set the tone. It can feel like a quiet tug.',
    watch: 'This is often the connection that takes the most understanding. It tends to ease when both of you know what it is and neither takes it as personal.',
  },
};

const CENTER_NAME: Record<string, string> = {
  head: 'Head', ajna: 'Ajna', throat: 'Throat', g_center: 'G Center', heart: 'Heart',
  solar_plexus: 'Solar Plexus', sacral: 'Sacral', spleen: 'Spleen', root: 'Root',
};

type GateState = 'yes' | 'no' | 'maybe';

function gateState(k: GateKnowledge, gate: number): GateState {
  if (k.sure.has(gate)) return 'yes';
  if (k.possible.has(gate)) return 'maybe';
  return 'no';
}

/** Fixed in order of how much weight each kind tends to carry for people. */
function unknownTimes(known: { you: boolean; them: boolean }): string | null {
  if (!known.you && !known.them) return 'both of your birth times are not known';
  if (!known.you) return 'your birth time is not known';
  if (!known.them) return 'their birth time is not known';
  return null;
}

const KIND_ORDER: ConnectionKind[] = ['electromagnetic', 'companionship', 'dominance', 'compromise'];

export function buildConnections(
  you: GateKnowledge,
  them: GateKnowledge,
  labels: { you: string; them: string },
  timesKnown: { you: boolean; them: boolean },
): HdConnections {
  const items: ChannelConnection[] = [];
  let leftOut = 0;
  const youWord = labels.you;
  const themWord = labels.them;

  for (const ch of UNIQUE_CHANNELS) {
    const [g1, g2] = ch.gates;
    const a1 = gateState(you, g1); const a2 = gateState(you, g2);
    const b1 = gateState(them, g1); const b2 = gateState(them, g2);
    const states = [a1, a2, b1, b2];
    const anyYes = states.includes('yes');
    if (!anyYes && !states.includes('maybe')) continue;
    if (states.includes('maybe')) {
      // Count it as left out only if it could matter at all.
      const couldYou = a1 !== 'no' || a2 !== 'no';
      const couldThem = b1 !== 'no' || b2 !== 'no';
      if (couldYou && couldThem) leftOut += 1;
      continue;
    }
    const yourCount = (a1 === 'yes' ? 1 : 0) + (a2 === 'yes' ? 1 : 0);
    const theirCount = (b1 === 'yes' ? 1 : 0) + (b2 === 'yes' ? 1 : 0);
    let kind: ConnectionKind | null = null;
    let holders = '';
    if (yourCount === 2 && theirCount === 2) {
      kind = 'companionship';
      holders = 'You both have this channel.';
    } else if (yourCount === 2 && theirCount === 0) {
      kind = 'dominance';
      holders = `${youWord} have the whole channel. ${themWord} has neither gate.`;
    } else if (yourCount === 0 && theirCount === 2) {
      kind = 'dominance';
      holders = `${themWord} has the whole channel. ${youWord} have neither gate.`;
    } else if (yourCount === 2 && theirCount === 1) {
      kind = 'compromise';
      holders = `${youWord} have the whole channel. ${themWord} has one gate (${b1 === 'yes' ? g1 : g2}).`;
    } else if (yourCount === 1 && theirCount === 2) {
      kind = 'compromise';
      holders = `${themWord} has the whole channel. ${youWord} have one gate (${a1 === 'yes' ? g1 : g2}).`;
    } else if (yourCount === 1 && theirCount === 1) {
      const yourGate = a1 === 'yes' ? g1 : g2;
      const theirGate = b1 === 'yes' ? g1 : g2;
      if (yourGate !== theirGate) {
        kind = 'electromagnetic';
        holders = `${youWord} hold gate ${yourGate}. ${themWord} holds gate ${theirGate}.`;
      }
    }
    if (!kind) continue;
    items.push({
      kind,
      channel: ch.name,
      gates: [g1, g2],
      centers: `${CENTER_NAME[ch.fromCenter] ?? ch.fromCenter} to ${CENTER_NAME[ch.toCenter] ?? ch.toCenter}`,
      holders,
    });
  }

  items.sort((x, y) => KIND_ORDER.indexOf(x.kind) - KIND_ORDER.indexOf(y.kind) || x.gates[0] - y.gates[0]);

  const why = unknownTimes(timesKnown);
  const note = why
    ? leftOut > 0
      ? `Because ${why}, ${leftOut} possible ${leftOut === 1 ? 'connection' : 'connections'} cannot be told apart and ${leftOut === 1 ? 'is' : 'are'} left out. What is listed holds for every hour of the day.`
      : `Because ${why}, we checked every hour of the day. What is listed holds for all of them.`
    : null;

  return {
    kinds: KIND_ORDER.map((kind) => ({ kind, ...KIND_INFO[kind] })),
    items,
    leftOut,
    note,
    closing:
      'These are patterns in how your two charts meet, not a verdict on the relationship. Each of you still decides through your own Strategy and Authority.',
  };
}

// ─── NUMEROLOGY PAIR ────────────────────────────────────────────────────────

export interface NumberPair {
  youLifePath: string;
  themLifePath: string;
  lifePath: { title: string; text: string; bring: Array<{ who: string; text: string }> };
  year: { title: string; text: string; bring: Array<{ who: string; text: string }> };
  closing: string;
}

const LP_BRING: Record<number, string> = {
  1: 'independence, initiative and standing on your own',
  2: 'cooperation, tact and attention to the other person',
  3: 'expression, warmth and a feel for creativity',
  4: 'steadiness, structure and practical follow-through',
  5: 'change, curiosity and a need for freedom',
  6: 'care, responsibility and a pull toward home',
  7: 'reflection, analysis and a need for quiet',
  8: 'drive, organisation and a focus on results',
  9: 'compassion, a wide view and letting go',
};

const YEAR_THEME: Record<number, string> = {
  1: 'new starts and independent moves',
  2: 'patience, partnership and slower growth',
  3: 'expression, social life and creativity',
  4: 'building foundations and steady work',
  5: 'change, movement and loosening up',
  6: 'home, family and responsibility',
  7: 'rest, study and inner work',
  8: 'effort, results and money matters',
  9: 'finishing, clearing out and release',
};

const GROUPS: number[][] = [[1, 5, 7], [2, 4, 8], [3, 6, 9]];
const groupOf = (n: number) => GROUPS.findIndex((g) => g.includes(n));

const ROOT: Record<number, number> = { 11: 2, 22: 4, 33: 6 };
const root = (n: number) => ROOT[n] ?? n;
const possessive = (label: string) => (label.toLowerCase() === 'you' ? 'Your' : `${label}'s`);
const show = (n: number) => (ROOT[n] ? `${n}/${ROOT[n]}` : String(n));

export function buildNumberPair(
  you: { lifePath: number; personalYear: number },
  them: { lifePath: number; personalYear: number },
  labels: { you: string; them: string },
): NumberPair {
  const ry = root(you.lifePath);
  const rt = root(them.lifePath);
  const sameRoot = ry === rt;
  const sameGroup = !sameRoot && groupOf(ry) === groupOf(rt);

  let lpText: string;
  if (sameRoot) {
    lpText = `You share the same Life Path root, so you tend to see yourselves in each other. Strengths can double, and so can the habits that come with this number. It can help to notice where you both lean the same way.`;
  } else if (sameGroup) {
    lpText = `Your Life Paths sit in the same family of numbers (${GROUPS[groupOf(ry)].join(', ')}). That tends to show up as a similar way of approaching things, with different details.`;
  } else {
    lpText = `Your Life Paths come from different families of numbers, so you may often go about things differently. That tends to be a place to learn from each other rather than a problem.`;
  }
  if ((ry === 1 && rt === 2) || (ry === 2 && rt === 1)) {
    lpText += ' A 1 with a 2 can feel like a pull between “me” and “us”, and does well with plain conversation.';
  }
  if (you.lifePath !== ry || them.lifePath !== rt) {
    lpText += ' A master number carries the qualities of its root with a stronger pull toward its higher potential, so both are shown.';
  }

  const yearSame = you.personalYear === them.personalYear;
  const yearRootSame = root(you.personalYear) === root(them.personalYear);
  const yText = yearSame || yearRootSame
    ? `You are in the same Personal Year, so your timing tends to line up. You may be asking similar things of this year.`
    : `You are in different Personal Years, so this year's pace may feel different for each of you. One of you may lean toward movement and the other toward rest. Knowing that can keep you from reading a different pace as less care.`;

  return {
    youLifePath: show(you.lifePath),
    themLifePath: show(them.lifePath),
    lifePath: {
      title: `Life Path ${show(you.lifePath)} and ${show(them.lifePath)}`,
      text: lpText,
      bring: [
        { who: labels.you, text: `${possessive(labels.you)} Life Path ${show(you.lifePath)} tends to bring ${LP_BRING[ry]}.` },
        { who: labels.them, text: `${possessive(labels.them)} Life Path ${show(them.lifePath)} tends to bring ${LP_BRING[rt]}.` },
      ],
    },
    year: {
      title: `Personal Year ${show(you.personalYear)} and ${show(them.personalYear)}`,
      text: yText,
      bring: [
        { who: labels.you, text: `${possessive(labels.you)} year points toward ${YEAR_THEME[root(you.personalYear)]}.` },
        { who: labels.them, text: `${possessive(labels.them)} year points toward ${YEAR_THEME[root(them.personalYear)]}.` },
      ],
    },
    closing:
      'These numbers describe tendencies and things to learn together. They do not decide how a relationship goes. We use Life Path and Personal Year because they only need a birth date.',
  };
}

// ─── ASTROLOGY SYNASTRY ─────────────────────────────────────────────────────

type Body = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn';
type AspectName = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';

const ASPECTS: Array<{ name: AspectName; angle: number }> = [
  { name: 'conjunction', angle: 0 }, { name: 'sextile', angle: 60 }, { name: 'square', angle: 90 },
  { name: 'trine', angle: 120 }, { name: 'opposition', angle: 180 },
];

const BODY_NAME: Record<Body, string> = {
  sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn',
};

interface PairMeaning {
  a: Body; b: Body; weight: number; theme: string; easy: string; stretch: string;
}

/** The main cross-chart pairings, each described the same way in both directions. */
const PAIRS: PairMeaning[] = [
  { a: 'sun', b: 'moon', weight: 10, theme: 'identity meets emotional needs',
    easy: 'One of you tends to feel understood by the other, and daily life can feel natural together.',
    stretch: 'What one of you does and what the other needs may not always match, and this tends to ask for patience.' },
  { a: 'venus', b: 'mars', weight: 10, theme: 'affection meets drive and desire',
    easy: 'Attraction and warmth tend to move easily here, and each of you can feel wanted in the way you like.',
    stretch: 'Attraction can be strong and still come with some friction, since wanting and pursuing may not line up.' },
  { a: 'moon', b: 'moon', weight: 9, theme: 'emotional style and daily habits',
    easy: 'You tend to understand each other\'s moods and routines without much explaining.',
    stretch: 'You may need and soothe yourselves differently, so naming what you need can help.' },
  { a: 'sun', b: 'sun', weight: 7, theme: 'core sense of self',
    easy: 'You tend to back each other\'s direction and recognise what the other is about.',
    stretch: 'Your drives may pull in different directions, and each of you may want to lead.' },
  { a: 'sun', b: 'venus', weight: 7, theme: 'identity meets affection and values',
    easy: 'Warmth and appreciation tend to flow, and you may enjoy each other\'s company.',
    stretch: 'What one of you values and what the other shows may not always meet, and it helps to say so.' },
  { a: 'moon', b: 'venus', weight: 7, theme: 'emotional needs meet affection',
    easy: 'Care tends to land well, and comfort comes easily between you.',
    stretch: 'The way you show care and the way the other receives it may differ, so ask what lands.' },
  { a: 'venus', b: 'venus', weight: 6, theme: 'love style and shared tastes',
    easy: 'You tend to like and enjoy similar things, and show affection in compatible ways.',
    stretch: 'You may want love to look different, and it helps to learn each other\'s style.' },
  { a: 'mercury', b: 'mercury', weight: 6, theme: 'how you think and talk',
    easy: 'Conversation tends to be easy, and you may finish each other\'s thoughts.',
    stretch: 'You may mean different things by the same words, so checking what was heard can help.' },
  { a: 'sun', b: 'mars', weight: 5, theme: 'identity meets drive',
    easy: 'You tend to motivate each other and can get things done together.',
    stretch: 'Energy between you can turn to competing, so watch for who is steering.' },
  { a: 'mars', b: 'mars', weight: 5, theme: 'how each of you acts and handles conflict',
    easy: 'Your pace and way of acting tend to suit each other.',
    stretch: 'You may handle anger and effort differently, so agree how you want to disagree.' },
  { a: 'moon', b: 'saturn', weight: 8, theme: 'feelings meet structure',
    easy: 'This can feel steady and dependable, with a sense of being held.',
    stretch: 'It can feel heavy at times, as if feelings are being measured, so gentleness helps.' },
  { a: 'sun', b: 'saturn', weight: 7, theme: 'identity meets structure',
    easy: 'This tends to bring commitment and a sense of something lasting.',
    stretch: 'One may feel held back or judged by the other, which tends to ask for clear support.' },
  { a: 'venus', b: 'saturn', weight: 7, theme: 'affection meets commitment',
    easy: 'Loyalty and durability tend to grow, and love can feel serious in a good way.',
    stretch: 'Affection can feel restricted or slow to arrive, so saying it out loud can help.' },
  { a: 'sun', b: 'jupiter', weight: 4, theme: 'identity meets growth',
    easy: 'One of you tends to encourage and open things up for the other.',
    stretch: 'Enthusiasm can run ahead of what is realistic, so keep an eye on promises.' },
  { a: 'moon', b: 'jupiter', weight: 4, theme: 'feelings meet generosity',
    easy: 'This tends to feel kind and reassuring, with room to relax.',
    stretch: 'Too much of a good thing can creep in, so watch for overdoing it.' },
];

export interface SynastryItem {
  line: string;
  aspect: AspectName;
  orb: number;
  theme: string;
  text: string;
}

export interface Synastry {
  items: SynastryItem[];
  note: string | null;
  closing: string;
}

const angDiff = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

function bestAspect(lonA: number, lonB: number, luminary: boolean): { name: AspectName; orb: number } | null {
  const d = angDiff(lonA, lonB);
  let best: { name: AspectName; orb: number } | null = null;
  for (const asp of ASPECTS) {
    const limit = asp.name === 'sextile' ? (luminary ? 4 : 3) : luminary ? 6 : 4;
    const orb = Math.abs(d - asp.angle);
    if (orb <= limit && (!best || orb < best.orb)) best = { name: asp.name, orb };
  }
  return best;
}

export function buildSynastry(
  you: ChartData,
  them: ChartData,
  labels: { you: string; them: string },
  timesKnown: { you: boolean; them: boolean },
): Synastry {
  const found: Array<SynastryItem & { score: number }> = [];

  const usable = (who: 'you' | 'them', body: Body) => body !== 'moon' || timesKnown[who];

  const consider = (pm: PairMeaning, bodyYou: Body, bodyThem: Body) => {
    if (!usable('you', bodyYou) || !usable('them', bodyThem)) return;
    const luminary = bodyYou === 'sun' || bodyYou === 'moon' || bodyThem === 'sun' || bodyThem === 'moon';
    const asp = bestAspect(you[bodyYou].longitude, them[bodyThem].longitude, luminary);
    if (!asp) return;
    const text =
      asp.name === 'trine' || asp.name === 'sextile'
        ? pm.easy
        : asp.name === 'conjunction'
          ? `${pm.easy} A conjunction is the strongest link and can show up both ways, so you may notice it often.`
          : pm.stretch;
    const youWord = labels.you.toLowerCase() === 'you' ? 'Your' : `${labels.you}'s`;
    const themWord = `${labels.them}'s`;
    const verb = asp.name === 'conjunction' ? 'with' : `in ${asp.name} to`;
    found.push({
      line: `${youWord} ${BODY_NAME[bodyYou]} ${verb} ${themWord} ${BODY_NAME[bodyThem]}${asp.name === 'conjunction' ? ' (conjunction)' : ''}`,
      aspect: asp.name,
      orb: Math.round(asp.orb * 10) / 10,
      theme: pm.theme,
      text,
      // Tighter and more central pairings first.
      score: pm.weight * 10 - asp.orb * 3,
    });
  };

  for (const pm of PAIRS) {
    if (pm.a === pm.b) {
      consider(pm, pm.a, pm.b);
    } else {
      consider(pm, pm.a, pm.b);
      consider(pm, pm.b, pm.a);
    }
  }

  found.sort((x, y) => y.score - x.score);
  const items = found.slice(0, 8).map(({ score: _score, ...rest }) => rest);

  const why = unknownTimes(timesKnown);
  const note = why
    ? `Because ${why}, ${!timesKnown.you && !timesKnown.them ? 'both Moons are' : !timesKnown.you ? 'your Moon is' : 'their Moon is'} left out. The Moon\u2019s position changes too much across a day to compare reliably.`
    : null;

  return {
    items,
    note,
    closing:
      'These show where your two charts touch most closely, using the tropical zodiac. Easy links tend to bring ease and tight links tend to bring friction, and most relationships have both.',
  };
}
