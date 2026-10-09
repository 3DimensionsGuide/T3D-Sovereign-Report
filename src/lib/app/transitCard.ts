/**
 * Transit meaning cards for the T3D app (server-side only).
 *
 * A transit is read the way the report reads it: the transiting body (the
 * quality of force) + the aspect (the dynamic) + the natal point it lands
 * on (the target). For the slow planets touching the Sun, Moon or
 * Ascendant, the report's own written theme and invitation are used. Every
 * other combination is composed from the same three parts.
 *
 * T3D rule: a transit is neutral weather. It never scores a day, predicts an
 * event, or gives an instruction. The decision always goes through the
 * reader's Human Design Strategy and Inner Authority.
 */

import {
  NATAL_TARGET_CONTENT,
  TRANSIT_ASPECT_CONTENT,
} from '@/lib/report/advanced/stoplight/transits-content';
import { AUTHORITY_CONTENT, TYPE_CONTENT } from '@/lib/report/section3/hd-content';

export const TRANSIT_BODIES = [
  'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
] as const;
export const TRANSIT_NATALS = [
  'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'ascendant', 'midheaven',
] as const;
export const TRANSIT_ASPECTS = ['conjunction', 'sextile', 'square', 'trine', 'opposition'] as const;
export const TRANSIT_NATURES = ['flow', 'friction', 'neutral'] as const;

export type Body = (typeof TRANSIT_BODIES)[number];
export type Natal = (typeof TRANSIT_NATALS)[number];
export type Aspect = (typeof TRANSIT_ASPECTS)[number];
export type Nature = (typeof TRANSIT_NATURES)[number];

export interface TransitCardInput {
  transiting: Body;
  natal: Natal;
  aspect: Aspect;
  nature: Nature;
  orb: number;
  peak: boolean;
  applying: boolean;
}

export interface TransitCardVehicle {
  type: string | null;
  authority: string | null;
}

export interface TransitCard {
  title: string;
  nature: Nature;
  natureLine: string;
  timingState: string;
  howLong: string;
  whatItIs: string;
  whereItLands: string;
  invitation: string;
  meetIt: {
    frame: string;
    strategy: string | null;
    authority: string | null;
    cue: string | null;
  };
  reminder: string;
  related: string[];
}

const BODY_NAME: Record<Body, string> = {
  moon: 'Moon', sun: 'Sun', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto',
};

const NATAL_NAME: Record<Natal, string> = {
  sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', ascendant: 'Ascendant', midheaven: 'Midheaven',
};

const ASPECT_NAME: Record<Aspect, string> = {
  conjunction: 'conjunct', sextile: 'sextile', square: 'square', trine: 'trine', opposition: 'opposite',
};

/** The quality of force each transiting body brings, in plain terms. */
const BODY_FORCE: Record<Body, string> = {
  moon: 'The Moon is the fastest-moving body, so it carries the mood and tone of the day: what you feel like doing, what you need, and what stirs up.',
  sun: 'The Sun brings light and attention. Whatever it touches becomes more visible, and it asks to be expressed rather than kept in the background.',
  mercury: 'Mercury is the messenger. It stirs thinking, talking, planning, reading and the small exchanges of the day.',
  venus: 'Venus is the planet of attraction and value. It colours what you are drawn to, how warm or guarded you feel, and what seems worth your time and money.',
  mars: 'Mars is drive. It brings energy, urgency and the push to act, and it also sharpens irritation when that energy has nowhere to go.',
  jupiter: 'Jupiter is expansion. It makes things feel larger and more possible, which is useful and also easy to overdo.',
  saturn: 'Saturn is structure and limits. It asks what is solid, what is yours to carry, and what needs a firmer foundation.',
  uranus: 'Uranus is the call for change. It loosens what has become stuck and can feel abrupt, restless or electric.',
  neptune: 'Neptune dissolves edges. It raises imagination and sensitivity, and it can blur clarity, so details deserve extra checking.',
  pluto: 'Pluto is deep transformation. It brings what is hidden to the surface so that something outworn can end and something truer can form.',
};

