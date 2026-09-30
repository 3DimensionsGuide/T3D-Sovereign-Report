/**
 * T3D Vehicle Synthesis Engine
 *
 * Generates the closing "Your Vehicle, Synthesized" paragraph for the
 * Advanced Sovereign Report's Vehicle section — genuinely generated per
 * reader via the Claude API, never templated boilerplate (the fallback
 * below exists only for API-unavailable situations, same pattern as the
 * cross-system engine at schema/synthesisEngine.ts).
 *
 * Unlike that cross-system engine (which blends Vehicle × Road ×
 * Stoplight for the basic Sovereign Report), this one stays entirely
 * inside the Vehicle: it draws on everything the eight Advanced Report
 * Vehicle pages actually calculated for this reader — Type/Strategy/
 * Authority, Profile, Definition, Circuitry, Incarnation Cross + family,
 * Godhead + its light/shadow, and all four Variables — and asks the model
 * to find the ONE throughline connecting them, not summarize each in turn.
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
import {
  calculateDefinition, calculateCircuitBalance, calculateCrossFamily,
  calculateGodhead, calculateVariables, VARIABLE_ARROW_LABEL,
} from '../tokens';
import type { ReportData } from '../tokens';

const TARGET_WORD_COUNT = { min: 180, max: 260 };

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are writing the closing synthesis paragraph for the Vehicle section of a reader's T3D Advanced Sovereign Report — a deep, Human-Design-only report. The reader has just been through eight pages: Definition, Bridges, Circuitry, Incarnation Cross, Godhead, Light & Shadow, and Variables. This paragraph is the payoff — the place where all eight findings resolve into ONE coherent read on how this specific Vehicle actually operates, not a recap of each page in turn.

STRUCTURAL REQUIREMENTS — include all four in this order:
1. Open with one plain-language thesis sentence naming the single throughline connecting this reader's Type/Authority, Definition, Circuitry, Cross, and Godhead — not a list, an actual pattern.
2. Name the specific mechanical requirement their Strategy and Authority impose on decision-making, and how their Definition/Circuitry either supports or complicates following it day to day.
3. Name the tension between their Godhead's shadow expression and what actually resolves it — tie this explicitly back to Strategy and Authority, since that is the real lever, not willpower.
4. Close with one concrete, specific experiment for this week that uses their actual Authority (name it) to test one small decision.

LENGTH: 180–260 words. Not shorter. Not longer.

VOICE: Direct, warm, discerning. You sound like a guide who has noticed a pattern — not an oracle performing certainty. Speak to someone intelligent who is skeptical of generalizations.

READING LEVEL: 8th grade. Short sentences. Active voice.

FORBIDDEN:
— No predictions ("you will," "this will lead to")
— No guarantees or absolute claims ("you always," "you never")
— No diagnoses or medical language
— No spiritual performance ("the universe," "your soul's purpose," "the stars say")
— Do not re-define terms already presented on the earlier pages (don't explain what a Godhead or a Variable is)
— Do not use the word "journey"
— Do not start with "As a [Type]" — this is too mechanical
— Do not simply list the eight page findings in sequence — find the actual connective thread

PERMITTED AND ENCOURAGED:
— Name the specific configuration (Type, Authority, Profile, Cross family, Godhead name)
— Use the reader's first name once, naturally
— Acknowledge the real difficulty of living the configuration, not just describing it`;

// ─── Build the data prompt from a reader's Vehicle-only calculated data ──────

function buildDataPrompt(data: ReportData): string {
  const definition = calculateDefinition(data.hdDefinedCenters, data.hdChannels);
  const circuit = calculateCircuitBalance(data.hdChannels);
  const crossFamily = calculateCrossFamily(data.hdProfile);
  const godheadResult = calculateGodhead(data.hdActiveGates);
  const variables = calculateVariables(data.hdActiveGates);

  const dominantCircuitLabel =
    circuit.dominant === 'None' ? 'no active circuitry'
      : circuit.dominant === 'Even' ? 'an even spread across circuits'
      : `${circuit.dominant}-dominant circuitry`;

  const variableLine = (key: 'digestion' | 'environment' | 'perspective' | 'motivation') => {
    const reading = variables[key];
    if (!reading) return `${key}: unavailable`;
    return `${key}: ${reading.arrow} (${VARIABLE_ARROW_LABEL[key][reading.arrow]})`;
  };

  return `READER DATA — VEHICLE SECTION ONLY:
Name: ${data.firstName}

TYPE MECHANICS:
  Type: ${data.hdType}
  Strategy: ${data.hdStrategy}
  Authority: ${data.hdAuthority}
  Profile: ${data.hdProfile}
  Not-Self theme: ${data.hdNotSelf}

DEFINITION & CIRCUITRY:
  Definition: ${definition.type} (${definition.groups.length} group${definition.groups.length === 1 ? '' : 's'})
  Dominant circuitry: ${dominantCircuitLabel}

INCARNATION CROSS:
  Name: ${data.hdIncarnationCross}
  Family: ${crossFamily.label} — ${crossFamily.meaning.keynote}

GODHEAD:
  ${godheadResult.godhead ? `${godheadResult.godhead.name} — ${godheadResult.godhead.archetype} (Quarter of ${godheadResult.godhead.quarter})` : 'Unavailable'}
  ${godheadResult.godhead ? `Shadow expression: ${godheadResult.godhead.shadow}` : ''}

VARIABLES (arrow level only):
  ${variableLine('digestion')}
  ${variableLine('environment')}
  ${variableLine('perspective')}
  ${variableLine('motivation')}

Write the Vehicle synthesis paragraph now. Begin directly — no preamble, no "Here is the synthesis." Start with the thesis sentence.`;
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
  const definition = calculateDefinition(data.hdDefinedCenters, data.hdChannels);
  const circuit = calculateCircuitBalance(data.hdChannels);
  const crossFamily = calculateCrossFamily(data.hdProfile);
  const godheadResult = calculateGodhead(data.hdActiveGates);

  const godheadName = godheadResult.godhead?.name ?? 'your Godhead';
  // Strip trailing sentence punctuation so this drops cleanly into the
  // em-dash frame below regardless of how the source content is phrased.
  const godheadShadow = (godheadResult.godhead?.shadow
    ?? 'a distorted version of your own archetype taking over the wheel')
    .replace(/[.!?]+\s*$/, '');

  const definitionNote = definition.groups.length > 1
    ? `a ${definition.type} — energy that runs as ${definition.groups.length} separate circuits rather than one continuous system`
    : `a ${definition.type} — one continuous circuit with nothing to bridge`;

  const circuitNote = circuit.dominant === 'None'
    ? 'no single circuit dominating the way you process energy'
    : circuit.dominant === 'Even'
      ? 'an even spread across how you process and share energy'
      : `${circuit.dominant}-dominant circuitry`;

  return `${data.firstName}, the throughline across your Vehicle is consistency under a single condition: everything here works when you let ${data.hdAuthority} Authority decide first, and works against you the moment the mind tries to decide instead. Your ${data.hdType} runs on ${definitionNote}, with ${circuitNote} — mechanics that reward waiting for the correct signal rather than reasoning your way to a decision in advance.

Your ${crossFamily.label} cross and your ${godheadName} Godhead point to the same theme from two directions: a life built to run through ${data.hdStrategy.toLowerCase()}, not around it. The friction shows up as a specific shadow — ${godheadShadow} — and it resolves the same way every time, not through more effort, but by handing the decision back to ${data.hdAuthority} Authority before the mind gets a vote.

This week: pick one decision, small or large, and run it through ${data.hdAuthority} Authority alone before you let yourself reason about it. Notice what's different about how it lands.`;
}

// ─── Main synthesis generator ─────────────────────────────────────────────────

export interface VehicleSynthesisResult {
  text: string;
  wordCount: number;
  source: 'api' | 'fallback';
  valid: boolean;
}

export async function generateVehicleSynthesis(data: ReportData): Promise<VehicleSynthesisResult> {
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
        model: 'claude-sonnet-4-5-20250929',
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
      .trim();

    const validation = validateSynthesis(rawText);

    if (validation.valid) {
      console.log(`[VehicleSynthesis] Generated via API — ${validation.wordCount} words`);
      return { text: rawText, wordCount: validation.wordCount, source: 'api', valid: true };
    }

    console.warn('[VehicleSynthesis] Validation issues:', validation.issues);

    if (validation.wordCount >= 150 && validation.wordCount <= 300) {
      return { text: rawText, wordCount: validation.wordCount, source: 'api', valid: false };
    }

    throw new Error('Synthesis output failed validation: ' + validation.issues.join('; '));

  } catch (error: unknown) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    console.warn(
      isTimeout
        ? '[VehicleSynthesis] API timeout — using fallback'
        : `[VehicleSynthesis] API error — using fallback: ${String(error)}`
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
