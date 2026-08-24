/**
 * T3D Synthesis Engine
 *
 * Generates the proprietary T3D Signature paragraph for each reader.
 * This is where the report becomes distinct in its experience, not
 * merely its calculations.
 *
 * The synthesis answers five questions:
 *   1. What is the Vehicle most reliably asking for in decision-making?
 *   2. What is the Road asking the reader to learn, build, or mature through?
 *   3. What is the Stoplight highlighting about pace, environment, or visibility?
 *   4. What is the most likely cross-system friction?
 *   5. What is the next small experiment?
 *
 * Output spec:
 *   — 180–260 words
 *   — Sounds like a discerning guide who has noticed a pattern
 *   — 8th-grade reading level
 *   — No predictions, diagnoses, guarantees, or absolute claims
 *   — Does not repeat technical definitions from the data card
 *
 * Note: This is an authoring specification paired with data-validation logic.
 * It is designed to be paired with an approved T3D knowledge base, style guide,
 * and human review samples as the platform matures.
 */

import type { ReportData } from '../tokens';

// ─── Voice and constraint constants ──────────────────────────────────────────

const FORBIDDEN_PHRASES = [
  'you will',
  'will always',
  'you are destined',
  'your destiny is',
  'predicts',
  'guaranteed',
  'diagnosis',
  'medical',
  'your soul\'s purpose',
  'journey',
  'the universe is telling you',
  'the stars say',
  'your fate',
];

const TARGET_WORD_COUNT = { min: 180, max: 260 };

// ─── System prompt (the T3D authoring specification) ─────────────────────────

const SYSTEM_PROMPT = `You are writing the T3D Signature paragraph for a specific reader's Sovereign Report. This is the most important paragraph in the report — the place where three separate systems produce one coherent insight that no single system could produce alone.

STRUCTURAL REQUIREMENTS — include all five in this order:
1. Open with one plain-language thesis sentence that names the overall pattern
2. Vehicle (Human Design): what the reader's decision mechanism is most reliably asking for
3. Road (Numerology): what the long-range developmental terrain is asking them to learn, build, or mature through
4. Stoplight (Astrology): what it highlights about pace, environment, emotional weather, or visibility
5. Cross-system friction: name one specific tension that arises when these three systems are confused or placed in the wrong order
6. Close with one concrete seven-day experiment using all three systems

LENGTH: 180–260 words. Not shorter. Not longer.

VOICE: Direct, warm, discerning. You sound like a guide who has noticed a pattern — not an oracle performing certainty. Write as though you are speaking to someone intelligent who is skeptical of generalizations.

READING LEVEL: 8th grade. Short sentences. Active voice. No jargon beyond the three system names (Vehicle, Road, Stoplight).

FORBIDDEN:
— No predictions ("you will," "this will lead to")
— No guarantees or absolute claims ("you always," "you never")
— No diagnoses or medical language
— No spiritual performance ("the universe," "your soul's purpose," "the stars say")
— Do not define terms already presented in the data card (Type, Life Path, Sun sign)
— Do not use the word "journey"
— Do not start with "As a [Type]" — this is too mechanical

PERMITTED AND ENCOURAGED:
— Name the specific configuration (e.g., "Sacral authority in a 7 Life Path")
— Name the specific tension between systems
— Use the reader's first name once, naturally
— Acknowledge the difficulty of living the configuration, not just describing it`;

// ─── Build the data prompt from validated ReportData ─────────────────────────

function buildDataPrompt(data: ReportData): string {
  const currentPinnacle = data.pinnacles[data.currentPinnacleIndex];
  const pinnacleDesc = currentPinnacle
    ? `Pinnacle ${currentPinnacle.number} (ages ${currentPinnacle.startAge}–${currentPinnacle.endAge ?? '+'})`
    : 'Current Pinnacle unknown';

  return `READER DATA:
Name: ${data.firstName}
Birth date: ${data.birthDate}

VEHICLE (Human Design):
  Type: ${data.hdType}
  Strategy: ${data.hdStrategy}
  Authority: ${data.hdAuthority}
  Profile: ${data.hdProfile}
  Not-Self theme: ${data.hdNotSelf}
  Defined centers: ${data.hdDefinedCenters.join(', ') || 'none recorded'}

ROAD (Numerology):
  Life Path: ${data.lifePathDisplay}
  Personal Year: ${data.personalYear} (${new Date().getFullYear()})
  Current phase: ${pinnacleDesc}
  Core direction (one line): ${getLifePathDirection(data.lifePath)}

STOPLIGHT (Astrology):
  Sun: ${data.sunSign} (${data.tropicalSun})
  Moon: ${data.moonSign} (${data.tropicalMoon})
  Rising: ${data.risingSign} (${data.tropicalAsc})
  Element pattern: ${getElementSummary(data.sunSign, data.moonSign, data.risingSign)}

Write the T3D Signature paragraph now. Begin directly — no preamble, no "Here is the synthesis." Start with the thesis sentence.`;
}