/** How long each body takes to make and leave a contact. */
const BODY_PACE: Record<Body, string> = {
  moon: 'The Moon moves about 13° a day, so a contact like this is felt for a few hours and is gone by tomorrow.',
  sun: 'The Sun moves about 1° a day, so a contact stays within range for several days either side of exact.',
  mercury: 'Mercury is quick but changes pace, so a contact usually stays in range for a few days. If Mercury turns retrograde it can return to the same point.',
  venus: 'Venus usually keeps a contact in range for several days. If it turns retrograde it can return to the same point later.',
  mars: 'Mars moves unevenly. A contact usually stays in range for about a week, and longer if Mars slows near a turn.',
  jupiter: 'Jupiter moves slowly, so a contact stays in range for weeks. A retrograde can bring it back for a second or third pass over a few months.',
  saturn: 'Saturn moves slowly, so a contact stays in range for weeks and often returns on a second or third pass as it turns retrograde and direct.',
  uranus: 'Uranus moves very slowly, so a contact stays in range for many weeks and can return over several months.',
  neptune: 'Neptune moves very slowly, so a contact stays in range for many weeks and can return over a year.',
  pluto: 'Pluto moves slowest of all, so a contact stays in range for many weeks and can return over more than a year.',
};

const ASPECT_DYNAMIC: Record<Aspect, { label: string; text: string }> = {
  conjunction: {
    label: 'Conjunction · 0°',
    text: 'The two energies sit on the same point and blend. Both are amplified, and it can be hard to tell them apart.',
  },
  sextile: {
    label: 'Sextile · 60°',
    text: 'A supportive angle. It offers an opening that takes a small effort to use, and it does not insist.',
  },
  square: {
    label: 'Square · 90°',
    text: 'A tense angle. The two energies pull in different directions, which creates friction and a reason to adjust.',
  },
  trine: {
    label: 'Trine · 120°',
    text: 'An easy angle. The two energies cooperate, so things tend to come with less effort. Ease still needs checking before you commit.',
  },
  opposition: {
    label: 'Opposition · 180°',
    text: 'A facing angle. Each energy sits across from the other, so you may feel pulled between two sides until you find a balance.',
  },
};

/** Natal points not covered by the report's Sun / Moon / Ascendant targets. */
const EXTRA_NATAL_TARGET: Record<'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'midheaven', string> = {
  mercury: 'your Mercury, how you think, speak and take things in. It can show up in conversation, planning and attention.',
  venus: 'your Venus, what you love and value. It can show up in relationships, pleasure, taste and money.',
  mars: 'your Mars, your drive and how you act. It can show up as energy, motivation and how you handle conflict.',
  jupiter: 'your Jupiter, where you grow and find opportunity. It can touch confidence, belief and appetite.',
  saturn: 'your Saturn, where you build mastery and carry responsibility. It can touch discipline, limits and commitments.',
  midheaven: 'your Midheaven, your public role and direction. It can touch work, reputation and what you are building.',
};

const NATURE_LINE: Record<Nature, string> = {
  flow: 'Flow · an easy current',
  friction: 'Friction · a point of resistance',
  neutral: 'Neutral · a blending of energies',
};

const NATURE_FRAME: Record<Nature, string> = {
  flow:
    'This is an easy current. Ease can feel like a green light, but it is not one. Let it make room, then check the pull with your Authority before you commit.',
  friction:
    'This is a point of resistance. Friction shows where something wants attention. It is not a reason to act and it is not a reason to avoid. It is a reason to slow down and let your Authority speak.',
  neutral:
    'This is a blending of two energies. Notice what feels amplified, name it, and let your Authority decide what, if anything, to do with it.',
};

const REMINDER =
  'A transit is weather, not a command. It does not predict what will happen. Decide through your Strategy and Inner Authority.';

export function pickAuthorityKey(authority: string | null): string | null {
  if (!authority) return null;
  const lower = authority.toLowerCase();
  const key = Object.keys(AUTHORITY_CONTENT).find((k) => lower.includes(k.toLowerCase()));
  if (key) return key;
  if (lower.includes('mental') || lower.includes('none') || lower.includes('environment')) return 'None';
  if (lower.includes('lunar')) return 'Lunar';
  return null;
}

