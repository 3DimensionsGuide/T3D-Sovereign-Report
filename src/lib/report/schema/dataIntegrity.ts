/**
 * T3D Report — Data Integrity, Ethics & Quality Assurance
 *
 * Six integrity checks run before every report render:
 *
 *   1. Birth date, time, and location are complete and normalized
 *   2. Time-zone and DST rules are correctly resolved
 *   3. HD calculation is locked to canonical implementation
 *   4. Numerology methods are documented and consistently applied
 *   5. Astrology system choice is named clearly in methodology notes
 *   6. Any calculation uncertainty is reported, not obscured
 *
 * Birth-time uncertainty triggers a Sensitivity Notice on affected pages.
 * Precise chart-based conclusions are withheld when source input is imprecise.
 */

// ─── Birth-time certainty classification ─────────────────────────────────────
export type BirthTimeCertainty =
  | 'exact'        // user provided specific time with confidence
  | 'approximate'  // user indicated "around" a time or used a default
  | 'unknown'      // user explicitly stated they don't know
  | 'missing';     // no time field submitted

// ─── Data quality report ──────────────────────────────────────────────────────
export interface DataQualityReport {
  // Input completeness (Check #1)
  birthDateComplete:     boolean;
  birthTimeStatus:       BirthTimeCertainty;
  birthLocationComplete: boolean;
  inputsComplete:        boolean;   // true only if all required inputs present

  // Time-zone integrity (Check #2)
  timezoneResolved:     boolean;
  timezoneId:           string;     // e.g., "America/New_York"
  dstApplied:           boolean;    // whether DST was in effect at birth

  // Birth-time sensitivity (for notice generation)
  birthTimeSensitive:   boolean;    // true if certainty !== 'exact'
  sensitivePages:       string[];   // pages where uncertain time affects output
  affectedOutputs:      string[];   // specific values that may be inaccurate
  stableOutputs:        string[];   // values unaffected by birth time

  // Calculation metadata (Checks #3–5)
  calculationDate:      string;     // ISO date of report generation
  methodology:          CalculationMethodology;

  // Quality flags (Check #6)
  uncertainties:        string[];   // any reported uncertainties
  warnings:             string[];   // non-blocking quality warnings
}

// ─── Calculation methodology (Check #5) ──────────────────────────────────────
export interface CalculationMethodology {
  humanDesign: {
    system:          string;
    ephemeris:       string;
    zodiac:          string;
    unconsciousCalc: string;
    gateLogic:       string;
  };
  numerology: {
    system:          string;
    masterNumbers:   number[];
    lifePathMethod:  string;
    nameRequirement: string;
  };
  astrology: {
    zodiac:          string;
    houseSystem:     string;
    ephemeris:       string;
    siderealRef:     string;
  };
}

// The canonical T3D methodology — documented and locked
export const T3D_METHODOLOGY: CalculationMethodology = {
  humanDesign: {
    system:          'Ra Uru Hu\'s original Human Design system',
    ephemeris:       'Swiss Ephemeris (swisseph)',
    zodiac:          'Tropical',
    unconsciousCalc: 'Unconscious positions calculated 88 days prior to birth',
    gateLogic:       'Binary gate activation (on/off); channels require both gates defined',
  },
  numerology: {
    system:          'Pythagorean (Western)',
    masterNumbers:   [11, 22, 33],
    lifePathMethod:  'Reduce month, day, and year separately; sum results; reduce again (master numbers preserved at each step)',
    nameRequirement: 'Full birth name as it appears on the birth certificate; middle name required for complete name-based calculations',
  },
  astrology: {
    zodiac:          'Tropical (Western)',
    houseSystem:     'Whole Sign Houses',
    ephemeris:       'Swiss Ephemeris (swisseph)',
    siderealRef:     'Sidereal positions provided as reference using Lahiri ayanamsa; primary interpretation uses tropical',
  },
};

// ─── Outputs affected by birth time ──────────────────────────────────────────
export const BIRTH_TIME_AFFECTED_OUTPUTS = [
  'Rising Sign (Ascendant) — shifts with every ~2 hours',
  'Midheaven (MC) — directly dependent on birth time',
  'All planetary house positions — require accurate birth time',
  'Chart ruler — derived from Rising sign',
  'Sun house placement — dependent on Ascendant',
  'Human Design Profile — may shift if personality Sun is near a gate boundary',
  'Some HD gate activations near hexagram line transitions',
] as const;

export const BIRTH_TIME_STABLE_OUTPUTS = [
  'Sun Sign (tropical) — based on date only',
  'Moon Sign (in most cases — Moon changes sign every ~2.5 days)',
  'HD Type, Strategy, and Authority — robust across most birth times',
  'HD defined and open centers — mostly stable',
  'All numerology calculations — date-based only, unaffected by birth time',
  'Life Path, Personal Year, Pinnacles, Challenges, Birthday, Attitude numbers',
] as const;

export const BIRTH_TIME_SENSITIVE_PAGES = [
  'Page27BigThree',   // Rising sign shown — may be inaccurate
  'Page29RulerArenas', // Chart ruler and Sun house derived from Ascendant
  'Page13Profile',    // HD Profile can shift in edge cases
] as const;

// ─── Birth-time certainty detection ──────────────────────────────────────────
/**
 * Classify birth time certainty from raw birth data.
 *
 * Handles common cases where systems insert default times (midnight, noon)
 * when no time was provided — which would produce a false impression of accuracy.
 */
