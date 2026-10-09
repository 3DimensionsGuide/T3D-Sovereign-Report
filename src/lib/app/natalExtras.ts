/**
 * Two more pieces for the Stoplight reading of your own chart:
 *  - the Lunar Nodes (North and South Node by sign and whole-sign house),
 *  - the aspects between your own planets, in plain words.
 *
 * Wording describes tendencies, never verdicts. Formulas and prose stay on the
 * server. Nothing here stores or logs anything.
 */

import type { ChartData, PlanetPosition } from '@/server/engines/types';

// ─── LUNAR NODES ────────────────────────────────────────────────────────────

export interface NodesReading {
  intro: string;
  north: { sign: string; formatted: string; house: number | null };
  south: { sign: string; formatted: string; house: number | null };
  /** Text for the sign pair. */
  growth: string;
  familiar: string;
  balance: string;
  /** Text for the house pair (null when the birth time is not known). */
  houseGrowth: string | null;
  houseFamiliar: string | null;
  note: string | null;
  closing: string;
}

interface SignPair {
  growth: string;
  familiar: string;
  balance: string;
}

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

/** Keyed by the North Node's sign; the South Node is the opposite sign. */
const NODE_BY_SIGN: Record<string, SignPair> = {
  Aries: {
    growth: 'self-reliance, personal initiative, courage and healthy self-assertion',
    familiar: 'diplomacy, fairness and seeing the other person’s side',
    balance: 'Lean on your gift for harmony and compromise without losing your own voice or putting off decisions.',
  },
  Taurus: {
    growth: 'steady stability, self-worth, calm presence and physical grounding',
    familiar: 'emotional depth, resilience through change and psychological insight',
    balance: 'Use that depth and strength to build quiet, practical, dependable security.',
  },
  Gemini: {
    growth: 'open-minded curiosity, gathering facts, clear everyday communication and listening',
    familiar: 'the big picture, high principles and broad vision',
    balance: 'Keep the wide view as a backdrop while staying flexible with everyday details and keeping your words simple.',
  },
  Cancer: {
    growth: 'emotional openness, nurturing care and a private place that feels like home',
    familiar: 'discipline, practical ambition and long-term responsibility',
    balance: 'Use your reliability to build a safe space where real warmth can grow.',
  },
  Leo: {
    growth: 'creative self-expression, joyful leadership and letting yourself be seen',
    familiar: 'group awareness, objectivity and ideals for the whole community',
    balance: 'Draw on your sense of community to share your own creative gifts and warm the people around you.',
  },
  Virgo: {
    growth: 'practical service, attention to detail, daily routines and discernment',
    familiar: 'empathy, trust and imagination',
    balance: 'Use that trust and compassion as an inner compass, while giving it practical, step-by-step form.',
  },
  Libra: {
    growth: 'partnership, listening, mutual respect and diplomacy',
    familiar: 'independent drive, courage and decisiveness',
    balance: 'Use your courage and self-reliance to stand up for fairness and build equal partnerships.',
  },
  Scorpio: {
    growth: 'deep emotional closeness, shared trust and loosening rigid control',
    familiar: 'material grounding, patience and steady habits',
    balance: 'Let your steadiness be the anchor while you allow meaningful change.',
  },
  Sagittarius: {
    growth: 'wider worldviews, philosophy, faith and long-range vision',
    familiar: 'quick thinking, fact-gathering and clever communication',
    balance: 'Use your facts and communication skills to explore the bigger questions of meaning.',
  },
  Capricorn: {
    growth: 'maturity, responsibility, long-term goals and accountability',
    familiar: 'emotional sensitivity, protective care and deep roots',
    balance: 'Stay anchored in the care you know, and use that security to build something lasting.',
  },
  Aquarius: {
    growth: 'connection, shared goals, collaboration and fresh ideas for your community',
    familiar: 'personal charisma, creative warmth and confidence',
    balance: 'Channel your confidence and warmth into causes that are bigger than you.',
  },
  Pisces: {
    growth: 'intuitive trust, imagination, compassion and acceptance',
    familiar: 'organization, efficiency and helpful service',
    balance: 'Rely on your competence to give form to your intuitive and artistic vision.',
  },
};

