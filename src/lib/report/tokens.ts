/**
 * T3D Report — Shared Design Tokens, Types & Data Helpers
 */

// ─── COLORS ───────────────────────────────────────────────────────────────────
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

// ─── TYPOGRAPHY ───────────────────────────────────────────────────────────────
export const F = {
  display: 'Playfair Display',
  sans:    'DM Sans',
} as const;

// ─── PAGE DIMENSIONS (Letter — 612 × 792 pt) ─────────────────────────────────
export const PAGE = {
  width:        612,
  height:       792,
  marginH:       60,
  marginV:       60,
  contentWidth: 492,
} as const;

// ─── REPORT DATA TYPE ─────────────────────────────────────────────────────────
export interface ReportData {
  // Personal
  firstName:    string;
  lastName:     string;
  email:        string;
  birthDate:    string;
  generatedAt:  string;

  // Human Design
  hdType:           string;
  hdAuthority:      string;
  hdProfile:        string;
  hdStrategy:       string;
  hdNotSelf:        string;
  hdDefinedCenters: string[];
  hdChannels:       { name: string; gates: number[]; activatedBy: string }[];

  // Numerology
  lifePath:      number;
  destiny:       number;
  personality:   number;
  soulUrge:      number;
  hiddenPassion: number;
  karmicLessons: number[];
  personalYear:  number;
  pinnacles:     { number: number; label: string; startAge: number; endAge: number | null }[];

  // Astrology
  tropicalSun:   string;
  tropicalMoon:  string;
  tropicalAsc:   string;
  tropicalMC:    string;
  siderealSun:   string;
  siderealAsc:   string;

  // Extracted signs (for dashboard display)
  sunSign:    string;
  moonSign:   string;
  risingSign: string;
}

// ─── PERSONAL YEAR CALCULATION ────────────────────────────────────────────────
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

// ─── SIGN EXTRACTOR ───────────────────────────────────────────────────────────
/** Extracts the sign name from a formatted position string e.g. "7°24' Libra" → "Libra" */
export function extractSign(formatted: string): string {
  if (!formatted || formatted === '—') return '—';
  const parts = formatted.trim().split(' ');
  return parts[parts.length - 1] ?? '—';
}

// ─── HD TYPE → SYNTHESIS SENTENCE ────────────────────────────────────────────
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

// ─── LIFE PATH → SYNTHESIS SENTENCE ──────────────────────────────────────────
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

// ─── SUN SIGN → SYNTHESIS SENTENCE ───────────────────────────────────────────
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

// ─── AUTHORITY → DECISION STEP TEXT ─────────────────────────────────────────
export const AUTHORITY_PROTOCOL: Record<string, {
  prompt:    string;
  instruction: string;
  signal:    string;
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

// ─── HD TYPE → EXPERIMENT ────────────────────────────────────────────────────
export const TYPE_EXPERIMENT: Record<string, {
  title:       string;
  premise:     string;
  checkins:    string[];
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
    premise: 'For seven days, commit to responding rather than initiating. Each time something appears in your environment — an opportunity, a question, a request — notice your Sacral response before your mind has a chance to override it. A full yes is different from a polite yes.',
    checkins: [
      'Morning: What am I being invited to respond to today?',
      'Midday: Did I say yes from genuine enthusiasm, or from obligation?',
      'Evening: What drained me? What energized me? Note the pattern.',
    ],
  },
  'Projector': {
    title:   'The Recognition Experiment',
    premise: 'For seven days, practice waiting for genuine recognition before offering your insight — even casually. Notice how often you reach to share before being asked. Notice what happens when you hold the insight until invited. This is not withholding. It is correct timing.',
    checkins: [
      'Morning: Where might I be invited to guide today?',
      'Midday: Did I offer unsolicited advice? How was it received?',
      'Evening: Where did I feel recognized? Where did I feel invisible?',
    ],
  },
  'Manifestor': {
    title:   'The Inform Experiment',
    premise: 'For seven days, practice informing the people who will be affected by your actions before you take them — not to ask permission, but to remove resistance. Notice the difference in how decisions land when others are brought along versus surprised.',
    checkins: [
      'Morning: What am I planning to initiate today? Who needs to know?',
      'Midday: Where did I move without informing? What was the result?',
      'Evening: Where did informing first create space rather than friction?',
    ],
  },
  'Reflector': {
    title:   'The Environment Experiment',
    premise: 'For seven days, pay close attention to how different environments, people, and spaces affect your energy, clarity, and sense of self. You are designed to sample and reflect — your clearest data about any situation comes from your felt sense across time and context.',
    checkins: [
      'Morning: What environment am I moving into today, and how does it feel?',
      'Midday: What am I amplifying or reflecting from the people around me?',
      'Evening: Where did I feel most like myself today? Least like myself?',
    ],
  },
};