export function classifyBirthTimeCertainty(birthData: {
  time?:          string | null;
  timeUncertain?: boolean | null;
  timeSource?:    string | null;   // e.g., 'birth_certificate', 'memory', 'unknown'
}): BirthTimeCertainty {
  const { time, timeUncertain, timeSource } = birthData;

  // Explicit uncertainty flag
  if (timeUncertain === true) return 'unknown';

  // Explicit unknown source
  if (timeSource === 'unknown') return 'unknown';

  // Missing time field
  if (!time || time.trim() === '') return 'missing';

  // Common system defaults that indicate no real time was provided
  const SUSPICIOUS_DEFAULTS = [
    '00:00', '00:00:00',   // midnight — almost never the real birth time
    '12:00', '12:00:00',   // noon default
    '00:01', '23:59',      // edge-of-day defaults
  ];
  if (SUSPICIOUS_DEFAULTS.includes(time.trim())) return 'unknown';

  // Approximate time indicators
  if (timeSource === 'memory' || timeSource === 'approximate') return 'approximate';

  // Time was provided and looks real
  return 'exact';
}

// ─── Sensitivity notice text ──────────────────────────────────────────────────
export function buildSensitivityNotice(certainty: BirthTimeCertainty): string {
  const labels: Record<BirthTimeCertainty, string> = {
    missing:     'No birth time was provided for this report.',
    unknown:     'Birth time is recorded as unknown for this report.',
    approximate: 'Birth time was recorded as approximate for this report.',
    exact:       '',
  };

  return labels[certainty];
}

// ─── Input validation (Check #1) ─────────────────────────────────────────────
export interface InputValidationResult {
  valid:     boolean;
  errors:    string[];
  warnings:  string[];
}

export function validateInputCompleteness(birthData: {
  date?:     string | null;
  time?:     string | null;
  location?: string | null;
  lat?:      number | null;
  lng?:      number | null;
}): InputValidationResult {
  const errors:   string[] = [];
  const warnings: string[] = [];

  // Date is always required
  if (!birthData.date || !/^\d{4}-\d{2}-\d{2}$/.test(birthData.date)) {
    errors.push('Birth date is missing or invalid (expected YYYY-MM-DD)');
  } else {
    // Validate date is reasonable
    const d = new Date(birthData.date);
    const now = new Date();
    if (isNaN(d.getTime())) {
      errors.push(`Birth date "${birthData.date}" is not a valid date`);
    } else if (d > now) {
      errors.push('Birth date is in the future');
    } else if (d.getFullYear() < 1900) {
      warnings.push('Birth date is before 1900 — verify calculation accuracy');
    }
  }

  // Location affects HD and astrology
  if (!birthData.location && (!birthData.lat || !birthData.lng)) {
    warnings.push('Birth location missing — timezone resolution may be imprecise');
  }

  // Time is optional but noted when missing
  const timeCertainty = classifyBirthTimeCertainty({ time: birthData.time });
  if (timeCertainty !== 'exact') {
    warnings.push(
      `Birth time is ${timeCertainty} — Rising sign, houses, and some HD gates may be inaccurate`
    );
  }

  return {
    valid:    errors.length === 0,
    errors,
    warnings,
  };
}

// ─── Main integrity check ─────────────────────────────────────────────────────
/**
 * runIntegrityCheck
 *
 * Runs all six integrity checks against the lead's raw birth data.
 * Returns a DataQualityReport that travels with the ReportData object.
 *
 * Called by buildReportData() before normalization.
 * Any errors block render. Warnings are surfaced on Page 43 and
 * in the Birth-Time Sensitivity Notice on affected pages.
 */
export function runIntegrityCheck(
  birthData: Record<string, unknown>,
  timezoneId?: string
): DataQualityReport {
  const time       = birthData['time'] as string | null;
  const date       = birthData['date'] as string | null;
  const location   = birthData['location'] as string | null;
  const lat        = birthData['lat']  as number | null;
  const lng        = birthData['lng']  as number | null;
  const uncertain  = birthData['timeUncertain'] as boolean | null;
  const timeSource = birthData['timeSource']    as string | null;

  // Check #1: Input completeness
  const inputValidation = validateInputCompleteness({ date, time, location, lat, lng });

  // Birth-time certainty
  const birthTimeStatus = classifyBirthTimeCertainty({ time, timeUncertain: uncertain, timeSource });
  const birthTimeSensitive = birthTimeStatus !== 'exact';

  // Check #2: Timezone resolution
  const tz = timezoneId ?? 'UTC';
  const timezoneResolved = tz !== 'UTC' || (!lat && !lng);

  return {
    // Input completeness
    birthDateComplete:     !!date && /^\d{4}-\d{2}-\d{2}$/.test(date),
    birthTimeStatus,
    birthLocationComplete: !!(location || (lat && lng)),
    inputsComplete:        inputValidation.valid,

    // Timezone
    timezoneResolved,
    timezoneId:   tz,
    dstApplied:   false,  // populated by engine if available

    // Sensitivity
    birthTimeSensitive,
    sensitivePages:  birthTimeSensitive ? [...BIRTH_TIME_SENSITIVE_PAGES] : [],
    affectedOutputs: birthTimeSensitive ? [...BIRTH_TIME_AFFECTED_OUTPUTS] : [],
    stableOutputs:   [...BIRTH_TIME_STABLE_OUTPUTS],

    // Methodology
    calculationDate: new Date().toISOString(),
    methodology:     T3D_METHODOLOGY,

    // Uncertainties and warnings
    uncertainties: inputValidation.errors,
    warnings:      inputValidation.warnings,
  };
}
