/**
 * T3D Numerology Engine — Pythagorean Calculation System
 *
 * Implements:
 *   - Life Path (month/day/year reduced separately, preserving Master Numbers)
 *   - Destiny / Expression (full birth name letter values)
 *   - Personality Number (consonants only)
 *   - Soul Urge / Heart's Desire (vowels only)
 *   - Hidden Passion (highest-frequency digit in name)
 *   - Karmic Lessons (missing digits 1–9 from name)
 *   - 4 Pinnacles + 4 Challenges (timing cycles)
 *
 * Reference: Pythagorean system per T3D Technical Specification.
 */

import type { NumerologyInput, NumerologyResult, NumerologyCycle } from './types';

// ─── PYTHAGOREAN LETTER → NUMBER MAP ─────────────────────────────────────────
//  A J S = 1   B K T = 2   C L U = 3   D M V = 4   E N W = 5
//  F O X = 6   G P Y = 7   H Q Z = 8   I R   = 9

const PYTHAGOREAN_MAP: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

const HARD_VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Reduce a number to a single digit.
 * Master Numbers 11, 22, 33 are NOT preserved — call digitReduceMaster for that.
 */
function digitReduceRaw(n: number): number {
  while (n > 9) {
    n = String(n)
      .split('')
      .reduce((sum, d) => sum + parseInt(d, 10), 0);
  }
  return n;
}

/**
 * Reduce a number to a single digit OR a Master Number (11, 22, 33).
 * Used for Life Path components, Pinnacle/Challenge results, and all core numbers.
 */
function digitReduceMaster(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n)
      .split('')
      .reduce((sum, d) => sum + parseInt(d, 10), 0);
  }
  return n;
}

/**
 * Determine whether a character is a vowel in the context of its surrounding letters.
 * Y is treated as a vowel when it is not at the start of a word AND not adjacent to
 * another hard vowel — the standard numerology convention.
 */
function isVowel(char: string, word: string, index: number): boolean {
  const upper = char.toUpperCase();
  if (HARD_VOWELS.has(upper)) return true;

  if (upper === 'Y') {
    const prev = index > 0 ? word[index - 1].toUpperCase() : '';
    const next = index < word.length - 1 ? word[index + 1].toUpperCase() : '';
    // Y is a vowel when not at the beginning of the word and not flanked by another vowel
    return index > 0 && !HARD_VOWELS.has(prev) && !HARD_VOWELS.has(next);
  }

  return false;
}

/**
 * Map a single letter to its Pythagorean numeric value.
 * Returns 0 for non-alphabetic characters (spaces, hyphens, apostrophes).
 */
function letterValue(char: string): number {
  return PYTHAGOREAN_MAP[char.toUpperCase()] ?? 0;
}

/**
 * Reduce the sum of letter values in a name segment to a single digit or Master Number.
 */
function reduceNameSegment(letters: number[]): number {
  const sum = letters.reduce((a, b) => a + b, 0);
  return digitReduceMaster(sum);
}

/**
 * Parse a full name into words, returning only alphabetic characters per word.
 */
function parseNameWords(
  firstName: string,
  middleName: string | undefined,
  lastName: string,
): string[] {
  return [firstName, ...(middleName ? [middleName] : []), lastName]
    .map((part) => part.trim().replace(/[^a-zA-Z]/g, ''));
}

// ─── CORE NUMBERS ─────────────────────────────────────────────────────────────

/**
 * Life Path Number
 *
 * Reduce Month, Day, and Year SEPARATELY to single digit or Master Number,
 * then sum and reduce the total.
 *
 * Example: November (11) 14 (→5), 1991 (→2) => 11+5+2 = 18 → 9
 */
function calculateLifePath(birthDate: string): number {
  const [yearStr, monthStr, dayStr] = birthDate.split('-');
  const rawMonth = parseInt(monthStr, 10);
  const rawDay = parseInt(dayStr, 10);
  const rawYear = parseInt(yearStr, 10);

  const M = digitReduceMaster(rawMonth);
  const D = digitReduceMaster(rawDay);
  const Y = digitReduceMaster(
    String(rawYear)
      .split('')
      .reduce((sum, d) => sum + parseInt(d, 10), 0),
  );

  return digitReduceMaster(M + D + Y);
}