// ─── PERSONAL YEAR THEMES ─────────────────────────────────────────────────────
export const PERSONAL_YEAR_THEMES: Record<number, {
  title:   string;
  essence: string;
  themes:  string[];
  caution: string;
}> = {
  1: {
    title:   'Year of New Beginnings',
    essence: 'Seeds planted now carry unusual weight. This is a year to define direction, not to harvest it.',
    themes:  ['Self-definition', 'New ventures', 'Independence', 'Clarity of identity'],
    caution: 'Resist the urge to finish what belongs to last cycle. The energy is for starting, not completing.',
  },
  2: {
    title:   'Year of Patience and Partnership',
    essence: 'Progress arrives through relationship and cooperation this year — not through solo effort.',
    themes:  ['Partnership', 'Listening', 'Diplomacy', 'Gathering before acting'],
    caution: 'Avoid forcing timelines. What arrives slowly this year is often more durable.',
  },
  3: {
    title:   'Year of Creative Expression',
    essence: 'A year when self-expression and social connection carry genuine momentum.',
    themes:  ['Creativity', 'Communication', 'Joy', 'Social expansion'],
    caution: 'Scattered attention is the risk. Channel the energy into one or two things that matter.',
  },
  4: {
    title:   'Year of Building and Foundation',
    essence: 'Discipline, structure, and steady work are rewarded this year. The foundation you build now supports what comes in years 5 through 9.',
    themes:  ['Discipline', 'Structure', 'Practicality', 'Long-term investment'],
    caution: 'Tedium is part of the process. The year rewards patience, not speed.',
  },
  5: {
    title:   'Year of Change and Freedom',
    essence: 'Movement, release, and new experience define this year. What no longer fits will make itself obvious.',
    themes:  ['Change', 'Freedom', 'Travel', 'Release', 'Adaptability'],
    caution: 'Not all change that appears is progress. Discern before releasing what still has value.',
  },
  6: {
    title:   'Year of Responsibility and Home',
    essence: 'Relationships, home, family, and community take center stage. Giving and receiving care are both part of the lesson.',
    themes:  ['Relationships', 'Home', 'Service', 'Responsibility', 'Healing'],
    caution: 'The risk is over-giving. Service that depletes you does not serve anyone well.',
  },
  7: {
    title:   'Year of Reflection and Depth',
    essence: 'A year for inner work, solitude, and investigation. Clarity arrives through reflection, not through action.',
    themes:  ['Solitude', 'Depth', 'Spiritual inquiry', 'Research', 'Inner clarity'],
    caution: 'Isolation differs from solitude. Stay connected while protecting your inner space.',
  },
  8: {
    title:   'Year of Power and Harvest',
    essence: 'What you built in previous years now becomes visible. Authority, abundance, and recognition are available — if claimed.',
    themes:  ['Authority', 'Financial focus', 'Power', 'Harvest', 'Recognition'],
    caution: 'Force and manipulation block the year\'s natural flow. Power is available; grasping repels it.',
  },
  9: {
    title:   'Year of Completion and Release',
    essence: 'A nine-year cycle closes. What no longer serves — relationships, projects, identities — is ready to be released.',
    themes:  ['Completion', 'Release', 'Endings', 'Integration', 'Compassion'],
    caution: 'Do not start major new projects this year. Close, complete, and integrate before the next cycle opens.',
  },
  11: {
    title:   'Master Year of Illumination',
    essence: 'A year of heightened intuition, spiritual alignment, and unusual clarity. The insights arriving this year carry long-term significance.',
    themes:  ['Intuition', 'Spiritual alignment', 'Illumination', 'Inspiration'],
    caution: 'The intensity of this year is real. Rest and integration are not optional — they are part of the work.',
  },
  22: {
    title:   'Master Year of the Builder',
    essence: 'A year for large-scale vision and the discipline to bring it to ground. What you build this year can outlast you.',
    themes:  ['Legacy', 'Mastery', 'Large-scale building', 'Discipline'],
    caution: 'The scope of this year can be overwhelming. Build the next thing, not all the things.',
  },
};
