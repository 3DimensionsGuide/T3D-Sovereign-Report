/**
 * T3D Advanced Sovereign Report — Stoplight (Astrology) Transits Content
 *
 * Content for the Stoplight section's second deep-dive topic: what the
 * sky is doing RIGHT NOW, relative to the reader's fixed birth chart —
 * computed live by calculateActiveTransits() in
 * src/server/engines/transits.ts, not pre-written per person like the
 * rest of this report. This file supplies the interpretive text that gets
 * composed onto each computed hit.
 *
 * Scoped to the five slow-moving planets (Jupiter through Pluto) against
 * the reader's Sun, Moon, and Ascendant — see transits.ts's docblock for
 * why (fast planets go stale in a static PDF; these
 * three natal points are the ones the source material itself treats as
 * "most personal" to read a transit through).
 *
 * Follows the same three-part formula the source material (The Astrology
 * Podcast with Chris Brennan; Mastering the Zodiac) uses to build a
 * transit's meaning — Transiting Planet (the quality of force) + Aspect
 * (the dynamic) + Natal Point & House (the target) — as three composable
 * pieces rather than one giant hand-written table per combination:
 *
 *   1. TRANSIT_ASPECT_CONTENT — the transiting planet's quality FUSED with
 *      the aspect's dynamic (25 entries: 5 planets × 5 aspects). This is
 *      the "what kind of pressure is this, and what does it want" part.
 *   2. NATAL_TARGET_CONTENT — what it means for that pressure to be
 *      landing on the Sun, Moon, or Ascendant specifically (3 entries).
 *   3. HOUSE_NAMES / HOUSE_THEMES — which life arena the transiting
 *      planet is currently passing through (Whole-Sign, off the reader's
 *      natal Ascendant). Mirrors the exact same 12-house vocabulary
 *      already used on the base report's Page31RulerElementsArenas.tsx
 *      ("Your Ruler, Elements & Life Arenas"), duplicated here rather than
 *      imported so this section stays self-contained the way the rest of
 *      the Stoplight Advanced pages are — kept word-for-word identical so
 *      a reader who saw that page recognizes the same map.
 *
 * getTransitInterpretation() composes all three into one paragraph per
 * active transit.
 */

import type { TransitPlanet, TransitAspectType, NatalTransitTarget, TransitWindow } from '../../../../server/engines/transits';

export interface TransitAspectContent {
  theme:      string; // what this transiting-planet + aspect combination feels like / is doing
  invitation: string; // the practical, actionable response to it
}

