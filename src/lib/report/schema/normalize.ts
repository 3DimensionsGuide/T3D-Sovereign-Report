/**
 * T3D Report — Normalization Layer
 *
 * Raw engine output → clean, display-ready values.
 *
 * This module is the boundary between the calculation engine and the PDF.
 * Nothing from the raw engine reaches the PDF without passing through here.
 *
 * Principle: every display string is the result of a lookup or formatter,
 * not a raw `String(value)` cast.
 */

// ─── HUMAN DESIGN NORMALIZATION ───────────────────────────────────────────────

export const HD_TYPE_MAP: Record<string, string> = {
  // Engine variants → display name
  'manifesting_generator':  'Manifesting Generator',
  'manifestinggenerator':   'Manifesting Generator',
  'manifesting generator':  'Manifesting Generator',
  'ManifestingGenerator':   'Manifesting Generator',
  'Manifesting Generator':  'Manifesting Generator',
  'generator':              'Generator',
  'Generator':              'Generator',
  'projector':              'Projector',
  'Projector':              'Projector',
  'manifestor':             'Manifestor',
  'Manifestor':             'Manifestor',
  'reflector':              'Reflector',
  'Reflector':              'Reflector',
};

export const HD_AUTHORITY_MAP: Record<string, string> = {
  'sacral':                 'Sacral',
  'Sacral':                 'Sacral',
  'sacral_authority':       'Sacral',
  'emotional':              'Emotional',
  'Emotional':              'Emotional',
  'emotional_solar_plexus': 'Emotional',
  'Solar Plexus':           'Emotional',
  'Emotional Solar Plexus': 'Emotional',
  'splenic':                'Splenic',
  'Splenic':                'Splenic',
  'spleen':                 'Splenic',
  'ego':                    'Ego',
  'Ego':                    'Ego',
  'heart':                  'Ego',
  'Heart':                  'Ego',
  'Ego / Heart':            'Ego',
  'ego_manifested':         'Ego',
  'self_projected':         'Self-Projected',
  'Self-Projected':         'Self-Projected',
  'self':                   'Self-Projected',
  'none':                   'None',
  'None':                   'None',
  'mental':                 'None',
  'No Inner Authority':     'None',
  'no_authority':           'None',
  'lunar':                  'Lunar',
  'Lunar':                  'Lunar',
};

export const HD_STRATEGY_MAP: Record<string, string> = {
  'to_respond':                        'To Respond',
  'respond':                           'To Respond',
  'To Respond':                        'To Respond',
  'wait_for_invitation':               'Wait for the Invitation',
  'Wait for the Invitation':           'Wait for the Invitation',
  'invitation':                        'Wait for the Invitation',
  'to_inform_then_initiate':           'To Inform and then Initiate',
  'To Inform and then Initiate':       'To Inform and then Initiate',
  'inform':                            'To Inform and then Initiate',
  'wait_a_lunar_cycle':                'Wait a Lunar Cycle',
  'Wait a Lunar Cycle':                'Wait a Lunar Cycle',
  'lunar_cycle':                       'Wait a Lunar Cycle',
};

export const HD_NOT_SELF_MAP: Record<string, string> = {
  'frustration':    'Frustration',
  'Frustration':    'Frustration',
  'bitterness':     'Bitterness',
  'Bitterness':     'Bitterness',
  'anger':          'Anger',
  'Anger':          'Anger',
  'disappointment': 'Disappointment',
  'Disappointment': 'Disappointment',
};

export const CENTER_NAME_MAP: Record<string, string> = {
  'head':         'head',
  'Head':         'head',
  'ajna':         'ajna',
  'Ajna':         'ajna',
  'throat':       'throat',
  'Throat':       'throat',
  'g_center':     'g_center',
  'G Center':     'g_center',
  'GCenter':      'g_center',
  'identity':     'g_center',
  'heart':        'heart',
  'Heart':        'heart',
  'ego':          'heart',
  'Ego':          'heart',
  'sacral':       'sacral',
  'Sacral':       'sacral',
  'solar_plexus': 'solar_plexus',
  'Solar Plexus': 'solar_plexus',
  'emotion':      'solar_plexus',
  'spleen':       'spleen',
  'Spleen':       'spleen',
  'root':         'root',
  'Root':         'root',
};

