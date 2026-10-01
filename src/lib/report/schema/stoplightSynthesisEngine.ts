/**
 * T3D Stoplight Synthesis Engine
 *
 * Generates the closing "Your Stoplight, Synthesized" paragraph for the
 * Advanced Sovereign Report's Stoplight (Astrology) section — genuinely
 * generated per reader via the Claude API, never templated boilerplate
 * (the fallback below exists only for API-unavailable situations, same
 * pattern as roadSynthesisEngine.ts and vehicleSynthesisEngine.ts).
 *
 * NOT to be confused with schema/synthesisEngine.ts (the base report's
 * cross-system Vehicle×Road×Stoplight "T3D Signature" paragraph) or
 * schema/stoplightSynthesis.ts / section5/Page30StoplightSynthesis.tsx
 * (the base report's own, unrelated section5 Stoplight synthesis).
 *
 * Stays entirely inside the Stoplight: it draws on everything the four
 * Advanced Report Stoplight pages actually calculated for this reader —
 * Personal Planets (Mercury/Venus/Mars by sign), Social Planets
 * (Jupiter/Saturn by sign), Outer Planets (Uranus/Neptune/Pluto by whole-
 * sign house), and whatever is currently active or next-up in Transits —
 * and asks the model to find the ONE throughline connecting the reader's
 * fixed astrological architecture to what the sky is doing right now, not
 * summarize each page in turn.
 *
 * Unlike Road and Vehicle (whose underlying data is fully static), the
 * Transits layer here changes day to day — so this synthesis is generated
 * fresh from whatever activeTransits/upcomingTransits the route already
 * computed for Page05Transits, at request time, rather than from a fixed
 * snapshot. That's intentional: the Stoplight section is the one part of
 * this report that's explicitly about timing, so its synthesis should
 * speak to today, not to a cached moment.
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
  MERCURY_CONTENT, VENUS_CONTENT, MARS_CONTENT,
  JUPITER_CONTENT, SATURN_CONTENT,
  URANUS_HOUSE_CONTENT, NEPTUNE_HOUSE_CONTENT, PLUTO_HOUSE_CONTENT,
  getPlanetHouse,
} from '../advanced/stoplight/stoplight-content';
import {
  getPlanetLabel, getAspectLabel, formatTransitWindow,
  NATAL_TARGET_CONTENT,
} from '../advanced/stoplight/transits-content';
import type { TransitHit, UpcomingTransit } from '../../../server/engines/transits';

const TARGET_WORD_COUNT = { min: 180, max: 260 };

// Whole-sign houses only ever run 1–12, so a lookup table is simpler and
// safer than a general-purpose ordinal-suffix algorithm.
const ORDINAL_HOUSE: Record<number, string> = {
  1: '1st', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th', 6: '6th',
  7: '7th', 8: '8th', 9: '9th', 10: '10th', 11: '11th', 12: '12th',
};
function ordinalHouse(house: number | null): string {
  return house !== null ? ORDINAL_HOUSE[house] : 'unavailable';
}

// ─── Reader data this engine actually needs ───────────────────────────────────
// Deliberately narrower than the full ReportData — mirrors exactly what the
// four Stoplight content pages (and the route that assembles them) already
// have in hand: sign placements for the seven non-Big-Three planets, the
// Ascendant (for house math), and the live-computed transits data.

export interface StoplightSynthesisInput {
  firstName:       string;
  sunSign:         string;
  tropicalAsc:     string; // doubles as the Rising sign
  tropicalMercury: string;
  tropicalVenus:   string;
  tropicalMars:    string;
  tropicalJupiter: string;
  tropicalSaturn:  string;
  tropicalUranus:  string;
  tropicalNeptune: string;
  tropicalPluto:   string;
  activeTransits:   TransitHit[];
  upcomingTransits: UpcomingTransit[];
}

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are writing the closing synthesis paragraph for the Stoplight section of a reader's T3D Advanced Sovereign Report — a deep, astrology-only report. The reader has just been through four pages: Personal Planets (Mercury, Venus, Mars — read by sign, since these move fast enough to be genuinely personal), Social Planets (Jupiter, Saturn — also by sign), Outer Planets (Uranus, Neptune, Pluto — read by whole-sign house instead, since their sign is generational and what's personal is which area of life carries their charge), and Transits (what's currently active in the sky against their Sun, Moon, and Ascendant, plus what's coming next). This paragraph is the payoff — the place where the reader's fixed chart and the moving sky resolve into ONE coherent read, not a recap of each page in turn.

STRUCTURAL REQUIREMENTS — include all four in this order:
1. Open with one plain-language thesis sentence naming the single throughline connecting how this reader's Personal Planets (Mercury/Venus/Mars) and Social Planets (Jupiter/Saturn) combine into one recognizable operating pattern — not a list of five placements, an actual pattern in how they work together or pull against each other.
2. Name what's different about the Outer Planets layer — which house(s) of the reader's chart carry the Uranus/Neptune/Pluto charge — and frame this as a slower, deeper undercurrent running beneath the faster personal pattern above, not a separate unrelated topic.
3. Name what's actually active for them RIGHT NOW from Transits: the current transit(s) — which planet, which aspect, landing on which of their Sun/Moon/Ascendant — and connect it explicitly to whichever layer above it's agitating (a personal-planet pattern, or the deeper outer-planet house material). Then name what's coming next as the chapter after this one.
4. Close with one concrete, specific thing to watch for or notice this month, tied to the current transit window closing or the next one opening — not a resolution, just something worth paying attention to.

LENGTH: 180–260 words. Not shorter. Not longer.

VOICE: Direct, warm, discerning. You sound like a guide who has noticed a pattern — not an oracle performing certainty. Speak to someone intelligent who is skeptical of generalizations.

READING LEVEL: 8th grade. Short sentences. Active voice.

FORBIDDEN:
— No predictions ("you will," "this will lead to")
— No guarantees or absolute claims ("you always," "you never")
— No diagnoses or medical language
— No spiritual performance ("the universe," "your soul's purpose," "the stars say," "written in the stars")
— Do not re-define terms already presented on the earlier pages (don't explain what a transit, an aspect, or a whole-sign house is)
— Do not use the word "journey"
— Do not start with "As a [sign] Sun" or "With your Mercury in [sign]" — this is too mechanical
— Do not simply list the four page findings in sequence — find the actual connective thread

PERMITTED AND ENCOURAGED:
— Name the specific signs, planets, houses, and aspects involved
— Use the reader's first name once, naturally
— Acknowledge the real difficulty of living the configuration, not just describing it
— If there is no currently active transit, or nothing upcoming within the visible horizon, say so plainly and use the fixed chart (personal + social + outer planets) as the full basis for the synthesis instead — don't invent activity that isn't there`;

// ─── Build the data prompt from a reader's Stoplight-only calculated data ─────

function summarizeTransit(
  hit: { transitingPlanet: TransitHit['transitingPlanet']; aspect: TransitHit['aspect']; natalTarget: TransitHit['natalTarget']; window: TransitHit['window'] },
  label: string,
): string {
  const targetLabel = NATAL_TARGET_CONTENT[hit.natalTarget].label;
  return `${label}: ${getPlanetLabel(hit.transitingPlanet)} ${getAspectLabel(hit.aspect)} → ${targetLabel} (${formatTransitWindow(hit.window)})`;
}

function buildDataPrompt(data: StoplightSynthesisInput): string {
  const mercury = MERCURY_CONTENT[data.tropicalMercury];
  const venus = VENUS_CONTENT[data.tropicalVenus];
  const mars = MARS_CONTENT[data.tropicalMars];
  const jupiter = JUPITER_CONTENT[data.tropicalJupiter];
  const saturn = SATURN_CONTENT[data.tropicalSaturn];

  const uranusHouse = getPlanetHouse(data.tropicalUranus, data.tropicalAsc);
  const neptuneHouse = getPlanetHouse(data.tropicalNeptune, data.tropicalAsc);
  const plutoHouse = getPlanetHouse(data.tropicalPluto, data.tropicalAsc);

  const uranus = uranusHouse !== null ? URANUS_HOUSE_CONTENT[uranusHouse] : undefined;
  const neptune = neptuneHouse !== null ? NEPTUNE_HOUSE_CONTENT[neptuneHouse] : undefined;
  const pluto = plutoHouse !== null ? PLUTO_HOUSE_CONTENT[plutoHouse] : undefined;

  const activeLines = data.activeTransits.length > 0
    ? data.activeTransits.map(h => summarizeTransit(h, 'Active now')).join('\n  ')
    : 'None of the five timing planets (Jupiter–Pluto) are currently within orb of the Sun, Moon, or Ascendant.';

  const upcomingLines = data.upcomingTransits.length > 0
    ? data.upcomingTransits.map(h => summarizeTransit(h, 'Coming next')).join('\n  ')
    : 'Nothing else projected to arrive within the visible horizon.';

  return `READER DATA — STOPLIGHT SECTION ONLY:
Name: ${data.firstName}
Sun: ${data.sunSign} · Ascendant: ${data.tropicalAsc}

PERSONAL PLANETS (by sign):
  Mercury in ${data.tropicalMercury}: ${mercury?.theme ?? 'Unavailable'}
  Venus in ${data.tropicalVenus}: ${venus?.theme ?? 'Unavailable'}
  Mars in ${data.tropicalMars}: ${mars?.theme ?? 'Unavailable'}

SOCIAL PLANETS (by sign):
  Jupiter in ${data.tropicalJupiter}: ${jupiter?.theme ?? 'Unavailable'}
  Saturn in ${data.tropicalSaturn}: ${saturn?.theme ?? 'Unavailable'}

OUTER PLANETS (by whole-sign house off the Ascendant):
  Uranus, ${ordinalHouse(uranusHouse)} house: ${uranus?.theme ?? 'Unavailable'}
  Neptune, ${ordinalHouse(neptuneHouse)} house: ${neptune?.theme ?? 'Unavailable'}
  Pluto, ${ordinalHouse(plutoHouse)} house: ${pluto?.theme ?? 'Unavailable'}

TRANSITS (live, computed for today):
  ${activeLines}
  ${upcomingLines}

Write the Stoplight synthesis paragraph now. Begin directly — no preamble, no "Here is the synthesis." Start with the thesis sentence.`;
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

  const hasWatchFor = /\b(this month|watch for|coming weeks|over the next|keep an eye|pay attention)\b/i.test(text);
  if (!hasWatchFor) issues.push('Missing closing watch-for note');

  return { valid: issues.length === 0, wordCount: count, issues };
}

// ─── Template fallback ────────────────────────────────────────────────────────
// Used only when the API is unavailable or times out. Less personalized but
// keeps the correct structure and never leaves the page blank.

function buildFallbackSynthesis(data: StoplightSynthesisInput): string {
  const uranusHouse = getPlanetHouse(data.tropicalUranus, data.tropicalAsc);
  const neptuneHouse = getPlanetHouse(data.tropicalNeptune, data.tropicalAsc);
  const plutoHouse = getPlanetHouse(data.tropicalPluto, data.tropicalAsc);

  const activeHit = data.activeTransits[0];
  const upcomingHit = data.upcomingTransits[0];

  const activeNote = activeHit
    ? `Right now, transiting ${getPlanetLabel(activeHit.transitingPlanet)} is forming a ${getAspectLabel(activeHit.aspect).toLowerCase()} to ${NATAL_TARGET_CONTENT[activeHit.natalTarget].label}, active through ${formatTransitWindow(activeHit.window)} — that's a direct signal to notice, not background noise.`
    : `Nothing from Jupiter through Pluto is currently within a tight orb of your Sun, Moon, or Ascendant, which just means the sky isn't insisting on anything urgent right now — the pattern below is running on its own.`;

  const upcomingNote = upcomingHit
    ? `Watch for ${getPlanetLabel(upcomingHit.transitingPlanet)} ${getAspectLabel(upcomingHit.aspect).toLowerCase()} ${NATAL_TARGET_CONTENT[upcomingHit.natalTarget].label} arriving around ${formatTransitWindow(upcomingHit.window)}, as the next chapter after this one.`
    : `Nothing else is projected to arrive within the visible horizon, which is a real gap worth simply noticing this month.`;

  return `${data.firstName}, the throughline across your Stoplight is how your fast-moving planets and your slower ones talk to each other. Mercury in ${data.tropicalMercury}, Venus in ${data.tropicalVenus}, and Mars in ${data.tropicalMars} set the pace of how you think, love, and act day to day, while Jupiter in ${data.tropicalJupiter} and Saturn in ${data.tropicalSaturn} decide where that energy gets to expand and where it has to hold a real line.

Underneath all of it sits a slower undercurrent: Uranus in your ${ordinalHouse(uranusHouse)} house, Neptune in your ${ordinalHouse(neptuneHouse)}, and Pluto in your ${ordinalHouse(plutoHouse)} are each running a generational theme through one specific, personal area of your life — disruption, dissolution, and transformation, respectively, each working quietly beneath the faster pattern above.

${activeNote} ${upcomingNote}

This month: notice which of the two layers — the fast, personal one or the slow, generational one — is actually asking for your attention right now, and let that be the one you respond to first.`;
}

// ─── Main synthesis generator ─────────────────────────────────────────────────

export interface StoplightSynthesisResult {
  text: string;
  wordCount: number;
  source: 'api' | 'fallback';
  valid: boolean;
}

export async function generateStoplightSynthesis(data: StoplightSynthesisInput): Promise<StoplightSynthesisResult> {
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
      .trim();

    const validation = validateSynthesis(rawText);

    if (validation.valid) {
      console.log(`[StoplightSynthesis] Generated via API — ${validation.wordCount} words`);
      return { text: rawText, wordCount: validation.wordCount, source: 'api', valid: true };
    }

    console.warn('[StoplightSynthesis] Validation issues:', validation.issues);

    if (validation.wordCount >= 150 && validation.wordCount <= 300) {
      return { text: rawText, wordCount: validation.wordCount, source: 'api', valid: false };
    }

    throw new Error('Synthesis output failed validation: ' + validation.issues.join('; '));

  } catch (error: unknown) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    console.warn(
      isTimeout
        ? '[StoplightSynthesis] API timeout — using fallback'
        : `[StoplightSynthesis] API error — using fallback: ${String(error)}`
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