// ─── TRANSITING PLANET + ASPECT — the quality of force, fused with the dynamic ─
export const TRANSIT_ASPECT_CONTENT: Record<TransitPlanet, Record<TransitAspectType, TransitAspectContent>> = {
  jupiter: {
    conjunction: {
      theme: 'A direct injection of confidence, optimism, and appetite — whatever this touches suddenly feels bigger, more possible, more worth pursuing.',
      invitation: 'Say yes to the real opportunity in front of you, but check any number or promise before you commit to it — Jupiter blends easily into overreach.',
    },
    sextile: {
      theme: 'A gentle, easy opening — a door that wasn’t there last month is quietly ajar, asking for a small, low-effort step rather than a leap.',
      invitation: 'Take the easy opening while it’s open. Sextiles don’t insist, and they don’t wait around forever either.',
    },
    square: {
      theme: 'Growth that outpaces your current structure — more is being asked of you, or offered to you, than your current setup can comfortably absorb yet.',
      invitation: 'Expand the container before you expand the load. Build the capacity, then take the opportunity, in that order.',
    },
    trine: {
      theme: 'Ease, momentum, and a sense that things are simply working — resources, goodwill, and good timing lining up with less effort than usual.',
      invitation: 'Use the tailwind on purpose. Trines can pass quietly if you’re not actively pointed at something worth the extra lift.',
    },
    opposition: {
      theme: 'Growth pulling against an equal and opposite need for balance — an offer, a gain, or an expansion that only works if something else gives way.',
      invitation: 'Find the trade you’re actually being asked to make, and make it consciously rather than by accident.',
    },
  },

  saturn: {
    conjunction: {
      theme: 'A direct, unmistakable dose of reality — Saturn sitting right on top of something means it’s time to get serious about it, with no more delay available.',
      invitation: 'Build the structure now. What you put in place under this transit tends to last; what you avoid tends to compound.',
    },
    sextile: {
      theme: 'A quiet, practical opportunity to add real discipline or skill — not exciting, but genuinely useful if you take the modest step being offered.',
      invitation: 'Do the unglamorous thing. A small, consistent effort right now compounds further than it looks like it should.',
    },
    square: {
      theme: 'Friction between where you are and what actually holds weight — delays, obstacles, or a workload that’s testing whether the foundation is real.',
      invitation: 'Don’t fight the test; pass it. Slow down, reinforce what’s actually load-bearing, and let the rest fall away.',
    },
    trine: {
      theme: 'Earned stability — the payoff of prior discipline showing up as real support: a structure holding, a plan working, competence being recognized.',
      invitation: 'Consolidate. This is a good window to formalize an arrangement or commit to a long-term plan.',
    },
    opposition: {
      theme: 'A limit meeting you at full force — a boundary, a authority figure, or your own fatigue insisting that something can’t continue as it has been.',
      invitation: 'Negotiate with the limit instead of pushing through it. What restructures now stops fighting you later.',
    },
  },

  uranus: {
    conjunction: {
      theme: 'A sudden jolt of change or insight — something shifts abruptly, on its own schedule, and asks you to update rather than resist.',
      invitation: 'Let the disruption in. Whatever breaks the routine right now is usually pointing at where you’d already outgrown it.',
    },
    sextile: {
      theme: 'A quick window for a genuinely original move — trying the unconventional option costs little right now and could open something new.',
      invitation: 'Take the unusual option once. Low-stakes experimentation is exactly what this aspect rewards.',
    },
    square: {
      theme: 'Instability that’s forcing a change you’ve been putting off — routine, plans, or an arrangement getting abruptly interrupted.',
      invitation: 'Don’t rebuild the exact same structure. The disruption is pointing at what needed to change anyway.',
    },
    trine: {
      theme: 'Freedom arriving with unusual ease — a genuinely new option, insight, or bit of independence, without the usual chaos that comes with Uranus.',
      invitation: 'Act on the insight quickly and lightly. This window rewards a fast, unconventional move over a slow, careful one.',
    },
    opposition: {
      theme: 'A pull between your need for freedom and something (or someone) that wants you predictable — a real tension between individuality and commitment.',
      invitation: 'Name the specific freedom you’re protecting, out loud if you can, rather than blowing up the whole arrangement to get it.',
    },
  },

  neptune: {
    conjunction: {
      theme: 'A dissolving of hard edges — clarity gets harder to hold onto here, while inspiration, empathy, and imagination get easier to access.',
      invitation: 'Make art, rest, or pray before you make decisions. This transit is better at revealing than at deciding.',
    },
    sextile: {
      theme: 'A gentle current of inspiration or compassion — creative or spiritual material is easier to access than usual, without much effort.',
      invitation: 'Let something through without immediately needing to explain or justify it. Not every insight needs a plan yet.',
    },
    square: {
      theme: 'Confusion between what’s real and what you wish were true — a situation, person, or story that’s harder to see clearly than it should be.',
      invitation: 'Get a second, unromantic opinion before committing to anything. Sleep, and a specific outside voice, cut through Neptune fastest.',
    },
    trine: {
      theme: 'Creative or spiritual material flowing with real ease — imagination, empathy, and inspiration arriving almost faster than you can use them.',
      invitation: 'Actually make the thing. This is fertile ground, but only if you give the inspiration somewhere concrete to land.',
    },
    opposition: {
      theme: 'A gap opening between a fantasy and the facts of a situation — an idealized version of something running into what’s actually true.',
      invitation: 'Trade the story for the facts, gently. The disappointment is smaller now than it will be later.',
    },
  },

  pluto: {
    conjunction: {
      theme: 'An intense, total-feeling pressure to transform — something is being stripped down to what’s actually real underneath it, whether you asked for that or not.',
      invitation: 'Stop managing the surface and deal with the root. Pluto doesn’t reward maintenance, only real change.',
    },
    sextile: {
      theme: 'A quiet opening to make a deliberate, deep change while the pressure is relatively low — a chance to choose the transformation rather than be forced into it.',
      invitation: 'Do the deep work voluntarily now. It’s cheaper than waiting for Pluto to demand it later.',
    },
    square: {
      theme: 'A power struggle, internal or external, that’s forcing something old to finally break — control, compulsion, or a buried pattern surfacing under pressure.',
      invitation: 'Look at what you’re actually trying to control. Release, once genuine, ends the struggle faster than force does.',
    },
    trine: {
      theme: 'Deep transformation moving with unusual ease — real power, resilience, or healing becoming available without the usual crisis attached.',
      invitation: 'Use the access. Do the deep, structural work you’ve been putting off while it’s this available.',
    },
    opposition: {
      theme: 'A confrontation with something (or someone) that has real power over the situation — an all-or-nothing dynamic demanding total honesty about who holds what.',
      invitation: 'Name the actual power dynamic instead of the surface disagreement. What’s underneath it is what needs addressing.',
    },
  },
};

// ─── NATAL TARGET — what it means for the pressure to land here specifically ──
export interface NatalTargetContent {
  label: string; // how this point is named in the interpretation
  theme: string; // why activation here matters
}

