/**
 * T3D Report — Design Tokens, Types & Calculation Helpers
 * Updated for Section 4: Road numerology fields
 */

// DataQualityReport is imported from schema/dataIntegrity
// and added to ReportData below
export type { DataQualityReport, BirthTimeCertainty } from './schema/dataIntegrity';

export const C = {
  base:          '#0D0D0E',
  baseSoft:      '#141416',
  parchment:     '#F5F5F3',
  parchmentDim:  '#A8A8A6',
  parchmentFaint:'#6B6B69',
  amber:         '#E5A93C',
  amberDim:      '#8C6520',
  amberLight:    '#FDF3DC',
  emerald:       '#1F8A4D',
  emeraldDim:    '#0E4425',
  emeraldLight:  '#EAF5EE',
  crimson:       '#991B1B',
  crimsonDim:    '#4C0D0D',
  crimsonLight:  '#FDEAEA',
  pageLight:     '#FAFAF9',
  rule:          '#DDDBD8',
  ruleFaint:     '#EDEBE8',
} as const;

export const F = {
  display: 'Playfair Display',
  sans:    'DM Sans',
} as const;

export const PAGE = {
  width:        612,
  height:       792,
  marginH:       60,
  marginV:       60,
  contentWidth: 492,
} as const;

// ─── REPORT DATA TYPE ─────────────────────────────────────────────────────────
export interface ReportConsent {
  reportStorageConsented: boolean;
  emailSequenceConsented: boolean;
  dataCollectedAt:        string;
}

export interface ReportData {
  // Personal
  firstName:   string;
  lastName:    string;
  email:       string;
  birthDate:   string;
  generatedAt: string;

  // Human Design
  hdType:           string;
  hdAuthority:      string;
  hdProfile:        string;
  hdStrategy:       string;
  hdNotSelf:        string;
  hdDefinedCenters: string[];
  hdChannels:       { name: string; gates: number[]; activatedBy: string; fromCenter: string; toCenter: string }[];
  hdIncarnationCross: string;   // e.g. "Right Angle Cross of Laws (41/31 | 44/24)" or generic fallback
  hdActiveGates: { gate: number; line: number; center: string; planet: string; epoch: string; longitude: number }[];

  // Numerology — core
  lifePath:         number;
  lifePathDisplay:  string;   // e.g., "34/7" — compound/reduced form
  lifePathCompound: number;   // e.g., 34 — intermediate sum before final reduction
  destiny:          number;
  personality:      number;
  soulUrge:         number;
  hiddenPassion:    number;
  karmicLessons:    number[];
  personalYear:     number;
  hasFullName:      boolean;  // true if full birth name was provided & calculated

  // Numerology — birthday & attitude
  birthdayNumber:   number;   // birth day reduced (e.g., 30 → 3)
  birthdayDisplay:  string;   // compound/reduced (e.g., "30/3")
  attitudeNumber:   number;   // month + day reduced
  attitudeDisplay:  string;   // compound/reduced (e.g., "12/3")

  // Numerology — pinnacles & challenges
  pinnacles:           { number: number; label: string; startAge: number; endAge: number | null }[];
  currentPinnacleIndex: number;       // 0–3, which pinnacle is active now
  challenges:          number[];      // [c1, c2, c3, c4]

  // Astrology
  tropicalSun:  string;
  tropicalMoon: string;
  tropicalAsc:  string;
  tropicalMC:   string;
  siderealSun:  string;
  siderealMoon: string;
  siderealAsc:  string;
  ayanamsha:    string;   // e.g., "Lahiri" — always named explicitly

  // Astrology — remaining planets (Advanced Stoplight section only; the
  // base report's Big Three pages don't use these). Sign name per planet,
  // per zodiac lens. Uranus/Neptune/Pluto are read by Whole-Sign house
  // (via firdariaWholeSignHouse against tropicalAsc/siderealAsc) rather
  // than by sign, since their sign is generational, not personal.
  tropicalMercury: string;
  tropicalVenus:   string;
  tropicalMars:    string;
  tropicalJupiter: string;
  tropicalSaturn:  string;
  tropicalUranus:  string;
  tropicalNeptune: string;
  tropicalPluto:   string;
  siderealMercury: string;
  siderealVenus:   string;
  siderealMars:    string;
  siderealJupiter: string;
  siderealSaturn:  string;
  siderealUranus:  string;
  siderealNeptune: string;
  siderealPluto:   string;

  // Extracted signs
  sunSign:    string;
  moonSign:   string;
  risingSign: string;
  consent:     ReportConsent;

  // Data Quality Report — output of runIntegrityCheck()
  // Surfaced on Page 43 and Birth-Time Sensitivity notices
  dataQuality: import('./schema/dataIntegrity').DataQualityReport;
}

// ─── PERSONAL YEAR ────────────────────────────────────────────────────────────
export function calculatePersonalYear(birthDate: string): number {
  const parts = birthDate.split('-');
  const month = parseInt(parts[1] ?? '1', 10);
  const day   = parseInt(parts[2] ?? '1', 10);
  const currentYear = new Date().getFullYear();
  function digitSum(n: number): number {
    return n.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);
  }
  function reduce(n: number): number {
    if (n === 11 || n === 22 || n === 33) return n;
    if (n <= 9) return n;
    return reduce(digitSum(n));
  }
  const total = digitSum(month) + digitSum(day) + digitSum(currentYear);
  return reduce(total);
}

// ─── COMPOUND LIFE PATH ───────────────────────────────────────────────────────
export function calculateLifePathFull(birthDate: string): {
  compound: number; reduced: number; display: string;
} {
  const parts = birthDate.split('-');
  const month = parseInt(parts[1] ?? '1', 10);
  const day   = parseInt(parts[2] ?? '1', 10);
  const year  = parseInt(parts[0] ?? '1990', 10);

  function digitSum(n: number): number {
    return n.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);
  }
  function reduce(n: number): number {
    if (n === 11 || n === 22 || n === 33) return n;
    if (n <= 9) return n;
    return reduce(digitSum(n));
  }

  const mR = reduce(digitSum(month));
  const dR = reduce(digitSum(day));
  const yR = reduce(digitSum(year));

  const compound = mR + dR + yR;
  const reduced  = reduce(compound);
  const display  = (compound !== reduced && compound > 9)
    ? `${compound}/${reduced}`
    : String(reduced);

  return { compound, reduced, display };
}

// ─── BIRTHDAY NUMBER ──────────────────────────────────────────────────────────
export function calculateBirthday(birthDate: string): { number: number; display: string } {
  const day = parseInt(birthDate.split('-')[2] ?? '1', 10);
  function digitSum(n: number): number {
    return n.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);
  }
  function reduce(n: number): number {
    if (n === 11 || n === 22) return n;
    if (n <= 9) return n;
    return reduce(digitSum(n));
  }
  const reduced = reduce(day);
  const display = (day !== reduced && day > 9) ? `${day}/${reduced}` : String(reduced);
  return { number: reduced, display };
}