/** Normalize an HD type string to display form */
export function normalizeType(raw: unknown): string {
  const s = String(raw ?? '').trim();
  return HD_TYPE_MAP[s] ?? (s.length > 0 ? s : 'Unknown');
}

/** Normalize an HD authority to display form */
export function normalizeAuthority(raw: unknown): string {
  const s = String(raw ?? '').trim();
  return HD_AUTHORITY_MAP[s] ?? (s.length > 0 ? s : 'Unknown');
}

/** Normalize an HD strategy to display form */
export function normalizeStrategy(raw: unknown): string {
  const s = String(raw ?? '').trim();
  return HD_STRATEGY_MAP[s] ?? (s.length > 0 ? s : '—');
}

/** Normalize not-self theme to display form */
export function normalizeNotSelf(raw: unknown, type?: string): string {
  const s = String(raw ?? '').trim();
  if (HD_NOT_SELF_MAP[s]) return HD_NOT_SELF_MAP[s]!;

  // Derive from type if not provided
  const typeDefaults: Record<string, string> = {
    'Generator':            'Frustration',
    'Manifesting Generator':'Frustration',
    'Projector':            'Bitterness',
    'Manifestor':           'Anger',
    'Reflector':            'Disappointment',
  };
  return type ? (typeDefaults[type] ?? '—') : '—';
}

/** Normalize a profile string to display form e.g. "4/1", "6/3" */
export function normalizeProfile(raw: unknown): string {
  const s = String(raw ?? '').trim();
  // Already in correct format e.g. "4/1"
  if (/^\d\/\d$/.test(s)) return s;
  // Handle "profile_4_1" or similar
  const match = s.match(/(\d)[/_](\d)/);
  if (match) return `${match[1]}/${match[2]}`;
  return s.length > 0 ? s : '—';
}

/** Normalize an array of center names to internal keys */
export function normalizeCenters(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(c => CENTER_NAME_MAP[String(c)] ?? String(c).toLowerCase())
    .filter(Boolean);
}

// ─── ASTROLOGY NORMALIZATION ──────────────────────────────────────────────────

export const ZODIAC_SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
] as const;

export type ZodiacSign = typeof ZODIAC_SIGNS[number];

/** Convert a longitude in decimal degrees to a formatted position string.
 *  e.g., 186.4 → "6°24' Libra" */
export function formatLongitude(degrees: number): string {
  const n   = ((degrees % 360) + 360) % 360;
  const si  = Math.floor(n / 30);
  const deg = Math.floor(n - si * 30);
  const min = Math.floor((n - si * 30 - deg) * 60);
  const sign = ZODIAC_SIGNS[si] ?? 'Unknown';
  return `${deg}°${String(min).padStart(2, '0')}' ${sign}`;
}

/** Extract sign name from a formatted position string.
 *  e.g., "6°24' Libra" → "Libra" */
export function extractSign(formatted: string): string {
  if (!formatted || formatted === '—') return '—';
  const parts = formatted.trim().split(' ');
  const last  = parts[parts.length - 1] ?? '';
  return ZODIAC_SIGNS.includes(last as ZodiacSign) ? last : '—';
}

/** Normalize a planet position: accepts longitude number OR formatted string */
export function normalizePlanetPosition(raw: unknown): string {
  if (raw === null || raw === undefined) return '—';
  // Already formatted
  if (typeof raw === 'string' && raw.includes('°')) return raw;
  // Object with longitude or formatted field
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, unknown>;
    if (typeof obj['formatted'] === 'string') return obj['formatted'];
    if (typeof obj['longitude'] === 'number') return formatLongitude(obj['longitude']);
  }
  // Raw longitude number
  if (typeof raw === 'number') return formatLongitude(raw);
  return '—';
}

