/**
 * T3D Language Guide-rails
 *
 * T3D's authority comes from clarity, structure, and ethical restraint —
 * not from performing certainty or spiritual weight.
 *
 * The guide-rails hold two commitments simultaneously:
 *   1. Spiritual seriousness — the systems are treated as real and worth engaging
 *   2. Epistemic humility — the report never claims more than it can honestly deliver
 *
 * ─── Five Use Cases ─────────────────────────────────────────────────────────
 *
 *   #1  DO: "This pattern may invite you to notice..."
 *       DON'T: "You will always..."
 *
 *   #2  DO: "A useful experiment is..."
 *       DON'T: "The universe demands..."
 *
 *   #3  DO: "When you are under pressure, this can look like..."
 *       DON'T: "Your flaw is..."
 *
 *   #4  DO: "Test whether this creates more clarity..."
 *       DON'T: "This proves your destiny."
 *
 *   #5  DO: "Use this as a reflective framework..."
 *       DON'T: "This replaces professional advice."
 *
 * ─── Usage ──────────────────────────────────────────────────────────────────
 *
 *   import { lintText, APPROVED_OPENERS } from '../schema/languageGuide';
 *
 *   // In synthesis engine validation:
 *   const result = lintText(synthesisOutput);
 *   if (!result.valid) console.warn(result.violations);
 *
 *   // In content module authoring:
 *   const body = `${APPROVED_OPENERS.invitation} notice when the Sacral response...`;
 */

// ─── Violation type ───────────────────────────────────────────────────────────
export interface LintViolation {
  found:      string;   // the matched text
  category:   string;   // which guide-rail it violates
  suggestion: string;   // approved replacement direction
  position:   number;   // character index in source text
}

export interface LintResult {
  valid:      boolean;
  violations: LintViolation[];
  score:      number;   // 0–100; 100 = no violations
}

// ─── Forbidden patterns ───────────────────────────────────────────────────────
// Each pattern: [regex_string, category_label, replacement_suggestion]