// ─── ATTITUDE NUMBER ──────────────────────────────────────────────────────────
export function calculateAttitude(birthDate: string): { number: number; display: string } {
  const parts = birthDate.split('-');
  const month = parseInt(parts[1] ?? '1', 10);
  const day   = parseInt(parts[2] ?? '1', 10);

  function digitSum(n: number): number {
    return n.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);
  }
  function reduce(n: number): number {
    if (n === 11 || n === 22) return n;
    if (n <= 9) return n;
    return reduce(digitSum(n));
  }

  const mR = digitSum(month);
  const dR = digitSum(day);
  const compound = mR + dR;
  const reduced  = reduce(compound);
  const display  = (compound !== reduced && compound > 9) ? `${compound}/${reduced}` : String(reduced);
  return { number: reduced, display };
}

// ─── CURRENT PINNACLE INDEX ───────────────────────────────────────────────────
export function getCurrentPinnacleIndex(
  pinnacles: { startAge: number; endAge: number | null }[],
  birthDate: string
): number {
  const parts = birthDate.split('-');
  const birthYear = parseInt(parts[0] ?? '1990', 10);
  const currentAge = new Date().getFullYear() - birthYear;

  for (let i = 0; i < pinnacles.length; i++) {
    const p = pinnacles[i]!;
    if (p.endAge === null || currentAge <= p.endAge) return i;
  }
  return pinnacles.length - 1;
}

// ─── CHALLENGES ───────────────────────────────────────────────────────────────
export function calculateChallenges(birthDate: string): number[] {
  const parts = birthDate.split('-');
  const month = parseInt(parts[1] ?? '1', 10);
  const day   = parseInt(parts[2] ?? '1', 10);
  const year  = parseInt(parts[0] ?? '1990', 10);

  function digitSum(n: number): number {
    return n.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);
  }
  function reduce(n: number): number {
    // Challenges reduce fully (no master numbers preserved)
    if (n <= 9) return n;
    return reduce(digitSum(n));
  }

  const mR = reduce(digitSum(month));
  const dR = reduce(digitSum(day));
  const yR = reduce(digitSum(year));

  const c1 = Math.abs(mR - dR);
  const c2 = Math.abs(dR - yR);
  const c3 = Math.abs(c1 - c2);
  const c4 = Math.abs(mR - yR);

  return [c1, c2, c3, c4];
}

// ─── SIGN EXTRACTOR ───────────────────────────────────────────────────────────
export function extractSign(formatted: string): string {
  if (!formatted || formatted === '—') return '—';
  const parts = formatted.trim().split(' ');
  return parts[parts.length - 1] ?? '—';
}

// ─── HD TYPE SYNTHESIS ────────────────────────────────────────────────────────
const HD_TYPE_SYNTHESIS: Record<string, string> = {
  'Manifesting Generator': 'Built to respond, move fast, and multitask — your power multiplies when you skip steps the gut approves.',
  'Generator':             'Built to respond and sustain — your energy is magnetic when you\'re doing what genuinely lights you up.',
  'Projector':             'Built to guide and be recognized — your clarity for others is a gift that works best by invitation.',
  'Manifestor':            'Built to initiate and inform — you move first and bring others into what you\'ve already set in motion.',
  'Reflector':             'Built to sample and reflect the health of your environment — your wisdom deepens across the full lunar cycle.',
};
export function hdTypeSynthesis(type: string): string {
  return HD_TYPE_SYNTHESIS[type] ?? `As a ${type}, your design carries specific instructions for how to engage with life.`;
}

// ─── LIFE PATH SYNTHESIS ─────────────────────────────────────────────────────
const LIFE_PATH_SYNTHESIS: Record<number, string> = {
  1:  'Yours is a lifetime of self-definition and leadership — you learn through stepping into your own authority.',
  2:  'Yours is a lifetime of partnership and patience — you learn through listening deeply before you act.',
  3:  'Yours is a lifetime of creative expression and joy — you learn when you stop editing yourself before you speak.',
  4:  'Yours is a lifetime of building solid foundations — what you construct carefully is built to outlast you.',
  5:  'Yours is a lifetime of freedom and adaptability — you learn through variety and the courage to release what no longer serves.',
  6:  'Yours is a lifetime of responsibility and community — you learn through the long arc of relationships and service.',
  7:  'Yours is a lifetime of depth and investigation — you learn when you trust solitude as a source, not a symptom.',
  8:  'Yours is a lifetime of authority and material mastery — you learn through owning your power without apology.',
  9:  'Yours is a lifetime of completion and humanitarianism — you learn through letting go of what has run its course.',
  11: 'Yours is a Master Path of spiritual illumination — you learn by trusting your sensitivity as the precision instrument it is.',
  22: 'Yours is a Master Path of large-scale building — you learn by marrying vision with the discipline to bring it to ground.',
  33: 'Yours is a Master Path of compassionate service — you learn through giving without losing yourself in the giving.',
};
export function lifePathSynthesis(lifePath: number): string {
  return LIFE_PATH_SYNTHESIS[lifePath] ?? `Your Life Path ${lifePath} carries its own unique teaching.`;
}

// ─── SUN SIGN SYNTHESIS ───────────────────────────────────────────────────────
const SUN_SIGN_SYNTHESIS: Record<string, string> = {
  'Aries':       'You meet the world through initiative and directness — the first to arrive and the first to act.',
  'Taurus':      'You meet the world through steadiness and presence — what you build with care is built to last.',
  'Gemini':      'You meet the world through curiosity and connection — ideas and people charge you up.',
  'Cancer':      'You meet the world through feeling and protection — home and belonging anchor every move you make.',
  'Leo':         'You meet the world through presence and expression — you are built to be seen, and to make others feel seen.',
  'Virgo':       'You meet the world through discernment and service — precision and usefulness are your natural languages.',
  'Libra':       'You meet the world through relationship and balance — beauty, fairness, and harmony orient your compass.',
  'Scorpio':     'You meet the world through depth and transformation — the surface rarely holds your attention for long.',
  'Sagittarius': 'You meet the world through seeking and expansion — meaning and truth propel your movement.',
  'Capricorn':   'You meet the world through structure and mastery — you build carefully, and you build for the long term.',
  'Aquarius':    'You meet the world through innovation and collective vision — you tend to be a version ahead of the room.',
  'Pisces':      'You meet the world through feeling and fluidity — your sensitivity is the instrument, not the obstacle.',
};
export function sunSignSynthesis(sign: string): string {
  return SUN_SIGN_SYNTHESIS[sign] ?? `Your ${sign} Sun shapes how you meet and engage with the world around you.`;
}

