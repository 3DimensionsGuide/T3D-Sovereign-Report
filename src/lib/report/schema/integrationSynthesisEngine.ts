/**
 * T3D Integration Synthesis Engine
 *
 * Generates the closing "Now, Drive" paragraph for Section IV — The
 * Integration, the final section of the Advanced Sovereign Report. By this
 * point the reader has been through all three deepened systems (Vehicle,
 * Road, Stoplight) plus three templated Integration pages (The Stack, The
 * Hierarchy, The Four Mistakes). This is the one AI-generated passage in
 * the whole section — everything else on these five pages is fixed T3D
 * doctrine copy, because the doctrine itself never changes reader to
 * reader. What changes is how THIS reader's actual configuration sits
 * inside it, and that's what this engine writes.
 *
 * Unlike vehicleSynthesisEngine.ts / roadSynthesisEngine.ts /
 * stoplightSynthesisEngine.ts (which each stay inside one system), this
 * engine is deliberately cross-system — closer in spirit to
 * schema/synthesisEngine.ts (the base report's "T3D Signature" engine),
 * but built on the advanced engines' correct fetch pattern (proper
 * x-api-key/anthropic-version headers, claude-sonnet-5-5) rather
 * than that file's older, unauthenticated call.
 *
 * Doctrine encoded here (sourced from expert review of the T3D Esoteric
 * Knowledge Base, paraphrased into original T3D language — never quoted
 * or attributed to any named teacher in reader-facing copy):
 *   — Vehicle = the only decision-maker. Strategy + Authority is the
 *     mechanism; no transit or cycle is ever allowed to decide.
 *   — Road = the macro season. Which Pinnacle/Challenge chapter this
 *     falls inside — context, not instruction.
 *   — Stoplight = today's specific weather. Useful for timing and
 *     awareness, never for authority.
 *   — Awareness flows Stoplight → Road → Vehicle. Authority flows the
 *     other way: only the Vehicle ever gets the final vote.
 *
 * Output spec:
 *   — 180–260 words
 *   — Names this reader's actual Strategy/Authority, current Pinnacle/
 *     Challenge season, and one live transit/timing signal — then shows
 *     how those three feed one decision, never three decisions
 *   — 8th-grade reading level, no predictions/guarantees/diagnoses
 *   — Ends with one concrete this-week experiment routed through
 *     Strategy + Authority
 *   — Validated against schema/languageGuide.ts plus a word-count check
 */

import { lintText } from './languageGuide';
import {
  getPlanetLabel, getAspectLabel, formatTransitWindow,
  NATAL_TARGET_CONTENT,
} from '../advanced/stoplight/transits-content';
import type { TransitHit } from '../../../server/engines/transits';

const TARGET_WORD_COUNT = { min: 180, max: 260 };

// ─── Input shape ────────────────────────────────────────────────────────────
// A deliberately narrow, pre-computed slice of Vehicle + Road + Stoplight
// data — the same "pass only what this page needs" discipline the other
// three synthesis engines use. Nothing here is recalculated; it's already
// the output of calculateDefinition/calculateNumerology/calculateActiveTransits
// etc. by the time it reaches this engine.

export interface IntegrationPinnacle {
  number: number;
  label: string;
  startAge: number;
  endAge: number | null;
}

export interface IntegrationSynthesisInput {
  firstName: string;

  // Vehicle
  hdType: string;
  hdStrategy: string;
  hdAuthority: string;
  hdProfile: string;
  hdIncarnationCross: string;

  // Road
  lifePathDisplay: string;
  currentPinnacle: IntegrationPinnacle | undefined;
  currentChallenge: number | undefined;

  // Stoplight
  sunSign: string;
  tropicalAsc: string;
  activeTransits: TransitHit[];
}

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are writing the closing synthesis paragraph for Section IV — The Integration — the final section of a reader's T3D Advanced Sovereign Report. The reader has already been through three deepened systems (Vehicle/Human Design, Road/Numerology, Stoplight/Astrology) and three fixed Integration pages explaining: the three-system stack, the non-negotiable decision hierarchy (Vehicle decides, Road contextualizes, Stoplight informs — never the reverse), and four common ways people get this wrong. This paragraph is the payoff: proof, using THIS reader's real configuration, that the hierarchy actually works as one system rather than three separate ones.

STRUCTURAL REQUIREMENTS — include all four in this order:
1. Open with one plain-language thesis sentence stating that for this reader, specifically, these three systems are not three separate readings but one instrument — name their Strategy, Authority, current Pinnacle/Challenge season, and current Stoplight signal in the same breath, showing they describe one condition from three angles.
2. Walk the awareness-to-authority flow using their actual data: what the current Stoplight signal is drawing attention to right now, how their current Pinnacle/Challenge season gives that signal its context, and why — despite all of that — the decision still only ever gets made through their named Authority.
3. Name the one most likely way THIS reader personally risks getting the order backwards (mind overriding Authority because a transit or a cycle feels urgent) — tie it to their specific Type/Authority, not a generic warning.
4. Close with one concrete, specific experiment for this week that uses their named Authority to test one real decision, explicitly informed by (but not decided by) the current Stoplight/Road context.

LENGTH: 180–260 words. Not shorter. Not longer.

VOICE: Direct, warm, discerning. A guide who has watched this pattern play out, not an oracle. Speak to someone intelligent and skeptical of generalizations.

READING LEVEL: 8th grade. Short sentences. Active voice.