/**
 * Destiny / Expression Number
 *
 * Sum the Pythagorean values of ALL letters in the full birth name.
 * Reduce each name part separately, then sum and reduce the totals.
 */
function calculateDestiny(
  firstName: string,
  middleName: string | undefined,
  lastName: string,
): number {
  const words = parseNameWords(firstName, middleName, lastName);

  const partTotals = words.map((word) => {
    const values = word.split('').map((c) => letterValue(c));
    return reduceNameSegment(values);
  });

  return digitReduceMaster(partTotals.reduce((a, b) => a + b, 0));
}

/**
 * Personality Number
 *
 * Sum the values of CONSONANTS only in the full birth name.
 * Each name part is reduced separately before summing.
 */
function calculatePersonality(
  firstName: string,
  middleName: string | undefined,
  lastName: string,
): number {
  const words = parseNameWords(firstName, middleName, lastName);

  const partTotals = words.map((word) => {
    const consonantValues = word
      .split('')
      .filter((c, i) => !isVowel(c, word, i))
      .map((c) => letterValue(c));
    return reduceNameSegment(consonantValues);
  });

  return digitReduceMaster(partTotals.reduce((a, b) => a + b, 0));
}

/**
 * Soul Urge / Heart's Desire Number
 *
 * Sum the values of VOWELS only (A, E, I, O, U + conditional Y)
 * in the full birth name. Each name part is reduced separately before summing.
 */
function calculateSoulUrge(
  firstName: string,
  middleName: string | undefined,
  lastName: string,
): number {
  const words = parseNameWords(firstName, middleName, lastName);

  const partTotals = words.map((word) => {
    const vowelValues = word
      .split('')
      .filter((c, i) => isVowel(c, word, i))
      .map((c) => letterValue(c));
    return reduceNameSegment(vowelValues);
  });

  return digitReduceMaster(partTotals.reduce((a, b) => a + b, 0));
}

// ─── SECONDARY NUMBERS ────────────────────────────────────────────────────────

/**
 * Hidden Passion Number
 *
 * Count the frequency of each digit (1–9) among all letter values in the full
 * birth name. The digit appearing most frequently is the Hidden Passion.
 * If two or more digits tie, both are valid — we return the lower digit per
 * standard Pythagorean convention.
 */
function calculateHiddenPassion(
  firstName: string,
  middleName: string | undefined,
  lastName: string,
): number {
  const words = parseNameWords(firstName, middleName, lastName);
  const freq: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };

  for (const word of words) {
    for (const char of word) {
      const val = letterValue(char);
      if (val >= 1 && val <= 9) freq[val]++;
    }
  }

  const maxFreq = Math.max(...Object.values(freq));
  // Return the lowest digit with max frequency (stable sort behaviour)
  for (let d = 1; d <= 9; d++) {
    if (freq[d] === maxFreq) return d;
  }
  return 1; // fallback
}

/**
 * Karmic Lessons
 *
 * Identify digits (1–9) that are COMPLETELY MISSING from the letter values
 * of the full birth name. Each missing number is a Karmic Lesson.
 */
function calculateKarmicLessons(
  firstName: string,
  middleName: string | undefined,
  lastName: string,
): number[] {
  const words = parseNameWords(firstName, middleName, lastName);
  const present = new Set<number>();

  for (const word of words) {
    for (const char of word) {
      const val = letterValue(char);
      if (val >= 1 && val <= 9) present.add(val);
    }
  }

  const lessons: number[] = [];
  for (let d = 1; d <= 9; d++) {
    if (!present.has(d)) lessons.push(d);
  }
  return lessons;
}

// ─── PINNACLES & CHALLENGES ───────────────────────────────────────────────────

/**
 * Calculate the four Life Pinnacles.
 *
 * M = reduced birth month, D = reduced birth day, Y = reduced birth year.
 *
 *  1st Pinnacle: M + D   — birth to age (36 − LP)
 *  2nd Pinnacle: D + Y   — next 9 years
 *  3rd Pinnacle: 1st + 2nd — next 9 years
 *  4th Pinnacle: M + Y   — age (54 − LP) to death
 */