// ─── PERSONAL YEAR THEMES ─────────────────────────────────────────────────────
export const PERSONAL_YEAR_THEMES: Record<number, { title: string; essence: string; themes: string[]; caution: string }> = {
  1: { title: 'Year of New Beginnings', essence: 'Seeds planted now carry unusual weight. This is a year to define direction, not to harvest it.', themes: ['Self-definition', 'New ventures', 'Independence', 'Clarity of identity'], caution: 'Resist the urge to finish what belongs to last cycle. The energy is for starting, not completing.' },
  2: { title: 'Year of Patience and Partnership', essence: 'Progress arrives through relationship and cooperation this year — not through solo effort.', themes: ['Partnership', 'Listening', 'Diplomacy', 'Gathering before acting'], caution: 'Avoid forcing timelines. What arrives slowly this year is often more durable.' },
  3: { title: 'Year of Creative Expression', essence: 'A year when self-expression and social connection carry genuine momentum.', themes: ['Creativity', 'Communication', 'Joy', 'Social expansion'], caution: 'Scattered attention is the risk. Channel the energy into one or two things that matter.' },
  4: { title: 'Year of Building and Foundation', essence: 'Discipline, structure, and steady work are rewarded this year.', themes: ['Discipline', 'Structure', 'Practicality', 'Long-term investment'], caution: 'Tedium is part of the process. The year rewards patience, not speed.' },
  5: { title: 'Year of Change and Freedom', essence: 'Movement, release, and new experience define this year.', themes: ['Change', 'Freedom', 'Travel', 'Release', 'Adaptability'], caution: 'Not all change that appears is progress. Discern before releasing what still has value.' },
  6: { title: 'Year of Responsibility and Home', essence: 'Relationships, home, family, and community take center stage.', themes: ['Relationships', 'Home', 'Service', 'Responsibility', 'Healing'], caution: 'The risk is over-giving. Service that depletes you does not serve anyone well.' },
  7: { title: 'Year of Reflection and Depth', essence: 'A year for inner work, solitude, and investigation.', themes: ['Solitude', 'Depth', 'Spiritual inquiry', 'Research', 'Inner clarity'], caution: 'Isolation differs from solitude. Stay connected while protecting your inner space.' },
  8: { title: 'Year of Power and Harvest', essence: 'What you built in previous years now becomes visible.', themes: ['Authority', 'Financial focus', 'Power', 'Harvest', 'Recognition'], caution: 'Force and manipulation block the year\'s natural flow. Power is available; grasping repels it.' },
  9: { title: 'Year of Completion and Release', essence: 'A nine-year cycle closes.', themes: ['Completion', 'Release', 'Endings', 'Integration', 'Compassion'], caution: 'Do not start major new projects this year. Close, complete, and integrate before the next cycle opens.' },
  11: { title: 'Master Year of Illumination', essence: 'A year of heightened intuition, spiritual alignment, and unusual clarity.', themes: ['Intuition', 'Spiritual alignment', 'Illumination', 'Inspiration'], caution: 'The intensity of this year is real. Rest and integration are not optional — they are part of the work.' },
  22: { title: 'Master Year of the Builder', essence: 'A year for large-scale vision and the discipline to bring it to ground.', themes: ['Legacy', 'Mastery', 'Large-scale building', 'Discipline'], caution: 'The scope of this year can be overwhelming. Build the next thing, not all the things.' },
};
// ─── AUTHORITY PROTOCOL (used by Page7DecisionProtocol) ──────────────────────
export const AUTHORITY_PROTOCOL: Record<string, {
  prompt: string; instruction: string; signal: string;
}> = {
  'Sacral': {
    prompt:      'What does your gut say right now?',
    instruction: 'Before reasoning through the decision, notice your body\'s immediate response. A full, warm yes. A flat or contracted no. Not a thought — a sensation.',
    signal:      'Sacral yes: lift, warmth, pull. Sacral no: flatness, contraction, silence.',
  },
  'Emotional': {
    prompt:      'Have you waited for emotional clarity?',
    instruction: 'Your authority operates across time. Notice how you feel about this decision across different emotional states — excited, neutral, reflective. Only commit when the clarity holds across moods.',
    signal:      'Emotional clarity: consistent, calm recognition across multiple emotional states.',
  },
  'Splenic': {
    prompt:      'What did your first moment tell you?',
    instruction: 'Your intuition speaks once, quietly, in the first instant of contact with a decision. Before analysis began. Retrieve that first signal — it carries more information than what came after.',
    signal:      'Splenic signal: a quiet knowing in the first moment. Often missed when overridden by reason.',
  },
  'Self-Projected': {
    prompt:      'What do you hear yourself say aloud?',
    instruction: 'Talk through this decision with a trusted person who will listen without advising. As you speak, notice what you actually say — not what you planned to say. Your authority lives in your own voice.',
    signal:      'Clarity comes through speaking, not through thinking alone.',
  },
  'Ego': {
    prompt:      'Does this align with what you genuinely want?',
    instruction: 'Not what you should want. Not what would be admirable. What do you, specifically, want — and are you willing to commit to it with your full will?',
    signal:      'Ego authority: a clear, unforced "I want this" that doesn\'t require justification.',
  },
  'None': {
    prompt:      'What does the environment reflect back?',
    instruction: 'Your authority is environmental — you need to move through different spaces and conversations before clarity arrives. Notice what you think, say, and feel in different contexts over time.',
    signal:      'Clarity comes from environmental sampling, not from a single internal signal.',
  },
};

// ─── TYPE EXPERIMENT (used by Page9SevenDay) ──────────────────────────────────
export const TYPE_EXPERIMENT: Record<string, {
  title: string; premise: string; checkins: string[];
}> = {
  'Manifesting Generator': {
    title:   'The Response Experiment',
    premise: 'For seven days, practice the foundational move of your design: responding rather than initiating. Before committing to anything new — a project, a conversation, a plan — pause and locate your Sacral response. Not a thought. A body signal. A full yes or the absence of one.',
    checkins: [
      'Morning: What is showing up today that I could respond to, rather than initiate?',
      'Midday: Where did I initiate or push when I could have waited for a pull?',
      'Evening: What felt genuinely lit up? What felt like effort against friction?',
    ],
  },
  'Generator': {
    title:   'The Response Experiment',
    premise: 'For seven days, commit to responding rather than initiating. Each time something appears in your environment — an opportunity, a question, a request — notice your Sacral response before your mind has a chance to override it.',
    checkins: [
      'Morning: What am I being invited to respond to today?',
      'Midday: Did I say yes from genuine enthusiasm, or from obligation?',
      'Evening: What drained me? What energized me? Note the pattern.',
    ],
  },
  'Projector': {
    title:   'The Recognition Experiment',
    premise: 'For seven days, practice waiting for genuine recognition before offering your insight — even casually. Notice how often you reach to share before being asked. Notice what happens when you hold the insight until invited.',
    checkins: [
      'Morning: Where might I be invited to guide today?',
      'Midday: Did I offer unsolicited advice? How was it received?',
      'Evening: Where did I feel recognized? Where did I feel invisible?',
    ],
  },
  'Manifestor': {
    title:   'The Inform Experiment',
    premise: 'For seven days, practice informing the people who will be affected by your actions before you take them — not to ask permission, but to remove resistance.',
    checkins: [
      'Morning: What am I planning to initiate today? Who needs to know?',
      'Midday: Where did I move without informing? What was the result?',
      'Evening: Where did informing first create space rather than friction?',
    ],
  },
  'Reflector': {
    title:   'The Environment Experiment',
    premise: 'For seven days, pay close attention to how different environments, people, and spaces affect your energy, clarity, and sense of self.',
    checkins: [
      'Morning: What environment am I moving into today, and how does it feel?',
      'Midday: What am I amplifying or reflecting from the people around me?',
      'Evening: Where did I feel most like myself today? Least like myself?',
    ],
  },
};