const FORBIDDEN: [string, string, string][] = [

  // ── Use Case #1: Epistemic humility ──────────────────────────────────────
  // DO: "may invite you to notice" / "tends to" / "often"
  // DON'T: "you will always" / "you will never" / absolute futures
  [
    '\\byou will always\\b',
    'Absolute claim',
    'Replace with "this pattern tends to" or "this often looks like"',
  ],
  [
    '\\byou will never\\b',
    'Absolute claim',
    'Replace with "this rarely" or "this tends not to"',
  ],
  [
    '\\bguaranteed to\\b',
    'Absolute claim',
    'Remove guarantee language — use "tends to" or "often produces"',
  ],
  [
    '\\bwill always\\b',
    'Absolute claim',
    'Replace with "tends to" or "often"',
  ],
  [
    '\\bwill never\\b',
    'Absolute claim',
    'Replace with "rarely" or "tends not to"',
  ],

  // ── Use Case #2: Agency — no cosmic authority ─────────────────────────────
  // DO: "A useful experiment is" / "one approach is"
  // DON'T: "The universe demands" / "the stars say" / "you must"
  [
    '\\bthe universe demands\\b',
    'Cosmic authority',
    'Replace with "a useful experiment is" or "one approach worth testing"',
  ],
  [
    '\\bthe universe requires\\b',
    'Cosmic authority',
    'Replace with "this configuration invites" or "a useful experiment is"',
  ],
  [
    '\\bthe universe is telling you\\b',
    'Cosmic authority',
    'Replace with "this pattern may be pointing toward"',
  ],
  [
    '\\bthe stars say\\b',
    'Cosmic authority',
    'Replace with "the Stoplight highlights" or "this placement tends toward"',
  ],
  [
    '\\bthe stars tell you\\b',
    'Cosmic authority',
    'Replace with "this configuration often coincides with"',
  ],
  [
    '\\bastrology says you (should|must|need to)\\b',
    'Cosmic authority',
    'Replace with "this placement tends to" or "this often coincides with"',
  ],
  [
    '\\bhuman design says you (will|must|should)\\b',
    'Cosmic authority',
    'Replace with "this type tends to" or "this authority often works best when"',
  ],

  // ── Use Case #3: Reframing shadow — no pathologizing ─────────────────────
  // DO: "when under pressure, this can look like"
  // DON'T: "your flaw is" / "your weakness is" / "your problem is"
  [
    '\\byour flaw is\\b',
    'Pathologizing language',
    'Replace with "when this pattern is under pressure, it can look like"',
  ],
  [
    '\\bthis is your flaw\\b',
    'Pathologizing language',
    'Replace with "under pressure, this pattern sometimes produces"',
  ],
  [
    '\\byour weakness is\\b',
    'Pathologizing language',
    'Replace with "the friction in this pattern tends to arrive as"',
  ],
  [
    '\\byour problem is\\b',
    'Pathologizing language',
    'Replace with "the recurring tension in this configuration is"',
  ],
  [
    '\\byour dysfunction\\b',
    'Pathologizing language',
    'Replace with "the not-self pattern in this configuration"',
  ],
  [
    '\\byou are broken\\b',
    'Pathologizing language',
    'Remove entirely — no equivalent replacement',
  ],
  [
    '\\byou are damaged\\b',
    'Pathologizing language',
    'Remove entirely — no equivalent replacement',
  ],

  // ── Use Case #4: No predictive certainty ─────────────────────────────────
  // DO: "test whether this creates clarity"
  // DON'T: "this proves your destiny" / "this predicts"
  [
    '\\bthis proves your destiny\\b',
    'Predictive certainty',
    'Replace with "test whether this creates more clarity"',
  ],
  [
    '\\bproves? your destiny\\b',
    'Predictive certainty',
    'Replace with "may point toward" or "is worth testing"',
  ],
  [
    '\\byour destiny is\\b',
    'Predictive certainty',
    'Replace with "your Life Path direction is" (Destiny Number is a valid technical term)',
  ],
  [
    '\\byou are destined\\b',
    'Predictive certainty',
    'Replace with "this configuration tends toward" or "this pattern often produces"',
  ],
  [
    '\\bpredicts\\b',
    'Predictive claim',
    'Replace with "tends toward" or "often coincides with" — no prediction language',
  ],
  [
    '\\bforetells\\b',
    'Predictive claim',
    'Replace with "tends toward" or "often points toward"',
  ],
  [
    '\\bfate\\b',
    'Fate language',
    'Replace with "developmental direction" or "Life Path pattern"',
  ],
  [
    "\\byour soul's purpose\\b",
    'Overclaiming',
    'Replace with "your Life Path direction" or "your developmental arc"',
  ],

  // ── Use Case #5: Scope integrity ──────────────────────────────────────────
  // DO: "use this as a reflective framework"
  // DON'T: "this replaces professional advice"
  [
    '\\bthis replaces professional advice\\b',
    'Scope violation',
    'Replace with "use this as a reflective framework — it does not replace professional support"',
  ],
  [
    '\\breplaces.*professional advice\\b',
    'Scope violation',
    'Remove — this statement is never appropriate in T3D copy',
  ],
  [
    '\\bthis is a diagnosis\\b',
    'Scope violation',
    'Remove — T3D is a reflective framework, not a diagnostic tool',
  ],
  [
    '\\bdiagnoses?\\b',
    'Clinical language',
    'Replace with "identifies" or "highlights" — T3D does not diagnose',
  ],
  [
    '\\bmedical advice\\b',
    'Scope violation',
    'Remove — direct to qualified professionals',
  ],
  [
    '\\btherapeutic advice\\b',
    'Scope violation',
    'Remove — direct to qualified professionals',
  ],
  [
    '\\bthis will heal\\b',
    'Overclaiming',
    'Replace with "this may support" or "this can be useful for"',
  ],

  // ── Tone: no spiritual performance ────────────────────────────────────────
  [
    "\\bthe cosmos (says|tells|demands|requires)\\b",
    'Spiritual performance',
    'Replace with the specific system name (Vehicle, Road, or Stoplight)',
  ],
  [
    '\\bdivine plan\\b',
    'Spiritual performance',
    'Replace with "developmental pattern" or "Life Path direction"',
  ],
  [
    '\\bthe journey of your soul\\b',
    'Spiritual performance',
    'Replace with "your developmental arc" or "your Life Path"',
  ],
  [
    '\\bsoul contract\\b',
    'Spiritual performance',
    'Replace with "recurring pattern" or "Life Path theme"',
  ],
  [
    '\\bkarmic debt\\b',
    'Spiritual performance',
    'Use "Karmic Lesson" (the technical term) if referring to numerology — never "karmic debt"',
  ],
];

