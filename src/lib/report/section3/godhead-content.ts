/**
 * The 16 Godheads — Human Design's mythic layer over the Incarnation Cross.
 *
 * Every one of the 64 gates belongs to exactly one Godhead (64 = 16 × 4), and
 * a person's Godhead is determined SOLELY by the gate of their Personality
 * (conscious) Sun — never the Earth, never the Design side. This is the
 * "face" the conscious mind wears as it moves through its incarnation.
 *
 * Verified as a clean, non-overlapping 64-gate partition (cross-referenced
 * against T3D's Human Design source library — two isolated transcription
 * errors in individual source recordings were caught and corrected: Parvati
 * is 15/52/39/53, not 50/15/52/39; Prometheus is 9/5/26/11, not
 * 54/5/39/53). Every gate below appears in exactly one Godhead.
 *
 * Content (theme/keynote) is T3D's own paraphrase of the mythic material —
 * never verbatim transcript text — written to match the T3D voice used
 * throughout the report.
 */

export type Quarter = 'Initiation' | 'Civilization' | 'Duality' | 'Mutation';

export interface GodheadInfo {
  name: string;
  quarter: Quarter;
  quarterTheme: string;   // the quarter's own purpose-statement
  gates: [number, number, number, number];
  archetype: string;      // one-line mythic tag
  keynote: string;        // T3D-voiced paragraph
}

export const QUARTER_THEMES: Record<Quarter, string> = {
  Initiation:    'Purpose fulfilled through Mind — learning to think, then applying that mind in the world.',
  Civilization:  'Purpose fulfilled through Form — learning to build, then applying that form for others.',
  Duality:       'Purpose fulfilled through Bonding — learning to relate, then applying that bond in service.',
  Mutation:      'Purpose fulfilled through Transformation — learning to break down, then applying that change.',
};