// ─── FIRDARIA TIME LORD & ANNUAL PROFECTIONS (used by Section 5 Stoplight timing pages) ───

export type FirdariaPlanet =
  | 'Sun' | 'Venus' | 'Mercury' | 'Moon' | 'Saturn'
  | 'Jupiter' | 'Mars' | 'North Node' | 'South Node';

interface FirdariaSlot { planet: FirdariaPlanet; years: number; }

const FIRDARIA_DAY_SEQUENCE: FirdariaSlot[] = [
  { planet: 'Sun',        years: 10 },
  { planet: 'Venus',      years: 8  },
  { planet: 'Mercury',    years: 13 },
  { planet: 'Moon',       years: 9  },
  { planet: 'Saturn',     years: 11 },
  { planet: 'Jupiter',    years: 12 },
  { planet: 'Mars',       years: 7  },
  { planet: 'North Node', years: 3  },
  { planet: 'South Node', years: 2  },
];

const FIRDARIA_NIGHT_SEQUENCE: FirdariaSlot[] = [
  { planet: 'Moon',       years: 9  },
  { planet: 'Saturn',     years: 11 },
  { planet: 'Jupiter',    years: 12 },
  { planet: 'Mars',       years: 7  },
  { planet: 'Sun',        years: 10 },
  { planet: 'Venus',      years: 8  },
  { planet: 'Mercury',    years: 13 },
  { planet: 'North Node', years: 3  },
  { planet: 'South Node', years: 2  },
];

export const FIRDARIA_TAGLINES: Record<FirdariaPlanet, string> = {
  Sun:          'Vitality, visibility, and leading from the front',
  Venus:        'Harmony, attraction, and relational ease',
  Mercury:      'Analysis, exchange, and gathering information',
  Moon:         'Receptivity, rhythm, and emotional foundation',
  Saturn:       'Structure, mastery, and consolidation',
  Jupiter:      'Expansion, opportunity, and growth',
  Mars:         'Initiative, drive, and direct action',
  'North Node': 'Momentum toward unfamiliar, forward-facing terrain',
  'South Node': 'Release, integration, and closing loops',
};

/** Traditional (whole-sign) planetary rulers — mirrors the Chart Ruler table on Page 31. */
export const TRADITIONAL_RULERS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
};

const FIRDARIA_ZODIAC_ORDER = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

/**
 * Whole Sign house number (1–12) of a planet's sign, counted from the
 * Ascendant sign. Originally built for Firdaria's day/night-chart check;
 * exported because the Advanced Stoplight section reuses the exact same
 * Whole-Sign math to place Uranus/Neptune/Pluto by house.
 */
export function firdariaWholeSignHouse(planetSign: string, ascSign: string): number | null {
  const p = FIRDARIA_ZODIAC_ORDER.indexOf(planetSign);
  const a = FIRDARIA_ZODIAC_ORDER.indexOf(ascSign);
  if (p === -1 || a === -1) return null;
  return 1 + ((p - a + 12) % 12);
}

/** Day chart (diurnal) when the Sun falls in houses 7–12 (above the horizon). */
function isDiurnalChart(sunSign: string, ascSign: string): boolean {
  const house = firdariaWholeSignHouse(sunSign, ascSign);
  if (house === null) return true; // default to a day chart when Rising is unconfirmed
  return house >= 7 && house <= 12;
}

function ageInYears(birthDate: string): { exact: number; completed: number } {
  const parts = birthDate.split('-');
  const y = parseInt(parts[0] ?? '1990', 10);
  const m = parseInt(parts[1] ?? '1', 10);
  const d = parseInt(parts[2] ?? '1', 10);
  const birth = Date.UTC(y, m - 1, d);
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const MS_PER_YEAR = 365.2425 * 24 * 60 * 60 * 1000;
  const exact = (today - birth) / MS_PER_YEAR;
  return { exact, completed: Math.floor(exact) };
}

export interface FirdariaPeriod {
  planet:    FirdariaPlanet;
  startAge:  number;
  endAge:    number;
  startYear: number;
  endYear:   number;
  tagline:   string;
}

export interface FirdariaResult {
  isDayChart:     boolean;
  sequence:       FirdariaPeriod[];   // the full 75-year cycle, in order
  currentIndex:   number;
  previous:       FirdariaPeriod | null;
  current:        FirdariaPeriod;
  next:           FirdariaPeriod | null;
  ageExact:       number;
  yearsElapsed:   number;
  yearsRemaining: number;
}

/**
 * Firdaria — classical (Persian) system of sequential planetary ruling periods across
 * a 75-year cycle. Sect (day/night) is set by the Sun's Whole Sign house: day charts
 * begin with the Sun, night charts begin with the Moon. Falls back to a day chart when
 * the Rising sign is unconfirmed (sect cannot be determined without it).
 */
export function calculateFirdaria(birthDate: string, sunSign: string, ascSign: string): FirdariaResult {
  const isDayChart = isDiurnalChart(sunSign, ascSign);
  const order = isDayChart ? FIRDARIA_DAY_SEQUENCE : FIRDARIA_NIGHT_SEQUENCE;
  const birthYear = parseInt(birthDate.split('-')[0] ?? '1990', 10);

  let cursor = 0;
  const sequence: FirdariaPeriod[] = order.map(({ planet, years }) => {
    const startAge = cursor;
    const endAge = cursor + years;
    cursor = endAge;
    return {
      planet,
      startAge,
      endAge,
      startYear: birthYear + startAge,
      endYear:   birthYear + endAge,
      tagline:   FIRDARIA_TAGLINES[planet],
    };
  });

  const { exact } = ageInYears(birthDate);
  let currentIndex = sequence.findIndex(p => exact >= p.startAge && exact < p.endAge);
  if (currentIndex === -1) currentIndex = exact < 0 ? 0 : sequence.length - 1;

  const current = sequence[currentIndex]!;

  return {
    isDayChart,
    sequence,
    currentIndex,
    previous: currentIndex > 0 ? sequence[currentIndex - 1]! : null,
    current,
    next: currentIndex < sequence.length - 1 ? sequence[currentIndex + 1]! : null,
    ageExact: exact,
    yearsElapsed: Math.max(0, exact - current.startAge),
    yearsRemaining: Math.max(0, current.endAge - exact),
  };
}

