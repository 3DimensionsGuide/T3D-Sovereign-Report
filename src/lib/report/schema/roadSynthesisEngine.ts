/**
 * T3D Road Synthesis Engine
 *
 * Generates the closing "Your Road, Synthesized" paragraph for the Advanced
 * Sovereign Report's Road (Numerology) section — genuinely generated per
 * reader via the Claude API, never templated boilerplate (the fallback
 * below exists only for API-unavailable situations, same pattern as
 * vehicleSynthesisEngine.ts).
 *
 * Stays entirely inside the Road: it draws on everything the seven Advanced
 * Report Road pages actually calculated for this reader — Life Path,
 * Destiny/Soul Urge/Personality, Hidden Passion, Karmic Lessons, and the
 * currently active Pinnacle/Challenge pair — and asks the model to find the
 * ONE throughline connecting them, not summarize each page in turn.
 *
 * Output spec:
 *   — 180–260 words
 *   — Sounds like a discerning guide who has noticed a pattern
 *   — 8th-grade reading level
 *   — No predictions, diagnoses, guarantees, or absolute claims
 *   — Does not re-define terms the reader already saw on earlier pages
 *   — Validated against the same language guide-rails as the rest of the
 *     report (schema/languageGuide.ts) plus a word-count check
 */

import { lintText } from './languageGuide';
import { getPinnacleChallengeInteraction } from '../advanced/road/road-content';
import type { ReportData } from '../tokens';

const TARGET_WORD_COUNT = { min: 180, max: 260 };

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are writing the closing synthesis paragraph for the Road section of a reader's T3D Advanced Sovereign Report — a deep, numerology-only report. The reader has just been through seven pages: Life Path (from the base report), Destiny/Expression, Soul Urge & Personality, Hidden Passion, Karmic Lessons, Pinnacles, and Challenges. This paragraph is the payoff — the place where all these findings resolve into ONE coherent read on how this specific chart actually moves through time, not a recap of each page in turn.

STRUCTURAL REQUIREMENTS — include all four in this order:
1. Open with one plain-language thesis sentence naming the single throughline connecting this reader's Life Path, their Destiny/Soul Urge/Personality layers, and their Hidden Passion — not a list, an actual pattern in how the name and the birth date are pulling together (or in tension).
2. Name the specific gap or alignment between what their name privately craves (Soul Urge) and what it outwardly projects (Personality), and how their Destiny Number either bridges that gap or gets pulled between the two.
3. Name what's actually active for them RIGHT NOW: their current Pinnacle and Challenge, whether those share a root number or contrast, and tie this explicitly to their Karmic Lesson(s) as the specific skill this phase is asking them to build — not a general life theme, this exact moment.
4. Close with one concrete, specific experiment for this week that uses their current Pinnacle/Challenge phase to practice their Karmic Lesson (or, if they have none, their Hidden Passion) directly.

LENGTH: 180–260 words. Not shorter. Not longer.

VOICE: Direct, warm, discerning. You sound like a guide who has noticed a pattern — not an oracle performing certainty. Speak to someone intelligent who is skeptical of generalizations.

READING LEVEL: 8th grade. Short sentences. Active voice.