FORBIDDEN:
— No predictions ("you will," "this will lead to")
— No guarantees or absolute claims ("you always," "you never")
— No diagnoses or medical language
— No spiritual performance ("the universe," "your soul's purpose," "the stars say")
— Do not re-define terms already presented on earlier pages (don't re-explain what a Pinnacle, a transit, or an Authority is)
— Do not use the word "journey"
— Do not name any external teacher, book, or source
— Do not introduce any term not already used elsewhere in this report (no "Annual Profection," "Time-Lord," "PHS," "Determination," or similar unintroduced jargon)
— Do not use Human Design's internal "Vehicle/Driver/Passenger" terminology — "Vehicle" in this report means the Human Design system as a whole, never that internal model
— Do not simply restate the three-system stack in sequence — show them functioning as one decision, not three findings

PERMITTED AND ENCOURAGED:
— Name the reader's specific Type, Strategy, Authority, current Pinnacle/Challenge, and current Stoplight signal
— Use the reader's first name once, naturally
— Acknowledge that holding all three at once is genuinely harder than following just one`;

// ─── Build the data prompt ────────────────────────────────────────────────────

function buildDataPrompt(data: IntegrationSynthesisInput): string {
  const pinnacleLine = data.currentPinnacle
    ? `${data.currentPinnacle.label} (Pinnacle ${data.currentPinnacle.number}, age ${data.currentPinnacle.startAge}${data.currentPinnacle.endAge ? `–${data.currentPinnacle.endAge}` : '+'})`
    : 'unavailable';

  const challengeLine = data.currentChallenge !== undefined
    ? `Challenge ${data.currentChallenge} (running concurrent with the Pinnacle above)`
    : 'unavailable';

  const topTransit = data.activeTransits[0];
  const transitLine = topTransit
    ? `${getPlanetLabel(topTransit.transitingPlanet)} ${getAspectLabel(topTransit.aspect).toLowerCase()} ${NATAL_TARGET_CONTENT[topTransit.natalTarget].label}, active through ${formatTransitWindow(topTransit.window)}`
    : 'No major named transit currently active — the Stoplight reading is quiet right now, which is itself worth naming as a signal';

  return `READER DATA — FULL CROSS-SYSTEM CONFIGURATION:
Name: {{NAME}}  (write the token {{NAME}} exactly wherever the reader's first name belongs; it is swapped in after writing)

VEHICLE (Human Design):
  Type: ${data.hdType}
  Strategy: ${data.hdStrategy}
  Authority: ${data.hdAuthority}
  Profile: ${data.hdProfile}
  Incarnation Cross: ${data.hdIncarnationCross}

ROAD (Numerology):
  Life Path: ${data.lifePathDisplay}
  Current season: ${pinnacleLine}
  Concurrent Challenge: ${challengeLine}

STOPLIGHT (Astrology):
  Sun sign: ${data.sunSign}
  Rising sign: ${data.tropicalAsc}
  Current live signal: ${transitLine}

Write the Integration synthesis paragraph now. Begin directly — no preamble, no "Here is the synthesis." Start with the thesis sentence.`;
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

  const bannedJargon = /\b(annual profection|time-lord|timelord|\bphs\b|determination system)\b/i;
  if (bannedJargon.test(text)) issues.push('Uses unintroduced jargon');

  return { valid: issues.length === 0, wordCount: count, issues };
}

// ─── Template fallback ────────────────────────────────────────────────────────
// Used only when the API is unavailable or times out.

function buildFallbackSynthesis(data: IntegrationSynthesisInput): string {
  const pinnacleLabel = data.currentPinnacle
    ? `Your ${data.currentPinnacle.label.toLowerCase()}`
    : 'Your current season';

  const topTransit = data.activeTransits[0];
  const transitPhrase = topTransit
    ? `transiting ${getPlanetLabel(topTransit.transitingPlanet)} ${getAspectLabel(topTransit.aspect).toLowerCase()} ${NATAL_TARGET_CONTENT[topTransit.natalTarget].label}`
    : `a quiet stretch on the Stoplight — no major signal pulling for attention`;

  return `${data.firstName}, these three systems have been describing one condition the whole time, not three. Your ${data.hdType} runs on ${data.hdStrategy.toLowerCase()}, decided through ${data.hdAuthority} Authority — that is the only place a decision is actually made here. ${pinnacleLabel} sets the chapter this year is happening inside, and ${transitPhrase} sets today's weather inside that chapter. Neither one gets a vote. They only set the scene.

The place this usually breaks down is the moment a transit or a cycle feels urgent enough that the mind reaches for the decision before ${data.hdAuthority} Authority does. That urgency is real, but it is information, not instruction — the Stoplight and the Road hand you context, and your Vehicle still has to run the actual call through ${data.hdAuthority} Authority, every time, no exceptions made for how loud the timing feels.

This week: take one decision that this season or this transit has made feel pressing, and deliberately slow it down until it passes through ${data.hdAuthority} Authority on its own terms. Let the timing inform when you look at it — not whether you're allowed to wait.`;
}

// ─── Main synthesis generator ─────────────────────────────────────────────────

export interface IntegrationSynthesisResult {
  text: string;
  wordCount: number;
  source: 'api' | 'fallback';
  valid: boolean;
}

export async function generateIntegrationSynthesis(
  data: IntegrationSynthesisInput
): Promise<IntegrationSynthesisResult> {
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
      console.log(`[IntegrationSynthesis] Generated via API — ${validation.wordCount} words`);
      return { text: rawText, wordCount: validation.wordCount, source: 'api', valid: true };
    }

    console.warn('[IntegrationSynthesis] Validation issues:', validation.issues);

    if (validation.wordCount >= 150 && validation.wordCount <= 300) {
      return { text: rawText, wordCount: validation.wordCount, source: 'api', valid: false };
    }

    throw new Error('Synthesis output failed validation: ' + validation.issues.join('; '));

  } catch (error: unknown) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    console.warn(
      isTimeout
        ? '[IntegrationSynthesis] API timeout — using fallback'
        : `[IntegrationSynthesis] API error — using fallback: ${String(error)}`
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