function calculatePinnacles(
  M: number,
  D: number,
  Y: number,
  lifePath: number,
): NumerologyCycle[] {
  // Transition ages
  const t1 = 36 - lifePath;
  const t2 = t1 + 9;
  const t3 = t2 + 9;

  const p1 = digitReduceMaster(M + D);
  const p2 = digitReduceMaster(D + Y);
  const p3 = digitReduceMaster(p1 + p2);
  const p4 = digitReduceMaster(M + Y);

  return [
    { number: p1, startAge: 0,  endAge: t1, label: 'First Pinnacle'  },
    { number: p2, startAge: t1, endAge: t2, label: 'Second Pinnacle' },
    { number: p3, startAge: t2, endAge: t3, label: 'Third Pinnacle'  },
    { number: p4, startAge: t3, endAge: null, label: 'Fourth Pinnacle' },
  ];
}

/**
 * Calculate the four Life Challenges.
 *
 *  1st Challenge: |M − D|
 *  2nd Challenge: |D − Y|
 *  3rd Challenge: |1st − 2nd|  (The Main Challenge)
 *  4th Challenge: |M − Y|
 */
function calculateChallenges(
  M: number,
  D: number,
  Y: number,
  lifePath: number,
): NumerologyCycle[] {
  const t1 = 36 - lifePath;
  const t2 = t1 + 9;
  const t3 = t2 + 9;

  const c1 = Math.abs(M - D);
  const c2 = Math.abs(D - Y);
  const c3 = Math.abs(c1 - c2);
  const c4 = Math.abs(M - Y);

  return [
    { number: c1, startAge: 0,  endAge: t1,  label: 'First Challenge'  },
    { number: c2, startAge: t1, endAge: t2,  label: 'Second Challenge' },
    { number: c3, startAge: t2, endAge: t3,  label: 'Third Challenge (Main)' },
    { number: c4, startAge: t3, endAge: null, label: 'Fourth Challenge' },
  ];
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

/**
 * Calculate the complete Pythagorean numerology profile for a person.
 */
export function calculateNumerology(input: NumerologyInput): NumerologyResult {
  const { firstName, middleName, lastName, birthDate } = input;

  // ── Core numbers ──────────────────────────────────────────────────────────
  const lifePath    = calculateLifePath(birthDate);
  const destiny     = calculateDestiny(firstName, middleName, lastName);
  const personality = calculatePersonality(firstName, middleName, lastName);
  const soulUrge    = calculateSoulUrge(firstName, middleName, lastName);

  // ── Secondary numbers ─────────────────────────────────────────────────────
  const hiddenPassion  = calculateHiddenPassion(firstName, middleName, lastName);
  const karmicLessons  = calculateKarmicLessons(firstName, middleName, lastName);

  // ── Timing cycles ─────────────────────────────────────────────────────────
  const [yearStr, monthStr, dayStr] = birthDate.split('-');
  const rawMonth = parseInt(monthStr, 10);
  const rawDay   = parseInt(dayStr,   10);
  const rawYear  = parseInt(yearStr,  10);

  const M = digitReduceMaster(rawMonth);
  const D = digitReduceMaster(rawDay);
  const Y = digitReduceMaster(
    String(rawYear).split('').reduce((sum, d) => sum + parseInt(d, 10), 0),
  );

  const pinnacles  = calculatePinnacles(M, D, Y, lifePath);
  const challenges = calculateChallenges(M, D, Y, lifePath);

  return {
    lifePath,
    destiny,
    personality,
    soulUrge,
    hiddenPassion,
    karmicLessons,
    pinnacles,
    challenges,
  };
}

// ─── NAMED EXPORTS FOR TESTING ────────────────────────────────────────────────
export {
  digitReduceRaw,
  digitReduceMaster,
  letterValue,
  isVowel,
  calculateLifePath,
  calculateDestiny,
  calculatePersonality,
  calculateSoulUrge,
  calculateHiddenPassion,
  calculateKarmicLessons,
};