FORBIDDEN:
— No predictions ("you will," "this will lead to")
— No guarantees or absolute claims ("you always," "you never")
— No diagnoses or medical language
— No spiritual performance ("the universe," "your soul's purpose," "the stars say")
— Do not re-define terms already presented on the earlier pages (don't explain what a Pinnacle or Karmic Lesson is)
— Do not use the word "journey"
— Do not start with "As a Life Path [N]" — this is too mechanical
— Do not simply list the seven page findings in sequence — find the actual connective thread

PERMITTED AND ENCOURAGED:
— Name the specific numbers (Life Path, Destiny, Soul Urge, Personality, Hidden Passion, current Pinnacle, current Challenge)
— Use the reader's first name once, naturally
— Acknowledge the real difficulty of living the configuration, not just describing it`;

// ─── Build the data prompt from a reader's Road-only calculated data ─────────

function buildDataPrompt(data: ReportData): string {
  const currentPinnacle = data.pinnacles[data.currentPinnacleIndex];
  const currentChallenge = data.challenges[data.currentPinnacleIndex];
  const interaction =
    currentPinnacle && currentChallenge !== undefined
      ? getPinnacleChallengeInteraction(currentPinnacle.number, currentChallenge)
      : 'Unavailable';

  const karmicLessonsLine = data.karmicLessons.length > 0
    ? data.karmicLessons.join(', ')
    : 'none — every digit 1–9 appears in the full birth name';

  return `READER DATA — ROAD SECTION ONLY:
Name: {{NAME}}  (write the token {{NAME}} exactly wherever the reader's first name belongs; it is swapped in after writing)

LIFE PATH:
  Life Path: ${data.lifePathDisplay} (root ${data.lifePath})

NAME-BASED NUMBERS:
  Destiny/Expression: ${data.destiny}
  Soul Urge (private craving): ${data.soulUrge}
  Personality (outer read): ${data.personality}
  Hidden Passion (recurring drive): ${data.hiddenPassion}
  Karmic Lessons (missing digits): ${karmicLessonsLine}

CURRENTLY ACTIVE PHASE:
  Pinnacle: ${currentPinnacle ? currentPinnacle.number : 'unavailable'} (${currentPinnacle?.label ?? ''}, age ${currentPinnacle?.startAge ?? '?'}${currentPinnacle?.endAge ? `–${currentPinnacle.endAge}` : '+'})
  Challenge: ${currentChallenge ?? 'unavailable'}
  How they interact: ${interaction}

Write the Road synthesis paragraph now. Begin directly — no preamble, no "Here is the synthesis." Start with the thesis sentence.`;
}

// ─── Output validation ────────────────────────────────────────────────────────

interface ValidationResult {
  valid: boolean;
  wordCount: number;
  issues: string[];
}

function validateSynthesis(text: string): ValidationResult {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const count = words.length;
  const issues: string[] = [];

  if (count < TARGET_WORD_COUNT.min) issues.push(`Too short: ${count} words (min ${TARGET_WORD_COUNT.min})`);
  if (count > TARGET_WORD_COUNT.max) issues.push(`Too long: ${count} words (max ${TARGET_WORD_COUNT.max})`);

  const lint = lintText(text);
  if (!lint.valid) {
    for (const v of lint.violations) issues.push(`${v.category}: "${v.found}"`);
  }

  const hasExperiment = /\b(this week|seven.day|7.day|experiment|try|test)\b/i.test(text);
  if (!hasExperiment) issues.push('Missing closing experiment');

  return { valid: issues.length === 0, wordCount: count, issues };
}

// ─── Template fallback ────────────────────────────────────────────────────────
// Used only when the API is unavailable or times out. Less personalized but
// keeps the correct structure and never leaves the page blank.

function buildFallbackSynthesis(data: ReportData): string {
  const currentPinnacle = data.pinnacles[data.currentPinnacleIndex];
  const currentChallenge = data.challenges[data.currentPinnacleIndex];
  const sameRoot = currentPinnacle && currentChallenge !== undefined
    && (currentPinnacle.number === currentChallenge
        || (currentPinnacle.number === 11 && currentChallenge === 2)
        || (currentPinnacle.number === 22 && currentChallenge === 4)
        || (currentPinnacle.number === 33 && currentChallenge === 6));

  const karmicNote = data.karmicLessons.length > 0
    ? `a Karmic Lesson in ${data.karmicLessons.join(' and ')} — energy your name never handed you automatically`
    : 'no Karmic Lesson at all — every digit showed up somewhere in your name';

  const phaseDynamic = sameRoot
    ? `right now your Pinnacle and Challenge share the same root, which pulls one specific lesson to the front of the line`
    : `right now your Pinnacle and Challenge are pulling in different directions, which sets up a real, productive tension`;

  return `${data.firstName}, the throughline across your Road is a specific kind of mismatch worth naming directly: your Life Path (${data.lifePathDisplay}) sets the mission, but your name splits that mission three ways — Destiny ${data.destiny} as the method, Soul Urge ${data.soulUrge} as what actually satisfies you, and Personality ${data.personality} as what people read before they know anything real. When those three don't all point the same direction, the gap itself is information, not a flaw to fix.

Underneath all of it sits your Hidden Passion, ${data.hiddenPassion} — the recurring drive that's been running since birth whether or not you ever named it — and ${karmicNote}.

For timing: ${phaseDynamic}. That's not background noise, it's the actual assignment for this stretch of years.

This week: take one small decision inside your current phase and deliberately practice the skill your Karmic Lesson (or, if you have none, your Hidden Passion) is asking for — not as a resolution, just as a single test.`;
}

// ─── Main synthesis generator ─────────────────────────────────────────────────

export interface RoadSynthesisResult {
  text: string;
  wordCount: number;
  source: 'api' | 'fallback';
  valid: boolean;
}

export async function generateRoadSynthesis(data: ReportData): Promise<RoadSynthesisResult> {
  const TIMEOUT_MS = 20_000;
  const dataPrompt = buildDataPrompt(data);

  const apiKey = process.env.ANTHROPIC_API_KEY;

  try {
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'claude-sonnet-5-5', // QA fix: 4-5-20250929 deprecated 2026-09-30, retires 2026-11-30 per Anthropic's model-deprecations page
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: dataPrompt }],
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      throw new Error(`API error: ${response.status} ${errBody}`);
    }

    const json = await response.json() as { content: { type: string; text: string }[] };
    const rawText = json.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n')
      .trim()
      .split('{{NAME}}').join(data.firstName);

    const validation = validateSynthesis(rawText);

    if (validation.valid) {
      console.log(`[RoadSynthesis] Generated via API — ${validation.wordCount} words`);
      return { text: rawText, wordCount: validation.wordCount, source: 'api', valid: true };
    }

    console.warn('[RoadSynthesis] Validation issues:', validation.issues);

    if (validation.wordCount >= 150 && validation.wordCount <= 300) {
      return { text: rawText, wordCount: validation.wordCount, source: 'api', valid: false };
    }

    throw new Error('Synthesis output failed validation: ' + validation.issues.join('; '));

  } catch (error: unknown) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    console.warn(
      isTimeout
        ? '[RoadSynthesis] API timeout — using fallback'
        : `[RoadSynthesis] API error — using fallback: ${String(error)}`
    );

    const fallback = buildFallbackSynthesis(data);
    const validation = validateSynthesis(fallback);

    return {
      text: fallback,
      wordCount: validation.wordCount,
      source: 'fallback',
      valid: validation.valid,
    };
  }
}