export interface ProfectionResult {
  age:   number;   // completed age for this profection year
  house: number;   // 1–12, Whole Sign, counted from the natal Ascendant
  sign:  string;
  lord:  string;   // traditional ruler of that sign — the "Lord of the Year"
}

/**
 * Annual Profections — advances one Whole Sign house per year of life from the natal
 * Ascendant (age 0 → House 1, age 1 → House 2, …). The ruling planet of that year's
 * house is the "Lord of the Year" — the single-year companion to the Firdaria major period.
 */
export function calculateProfection(birthDate: string, ascSign: string): ProfectionResult {
  const { completed } = ageInYears(birthDate);
  const house = (completed % 12) + 1;
  const ascIndex = FIRDARIA_ZODIAC_ORDER.indexOf(ascSign);
  const signIndex = ascIndex === -1 ? house - 1 : (ascIndex + house - 1) % 12;
  const sign = FIRDARIA_ZODIAC_ORDER[signIndex]!;
  return {
    age: completed,
    house,
    sign,
    lord: TRADITIONAL_RULERS[sign] ?? sign,
  };
}

// ─── DEFINITION TYPE — Single / Split / Triple Split / Quadruple Split ────────
//
// Definition describes how a person's defined Centers connect to each other.
// It's the connectivity of the graph whose nodes are the defined Centers and
// whose edges are the active (defined) Channels between them — the number of
// connected components is the Definition Type. This is pure graph math over
// data the Human Design engine already computes (hdDefinedCenters + hdChannels
// with their fromCenter/toCenter); no external formula or lookup table needed.

export type DefinitionType = 'Single' | 'Split' | 'Triple Split' | 'Quadruple Split' | 'No Definition';

export interface DefinitionResult {
  type: DefinitionType;
  circuitCount: number;       // number of connected groups of defined Centers
  groups: string[][];         // each connected group's Center names
}

const DEFINITION_LABELS: Record<number, DefinitionType> = {
  0: 'No Definition',   // Reflectors — no defined Centers at all
  1: 'Single',
  2: 'Split',
  3: 'Triple Split',
  4: 'Quadruple Split',
};

export const DEFINITION_MEANING: Record<DefinitionType, string> = {
  'Single':
    "All of your defined Centers connect in one continuous circuit — there's no gap anywhere inside you that needs another person to close it. That gives you a natural solidity: you don't wake up feeling like a piece is missing, and you don't need anyone else's presence to feel whole. You process quickly, largely on your own terms, and you enter relationships out of desire rather than mechanical need. The trade-off is real, though — your independence can read to Split-definition people (about 60% of the population) as aloofness or self-containment, when it's actually just a different wiring. Your growth doesn't come from finding a bridge; it comes from paying attention to what your open Centers pick up from the world around you, since that's where your conditioning actually happens.",

  'Split':
    "Two separate islands of definition are running inside you, and — on your own — they can't talk to each other. That produces a very specific, very real sensation: an underlying sense that something is missing, even when nothing is actually wrong. This isn't a flaw to fix; it's simple mechanics, and it's also exactly what wires half of humanity toward pair-bonding in the first place. When something (or someone) bridges the gap — a partner, a friend, even just the ambient hum of a public space — the two islands connect, and you feel a genuine, almost physical wave of relief and wholeness. Two people can experience this differently depending on the SIZE of what's missing: if it's a single hanging gate, you tend to fixate on that one quality as your own personal Holy Grail, and quietly blame yourself for not having it. If it's a whole missing channel, the story tends to point outward instead — frustration at a partner or the world for not supplying what you need. Either way, knowing the mechanism changes the experience: you can stop treating the gap as a personal failing, and start treating it as a design feature you can meet on purpose — including the simple, underrated fix of spending real time in public places, where the ambient aura does some of the bridging for you without the weight of depending on one person.",

  'Triple Split':
    "Three separate islands of definition are running inside you at once — closer to managing three ongoing internal conversations than one. Processing takes longer than it does for a Single or Split configuration, because energy has to move through more than one divide before anything settles into clarity. The relational implication is significant: no single person can bridge all three islands the way a partner can bridge a simple Split. One relationship might connect two of your islands; the third stays open regardless. That's not a problem to solve by finding the 'right' person — it's a sign that your wholeness was never meant to come from one relationship at all. It comes from movement: time in groups, in public places, around varied company. Passing through different auras works almost like a reset, briefly connecting and clearing each island before you're back in your own space. Without that movement, staying too long in one aura — even a loved one's — can start to feel claustrophobic or 'stir crazy,' which has nothing to do with how you feel about that person and everything to do with your system needing more circulation than any one relationship can supply.",

  'Quadruple Split':
    "Four separate islands of definition — the rarest configuration, and the slowest to process of any Definition type. Where other types might feel a quick click of recognition, you're built for a longer arc: information has to move through four distinct internal divides before a decision actually settles, which is exactly why people with this Definition are often described as late bloomers. It's not indecision — it's thoroughness. Because so much of you is already defined, you don't absorb the world the way more open configurations do; if anything, you're here to condition the people and environments around you more than the reverse, which can make relationships feel more one-sided or private than others expect. The people around you do you the biggest favor by simply giving your process room — rushing a Quadruple Split rarely produces a better decision, only an earlier one.",

  'No Definition':
    "No Centers are defined at all — every single one is open. This is the Reflector configuration, and it runs on an entirely different mechanic than the other four: rather than a fixed circuit (or circuits) of your own, you have a resistant, sampling aura that takes in and reflects whatever is around you without holding onto it permanently. That makes environment the single biggest factor in your life — the right space, the right company, and you genuinely thrive; the wrong one, and it shows up fast. Because nothing in you is fixed, your decision-making runs on its own timeline too: waiting through a full lunar cycle (about 28 days) for something significant lets the full range of your chart actually get illuminated before you commit. Lived well, that patience produces a distinctive kind of ongoing surprise and delight with the world; lived out of step with it, the same openness can just as easily curdle into disappointment. Neither is a flaw in you — it's a direct readout of whether your environment and your timing are actually correct.",
};

export function calculateDefinition(
  definedCenters: string[],
  channels: { fromCenter: string; toCenter: string }[]
): DefinitionResult {
  if (definedCenters.length === 0) {
    return { type: 'No Definition', circuitCount: 0, groups: [] };
  }

  // Union-Find over the defined Centers, connected by edges from active channels
  const parent = new Map<string, string>();
  const find = (c: string): string => {
    let root = c;
    while (parent.get(root) && parent.get(root) !== root) root = parent.get(root)!;
    parent.set(c, root);
    return root;
  };
  const union = (a: string, b: string) => {
    const ra = find(a), rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };

  for (const center of definedCenters) parent.set(center, center);
  for (const ch of channels) {
    if (definedCenters.includes(ch.fromCenter) && definedCenters.includes(ch.toCenter)) {
      union(ch.fromCenter, ch.toCenter);
    }
  }

  const groupMap = new Map<string, string[]>();
  for (const center of definedCenters) {
    const root = find(center);
    if (!groupMap.has(root)) groupMap.set(root, []);
    groupMap.get(root)!.push(center);
  }

  const groups = [...groupMap.values()];
  const circuitCount = groups.length;

  return {
    type: DEFINITION_LABELS[circuitCount] ?? 'Quadruple Split',
    circuitCount,
    groups,
  };
}