export function pickTypeKey(type: string | null): string | null {
  if (!type) return null;
  const lower = type.toLowerCase();
  return Object.keys(TYPE_CONTENT).find((k) => lower.includes(k.toLowerCase())) ?? null;
}

function timingState(input: TransitCardInput): string {
  const orb = `${input.orb.toFixed(1)}° from exact`;
  if (input.peak) {
    return input.applying
      ? `${orb}. This is its peak, and it is still building toward exact.`
      : `${orb}. This is its peak, just past exact and starting to ease.`;
  }
  return input.applying
    ? `${orb}. It is building toward exact.`
    : `${orb}. It is past exact and fading.`;
}

export function buildTransitCard(input: TransitCardInput, vehicle: TransitCardVehicle): TransitCard {
  const { transiting, natal, aspect, nature } = input;

  // The report's own text is used where it exists: slow planets on Sun, Moon, Ascendant.
  const slow = transiting === 'jupiter' || transiting === 'saturn' || transiting === 'uranus'
    || transiting === 'neptune' || transiting === 'pluto';
  const reportTarget = natal === 'sun' || natal === 'moon' || natal === 'ascendant';
  const reportPiece = slow && reportTarget
    ? TRANSIT_ASPECT_CONTENT[transiting][aspect]
    : null;

  const whatItIs = reportPiece
    ? reportPiece.theme
    : `${BODY_FORCE[transiting]} ${ASPECT_DYNAMIC[aspect].text}`;

  let whereItLands: string;
  if (reportTarget) {
    const t = NATAL_TARGET_CONTENT[natal];
    whereItLands = `This is landing on ${t.label}, ${t.theme}`;
  } else {
    whereItLands = `This is landing on ${EXTRA_NATAL_TARGET[natal as keyof typeof EXTRA_NATAL_TARGET]}`;
  }

  const invitation = reportPiece
    ? reportPiece.invitation
    : nature === 'friction'
      ? 'Give the tension a little room before you respond to it. Notice what it is pointing at.'
      : nature === 'flow'
        ? 'Notice what is easier than usual, and use it for something you already want.'
        : 'Notice which of the two energies is louder, and give the quieter one a turn.';

  const typeKey = pickTypeKey(vehicle.type);
  const authKey = pickAuthorityKey(vehicle.authority);
  const typeContent = typeKey ? TYPE_CONTENT[typeKey] : null;
  const authContent = authKey ? AUTHORITY_CONTENT[authKey] : null;

  return {
    title: `${BODY_NAME[transiting]} ${ASPECT_NAME[aspect]} your ${NATAL_NAME[natal]}`,
    nature,
    natureLine: NATURE_LINE[nature],
    timingState: timingState(input),
    howLong: BODY_PACE[transiting],
    whatItIs,
    whereItLands,
    invitation,
    meetIt: {
      frame: NATURE_FRAME[nature],
      strategy: typeContent
        ? `Your Strategy as a ${typeContent.type}: ${typeContent.strategyPractice}`
        : null,
      authority: authContent
        ? `Your ${authContent.authority} Authority: ${authContent.doList[0]}.`
        : null,
      cue: typeContent
        ? `If you notice ${typeContent.notSelf.charAt(0).toLowerCase()}${typeContent.notSelf.slice(1)}, take it as a cue to come back to your Strategy.`
        : null,
    },
    reminder: REMINDER,
    related: [
      `astro:planet:${transiting}`,
      `astro:aspect:${aspect}`,
      natal === 'ascendant' || natal === 'midheaven' ? `astro:${natal}` : `astro:planet:${natal}`,
      'astro:orb',
      input.applying ? 'astro:applying' : 'astro:separating',
    ],
  };
}

export function pickTypeContent(type: string | null) {
  const key = pickTypeKey(type);
  return key ? (TYPE_CONTENT[key] ?? null) : null;
}

export function pickAuthorityContent(authority: string | null) {
  const key = pickAuthorityKey(authority);
  return key ? (AUTHORITY_CONTENT[key] ?? null) : null;
}