export const NATAL_TARGET_CONTENT: Record<NatalTransitTarget, NatalTargetContent> = {
  sun: {
    label: 'your Sun',
    theme: 'the core of who you are and what keeps you vital — when a transit lands here, it’s touching your basic sense of identity and self-expression, not just a passing circumstance.',
  },
  moon: {
    label: 'your Moon',
    theme: 'your emotional needs and your instinctive sense of safety — when a transit lands here, it shows up first as a feeling, often before you can name what it’s actually about.',
  },
  ascendant: {
    label: 'your Ascendant',
    theme: 'how you meet the world and how the world first meets you — when a transit lands here, it tends to show up as a shift in circumstances, health, or how you’re coming across, more than as an internal mood.',
  },
};

// ─── LIFE ARENAS — Whole-Sign houses ───────────────────────────────────────────
// Mirrors Page31RulerElementsArenas.tsx's HOUSE_NAMES / HOUSE_THEMES exactly,
// so a reader sees the same house vocabulary in both places.
export const HOUSE_NAMES: Record<number, string> = {
  1: 'Identity & First Impression', 2: 'Resources & Values',
  3: 'Communication & Local', 4: 'Home & Roots',
  5: 'Creativity & Expression', 6: 'Work & Daily Practice',
  7: 'Partnership & Relationship', 8: 'Depth & Transformation',
  9: 'Philosophy & Expansion', 10: 'Career & Reputation',
  11: 'Community & Vision', 12: 'Inner Life & Hidden Terrain',
};

export const HOUSE_THEMES: Record<number, string> = {
  1: 'How you meet life and are first encountered.',
  2: 'What you value and are building as security.',
  3: 'How you think and communicate in your immediate environment.',
  4: 'Your private life, family history, and the feeling of being at home.',
  5: 'Where creative energy and self-expression are most alive.',
  6: 'Daily work, health, and the practice of showing up with consistency.',
  7: 'Key partnerships and how you are met in close relationship.',
  8: 'Transformation, shared depth, and what you are currently releasing.',
  9: 'Philosophy, travel, and the search for broader meaning.',
  10: 'Your public role and what you are building as lasting reputation.',
  11: 'Community, collective vision, and where you belong in a larger story.',
  12: 'The inner life, the hidden, and what you are processing beneath the surface.',
};

const ASPECT_LABELS: Record<TransitAspectType, string> = {
  conjunction: 'Conjunction',
  sextile:     'Sextile',
  square:      'Square',
  trine:       'Trine',
  opposition:  'Opposition',
};

const PLANET_LABELS: Record<TransitPlanet, string> = {
  jupiter: 'Jupiter',
  saturn:  'Saturn',
  uranus:  'Uranus',
  neptune: 'Neptune',
  pluto:   'Pluto',
};

export function getAspectLabel(aspect: TransitAspectType): string {
  return ASPECT_LABELS[aspect];
}

export function getPlanetLabel(planet: TransitPlanet): string {
  return PLANET_LABELS[planet];
}

/**
 * Composes one transit — active or upcoming — into a single interpretive
 * paragraph, following the same Planet + Aspect + Natal Target formula the
 * source material itself uses to build a transit's meaning. Only needs the
 * three identifying fields, so the same function serves both a
 * calculateActiveTransits() hit and a getNextUpcomingTransit() result —
 * "equally in-depth" for what's live now and what's coming next.
 */
export function getTransitInterpretation(
  hit: { transitingPlanet: TransitPlanet; aspect: TransitAspectType; natalTarget: NatalTransitTarget },
  house: number | null,
): string {
  const aspectContent = TRANSIT_ASPECT_CONTENT[hit.transitingPlanet][hit.aspect];
  const targetContent = NATAL_TARGET_CONTENT[hit.natalTarget];
  const houseTheme = house !== null ? HOUSE_THEMES[house] : null;

  const arenaLine = houseTheme
    ? ` It’s currently moving through your ${HOUSE_NAMES[house!]} house — ${houseTheme.charAt(0).toLowerCase()}${houseTheme.slice(1)}`
    : '';

  return `${aspectContent.theme} This is landing on ${targetContent.label} — ${targetContent.theme}${arenaLine} ${aspectContent.invitation}`;
}

// ─── DATE FORMATTING ────────────────────────────────────────────────────────

/** "2026-10-14" -> "October 14, 2026" */
function formatTransitDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

/**
 * Formats a transit's definite timeframe for display. Drops the year on
 * the start date when the window doesn't cross a calendar year, since
 * repeating it twice ("October 14, 2026 – February 3, 2026") reads as
 * noise; a window that does cross a year boundary keeps both, since that's
 * exactly the information a reader needs there.
 */
export function formatTransitWindow(window: TransitWindow): string {
  const start = new Date(`${window.startDate}T00:00:00Z`);
  const end = new Date(`${window.endDate}T00:00:00Z`);

  if (start.getUTCFullYear() === end.getUTCFullYear()) {
    const startStr = start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' });
    return `${startStr} – ${formatTransitDate(window.endDate)}`;
  }

  return `${formatTransitDate(window.startDate)} – ${formatTransitDate(window.endDate)}`;
}