// ─── CIRCUIT BALANCE — Individual / Collective / Tribal ───────────────────────
//
// Tallies each of the user's active (defined) Channels against the full
// 36-channel circuit classification (src/lib/report/section3/gate-content.ts,
// sourced from a practitioner reference) to find which Circuit Group(s)
// dominate their design. A channel not found in the table (shouldn't happen
// with valid chart data, but data can be messy) is skipped rather than
// guessed at.

import { CHANNELS, findChannelCircuit, GATE_KEYNOTES, type CircuitGroup, type ChannelCircuit } from './section3/gate-content';
import { findGodheadByGate, type GodheadInfo } from './section3/godhead-content';
// MANDALA_START_LON / DEGREES_PER_GATE are duplicated here (not imported)
// deliberately: human_design.ts pulls in the astrology engine, which
// require()s the native swisseph addon — fine for a server-only API route,
// but tokens.ts is imported by report *page components*, and a value-import
// chain that drags a native binary into that layer breaks anywhere the
// binary isn't built for the current platform (hit this on both the sandbox
// and Tyler's own machine). These are fixed geometry constants of the Rave
// Mandala wheel, not derived data — they will not drift. Canonical source:
// src/server/engines/human_design.ts (MANDALA_START_LON, DEGREES_PER_GATE).
const MANDALA_START_LON = 302.0;      // 2°00' Aquarius — canonical Rave Mandala start point
const DEGREES_PER_GATE  = 360 / 64;   // 5.625°

export interface CircuitBalanceResult {
  matched: ChannelCircuit[];           // the user's active channels, resolved to circuit info
  counts: Record<CircuitGroup | 'Integration', number>;
  dominant: CircuitGroup | 'Integration' | 'None' | 'Even';
}

export function calculateCircuitBalance(
  activeChannels: { gates: number[] }[]
): CircuitBalanceResult {
  const matched: ChannelCircuit[] = [];
  const counts: Record<CircuitGroup | 'Integration', number> = {
    Individual: 0, Collective: 0, Tribal: 0, Integration: 0,
  };

  for (const ch of activeChannels) {
    const [a, b] = ch.gates;
    if (a === undefined || b === undefined) continue;
    const found = findChannelCircuit(a, b);
    if (found) {
      matched.push(found);
      counts[found.group] += 1;
    }
  }

  if (matched.length === 0) {
    return { matched, counts, dominant: 'None' };
  }

  const max = Math.max(counts.Individual, counts.Collective, counts.Tribal, counts.Integration);
  const topGroups = (Object.keys(counts) as (CircuitGroup | 'Integration')[])
    .filter(g => counts[g] === max);

  return {
    matched,
    counts,
    dominant: topGroups.length === 1 ? topGroups[0]! : 'Even',
  };
}

// ─── GODHEAD — the 16 faces governing the Incarnation Cross ──────────────────
//
// Determined SOLELY by the gate of the Personality (conscious) Sun — never
// the Earth, never the Design side. Looks up hdActiveGates for the one
// matching activation and resolves it against the verified 64-gate
// partition in section3/godhead-content.ts.

export interface GodheadResult {
  godhead: GodheadInfo | null;
  personalitySunGate: number | null;
}

export function calculateGodhead(
  activeGates: { gate: number; planet: string; epoch: string }[]
): GodheadResult {
  const pSun = activeGates.find(g => g.planet === 'sun' && g.epoch === 'personality');
  if (!pSun) {
    return { godhead: null, personalitySunGate: null };
  }
  const godhead = findGodheadByGate(pSun.gate) ?? null;
  return { godhead, personalitySunGate: pSun.gate };
}

// ─── VARIABLES (PHS) — Digestion / Environment / Perspective / Motivation ────
//
// Each Variable's Left/Right arrow is set by the Tone (1-6) of one chart
// point's activation — NOT by its Gate or Line. Tone is the third level of
// subdivision beneath Gate → Line → Color → Tone → Base, so it's derived
// from the same ecliptic-longitude math already used for longitudeToGate()
// in the HD engine (src/server/engines/human_design.ts), just carried two
// levels deeper: Color = Line / 6, Tone = Color / 6.
//
// Sun/Earth and the two Nodes are always exactly 180° apart on the wheel —
// an exact multiple of every subdivision level down to Tone — so either
// point of a pair always yields the identical Tone. Only one point per
// Variable needs to be read (source-verified: T3D PHILOSOPHER notebook,
// Ra Uru Hu — "The Substructure of Tone" / "10 Minute Lecture About
// Variable").
//
// The 4 Variables and their source points:
//   Digestion   (Design Sun)         — dietary/cognitive processing style
//   Environment (Design Node)        — the physical setting that supports you
//   Perspective (Personality Node)   — the vantage point you're here to see from
//   Motivation  (Personality Sun)    — what drives the conscious mind

const DEGREES_PER_LINE  = DEGREES_PER_GATE / 6;   // 0.9375°
const DEGREES_PER_COLOR = DEGREES_PER_LINE / 6;   // 0.15625°
const DEGREES_PER_TONE  = DEGREES_PER_COLOR / 6;  // 0.026041666...°

export type ArrowDirection = 'Left' | 'Right';

export interface VariableReading {
  tone: number; // 1-6
  arrow: ArrowDirection;
}

export interface VariablesResult {
  digestion: VariableReading | null;
  environment: VariableReading | null;
  perspective: VariableReading | null;
  motivation: VariableReading | null;
}

export const VARIABLE_MEANING: Record<'digestion' | 'environment' | 'perspective' | 'motivation', string> = {
  digestion: 'How you take in and process — food, information, and experience alike. This is your Primary Health System: the conditions under which you digest correctly and nourish the mind that runs your design.',
  environment: 'The physical setting your design actually thrives in — not a place in the abstract, but the conditions your body was built to be grounded by.',
  perspective: 'The vantage point you are here to see from — the specific, correct framework through which your conscious mind is meant to view the world.',
  motivation: 'What drives your conscious mind to act — the frequency underneath your outer, "who I think I am" awareness.',
};

// General mechanism explainer for the Variables page — independent of any
// one reader's arrows. Paraphrased from the T3D PHILOSOPHER notebook
// (Ra Uru Hu, "10 Minute Lecture About Variable"; Dr. Lvina Archers,
// "Introduction to Human Design Variables"; Leann Wolff, "Human Design
// Storyline | Variables Explained").
export const VARIABLES_MECHANISM =
  "Variables — also called PHS, Primary Health System — are four Left/Right arrows built " +
  "into every chart: Digestion, Environment, Perspective, and Motivation, each read off a " +
  "different pair of planetary activations. Left is rooted in an older, more strategic, " +
  "focused evolutionary pattern; Right is rooted in a newer, more receptive, peripheral " +
  "one. Neither side is better than the other — they're simply different operating " +
  "conditions your Vehicle actually runs on, quietly shaping how you eat and process " +
  "information, where your body physically thrives, how you naturally see, and how your " +
  "conscious mind takes things in.";

