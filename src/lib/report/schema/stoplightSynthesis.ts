/**
 * T3D Stoplight Synthesis Engine
 *
 * Generates the Page 30 personalized synthesis of all six astrology placements.
 *
 * Writing brief (per spec):
 *   — 220–280 word personalized interpretation
 *   — Tropical lens as lived-experience reference
 *   — Sidereal lens as stellar-reference orientation
 *   — One named harmony (useful across both systems)
 *   — One named productive tension (creates reflection, range, self-awareness)
 *   — No predictions, diagnoses, guarantees, or deterministic claims
 *   — End by directing reader to Human Design Authority
 *   — Clear, warm, eighth-grade reading level
 */

import type { ReportData } from '../tokens';

// ─── Return type ──────────────────────────────────────────────────────────────
export interface StoplightSynthesis {
  thesis:   string;   // one-sentence headline
  body:     string;   // 220–280 words
  harmony: {
    name:        string;   // short label
    description: string;   // 1–2 sentences
  };
  tension: {
    name:        string;
    description: string;
  };
  reminder: string;   // one sentence → return to Authority
  source:  'api' | 'fallback';
  wordCount: number;
}

// ─── System prompt (exact brief from spec) ────────────────────────────────────
const SYSTEM_PROMPT = `You are writing the Stoplight Synthesis for a reader's T3D Sovereign Report.

Write a personalized 220–280 word Stoplight synthesis using the reader's six astrology placements.

STRUCTURE — respond in valid JSON only, no preamble, no markdown fences:
{
  "thesis": "one sentence — the headline",
  "body": "220–280 words — the full synthesis paragraph",
  "harmony": {
    "name": "short name (3–6 words) for this harmony",
    "description": "1–2 sentences describing what appears consistently across both systems"
  },
  "tension": {
    "name": "short name (3–6 words) for this productive tension",
    "description": "1–2 sentences describing the difference and its value"
  },
  "reminder": "one sentence directing the reader to use their Human Design Authority for the actual decision"
}

WRITING RULES:
— Begin body with one direct thesis sentence.
— Explain the Tropical lens as lived-experience reference.
— Explain the Sidereal lens as stellar-reference orientation.
— Identify one harmony without declaring either chart more authentic.
— Identify one productive tension without declaring either chart false or superficial.
— Do not make predictions, diagnoses, guarantees, or deterministic claims.
— End body by directing the reader to their Human Design Authority.
— Clear, warm T3D language. Eighth-grade reading level.
— The word "journey" is forbidden. No cosmic authority language.
— Name the reader once (their first name) naturally.

Respond ONLY with valid JSON. No other text.`;

// ─── User data prompt ─────────────────────────────────────────────────────────
function buildPrompt(data: ReportData & { siderealMoon?: string }): string {
  const sidMoon = data.siderealMoon ?? '—';
  return `READER: ${data.firstName}
HD AUTHORITY: ${data.hdAuthority}

TROPICAL (seasonal reference):
  Sun:    ${data.sunSign} (${data.tropicalSun})
  Moon:   ${data.moonSign} (${data.tropicalMoon})
  Rising: ${data.risingSign !== '—' ? `${data.risingSign} (${data.tropicalAsc})` : 'Unknown — birth time not confirmed'}

SIDEREAL (stellar reference, ${data.ayanamsha ?? 'Lahiri'} ayanamsha):
  Sun:    ${data.siderealSun}
  Moon:   ${sidMoon}
  Rising: ${data.siderealAsc !== '—' ? data.siderealAsc : 'Unknown — birth time not confirmed'}

Write the Stoplight Synthesis now.`;
}

// ─── Fallback template ────────────────────────────────────────────────────────

const SIGN_ELEMENTS: Record<string, string> = {
  Aries:'Fire', Leo:'Fire', Sagittarius:'Fire',
  Taurus:'Earth', Virgo:'Earth', Capricorn:'Earth',
  Gemini:'Air', Libra:'Air', Aquarius:'Air',
  Cancer:'Water', Scorpio:'Water', Pisces:'Water',
};

const SIGN_MODES: Record<string, string> = {
  Aries:'Cardinal', Cancer:'Cardinal', Libra:'Cardinal', Capricorn:'Cardinal',
  Taurus:'Fixed', Leo:'Fixed', Scorpio:'Fixed', Aquarius:'Fixed',
  Gemini:'Mutable', Virgo:'Mutable', Sagittarius:'Mutable', Pisces:'Mutable',
};

const SIGN_THEMES: Record<string, string> = {
  Aries:'initiation and self-definition', Taurus:'substance and endurance',
  Gemini:'synthesis and perceptual agility', Cancer:'belonging and protection',
  Leo:'presence and self-expression', Virgo:'discernment and precision',
  Libra:'balance and relational intelligence', Scorpio:'depth and transformation',
  Sagittarius:'meaning and expansion', Capricorn:'mastery and earned authority',
  Aquarius:'collective intelligence and independence', Pisces:'permeability and depth',
};

