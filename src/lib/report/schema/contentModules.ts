/**
 * T3D Report — Content Module System
 *
 * Three editorial levels applied across all three dimensions.
 *
 *   Level A: Essential
 *     Always appears. Immediate daily use. No prior knowledge required.
 *     Reader can apply this today, without explanation.
 *
 *   Level B: Contextual
 *     Appears only where it changes the lived interpretation.
 *     Shown when it modifies, qualifies, or deepens a Level A insight.
 *     Omitted when it would add data without adding usability.
 *
 *   Level C: Reference
 *     Never in the core report. Available in the Field Library.
 *     Exists for readers who want precision and completeness.
 *     Its absence from the core report is an editorial choice, not an omission.
 *
 * ─── Why this exists ───────────────────────────────────────────────────────
 *
 * The failure mode of generative reports is treating all available data
 * as equally important. A 64-gate list and a 3-sentence Type description
 * are not the same kind of information. One is reference material.
 * The other is a daily operating instruction.
 *
 * The Content Module System gives the renderer explicit editorial rules
 * so that pages select rather than dump.
 */

import type { ReportData } from '../tokens';

// ─── Content Level Type ───────────────────────────────────────────────────────
export type ContentLevel = 'A' | 'B' | 'C';

// ─── Catalogue: what belongs at each level ────────────────────────────────────
export const CONTENT_CATALOGUE = {

  humanDesign: {

    A: [
      'Type',
      'Strategy',
      'Authority',
      'Signature (feeling when aligned)',
      'Not-Self theme (feeling when misaligned)',
      'Profile (the two-number label and plain-language role)',
    ],

    B: [
      'Defined center pattern (organized as 2–3 lived capacities)',
      'Open center themes (top 3 by behavioral impact, not a full list)',
      'Active channels (only where they significantly modify Type or Authority)',
      'Profile line descriptions (natural role, social learning, visibility)',
      'Not-Self voice (the specific sentences the pattern produces)',
      'Authority distortion (what override looks like for this authority)',
    ],

    C: [
      'All 64 gates with activation source',
      'All channel names and circuit groups',
      'Incarnation Cross',
      'Variable (arrows)',
      'Detailed circuit analysis',
      'Full definition type (Split, Triple Split, etc.)',
      'Planetary activations for each gate',
      'Line descriptions for both profile lines in isolation',
      'Full center-by-center inventory (all 9, defined and undefined)',
    ],
  },

  numerology: {

    A: [
      'Life Path (compound/reduced display, e.g., 34/7)',
      'Personal Year (current year theme)',
      'Life Path direction (one-sentence core orientation)',
    ],

    B: [
      'Birthday Number (daily stance modifier)',
      'Attitude Number (first-impression quality)',
      'Current Pinnacle (the active developmental phase)',
      'Prior Pinnacle (context for the current one)',
      'Next Pinnacle (forward orientation)',
      'Current Challenge (terrain paired with current Pinnacle)',
      'Expression/Destiny (if full name provided)',
      'Soul Urge (if full name provided)',
      'Personality (if full name provided)',
      'Karmic Lessons (if full name provided — maximum 3 highlighted)',
    ],

    C: [
      'All four Pinnacles with full interpretive paragraphs',
      'All four Challenges with full interpretive paragraphs',
      'Hidden Passion (available in Field Library for name-data readers)',
      'All secondary name numbers (Subconscious Self, Maturity, etc.)',
      'Detailed year-by-year Personal Year progression',
      'Specific month-by-month cycle calculations',
      'Full Pythagorean letter-value chart',
    ],
  },

  astrology: {

    A: [
      'Sun Sign (core orientation)',
      'Moon Sign (emotional needs)',
      'Rising Sign (interface with life)',
      'Element pattern from Big Three',
      'Modality pattern from Big Three',
    ],

    B: [
      'Chart ruler (from Rising sign)',
      'Sun house placement (1–2 relevant life arenas)',
      'Sun-Moon dynamic (core tension or resource pattern)',
      'Current seasonal orientation (Personal Year + season)',
      'Stoplight friction patterns (4 common misreadings)',
    ],

    C: [
      'All planetary positions with degrees',
      'Full 12-house inventory',
      'All aspects with orbs (conjunctions, squares, trines, oppositions, sextiles)',
      'Whole Sign house cusps',
      'Midheaven and its aspects',
      'Progressed chart',
      'Current transit table',
      'Sidereal chart placements (beyond Sun reference)',
      'Asteroid placements',
      'Chart shape analysis',
    ],
  },

} as const;