/** The named Left/Right label T3D uses for each Variable, per source terminology. */
export const VARIABLE_ARROW_LABEL: Record<
  'digestion' | 'environment' | 'perspective' | 'motivation',
  Record<ArrowDirection, string>
> = {
  digestion:   { Left: 'Active Brain',    Right: 'Passive Brain' },
  environment: { Left: 'Observed',        Right: 'Observer' },
  perspective: { Left: 'Focused View',    Right: 'Peripheral View' },
  motivation:  { Left: 'Strategic Mind',  Right: 'Receptive Mind' },
};

/** The T3D-voiced practical reading for each Variable's Left/Right arrow. */
export const VARIABLE_ARROW_MEANING: Record<
  'digestion' | 'environment' | 'perspective' | 'motivation',
  Record<ArrowDirection, string>
> = {
  digestion: {
    Left: "Your brain runs hot and needs steady fuel — skipping meals brings on fog and a real ‘hangry’ edge fast. Keep something to eat within reach, and eat on a regular rhythm rather than waiting until you're starving.",
    Right: "Your brain runs as a quiet, receptive sponge that doesn't need heavy, constant fuel to function well. Three forced meals a day dulls you down — keep food simple, and eat only when you're genuinely hungry.",
  },
  environment: {
    Left: "Your body is built to be active and visible — moving, doing, working in a space where people can see you in motion. A place that makes you sleepy or still is the wrong one; the right one energizes you.",
    Right: "Your body is built to stay low-key and take everything in from the sidelines, not perform for anyone. Calm, unpressured spaces recharge you — high-stress, high-visibility environments quietly drain you instead.",
  },
  perspective: {
    Left: "You see life through a narrow, precise lens — zeroing in on one specific detail or target at a time. Trying to take in everything at once just scatters your attention; depth is where your clarity actually lives.",
    Right: "You see life through a wide, soft-focus lens — the whole room, the whole mood, all at once, rather than any one thing. Forcing yourself into tunnel vision on a single detail works against how you actually see.",
  },
  motivation: {
    Left: "Your conscious mind runs on a clear agenda — linear, structured, and good at holding onto specific facts and sequences. You're built to think things through and offer that structured logic to others when it's asked for.",
    Right: "Your conscious mind works like a deep well — you don't always know what you know until someone asks the right question and draws it out of you. That's not a gap; it's a different, valid kind of intelligence, one that surrenders rather than pushes.",
  },
};

/** Longitude → Tone (1-6), via the same mandala math as longitudeToGate(). */
function longitudeToTone(longitude: number): number {
  const adjusted = ((longitude - MANDALA_START_LON) % 360 + 360) % 360;
  const posInGate = adjusted % DEGREES_PER_GATE;
  const posInLine = posInGate % DEGREES_PER_LINE;
  const posInColor = posInLine % DEGREES_PER_COLOR;
  return Math.min(Math.floor(posInColor / DEGREES_PER_TONE) + 1, 6);
}

function toneToArrow(tone: number): ArrowDirection {
  return tone <= 3 ? 'Left' : 'Right';
}

function readVariable(
  activeGates: { planet: string; epoch: string; longitude: number }[],
  planet: string,
  epoch: string
): VariableReading | null {
  const point = activeGates.find(g => g.planet === planet && g.epoch === epoch);
  if (!point) return null;
  const tone = longitudeToTone(point.longitude);
  return { tone, arrow: toneToArrow(tone) };
}

export function calculateVariables(
  activeGates: { planet: string; epoch: string; longitude: number }[]
): VariablesResult {
  return {
    digestion:   readVariable(activeGates, 'sun', 'design'),
    environment: readVariable(activeGates, 'northNode', 'design'),
    perspective: readVariable(activeGates, 'northNode', 'personality'),
    motivation:  readVariable(activeGates, 'sun', 'personality'),
  };
}

// ─── SPLIT BRIDGES — narrow (single hanging gate) vs wide (whole channel) ────
//
// For a Split/Triple Split/Quadruple Split chart, this identifies, for every
// pair of separate Definition groups, whether the person already has one
// gate of a connecting channel active (a "hanging gate" — a narrow split,
// where the psychology tends toward self-blame: "why can't I do this
// myself?"), or whether no candidate channel has either gate active at all
// (a wide split — the psychology tends outward: "why doesn't someone/
// something else supply this?"). Source: T3D PHILOSOPHER notebook — Ra Uru
// Hu ("Your Definition Type"), Richard Beaumont, Brenda Gregory.
//
// Uses the same 36-channel table as calculateCircuitBalance() (CHANNELS,
// from section3/gate-content.ts) plus GATE_KEYNOTES for each gate's Center,
// so no new data source is needed — just a different cut through what's
// already in hdActiveGates.

export interface HangingBridgeGate {
  gate: number;
  center: string;
  partnerGate: number;
  partnerCenter: string;
  channelName: string;
}

export interface GroupBridge {
  groupAIndex: number;
  groupBIndex: number;
  classification: 'narrow' | 'wide';
  hangingGates: HangingBridgeGate[]; // populated only when classification === 'narrow'
}

export function calculateSplitBridges(
  groups: string[][],
  activeGates: { gate: number }[]
): GroupBridge[] {
  const activeSet = new Set(activeGates.map(g => g.gate));
  const bridges: GroupBridge[] = [];

  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      const groupA = new Set(groups[i]);
      const groupB = new Set(groups[j]);
      const hangingGates: HangingBridgeGate[] = [];

      for (const ch of CHANNELS) {
        const [gA, gB] = ch.gates;
        const centerA = GATE_KEYNOTES[gA]?.center;
        const centerB = GATE_KEYNOTES[gB]?.center;
        if (!centerA || !centerB) continue;

        const spansAB =
          (groupA.has(centerA) && groupB.has(centerB)) ||
          (groupA.has(centerB) && groupB.has(centerA));
        if (!spansAB) continue;

        const aActive = activeSet.has(gA);
        const bActive = activeSet.has(gB);
        if (aActive && !bActive) {
          hangingGates.push({ gate: gA, center: centerA, partnerGate: gB, partnerCenter: centerB, channelName: ch.name });
        } else if (bActive && !aActive) {
          hangingGates.push({ gate: gB, center: centerB, partnerGate: gA, partnerCenter: centerA, channelName: ch.name });
        }
      }

      bridges.push({
        groupAIndex: i,
        groupBIndex: j,
        classification: hangingGates.length > 0 ? 'narrow' : 'wide',
        hangingGates,
      });
    }
  }

  return bridges;
}