/** Keyed by the North Node's house: what that area is about, and the opposite (South Node) house's pointer. */
const NODE_BY_HOUSE: Record<number, { growth: string; familiar: string }> = {
  1: { growth: 'who you are and how you carry yourself: your presence, vitality and character', familiar: 'Lean on your relationship skills without losing your own footing.' },
  2: { growth: 'earning, resources and your sense of self-worth', familiar: 'Accept shared support and deep change with peace, while building your own base.' },
  3: { growth: 'everyday conversation, learning, short trips and the people nearby', familiar: 'Turn big beliefs into clear, practical everyday talk.' },
  4: { growth: 'home, family and your private emotional roots', familiar: 'Use your public experience and discipline to build a grounded home life.' },
  5: { growth: 'creativity, play, romance and self-expression', familiar: 'Use your friends and groups to support your own creative projects.' },
  6: { growth: 'daily work, routines and practical service', familiar: 'Use quiet reflection to keep your routines steady.' },
  7: { growth: 'one-to-one partnership and commitment', familiar: 'Bring your self-reliance into equal, supportive partnerships.' },
  8: { growth: 'deep closeness, shared resources and trust', familiar: 'Use your own stability and sense of worth as a base for deep trust.' },
  9: { growth: 'big ideas, higher learning, travel and meaning', familiar: 'Use your practical communication and attention to detail to explore larger truths.' },
  10: { growth: 'career, reputation and public contribution', familiar: 'Draw strength from your home and family roots to step into public leadership.' },
  11: { growth: 'groups, friendships and shared hopes', familiar: 'Channel personal creative joy into causes you share with others.' },
  12: { growth: 'rest, solitude, reflection and behind-the-scenes work', familiar: 'Use your practical discipline to give quiet time a steady structure.' },
};

const signOf = (longitude: number) => Math.floor((((longitude % 360) + 360) % 360) / 30);

function houseOf(longitude: number, ascendant: number): number {
  return ((signOf(longitude) - signOf(ascendant) + 12) % 12) + 1;
}

export function buildNodes(tropical: ChartData, birthTimeKnown: boolean): NodesReading | null {
  const nn = tropical.northNode;
  const sn = tropical.southNode;
  if (!nn || !sn || !SIGNS.includes(nn.sign as (typeof SIGNS)[number])) return null;
  const pair = NODE_BY_SIGN[nn.sign];
  if (!pair) return null;
  const asc = tropical.houses?.ascendant;
  const northHouse = birthTimeKnown && typeof asc === 'number' ? houseOf(nn.longitude, asc) : null;
  const southHouse = birthTimeKnown && typeof asc === 'number' ? houseOf(sn.longitude, asc) : null;
  const h = northHouse ? NODE_BY_HOUSE[northHouse] : null;
  return {
    intro:
      'The Lunar Nodes are not planets. They are two points opposite each other, where the Moon’s path crosses the Sun’s path. The North Node points to growth: unfamiliar ground that asks for attention and a willingness to learn. The South Node points to what is already familiar: natural strengths and habits that feel easy.',
    north: { sign: nn.sign, formatted: nn.formatted, house: northHouse },
    south: { sign: sn.sign, formatted: sn.formatted, house: southHouse },
    growth: `With your North Node in ${nn.sign}, growth tends to point toward ${pair.growth}.`,
    familiar: `With your South Node in ${sn.sign}, what already comes naturally tends to be ${pair.familiar}.`,
    balance: pair.balance,
    houseGrowth: northHouse && h ? `Your North Node is in your ${northHouse}${suffix(northHouse)} house, so this growth tends to play out around ${h.growth}.` : null,
    houseFamiliar: southHouse && h ? `Your South Node is in your ${southHouse}${suffix(southHouse)} house. ${h.familiar}` : null,
    note: birthTimeKnown
      ? null
      : 'No birth time was entered, so the houses for your Nodes are left out. The signs hold either way, because the Nodes move slowly.',
    closing:
      'The South Node is not a flaw to discard and the North Node is not a finish line. The idea is to feel grateful for what comes easily, then stretch toward the new from there. These are tendencies, not verdicts.',
  };
}