function buildFallback(data: ReportData & { siderealMoon?: string }): StoplightSynthesis {
  const tropSun  = data.sunSign;
  const tropMoon = data.moonSign;
  const sidSun   = extractSignLocal(data.siderealSun);
  const sidMoon  = data.siderealMoon ? extractSignLocal(data.siderealMoon) : '—';

  const tropSunEl  = SIGN_ELEMENTS[tropSun]  ?? 'Fire';
  const sidSunEl   = SIGN_ELEMENTS[sidSun]   ?? 'Earth';
  const tropMoonEl = SIGN_ELEMENTS[tropMoon] ?? 'Fire';
  const sidMoonEl  = SIGN_ELEMENTS[sidMoon]  ?? 'Water';

  const sunSameEl  = tropSunEl === sidSunEl;
  const moonSameEl = tropMoonEl === sidMoonEl;

  const tropSunTheme  = SIGN_THEMES[tropSun]  ?? 'orientation and direction';
  const sidSunTheme   = SIGN_THEMES[sidSun]   ?? 'discernment and pattern';
  const tropMoonTheme = SIGN_THEMES[tropMoon] ?? 'directness and immediacy';
  const sidMoonTheme  = SIGN_THEMES[sidMoon]  ?? 'depth and permeability';

  const thesis = `${data.firstName}'s Tropical ${tropSun} Sun and Sidereal ${sidSun} Sun describe the same solar orientation through two different reference points — one calibrated to lived seasonal experience, one to the longer stellar cycle.`;

  const body = `Two systems, one person. The Tropical lens places your Sun in ${tropSun}, orienting your core identity toward ${tropSunTheme}. This is the seasonal, lived-experience layer — the pattern most likely to show up in your daily navigation. Through the stellar-reference lens, your Sidereal Sun moves to ${sidSun}, where the emphasis shifts toward ${sidSunTheme}. These are not contradictions. They are two angles of reflection on the same solar energy.

Your Moon in Tropical ${tropMoon} shapes what you need emotionally — bringing a quality of ${tropMoonTheme} to how you meet and process experience. The Sidereal lens places your Moon in ${sidMoon}, where ${sidMoonTheme} enters as a second orientation on what nourishes you. Together, they describe a more complete picture than either offers alone.

${sunSameEl ? `Both Sun placements share the ${tropSunEl} element, suggesting a consistent solar quality across reference systems.` : `The shift from ${tropSunEl} (Tropical Sun) to ${sidSunEl} (Sidereal Sun) describes a solar identity that contains both qualities — and invites observation of when each is more active.`}

The Stoplight's role is to surface these patterns for reflection — not to direct your choices. Use your ${data.hdAuthority} Authority to make the actual decision.`;

  const wordsInBody = body.trim().split(/\s+/).length;

  // Harmony — where the two systems agree
  const harmonyName = sunSameEl
    ? `Consistent ${tropSunEl} Solar Quality`
    : `Shared Orientation Toward Care`;

  const harmonyDesc = sunSameEl
    ? `Both your Tropical and Sidereal Sun sit in ${tropSunEl}-element signs, suggesting your solar identity carries a consistent ${tropSunEl.toLowerCase()} quality regardless of which reference system is used.`
    : `Both Sun placements — ${tropSun} and ${sidSun} — describe a person oriented toward quality, care, and considered attention. The expressions differ; the underlying orientation appears consistent.`;

  // Tension — where the systems create useful contrast
  const tensionName = moonSameEl
    ? `Moon in Parallel Expression`
    : `${tropMoonEl} Meets ${sidMoonEl} in the Moon`;

  const tensionDesc = moonSameEl
    ? `Both Moon placements share the ${tropMoonEl} element, offering a consistent emotional signature. The difference in sign invites observation of how that elemental quality expresses across contexts.`
    : `Your Tropical Moon in ${tropMoon} (${tropMoonEl}) and Sidereal Moon in ${sidMoon} (${sidMoonEl}) describe two different emotional orientations — not opposing truths, but a range worth noticing. When you feel ${tropMoonEl.toLowerCase()} energy emotionally and ${sidMoonEl.toLowerCase()} at the same time, that intersection is where your most useful self-knowledge tends to live.`;

  const reminder = `The Stoplight describes conditions and tendencies — your ${data.hdAuthority} Authority is the mechanism you use to navigate them.`;

  return {
    thesis,
    body: body.trim(),
    harmony:  { name: harmonyName,  description: harmonyDesc },
    tension:  { name: tensionName,  description: tensionDesc },
    reminder,
    source:    'fallback',
    wordCount: wordsInBody,
  };
}

function extractSignLocal(formatted: string): string {
  if (!formatted || formatted === '—') return '—';
  const parts = formatted.trim().split(' ');
  return parts[parts.length - 1] ?? '—';
}

// ─── Main generator ───────────────────────────────────────────────────────────
export async function generateStoplightSynthesis(
  data: ReportData & { siderealMoon?: string }
): Promise<StoplightSynthesis> {
  const TIMEOUT_MS = 20_000;
  const prompt = buildPrompt(data);

  try {
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      signal:  controller.signal,
      body: JSON.stringify({
        model:      'claude-sonnet-4-6',
        max_tokens: 800,
        system:     SYSTEM_PROMPT,
        messages:   [{ role: 'user', content: prompt }],
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`API ${response.status}`);

    const json = await response.json() as {
      content: { type: string; text: string }[];
    };

    const raw = json.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/```\s*$/, '')
      .trim();

    const parsed = JSON.parse(raw) as {
      thesis: string; body: string;
      harmony: { name: string; description: string };
      tension: { name: string; description: string };
      reminder: string;
    };

    const wordCount = parsed.body.trim().split(/\s+/).length;
    console.log(`[StoplightSynthesis] ${wordCount}w via API`);

    return { ...parsed, source: 'api', wordCount };

  } catch (err) {
    console.warn('[StoplightSynthesis] API error, using fallback:', String(err));
    return buildFallback(data);
  }
}