// ─── Helper: element summary ─────────────────────────────────────────────────

const SIGN_ELEMENTS: Record<string, string> = {
  Aries:'Fire', Leo:'Fire', Sagittarius:'Fire',
  Taurus:'Earth', Virgo:'Earth', Capricorn:'Earth',
  Gemini:'Air', Libra:'Air', Aquarius:'Air',
  Cancer:'Water', Scorpio:'Water', Pisces:'Water',
};

function getElementSummary(sun: string, moon: string, rising: string): string {
  const elements = [sun, moon, rising].map(s => SIGN_ELEMENTS[s] ?? '?');
  const counts: Record<string, number> = {};
  for (const e of elements) counts[e] = (counts[e] ?? 0) + 1;
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (dominant[0]![1] >= 2) return `${dominant[0]![0]}-dominant`;
  return `${elements[0]}-${elements[1]}-${elements[2]} blend`;
}

// ─── Helper: life path one-liner ─────────────────────────────────────────────

const LP_DIRECTIONS: Record<number, string> = {
  1: 'Leadership and independent self-definition',
  2: 'Partnership, diplomacy, and cooperative sensitivity',
  3: 'Creative expression and authentic communication',
  4: 'Building durable foundations through methodical work',
  5: 'Freedom, adaptability, and experiential learning',
  6: 'Responsibility, community, and care without martyrdom',
  7: 'Depth, investigation, and wisdom through solitude',
  8: 'Authority, material mastery, and leadership at scale',
  9: 'Completion, humanitarianism, and learning to release',
  11: 'Spiritual illumination and translating what others sense',
  22: 'Large-scale building and legacy-oriented discipline',
  33: 'Compassionate service through creative mastery',
};

function getLifePathDirection(lifePath: number): string {
  return LP_DIRECTIONS[lifePath] ?? `Life Path ${lifePath}`;
}

// ─── Output validation ────────────────────────────────────────────────────────

interface ValidationResult {
  valid:       boolean;
  wordCount:   number;
  issues:      string[];
}

function validateSynthesis(text: string): ValidationResult {
  const words  = text.trim().split(/\s+/).filter(Boolean);
  const count  = words.length;
  const issues: string[] = [];
  const lower  = text.toLowerCase();

  if (count < TARGET_WORD_COUNT.min) {
    issues.push(`Too short: ${count} words (min ${TARGET_WORD_COUNT.min})`);
  }
  if (count > TARGET_WORD_COUNT.max) {
    issues.push(`Too long: ${count} words (max ${TARGET_WORD_COUNT.max})`);
  }

  for (const phrase of FORBIDDEN_PHRASES) {
    if (lower.includes(phrase)) {
      issues.push(`Forbidden phrase: "${phrase}"`);
    }
  }

  // Check structural elements
  const hasExperiment = /\b(seven.day|7.day|this week|experiment|practice|try)\b/i.test(text);
  if (!hasExperiment) {
    issues.push('Missing closing experiment');
  }

  return { valid: issues.length === 0, wordCount: count, issues };
}

// ─── Template fallback ────────────────────────────────────────────────────────
// Used when the API is unavailable or times out.
// Less personalized but maintains quality and correct structure.