function suffix(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) return 'th';
  return n % 10 === 1 ? 'st' : n % 10 === 2 ? 'nd' : n % 10 === 3 ? 'rd' : 'th';
}

// ─── ASPECTS BETWEEN YOUR OWN PLANETS ───────────────────────────────────────

export type NatalAspectName = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
export type AspectFeel = 'easy' | 'challenging' | 'blend';

export interface NatalAspectItem {
  line: string;
  aspect: NatalAspectName;
  feel: AspectFeel;
  orb: number;
  /** Within 1 degree of exact. */
  tight: boolean;
  theme: string;
  text: string;
}

export interface NatalAspects {
  intro: string;
  items: NatalAspectItem[];
  note: string | null;
  closing: string;
}

type Body = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto';

const BODIES: Body[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

const NAME: Record<Body, string> = {
  sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto',
};

const ROLE: Record<Body, string> = {
  sun: 'sense of identity', moon: 'emotional needs', mercury: 'way of thinking and speaking',
  venus: 'way of loving and valuing', mars: 'drive and assertion', jupiter: 'optimism and growth',
  saturn: 'sense of structure and responsibility', uranus: 'need for independence and change',
  neptune: 'imagination and sensitivity', pluto: 'depth and capacity for change',
};

const ANGLES: Array<{ name: NatalAspectName; angle: number; feel: AspectFeel }> = [
  { name: 'conjunction', angle: 0, feel: 'blend' },
  { name: 'sextile', angle: 60, feel: 'easy' },
  { name: 'square', angle: 90, feel: 'challenging' },
  { name: 'trine', angle: 120, feel: 'easy' },
  { name: 'opposition', angle: 180, feel: 'challenging' },
];

/** Same orbs as the chart wheel and the Today screen: active within 3 degrees, tight within 1. */
const ACTIVE_ORB = 3;
const TIGHT_ORB = 1;

/** Easy and challenging wording for the pairs the sources describe. Keys are the two bodies, sorted. */
const PAIR: Record<string, { easy: string; hard: string }> = {
  'moon|sun': {
    easy: 'Who you are and what you emotionally need tend to agree, so you feel comfortable in your own skin.',
    hard: 'What you want to do and what makes you feel safe can pull apart, and balancing the two is a lifelong skill.',
  },
  'mars|sun': {
    easy: 'Natural vitality and a direct drive toward your goals.',
    hard: 'A lot of inner heat and some impatience. It helps to give that energy somewhere constructive to go.',
  },
  'jupiter|sun': {
    easy: 'Optimism, generosity and a sense that life has room for you.',
    hard: 'Enthusiasm can run ahead of what is realistic, so grounding the details helps.',
  },
  'saturn|sun': {
    easy: 'Natural discipline, steadiness and a strong sense of responsibility.',
    hard: 'A sense of heaviness or self-doubt can show up early. It tends to mature into resilience and quiet authority.',
  },
  'mercury|moon': {
    easy: 'Feelings and words tend to line up, so you can say what you feel.',
    hard: 'Logic and feeling can talk past each other, and analyzing a feeling can make it more complicated than it is.',
  },
  'moon|venus': {
    easy: 'Gentleness, warmth and a natural way of caring for people.',
    hard: 'Wanting comfort and wanting to please others can tug against each other.',
  },
  'mars|moon': {
    easy: 'Quick, courageous feeling and passion.',
    hard: 'Feelings can flare into defensiveness fast. Learning to pause tends to help.',
  },
  'jupiter|moon': {
    easy: 'Emotional generosity, optimism and a basic trust in life.',
    hard: 'Feelings can swing high and low, and it is easy to overdo comforts.',
  },
  'moon|saturn': {
    easy: 'Emotional steadiness and self-containment under pressure.',
    hard: 'A cautious, reserved streak with feelings. It tends to soften into loyalty and emotional self-reliance over time.',
  },
  'mars|mercury': {
    easy: 'A sharp, decisive mind and direct speech.',
    hard: 'A restless or argumentative mind. Thoughts can come out sharper than you meant them to.',
  },
  'jupiter|mercury': {
    easy: 'The knack of joining fine details to the big picture.',
    hard: 'Simple details can grow into overly large theories.',
  },
  'mercury|saturn': {
    easy: 'A careful, structured mind with good concentration.',
    hard: 'Self-criticism or worry can weigh on your thinking. At its best it becomes thorough, patient expertise.',
  },
  'mars|venus': {
    easy: 'Affection and desire tend to flow without much inner awkwardness.',
    hard: 'Wanting harmony and wanting independence can pull against each other, which keeps relationships lively.',
  },
  'jupiter|venus': {
    easy: 'Warmth, generosity and an appreciation for beauty and romance.',
    hard: 'A pull to overdo it, in spending or in idealizing.',
  },
  'saturn|venus': {
    easy: 'Loyalty, reliability and love that lasts.',
    hard: 'Affection can feel held back or slow to show. Saying it out loud helps, and it tends to ease with time.',
  },
  'jupiter|mars': {
    easy: 'Buoyant energy, ambition and confident risk-taking.',
    hard: 'Drive and enthusiasm can outrun your energy, so pacing yourself helps.',
  },
  'mars|saturn': {
    easy: 'Controlled, methodical strength and the ability to put energy into long, disciplined work.',
    hard: 'It can feel like pressing the gas and the brake at once. The frustration tends to build into endurance and staying power.',
  },
  'sun|uranus': {
    easy: 'Inventive, independent originality.',
    hard: 'Restlessness and a sudden urge to shake up routine to protect your freedom.',
  },
  'neptune|sun': {
    easy: 'Deep creative imagination and spiritual empathy.',
    hard: 'A fog can sit between who you are and an ungrounded ideal.',
  },
  'pluto|sun': {
    easy: 'Deep resilience and personal power.',
    hard: 'Inner pressure to keep shedding old layers and to be honest about who you are.',
  },
  'moon|uranus': {
    easy: 'Open-minded emotional independence.',
    hard: 'An uneven emotional rhythm, or feeling like a stranger in traditional settings.',
  },
  'moon|neptune': {
    easy: 'Artistic sensitivity and strong intuition.',
    hard: 'Soaking up the moods around you, so clear boundaries help.',
  },
  'moon|pluto': {
    easy: 'Psychological depth and emotional honesty.',
    hard: 'Intense emotional storms that push you to face hidden feelings, with real mastery as the result.',
  },
  'mercury|uranus': {
    easy: 'Flashes of insight and original thinking.',
    hard: 'Nervous mental tension or an erratic train of thought.',
  },
  'mercury|neptune': {
    easy: 'Poetic, imaginative and visual thinking.',
    hard: 'Trouble pinning down plain facts, because images come easier than linear logic.',
  },
  'mercury|pluto': {
    easy: 'A penetrating, investigative mind that spots what is hidden.',
    hard: 'Obsessive probing or suspicion, which eases when pointed at something worth investigating.',
  },
  'uranus|venus': {
    easy: 'Unconventional taste and open-minded relating.',
    hard: 'Sudden shifts in romance, or a strong need for personal space.',
  },
  'neptune|venus': {
    easy: 'Soulful, devoted love.',
    hard: 'Seeing partners through rose-colored glasses, so grounding the ideal in real life helps.',
  },
  'pluto|venus': {
    easy: 'Deep passion and a magnetic presence.',
    hard: 'High-stakes intensity or power struggles in love, which can turn into deep trust.',
  },
  'mars|uranus': {
    easy: 'Bold, inventive action.',
    hard: 'Explosive, unpredictable bursts of energy that need a constructive outlet.',
  },
  'mars|neptune': {
    easy: 'Inspired, gentle or artistic drive.',
    hard: 'Energy that scatters or goes toward ideals you cannot touch, so clear real-world focus helps.',
  },
  'mars|pluto': {
    easy: 'Great willpower and stamina.',
    hard: 'A fierce inner drive that works best channeled rather than forced.',
  },
};

const sortedKey = (a: Body, b: Body) => [a, b].sort().join('|');

const angDiff = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

function pairText(a: Body, b: Body, feel: AspectFeel): { text: string; theme: string } {
  const known = PAIR[sortedKey(a, b)];
  const theme = `${ROLE[a]} and ${ROLE[b]}`;
  if (known) {
    if (feel === 'easy') return { text: known.easy, theme };
    if (feel === 'challenging') return { text: known.hard, theme };
    return {
      text: `These two work as one impulse, so you tend to feel them together. At their best: ${known.easy.charAt(0).toLowerCase()}${known.easy.slice(1)} Under strain: ${known.hard.charAt(0).toLowerCase()}${known.hard.slice(1)}`,
      theme,
    };
  }
  if (feel === 'easy') {
    return { text: `Your ${ROLE[a]} and your ${ROLE[b]} tend to work together without much effort. It can be a natural strength, and it helps not to take it for granted.`, theme };
  }
  if (feel === 'challenging') {
    return { text: `Your ${ROLE[a]} and your ${ROLE[b]} can pull in different directions. That friction tends to keep you adjusting, and it is often where you grow most.`, theme };
  }
  return { text: `Your ${ROLE[a]} and your ${ROLE[b]} work as one impulse, so you tend to feel them together. How it feels depends on the nature of the two.`, theme };
}

export function buildNatalAspects(tropical: ChartData, birthTimeKnown: boolean): NatalAspects {
  const items: Array<NatalAspectItem & { sort: number }> = [];
  const bodies = BODIES.filter((b) => b !== 'moon' || birthTimeKnown);
  for (let i = 0; i < bodies.length; i += 1) {
    for (let j = i + 1; j < bodies.length; j += 1) {
      const a = bodies[i]!;
      const b = bodies[j]!;
      const pa = tropical[a] as PlanetPosition | undefined;
      const pb = tropical[b] as PlanetPosition | undefined;
      if (!pa || !pb) continue;
      const gap = angDiff(pa.longitude, pb.longitude);
      let best: { def: (typeof ANGLES)[number]; orb: number } | null = null;
      for (const def of ANGLES) {
        const orb = Math.abs(gap - def.angle);
        if (orb <= ACTIVE_ORB && (!best || orb < best.orb)) best = { def, orb };
      }
      if (!best) continue;
      const { text, theme } = pairText(a, b, best.def.feel);
      items.push({
        line: `${NAME[a]} ${best.def.name === 'conjunction' ? 'conjunct' : best.def.name} ${NAME[b]}`,
        aspect: best.def.name,
        feel: best.def.feel,
        orb: Math.round(best.orb * 10) / 10,
        tight: best.orb <= TIGHT_ORB,
        theme,
        text,
        sort: best.orb,
      });
    }
  }
  items.sort((x, y) => x.sort - y.sort);
  return {
    intro:
      'Aspects are the angles between your own planets. They show how different parts of you work together. Easy angles (trine, sextile) tend to feel like natural talent, and can be taken for granted. Challenging angles (square, opposition) tend to feel like friction, and are often where you grow most.',
    items: items.slice(0, 14).map(({ sort: _sort, ...rest }) => rest),
    note: birthTimeKnown
      ? null
      : 'No birth time was entered, so aspects to your Moon are left out. The Moon moves too far in a day to place reliably.',
    closing:
      'Angles within 1° of exact tend to be felt most. Angles up to 3° are quieter background. These are tendencies, not verdicts, and nearly every chart has both easy and demanding angles.',
  };
}