export const GODHEADS: GodheadInfo[] = [
  // ── Quarter 1: Initiation ──────────────────────────────────────────────
  {
    name: 'Kali', quarter: 'Initiation', quarterTheme: QUARTER_THEMES.Initiation,
    gates: [13, 49, 30, 55],
    archetype: 'The Destroyer of False Devotion',
    keynote: 'Kali burns away whatever is no longer true. This is initiating fire — the willingness to let an old story, an old loyalty, or an old identity collapse so something more honest can stand in its place. Change, under this Godhead, is never gentle by nature; it is necessary.',
  },
  {
    name: 'Mitra', quarter: 'Initiation', quarterTheme: QUARTER_THEMES.Initiation,
    gates: [37, 63, 22, 36],
    archetype: 'The Sacred Bond',
    keynote: 'Mitra tends the hearth — the slow, warming fire of trust built through shared experience rather than declared all at once. This Godhead initiates through relationship: contracts, family, the bonds that hold when doubt and crisis test them.',
  },
  {
    name: 'Michael', quarter: 'Initiation', quarterTheme: QUARTER_THEMES.Initiation,
    gates: [25, 17, 21, 51],
    archetype: 'The Angelical Mind',
    keynote: 'Michael protects innocence with a sword, not a shield — opinion, control, and shock in service of something worth defending. This Godhead initiates through principled action: naming what is right, then moving decisively to protect it.',
  },
  {
    name: 'Janus', quarter: 'Initiation', quarterTheme: QUARTER_THEMES.Initiation,
    gates: [42, 3, 27, 24],
    archetype: 'The Threshold',
    keynote: 'Janus faces both directions at once — the ending of one cycle and the ordering of the next. This Godhead initiates through thresholds: growth that looks chaotic mid-transition, but is actually a new order assembling itself.',
  },

  // ── Quarter 2: Civilization ────────────────────────────────────────────
  {
    name: 'Maia', quarter: 'Civilization', quarterTheme: QUARTER_THEMES.Civilization,
    gates: [2, 23, 8, 20],
    archetype: 'The Mother of Form',
    keynote: 'Maia receives the formless and gives it direction — the quiet authority of knowing which way is forward without having to explain why. This Godhead civilizes through presence: contribution and clarity offered in the now, not argued for.',
  },
  {
    name: 'Lakshmi', quarter: 'Civilization', quarterTheme: QUARTER_THEMES.Civilization,
    gates: [16, 35, 45, 12],
    archetype: 'Abundance Through Mastery',
    keynote: 'Lakshmi builds wealth the honest way — skill repeated until it becomes talent, experience gathered until it becomes resource. This Godhead civilizes through cultivated abundance: what is refined and shared outlasts what is merely acquired.',
  },
  {
    name: 'Parvati', quarter: 'Civilization', quarterTheme: QUARTER_THEMES.Civilization,
    gates: [15, 52, 39, 53],
    archetype: 'Stillness and Root Pressure',
    keynote: 'Parvati holds the tension between rest and the pressure to begin — the discipline of a mountain that moves only when it truly moves. This Godhead civilizes through patience: provocation and stillness in service of what is being slowly, deliberately built.',
  },
  {
    name: "Ma'at", quarter: 'Civilization', quarterTheme: QUARTER_THEMES.Civilization,
    gates: [62, 56, 31, 33],
    archetype: 'Truth, Justice, and Cosmic Order',
    keynote: "Ma'at weighs the detail against the whole — fact, story, leadership, and privacy held to one honest standard. This Godhead civilizes through truth-telling: the courage to say what is factually so, then lead from it.",
  },

  // ── Quarter 3: Duality ─────────────────────────────────────────────────
  {
    name: 'Thoth', quarter: 'Duality', quarterTheme: QUARTER_THEMES.Duality,
    gates: [7, 4, 29, 59],
    archetype: 'The Scribe of Consciousness',
    keynote: 'Thoth keeps the record — the role, the answer, the commitment, and the intimacy that binds one life to another. This Godhead learns bonding through pattern and memory: relationships that are built, tested, and written down as they deepen.',
  },
  {
    name: 'Harmonia', quarter: 'Duality', quarterTheme: QUARTER_THEMES.Duality,
    gates: [40, 64, 47, 6],
    archetype: 'Resolution Through Conflict',
    keynote: "Harmonia is born of both love and war — the peace that only arrives after friction has done its honest work. This Godhead bonds through resolution: confusion and realization moving toward a hard-won, transcendent accord.",
  },
  {
    name: 'Christ', quarter: 'Duality', quarterTheme: QUARTER_THEMES.Duality,
    gates: [46, 18, 48, 57],
    archetype: 'Love Thy Neighbor',
    keynote: 'Christ pushes upward through correction and depth toward a love that includes rather than excludes. This Godhead bonds through service: the willingness to be corrected, to go deeper, and to act from intuitive clarity on behalf of another.',
  },
  {
    name: 'Minerva', quarter: 'Duality', quarterTheme: QUARTER_THEMES.Duality,
    gates: [32, 50, 28, 44],
    archetype: 'Wisdom, Strategy, and Preservation',
    keynote: 'Minerva carries knowledge into action — continuity, values, and instinct held together by strategic, protective intelligence. This Godhead bonds through stewardship: what a relationship, a family, or a tradition needs to survive and be carried forward.',
  },

  // ── Quarter 4: Mutation ────────────────────────────────────────────────
  {
    name: 'Hades', quarter: 'Mutation', quarterTheme: QUARTER_THEMES.Mutation,
    gates: [1, 43, 14, 34],
    archetype: 'The Fertile Underworld',
    keynote: 'Hades is not darkness for its own sake — it is the seed gathering strength underground before anything visible breaks through. This Godhead mutates through raw creative power: individual expression, insight, and unstoppable, self-generated force.',
  },
  {
    name: 'Prometheus', quarter: 'Mutation', quarterTheme: QUARTER_THEMES.Mutation,
    gates: [9, 5, 26, 11],
    archetype: 'The Fire-Bringer',
    keynote: 'Prometheus steals fire not to hoard it but to give it away — focus, rhythm, ego, and ideas turned toward the benefit of others. This Godhead mutates through ambition in service of humanity: the drive to improve life, not merely to win.',
  },
  {
    name: 'Vishnu', quarter: 'Mutation', quarterTheme: QUARTER_THEMES.Mutation,
    gates: [10, 58, 38, 54],
    archetype: 'The Preserver',
    keynote: "Vishnu maintains cosmic order through joyful, driven perseverance — behavior, vitality, and ambition that restore balance whenever chaos threatens it. This Godhead mutates through sustained effort: rising, again and again, toward a higher purpose.",
  },
  {
    name: 'Keepers of the Wheel', quarter: 'Mutation', quarterTheme: QUARTER_THEMES.Mutation,
    gates: [61, 60, 41, 19],
    archetype: 'The Hidden Gods',
    keynote: 'The Keepers govern the cycle itself — mystery, acceptance, contraction, and want, moving in a rhythm too large to see all at once. This Godhead mutates through what is hidden: trusting an unfolding you cannot yet fully explain.',
  },
];

/** Fast lookup: gate number → its Godhead. Built once at module load. */
const GATE_TO_GODHEAD = new Map<number, GodheadInfo>();
for (const g of GODHEADS) {
  for (const gate of g.gates) GATE_TO_GODHEAD.set(gate, g);
}

export function findGodheadByGate(gate: number): GodheadInfo | undefined {
  return GATE_TO_GODHEAD.get(gate);
}