// ─── Lint function ─────────────────────────────────────────────────────────────
/**
 * lintText
 *
 * Checks a string of copy against all language guide-rails.
 * Returns a structured result with violations and a score.
 *
 * Score: 100 = fully compliant. Each violation deducts 20 points.
 * A score below 60 indicates the copy needs significant revision.
 *
 * Usage:
 *   const result = lintText(synthesisOutput);
 *   if (!result.valid) console.warn('[Language] violations:', result.violations);
 */
export function lintText(text: string): LintResult {
  const violations: LintViolation[] = [];

  for (const [pattern, category, suggestion] of FORBIDDEN) {
    const regex = new RegExp(pattern, 'gi');
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      violations.push({
        found:      match[0],
        category,
        suggestion,
        position:   match.index,
      });
    }
  }

  return {
    valid:      violations.length === 0,
    violations,
    score:      Math.max(0, 100 - violations.length * 20),
  };
}

// ─── Approved vocabulary ──────────────────────────────────────────────────────
/**
 * APPROVED_OPENERS
 *
 * Sentence starters that carry the correct epistemic register.
 * Use these when drafting interpretation copy, synthesis paragraphs,
 * and practice instructions.
 */
export const APPROVED_OPENERS = {
  // Invitation language (Use Case #1)
  invitation:   'This pattern may invite you to notice',
  tendency:     'This tends to',
  observation:  'When this is active, it often looks like',
  conditional:  'When you are under pressure, this can look like',

  // Experiment language (Use Case #2)
  experiment:   'A useful experiment is',
  practice:     'One approach worth testing:',
  tryThis:      'Try this for seven days:',
  notice:       'Notice whether',
  testWhether:  'Test whether this creates more clarity',

  // Reframe language (Use Case #3 — friction/shadow)
  frictionIntro:'When this pattern is under pressure, it can arrive as',
  shadowFrame:  'The friction in this configuration sometimes looks like',
  notSelfFrame: 'The not-self pattern here tends to sound like',

  // Scope markers (Use Case #5)
  framework:    'Use this as a reflective framework',
  disclaimer:   'This is a lens for reflection, not a prediction or professional assessment',
} as const;

/**
 * APPROVED_QUALIFIERS
 *
 * Words and phrases that soften certainty appropriately.
 * Every interpretive statement should contain at least one.
 */
export const APPROVED_QUALIFIERS = [
  'may', 'might', 'often', 'tends to', 'can', 'sometimes',
  'in many cases', 'for many readers', 'when active',
  'under pressure', 'in this configuration',
  'notice whether', 'test whether', 'consider whether',
] as const;

/**
 * SCOPE_STATEMENT
 *
 * The standard scope statement used on Page 43 (Data Notes)
 * and wherever the report's limits need to be acknowledged.
 */
export const SCOPE_STATEMENT =
  'This report is a reflective tool built from three symbolic systems. ' +
  'It is not a substitute for medical, psychological, legal, or financial advice. ' +
  'No interpretation in this report constitutes a diagnosis, prediction, or professional consultation. ' +
  'Use this as a framework for reflection — one that you test, keep, or set aside based on your own experience.';