// ─── INCARNATION CROSS — family (Profile-determined) + the four cross gates ──
//
// The cross NAME itself (e.g. "Right Angle Cross of Explanation") is already
// computed server-side by getIncarnationCross() in human_design.ts and
// stored as hdIncarnationCross — that function needs the full 64-gate name
// table, which belongs there. What this section adds is the FAMILY-level
// reading (Right Angle / Juxtaposition / Left Angle) and the four literal
// gates that make up the cross, both of which a report page needs directly.
//
// determineCrossFamily() and its Profile sets are duplicated here (not
// imported) for the same reason as MANDALA_START_LON/DEGREES_PER_GATE
// above: human_design.ts transitively requires the native swisseph addon,
// which breaks anywhere that binary isn't built — fine for a server-only
// API route, not safe for a file report *page components* import. This is
// fixed classification data (which Profiles fall in which family), not
// derived data — it will not drift. Canonical source: human_design.ts.
type CrossFamily = 'rightAngle' | 'juxtaposition' | 'leftAngle';
const RIGHT_ANGLE_PROFILES = new Set(['1/3', '1/4', '2/4', '2/5', '3/5', '3/6', '4/6']);
const JUXTAPOSITION_PROFILES = new Set(['4/1']);
const LEFT_ANGLE_PROFILES = new Set(['5/1', '5/2', '6/2', '6/3']);

function determineCrossFamily(profile: string): CrossFamily | null {
  if (JUXTAPOSITION_PROFILES.has(profile)) return 'juxtaposition';
  if (LEFT_ANGLE_PROFILES.has(profile)) return 'leftAngle';
  if (RIGHT_ANGLE_PROFILES.has(profile)) return 'rightAngle';
  return null; // unrecognized/malformed profile — fall back to a generic reading
}

export const CROSS_FAMILY_LABEL: Record<CrossFamily, string> = {
  rightAngle: 'Right Angle',
  juxtaposition: 'Juxtaposition',
  leftAngle: 'Left Angle',
};

export interface CrossFamilyMeaning {
  keynote: string;
  passage: string;
}

export const CROSS_FAMILY_MEANING: Record<CrossFamily, CrossFamilyMeaning> = {
  rightAngle: {
    keynote: 'Personal Destiny',
    passage:
      "Roughly two out of every three people carry a Right Angle cross, and yours is one of them: a self-contained curriculum, not a shared assignment. You're here to bump into the world on your own terms, live out exactly what your Profile is built to do, and let whatever wisdom comes from it accumulate as yours — not something owed to anyone else first. Other people can benefit enormously from you doing what you love, but that benefit is a byproduct, not the point, and you're not obligated to make your path about them. The shadow here is a specific kind of guilt: mistaking your self-orientation for selfishness, or waiting for a partner, a cause, or a community to hand you your purpose, when the mechanics were never built to depend on anyone showing up. Nobody else is required for your geometry to complete itself — that's not a flaw in the design, it's the design.",
  },
  juxtaposition: {
    keynote: 'Fixed Fate',
    passage:
      "You carry the rarest of the three geometries — only the 4/1 Profile lands here — and it makes you a genuinely unbending track. Nothing conditions you out of your own perspective, and nothing needs to: the quiet first-line research underneath your Profile becomes, through your fourth line, a fixed truth you externalize to the specific circle of friends and family already around you, not to the wider world. You're not here to change, evolve past, or soften your core stance to keep the peace — you're the anchor point other people orient around, whether they realize that's what's happening or not. The friction shows up almost entirely from the outside: people who try to bend, convince, or 'grow' you into someone more flexible, mistaking your fixed nature for stubbornness instead of recognizing it as correct mechanics. It was never going to work, and it was never supposed to.",
  },
  leftAngle: {
    keynote: 'Transpersonal Karma',
    passage:
      "A little over a third of people carry a Left Angle cross, and yours is one of them — which means your life's work doesn't complete alone. Specific people are mechanically necessary to it: encounters that aren't random, agreements that read almost like karma, where you meet the right person at the right time to deliver something, resolve something, or move something forward together. Depending on which line carries the weight, that shows up as bringing a hard-won solution to whoever's in front of you, or simply being witnessed as an authentic standard other people measure themselves against. The shadow is projection running in both directions: others can load you up with savior-sized expectations you never agreed to carry, and you can mistake the need for isolation as a Right Angle person might, retreating from the very interactions your design actually depends on. The people your path keeps intersecting with aren't distractions from your purpose — they're the mechanism.",
  },
};

export const CROSS_FAMILY_MEANING_FALLBACK: CrossFamilyMeaning = {
  keynote: 'Your Geometry',
  passage:
    "Your Profile didn't resolve cleanly to one of the three recognized cross families here, so this reading stays at the gate level below rather than guessing at a family-wide theme. The four gates themselves — and what each one means on its own — still tell the real story of your life's work.",
};

export interface CrossFamilyResult {
  family: CrossFamily | null;
  label: string;        // "Right Angle" / "Juxtaposition" / "Left Angle" / "Your Geometry"
  meaning: CrossFamilyMeaning;
}

export function calculateCrossFamily(profile: string): CrossFamilyResult {
  const family = determineCrossFamily(profile);
  if (!family) {
    return { family: null, label: 'Your Geometry', meaning: CROSS_FAMILY_MEANING_FALLBACK };
  }
  return { family, label: CROSS_FAMILY_LABEL[family], meaning: CROSS_FAMILY_MEANING[family] };
}

// The four gates that literally make up an Incarnation Cross, in a fixed
// reading order, each with a short role blurb (sourced from the T3D
// PHILOSOPHER notebook's cross-mechanics research — Leann Wolff / Frequency
// of Self material on how the conscious/unconscious Sun/Earth pair function).
export interface CrossGateEntry {
  role: string;   // "Personality Sun", etc.
  blurb: string;  // one-line role description, not gate-specific content
  gate: number;
}

const CROSS_GATE_ROLES: { role: string; blurb: string; match: { epoch: string; planet: string } }[] = [
  { role: 'Personality Sun', blurb: 'Your core, waking-life expression — about 70% of what you’re consciously aware of being.', match: { epoch: 'personality', planet: 'sun' } },
  { role: 'Personality Earth', blurb: 'The conscious grounding lesson your mind works through to express that Sun cleanly.', match: { epoch: 'personality', planet: 'earth' } },
  { role: 'Design Sun', blurb: 'Your body’s unconscious frequency — what people read off you before you’ve said a word.', match: { epoch: 'design', planet: 'sun' } },
  { role: 'Design Earth', blurb: 'The physical anchor that lets that unconscious frequency actually land in the world.', match: { epoch: 'design', planet: 'earth' } },
];

export function getCrossGates(
  activeGates: { gate: number; planet: string; epoch: string }[]
): CrossGateEntry[] {
  const entries: CrossGateEntry[] = [];
  for (const r of CROSS_GATE_ROLES) {
    const found = activeGates.find(a => a.epoch === r.match.epoch && a.planet === r.match.planet);
    if (found) entries.push({ role: r.role, blurb: r.blurb, gate: found.gate });
  }
  return entries;
}