// ─── Page → Level Map ─────────────────────────────────────────────────────────
// Documents which level each report page operates at.
// Pages must not include content above their designated level.
export const PAGE_CONTENT_LEVELS: Record<string, ContentLevel> = {
  // Section 2 — Your Coordinates
  'Page5Dashboard':         'A',  // essential outputs only
  'Page6PersonalMap':       'A',  // one sentence per system
  'Page7DecisionProtocol':  'A',  // decision mechanism
  'Page8CurrentSeason':     'A',  // personal year + seasonal framing
  'Page9SevenDay':          'A',  // single experiment, immediate use

  // Section 3 — The Vehicle
  'Page10VehicleDivider':   'A',
  'Page11TypeStrategy':     'A',  // Type + Strategy + Authority = Level A
  'Page12Authority':        'A',  // most important Vehicle page
  'Page13Profile':          'B',  // profile modifies A content
  'Page14DefinedStrengths': 'B',  // 2–3 lived capacities
  'Page15OpenTerrain':      'B',  // top 3 open center themes
  'Page16Friction':         'B',  // not-self + authority distortion
  'Page17VehiclePractice':  'A',  // one actionable experiment

  // Section 4 — The Road
  'Page18RoadDivider':      'A',
  'Page19LifePath':         'A',  // core direction
  'Page20BirthdayAttitude': 'B',  // modifies daily stance
  'Page21InnerDrivers':     'B',  // name-based, conditional
  'Page22Pinnacles':        'B',  // current + context phases
  'Page23Challenges':       'B',  // terrain paired with pinnacles
  'Page24RoadFriction':     'B',  // overreach/underexpression
  'Page25RoadPractice':     'A',  // one weekly practice

  // Section 5 — The Stoplight
  'Page26StoplightDivider': 'A',
  'Page27BigThree':         'A',  // Sun + Moon + Rising
  'Page28ElementModality':  'B',  // pattern from Big Three
  'Page29RulerArenas':      'B',  // chart ruler + sun house
  'Page30TensionsResources':'B',  // sun-moon dynamic
  'Page31PresentSeason':    'B',  // timing context
  'Page32StoplightFriction':'B',  // 4 misreadings
  'Page33StoplightPractice':'A',  // one experiment

  // Section 6 — Sovereign OS
  'Page34SOSDivider':       'A',
  'Page35Decisions':        'A',  // decision tree, immediate use
  'Page36CreativeWork':     'B',  // creative compass
  'Page37Relate':           'B',  // relational compass
  'Page38Recalibration':    'A',  // protocol for 4 states
  'Page39SevenDay':         'A',  // integrated experiment

  // Section 7 — Integration & Close
  'Page40NavigationCard':   'A',  // reference card — Level A content only
  'Page41Leave':            'A',  // reflection prompt
  'Page42Keep':             'A',  // commitment prompt
  'Page43DataNotes':        'C',  // technical reference page
  'Page44ClosingLetter':    'A',  // human close
};

// ─── Rendering decision function ──────────────────────────────────────────────
/**
 * shouldRender
 *
 * Returns true if a piece of content at the given level should appear
 * on a page operating at the given page level.
 *
 * Rules:
 *   — Level A content: always renders
 *   — Level B content: renders on pages designated B or C
 *   — Level C content: only renders on Page 43 (Data Notes) — never in core
 *
 * Usage:
 *   if (shouldRender('B', PAGE_CONTENT_LEVELS['Page13Profile'])) {
 *     // render defined center details
 *   }
 */
