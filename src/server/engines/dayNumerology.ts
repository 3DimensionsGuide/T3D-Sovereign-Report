/**
 * Daily numerology for the T3D app's Today screen.
 *
 *  - Universal Day (global energy of a calendar date) =
 *    reduce( reduce(month) + reduce(day) + reduce(year) ).
 *  - Personal Day (this person's day) =
 *    reduce( Personal Month + calendar day ), where
 *    Personal Month = reduce( Personal Year + calendar month ) and
 *    Personal Year  = reduce( birth month + birth day + Universal Year ).
 *
 * Master numbers 11 / 22 / 33 are preserved as outcomes (never reduced).
 * Formulas and interpretations stay on the server.
 */

export interface DayNumberMeaning {
  number: number;
  /** Single-digit root, set only for master numbers. */
  root: number | null;
  label: string;
  theme: string;
  keyThemes: string[];
  leanIn: string;
  watchFor: string;
}

export interface DayNumerology {
  date: string;
  universal: DayNumberMeaning;
  personal: DayNumberMeaning;
  personalYear: number;
  personalMonth: number;
  /** How the two days relate, in one or two sentences. */
  blend: string;
}

const digitSum = (n: number): number =>
  String(Math.abs(n)).split('').reduce((s, d) => s + Number(d), 0);

function reduceKeepMasters(n: number): number {
  let v = n;
  while (v > 9 && v !== 11 && v !== 22 && v !== 33) v = digitSum(v);
  return v;
}

type Content = Omit<DayNumberMeaning, 'number' | 'root'>;

const CONTENT: Record<number, Content> = {
  1: {
    label: 'Beginnings',
    theme: 'New beginnings, initiative and independent action.',
    keyThemes: ['Innovation', 'Self-reliance', 'Original leadership', 'Calculated risk-taking'],
    leanIn: 'Take charge of a project, make your own decisions, start something fresh and stand confidently in your own style.',
    watchFor: 'Impatience, bossiness, aggression, or the fear of standing alone.',
  },
  2: {
    label: 'Partnership',
    theme: 'Cooperation, patience and diplomatic connection.',
    keyThemes: ['Partnership', 'Emotional sensitivity', 'Intuition', 'Mediation'],
    leanIn: 'Listen closely, nurture the relationships that matter, mediate conflict and trust quiet intuitive signals.',
    watchFor: 'Over-sensitivity, passive-aggressiveness, codependency, or taking things too personally.',
  },
  3: {
    label: 'Expression',
    theme: 'Creative self-expression and joyful communication.',
    keyThemes: ['Creative output', 'Social connection', 'Emotional honesty', 'Optimism'],
    leanIn: 'Write, speak, create, connect with friends, share uplifting ideas and say what you actually feel.',
    watchFor: 'Scattering your energy, gossip, fear of criticism, or superficial distraction.',
  },
  4: {
    label: 'Foundations',
    theme: 'Building practical foundations through disciplined effort.',
    keyThemes: ['Organization', 'Systematic work', 'Body and health care', 'Long-term stability'],
    leanIn: 'Organize your space, handle the details, commit to your physical wellness and finish the necessary chores.',
    watchFor: 'Rigid stubbornness, burnout from overwork, frustration with slow progress, or over-controlling outcomes.',
  },
  5: {
    label: 'Change',
    theme: 'Dynamic freedom, change and versatile adventure.',
    keyThemes: ['Adaptability', 'Networking', 'Constructive change', 'Resourcefulness'],
    leanIn: 'Pivot quickly, welcome the unexpected shift, try something new, network and explore.',
    watchFor: 'Recklessness, restlessness, scattered focus, or escaping obligations.',
  },
  6: {
    label: 'Responsibility',
    theme: 'Responsibility, nurturing service and harmony at home.',
    keyThemes: ['Family care', 'Domestic balance', 'Duty', 'Accepting imperfection'],
    leanIn: 'Beautify your environment, support the people you love, take responsibility and offer practical help.',
    watchFor: 'Over-controlling others, martyrdom, perfectionism, or blurred boundaries.',
  },
  7: {
    label: 'Reflection',
    theme: 'Introspection, specialization and inner wisdom.',
    keyThemes: ['Research', 'Spiritual trust', 'Quiet reflection', 'Technical analysis'],
    leanIn: 'Spend time in solitude or nature, study something complex, look at the data and build self-trust.',
    watchFor: 'Over-analyzing into paralysis, emotional coldness, cynicism, or suspicion.',
  },
  8: {
    label: 'Authority',
    theme: 'Empowerment, financial mastery and executive authority.',
    keyThemes: ['Achievement', 'Material manifestation', 'Leadership', 'Spiritual-material balance'],
    leanIn: 'Manage your budget and resources, make the business decision, step into authority and turn vision into concrete form.',
    watchFor: 'Power struggles, intimidation, fixating only on money, or slipping into a victim mindset.',
  },
  9: {
    label: 'Completion',
    theme: 'Completion, letting go and universal compassion.',
    keyThemes: ['Culmination', 'Humanitarian perspective', 'Forgiveness', 'Release'],
    leanIn: 'Finish open projects, clear physical and mental clutter, practice forgiveness and surrender what has outlived its purpose.',
    watchFor: 'Emotional drama, resisting necessary endings, arrogance, or a martyr complex.',
  },
  11: {
    label: 'Illumination',
    theme: 'Inspired illumination and intuitive epiphany.',
    keyThemes: ['Spiritual awareness', 'Visionary insight', 'Electric intuition', 'Uplifting leadership'],
    leanIn: 'Pay attention to sudden flashes of insight, inspire others through vision and bring spiritual awareness into daily life.',
    watchFor: 'Nervous tension, sensory overload, anxiety, or ungrounded daydreaming.',
  },
  22: {
    label: 'Master Builder',
    theme: 'Master building and large-scale execution.',
    keyThemes: ['Systemic impact', 'Practical manifestation', 'Master planning', 'Disciplined power'],
    leanIn: 'Focus on the high-impact project, build something scalable, organize people and carry out the long-term plan.',
    watchFor: 'Extreme self-imposed pressure, fear of failing on a large stage, or rigid dogmatism.',
  },
  33: {
    label: 'Master Teacher',
    theme: 'Master teaching and selfless spiritual service.',
    keyThemes: ['Universal nurturing', 'Compassionate guidance', 'Spiritual leadership', 'Selfless care'],
    leanIn: 'Offer wisdom without expectation, uplift others through service, practice deep empathy and embody unconditional care.',
    watchFor: 'Emotional exhaustion, carrying the burden of the world, or neglecting your own needs.',
  },
};