// ─── NUMEROLOGY NORMALIZATION ─────────────────────────────────────────────────

/** Reduce a number to single digit, preserving master numbers 11, 22, 33 */
export function reduceNumber(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n;
  if (n <= 9) return n;
  const sum = n.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);
  return reduceNumber(sum);
}

/** Sum digits of a number */
export function digitSum(n: number): number {
  return Math.abs(n).toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);
}

/** Calculate Life Path with compound display e.g. "34/7" */
export function computeLifePath(birthDate: string): {
  reduced: number; compound: number; display: string;
} {
  const parts = birthDate.split('-');
  const month = parseInt(parts[1] ?? '1', 10);
  const day   = parseInt(parts[2] ?? '1', 10);
  const year  = parseInt(parts[0] ?? '1990', 10);

  const mR = reduceNumber(digitSum(month));
  const dR = reduceNumber(digitSum(day));
  const yR = reduceNumber(digitSum(year));

  const compound = mR + dR + yR;
  const reduced  = reduceNumber(compound);
  const display  = compound !== reduced && compound > 9
    ? `${compound}/${reduced}` : String(reduced);

  return { reduced, compound, display };
}

/** Calculate Birthday Number (day of birth, reduced) */
export function computeBirthday(birthDate: string): { number: number; display: string } {
  const day     = parseInt(birthDate.split('-')[2] ?? '1', 10);
  const reduced = reduceNumber(day);
  const display = day !== reduced && day > 9 ? `${day}/${reduced}` : String(reduced);
  return { number: reduced, display };
}

/** Calculate Attitude Number (month + day reduced) */
export function computeAttitude(birthDate: string): { number: number; display: string } {
  const parts = birthDate.split('-');
  const month = parseInt(parts[1] ?? '1', 10);
  const day   = parseInt(parts[2] ?? '1', 10);
  const mR    = digitSum(month);
  const dR    = digitSum(day);
  const compound = mR + dR;
  const reduced  = reduceNumber(compound);
  const display  = compound !== reduced && compound > 9
    ? `${compound}/${reduced}` : String(reduced);
  return { number: reduced, display };
}

/** Calculate Personal Year */
export function computePersonalYear(birthDate: string): number {
  const parts = birthDate.split('-');
  const month = parseInt(parts[1] ?? '1', 10);
  const day   = parseInt(parts[2] ?? '1', 10);
  const year  = new Date().getFullYear();
  const total = digitSum(month) + digitSum(day) + digitSum(year);
  return reduceNumber(total);
}

/** Calculate four Challenges from birth date */
export function computeChallenges(birthDate: string): number[] {
  const parts = birthDate.split('-');
  const month = parseInt(parts[1] ?? '1', 10);
  const day   = parseInt(parts[2] ?? '1', 10);
  const year  = parseInt(parts[0] ?? '1990', 10);
  // Fully reduce month, day, year for challenges (no master number preservation)
  function fr(n: number): number {
    if (n <= 9) return n;
    return fr(n.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0));
  }
  const mR = fr(digitSum(month));
  const dR = fr(digitSum(day));
  const yR = fr(digitSum(year));
  return [
    Math.abs(mR - dR),
    Math.abs(dR - yR),
    Math.abs(Math.abs(mR - dR) - Math.abs(dR - yR)),
    Math.abs(mR - yR),
  ];
}

/** Get current Pinnacle index from birth date and pinnacle age ranges */
export function computePinnacleIndex(
  pinnacles: { startAge: number; endAge: number | null }[],
  birthDate: string
): number {
  const birthYear  = parseInt(birthDate.split('-')[0] ?? '1990', 10);
  const currentAge = new Date().getFullYear() - birthYear;
  for (let i = 0; i < pinnacles.length; i++) {
    const p = pinnacles[i]!;
    if (p.endAge === null || currentAge <= p.endAge) return i;
  }
  return pinnacles.length - 1;
}

/** Normalize a number value with fallback */
export function normalizeNum(raw: unknown, fallback = 0): number {
  const n = Number(raw);
  return isNaN(n) ? fallback : n;
}