export function shouldRender(
  contentLevel: ContentLevel,
  pageLevel: ContentLevel
): boolean {
  const levels: ContentLevel[] = ['A', 'B', 'C'];
  const contentRank = levels.indexOf(contentLevel);
  const pageRank    = levels.indexOf(pageLevel);
  return contentRank <= pageRank;
}

// ─── Field Library redirect ────────────────────────────────────────────────────
/**
 * Describes Level C content that is available in the Field Library.
 * Used on Page 43 and wherever a Field Library reference is appropriate.
 */
export const FIELD_LIBRARY_CONTENTS = {
  humanDesign: [
    'Full BodyGraph with all 64 gates and activation planets',
    'All channel activations with circuit group and harmonic group',
    'Incarnation Cross and its cross quarter',
    'Variable and arrow directions (left/right, active/passive)',
    'Full Profile line interpretations for both lines in isolation',
    'All centers defined and undefined with full descriptions',
    'Detailed channel-by-channel interpretation',
  ],
  numerology: [
    'Full calculation workbook showing every reduction step',
    'Hidden Passion detailed interpretation (name data required)',
    'All secondary numerology numbers with interpretations',
    'Month-by-month Personal Year breakdown for the current year',
    'Four Pinnacle interpretations in full paragraph form',
    'Four Challenge interpretations in full paragraph form',
    'Pythagorean letter-value reference chart',
  ],
  astrology: [
    'Full natal chart wheel with all planetary positions and degrees',
    'All 12 houses with ruling planets and house cusps',
    'Complete aspect table (all major and minor aspects with orbs)',
    'Full Midheaven interpretation and career indicators',
    'Current transit table (real-time planetary positions vs natal)',
    'All planetary sign and house placements with interpretations',
    'Sidereal chart for readers working with Vedic frameworks',
  ],
} as const;

// ─── Content gate — wrapper for conditional rendering ─────────────────────────
/**
 * isLevelA / isLevelB / isLevelC
 *
 * Simple boolean helpers for JSX conditional rendering.
 *
 * Usage inside page components:
 *   {isLevelB('Page13Profile') && (
 *     <DefinedCenterDetails data={data} />
 *   )}
 */
export function isLevelA(pageName: string): boolean {
  return PAGE_CONTENT_LEVELS[pageName] === 'A';
}

export function isLevelB(pageName: string): boolean {
  const level = PAGE_CONTENT_LEVELS[pageName];
  return level === 'B' || level === 'C';
}

export function isLevelC(pageName: string): boolean {
  return PAGE_CONTENT_LEVELS[pageName] === 'C';
}

// ─── Editorial selection helpers ──────────────────────────────────────────────
/**
 * selectTopN
 *
 * Takes an array of items with a priority score and returns the top N.
 * Used for selecting which open centers, channels, or aspects to show
 * rather than listing all of them.
 */
export function selectTopN<T extends { priority?: number }>(
  items: T[],
  n: number
): T[] {
  return [...items]
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
    .slice(0, n);
}

/**
 * capAtLevel
 *
 * Returns a maximum number of items based on content level.
 *   Level A: 1 (only the most essential)
 *   Level B: 3 (contextual selection)
 *   Level C: unlimited (reference)
 */
export function capAtLevel(level: ContentLevel): number {
  return level === 'A' ? 1 : level === 'B' ? 3 : Infinity;
}

/**
 * filterByRelevance
 *
 * Takes an array of content items and a relevance threshold.
 * Returns only items that cross the threshold.
 * Used to prevent Level B content from becoming exhaustive.
 */
export function filterByRelevance<T extends { relevance?: number }>(
  items: T[],
  minRelevance = 0.5
): T[] {
  return items.filter(item => (item.relevance ?? 1) >= minRelevance);
}