function buildFallbackSynthesis(data: ReportData): string {
  const { hdType, hdAuthority, hdStrategy, lifePath, lifePathDisplay,
          sunSign, moonSign, hdNotSelf, personalYear } = data;

  const authorityAction: Record<string, string> = {
    'Sacral':         'checking the gut before the mind',
    'Emotional':      'waiting across emotional states before committing',
    'Splenic':        'retrieving the first moment\'s signal',
    'Self-Projected': 'speaking the decision aloud before making it',
    'Ego':            'asking honestly what you actually want',
    'None':           'sampling different environments before deciding',
    'Lunar':          'waiting a full lunar cycle for major decisions',
  };

  const lpTerrain: Record<number, string> = {
    1: 'learning to lead from your own center rather than inherited expectations',
    2: 'building genuine partnership without losing yourself inside it',
    3: 'developing the courage to express before the work feels finished',
    4: 'building things that last without confusing discipline with obligation',
    5: 'learning the difference between freedom that integrates and movement that escapes',
    6: 'giving care sustainably — not as martyrdom but as genuine capacity',
    7: 'trusting solitude as a resource rather than a symptom',
    8: 'claiming authority that was earned rather than seized',
    9: 'learning to release what has genuinely completed, not just what is difficult',
    11: 'trusting your sensitivity as the instrument, not the obstacle',
    22: 'matching the scope of your building to the scale your design can actually carry',
    33: 'giving from fullness rather than from depletion',
  };

  const sunAction: Record<string, string> = {
    'Aries':       'acts fastest when initiative is genuine',
    'Taurus':      'builds most durably when pace is respected',
    'Gemini':      'thinks most clearly in conversation, not isolation',
    'Cancer':      'operates best when safety is established first',
    'Leo':         'contributes most when expression is genuine rather than performed',
    'Virgo':       'works best when usefulness is clearly defined',
    'Libra':       'functions best when relational balance is maintained',
    'Scorpio':     'moves most effectively when depth is honoured over speed',
    'Sagittarius': 'generates most when direction is meaningful, not just busy',
    'Capricorn':   'builds most durably when structure serves, not controls',
    'Aquarius':    'thinks ahead of the room — environments need time to catch up',
    'Pisces':      'operates best in emotionally safe, low-pressure environments',
  };

  const authKey = Object.keys(authorityAction).find(k =>
    hdAuthority.toLowerCase().includes(k.toLowerCase())
  ) ?? 'Sacral';

  const action   = authorityAction[authKey] ?? 'checking the correct internal signal';
  const terrain  = lpTerrain[lifePath] ?? `deepening what Life Path ${lifePathDisplay} is asking for`;
  const stoplight = sunAction[sunSign] ?? `moving when the environment supports ${sunSign} energy`;

  return `${data.firstName} carries a configuration that asks for precision in a specific sequence: Vehicle first, Road second, Stoplight third. As a ${hdType}, the most consistent point of failure is the moment before a decision — not the decision itself. ${hdStrategy.toLowerCase()} means ${action}. When that sequence is honored, the rest of the system has something to work with.

The Life Path ${lifePathDisplay} sets the long-range terrain: ${terrain}. This isn't the drama of the current year — it's the quiet curriculum that keeps returning regardless of circumstances. Personal Year ${personalYear} is the current chapter inside that longer arc.

The ${sunSign} Sun ${stoplight}. This isn't a preference — it's a condition. When the environment contradicts the Stoplight, effort increases and output drops.

The most common friction in this configuration is using the Stoplight to override the Vehicle. The emotional weather or the current season seems to argue against what the ${hdAuthority} Authority has already confirmed. The sequence exists for this reason: Vehicle answers the how, Road answers the why, Stoplight answers the when. None of them replaces the others.

This week: make one decision using only your ${hdAuthority} Authority. Then check whether it aligns with the ${lifePathDisplay} direction. Then check the conditions. Notice what shifts.`;
}

// ─── Main synthesis generator ─────────────────────────────────────────────────

export interface SynthesisResult {
  text:       string;
  wordCount:  number;
  source:     'api' | 'fallback';
  valid:      boolean;
}

export async function generateSynthesis(data: ReportData): Promise<SynthesisResult> {
  const TIMEOUT_MS = 20_000;

  // Build prompts
  const dataPrompt = buildDataPrompt(data);

  try {
    // Call Claude API with timeout
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      signal:  controller.signal,
      body: JSON.stringify({
        model:      'claude-sonnet-4-6',
        max_tokens: 600,
        system:     SYSTEM_PROMPT,
        messages:   [{ role: 'user', content: dataPrompt }],
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const json = await response.json() as {
      content: { type: string; text: string }[];
    };

    const rawText = json.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n')
      .trim();

    // Validate
    const validation = validateSynthesis(rawText);

    if (validation.valid) {
      console.log(`[Synthesis] Generated via API — ${validation.wordCount} words`);
      return { text: rawText, wordCount: validation.wordCount, source: 'api', valid: true };
    }

    // Log issues but still use the text if word count is close
    console.warn('[Synthesis] Validation issues:', validation.issues);

    if (validation.wordCount >= 150 && validation.wordCount <= 300) {
      // Acceptable range — use despite minor issues
      return { text: rawText, wordCount: validation.wordCount, source: 'api', valid: false };
    }

    throw new Error('Synthesis output failed validation: ' + validation.issues.join('; '));

  } catch (error: unknown) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    console.warn(
      isTimeout
        ? '[Synthesis] API timeout — using fallback'
        : `[Synthesis] API error — using fallback: ${String(error)}`
    );

    // Fallback to template synthesis
    const fallback   = buildFallbackSynthesis(data);
    const validation = validateSynthesis(fallback);

    return {
      text:      fallback,
      wordCount: validation.wordCount,
      source:    'fallback',
      valid:     validation.valid,
    };
  }
}