/** Reading text for each day number; also used by the app glossary. */
export const DAY_NUMBER_CONTENT = CONTENT;

const ROOT: Record<number, number> = { 11: 2, 22: 4, 33: 6 };

function meaning(n: number): DayNumberMeaning {
  const c = CONTENT[n] ?? CONTENT[9]!;
  return { number: n, root: ROOT[n] ?? null, ...c };
}

function blendSentence(universal: number, personal: number): string {
  const u = CONTENT[universal]?.label ?? '';
  const p = CONTENT[personal]?.label ?? '';
  if (universal === personal) {
    return `The world's ${u} theme and your own personal theme are the same today, so this energy is doubled for you. Lean into it deliberately and make your choices through your Strategy and Authority.`;
  }
  return `The world is running a ${u} theme while your own day is about ${p}. Let the global tone set the backdrop, and let your personal day guide what you do within it.`;
}

/** localDate is the person's calendar date, YYYY-MM-DD. birthDate likewise. */
export function calculateDayNumerology(birthDate: string, localDate: string): DayNumerology {
  const [y, m, d] = localDate.split('-').map(Number) as [number, number, number];
  const [, bm, bd] = birthDate.split('-').map(Number) as [number, number, number];

  const universalYear = reduceKeepMasters(digitSum(y));
  const universalDay = reduceKeepMasters(
    reduceKeepMasters(m) + reduceKeepMasters(d) + universalYear,
  );
  const personalYear = reduceKeepMasters(bm + bd + universalYear);
  const personalMonth = reduceKeepMasters(personalYear + m);
  const personalDay = reduceKeepMasters(personalMonth + d);

  return {
    date: localDate,
    universal: meaning(universalDay),
    personal: meaning(personalDay),
    personalYear,
    personalMonth,
    blend: blendSentence(universalDay, personalDay),
  };
}
