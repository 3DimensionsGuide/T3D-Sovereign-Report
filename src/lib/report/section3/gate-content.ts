/**
 * Gate keynotes and Channel/Circuit reference data for the Human Design
 * engine's output. Sourced from Tyler's uploaded practitioner reference
 * ("The Practitioner's Guide to the Human Design System") — I Ching names,
 * core meanings, and the full 36-channel circuit classification.
 *
 * Used by: Definition/Circuitry breakdown, Incarnation Cross gate detail,
 * and any page that needs a plain-language name for a gate or channel.
 */

import type { HDCenter } from '@/server/engines/types';

export interface GateKeynote {
  ichingName: string;
  coreMeaning: string;
  center: HDCenter;
}

// ─── HANGING GATE AURIC DETAIL ───────────────────────────────────────────────
//
// An optional deeper layer for the Bridges page's per-gate "Your Bridge
// Gate" block: where the gate physically sits, which channel(s) it's part
// of, and — sourced from the T3D PHILOSOPHER notebook rather than invented —
// what it actually feels like to be in the aura of someone with that gate
// active. Deliberately a PARTIAL record: only gates that have been
// genuinely researched get an entry. A reader whose bridge gate isn't in
// here yet still gets the existing ichingName/coreMeaning line from
// GATE_KEYNOTES — no placeholder or fabricated depth stands in for gates
// not yet researched.
export interface HangingGateAuricDetail {
  location: string;    // where it sits + what kind of Center that is
  channels: string;    // the channel(s) it's part of, in plain language
  experience: string;  // what it feels like to be near someone with it active
}

export const HANGING_GATE_AURIC_DETAIL: Partial<Record<number, HangingGateAuricDetail>> = {
  57: {
    location:
      'The Spleen Center — humanity’s oldest awareness center, reading instinctive, body-level truth in the present moment rather than anything visual or logical.',
    channels:
      'Gate 57 sits at the center of three channels at once: 57–10 (Perfected Form), 57–20 (The Brainwave), and 57–34 (Power) — together with Gates 10, 20, and 34, the structural core of the Integration circuitry, the body’s survival backbone.',
    experience:
      'Being around someone with Gate 57 active feels like standing in a gentle, steady wind: barely noticeable at first, but it keeps penetrating until you feel quietly, thoroughly read — not analyzed, just registered, the way an animal senses a shift in a room before anyone has said anything. The read is acoustic and instinctive, not visual or mental: it’s picking up the vibrational truth underneath whatever is actually being said. It tends to arrive as a single, quiet signal rather than a repeated nudge, so it’s genuinely easy to miss if your attention is elsewhere — there’s no second alarm.',
  },
};

export const GATE_KEYNOTES: Record<number, GateKeynote> = {
  // Head Center
  64: { ichingName: 'Before Completion', coreMeaning: 'The pressure of confusion, to make sense of the past.', center: 'head' },
  61: { ichingName: 'Inner Truth', coreMeaning: 'The pressure of mystery, to know the unknowable.', center: 'head' },
  63: { ichingName: 'After Completion', coreMeaning: 'The pressure of doubt, to find the logical pattern.', center: 'head' },
  // Ajna Center
  47: { ichingName: 'Oppression', coreMeaning: 'The realization of mental patterns, the "aha" moment.', center: 'ajna' },
  24: { ichingName: 'Returning', coreMeaning: 'The rationalization of knowing, the cyclical return of thought.', center: 'ajna' },
  4:  { ichingName: 'Youthful Folly', coreMeaning: 'The formulation of logical answers, the possibility of a solution.', center: 'ajna' },
  17: { ichingName: 'Following', coreMeaning: 'The formulation of opinions, the understanding of patterns.', center: 'ajna' },
  43: { ichingName: 'Breakthrough', coreMeaning: 'The expression of individual insight, the "I know" that is not logical.', center: 'ajna' },
  11: { ichingName: 'Peace', coreMeaning: 'The conception of ideas, the stream of creativity.', center: 'ajna' },
  // Throat Center
  62: { ichingName: 'Preponderance of the Small', coreMeaning: 'The expression of detail, the naming of things.', center: 'throat' },
  23: { ichingName: 'Splitting Apart', coreMeaning: 'The expression of individual knowing, "I know that I know."', center: 'throat' },
  56: { ichingName: 'The Wanderer', coreMeaning: 'The expression of ideas through storytelling.', center: 'throat' },
  35: { ichingName: 'Progress', coreMeaning: 'The expression of experience, the "jack of all trades."', center: 'throat' },
  12: { ichingName: 'Standstill', coreMeaning: 'The expression of caution, the social gate of stillness.', center: 'throat' },
  45: { ichingName: 'Gathering Together', coreMeaning: 'The expression of the "I have," the voice of the King or Queen.', center: 'throat' },
  33: { ichingName: 'Retreat', coreMeaning: 'The expression of memory, the storyteller of the past.', center: 'throat' },
  8:  { ichingName: 'Holding Together', coreMeaning: 'The expression of contribution, making a unique difference.', center: 'throat' },
  31: { ichingName: 'Influence', coreMeaning: 'The expression of leadership, the voice of the democratic leader.', center: 'throat' },
  20: { ichingName: 'Contemplation', coreMeaning: 'The expression of the now, the voice of self-awareness.', center: 'throat' },
  16: { ichingName: 'Enthusiasm', coreMeaning: 'The expression of skill, the talent for mastery through repetition.', center: 'throat' },
  // G Center
  7:  { ichingName: 'The Army', coreMeaning: 'The role of the self in interaction, democratic leadership.', center: 'g_center' },
  1:  { ichingName: 'The Creative', coreMeaning: 'The expression of the creative self, pure yang.', center: 'g_center' },
  13: { ichingName: 'The Fellowship of Man', coreMeaning: 'The role of the listener, the keeper of secrets.', center: 'g_center' },
  10: { ichingName: 'Treading', coreMeaning: 'The behavior of the self, the love of being.', center: 'g_center' },
  15: { ichingName: 'Modesty', coreMeaning: 'The love of humanity, the energy of extremes in rhythm.', center: 'g_center' },
  2:  { ichingName: 'The Receptive', coreMeaning: 'The direction of the self, the driver, pure yin.', center: 'g_center' },
  46: { ichingName: 'Pushing Upward', coreMeaning: 'The love of the body, the determination of the self.', center: 'g_center' },
  25: { ichingName: 'Innocence', coreMeaning: 'The spirit of the self, universal love.', center: 'g_center' },
  // Heart Center
  21: { ichingName: 'Biting Through', coreMeaning: 'The control of resources, the treasurer.', center: 'heart' },
  40: { ichingName: 'Deliverance', coreMeaning: 'The aloneness of the ego, the will to provide.', center: 'heart' },
  26: { ichingName: 'The Taming Power of the Great', coreMeaning: 'The egoist, the trickster, the salesman.', center: 'heart' },
  51: { ichingName: 'The Arousing (Shock)', coreMeaning: 'The shock of initiation, the competitive will.', center: 'heart' },
  // Spleen Center
  48: { ichingName: 'The Well', coreMeaning: 'The fear of inadequacy, the depth of knowledge.', center: 'spleen' },
  57: { ichingName: 'The Gentle', coreMeaning: 'The fear of the future, the intuition of the now.', center: 'spleen' },
  44: { ichingName: 'Coming to Meet', coreMeaning: 'The fear of the past, the instinct for what is possible.', center: 'spleen' },
  50: { ichingName: 'The Cauldron', coreMeaning: 'The fear of responsibility, the awareness of tribal values.', center: 'spleen' },
  32: { ichingName: 'Duration', coreMeaning: 'The fear of failure, the intuition for what has endurance.', center: 'spleen' },
  28: { ichingName: 'Preponderance of the Great', coreMeaning: 'The fear of death, the struggle for purpose.', center: 'spleen' },
  18: { ichingName: 'Work on What Has Been Spoilt', coreMeaning: 'The fear of authority, the joy of correction.', center: 'spleen' },
  // Sacral Center
  5:  { ichingName: 'Waiting', coreMeaning: 'The fixed rhythm of life force, the pattern of waiting.', center: 'sacral' },
  14: { ichingName: 'Possession in Great Measure', coreMeaning: 'The power skills, the fuel to generate wealth.', center: 'sacral' },
  29: { ichingName: 'The Abysmal', coreMeaning: 'The energy to say "yes," the commitment to a cycle.', center: 'sacral' },
  59: { ichingName: 'Dispersion', coreMeaning: 'The energy for intimacy and breaking down barriers.', center: 'sacral' },
  9:  { ichingName: 'The Taming Power of the Small', coreMeaning: 'The power of focus and detail.', center: 'sacral' },
  3:  { ichingName: 'Difficulty at the Beginning', coreMeaning: 'The energy for mutation and ordering.', center: 'sacral' },
  42: { ichingName: 'Increase', coreMeaning: 'The energy for growth and finishing cycles.', center: 'sacral' },
  27: { ichingName: 'Nourishment', coreMeaning: 'The energy for caring and responsibility.', center: 'sacral' },
  34: { ichingName: 'The Power of the Great', coreMeaning: 'The pure power of life force, the busiest gate.', center: 'sacral' },
  // Solar Plexus Center
  6:  { ichingName: 'Conflict', coreMeaning: 'The emotional wave of intimacy and friction.', center: 'solar_plexus' },
  37: { ichingName: 'The Family', coreMeaning: 'The emotional wave of friendship and community.', center: 'solar_plexus' },
  22: { ichingName: 'Grace', coreMeaning: 'The emotional wave of openness and social grace.', center: 'solar_plexus' },
  36: { ichingName: 'The Darkening of the Light', coreMeaning: 'The emotional wave of crisis and new experience.', center: 'solar_plexus' },
  30: { ichingName: 'The Clinging Fire', coreMeaning: 'The emotional wave of desire and intensity.', center: 'solar_plexus' },
  55: { ichingName: 'Abundance', coreMeaning: 'The emotional wave of spirit and mood.', center: 'solar_plexus' },
  49: { ichingName: 'Revolution', coreMeaning: 'The emotional wave of principles and rejection.', center: 'solar_plexus' },
  // Root Center
  53: { ichingName: 'Development', coreMeaning: 'The pressure to start new things.', center: 'root' },
  60: { ichingName: 'Limitation', coreMeaning: 'The pressure of limitation, to transcend restriction.', center: 'root' },
  52: { ichingName: 'Keeping Still (Mountain)', coreMeaning: 'The pressure to focus and concentrate.', center: 'root' },
  19: { ichingName: 'Approach', coreMeaning: 'The pressure to be sensitive to the needs of the tribe.', center: 'root' },
  39: { ichingName: 'Obstruction', coreMeaning: 'The pressure to provoke and find the spirit.', center: 'root' },
  41: { ichingName: 'Decrease', coreMeaning: 'The pressure of fantasy, to begin a new experience.', center: 'root' },
  58: { ichingName: 'The Joyous', coreMeaning: 'The pressure to perfect, the vitality to correct.', center: 'root' },
  38: { ichingName: 'Opposition', coreMeaning: 'The pressure to struggle and find purpose.', center: 'root' },
  54: { ichingName: 'The Marrying Maiden', coreMeaning: 'The pressure of ambition and the drive to rise up.', center: 'root' },
};

export type CircuitGroup = 'Individual' | 'Collective' | 'Tribal';
export type SubCircuit =
  | 'Knowing' | 'Centering'                    // Individual
  | 'Sensing/Abstract' | 'Understanding/Logic'  // Collective
  | 'Defense' | 'Ego'                           // Tribal
  | 'Integration';                              // cross-cutting, not part of a Circuit Group

export interface ChannelCircuit {
  gates: [number, number];
  name: string;
  group: CircuitGroup | 'Integration';
  subCircuit: SubCircuit;
}

// The dominant reading calculateCircuitBalance() can return: one of the
// three Circuit Groups, the cross-cutting Integration construct, an even
// spread across all three groups with no single winner, or none at all
// (no active channels — the Reflector case).
export type CircuitMeaningKey = CircuitGroup | 'Integration' | 'Even' | 'None';

export const CIRCUIT_GROUP_MEANING: Record<CircuitMeaningKey, { keynote: string; passage: string }> = {
  Individual: {
    keynote: 'Empowerment',
    passage:
      "Your Individual channels don't run on a steady current — they pulse. There's a mutative on/off rhythm to how you know things: a sudden download of certainty, then a genuine quiet with nothing coming through at all. Neither half is a malfunction; both are the mechanism working correctly. The quiet half is where most of the trouble starts — if your mind tries to explain the emptiness instead of just letting it pass, that ordinary chemical dip can curdle into something that feels like real depression. You're not built to fit into a room's consensus or soften a knowing until it sounds palatable; when it lands, it can sound strange, disruptive, even a little unhinged to people running on steadier circuitry, and waiting for the right moment to say it out loud is not the same as silencing yourself. What you're actually here for is simpler than convincing anyone: mutate the world by being unmistakably, uncompromisingly yourself, and let that example do the influencing your words don't have to.",
  },
  Collective: {
    keynote: 'Sharing',
    passage:
      "Your Collective channels point outward by default — toward the room, the organization, the species, never just the one person in front of you. Two very different engines can produce that outward pull. The Logic side runs on testing and pattern, building toward a workable future: what can be made clearer, more efficient, more true, so it holds up later. The Abstract side runs on lived experience, replaying the past until the wisdom in it becomes shareable: what you just lived through, and who needs to hear it. Whichever engine dominates yours, the currency is the same — a pattern, an opinion, a story, offered to the group rather than kept as private property. The shadow shows up as impersonal energy mistaken for a personal attack: Logic can tip into relentless correcting and doubt, Abstract into replaying a disappointment until it hardens into a grievance. The fix isn't to stop sharing — it's remembering the material is about the pattern, not the person holding it, yours or anyone else's.",
  },
  Tribal: {
    keynote: 'Support',
    passage:
      "Your Tribal channels care about a much smaller radius than Individual or Collective circuitry — not humanity, not a broader philosophy, just who's actually in the room and whether they're provided for. Everything here runs on bargains: I support you, you support me, spoken or not. The Defense side protects and nurtures — the physical safety and continuity of the people closest to you. The Ego side builds and provides — ambition, resources, the material means to actually make good on the bargain. Belonging matters more here than almost anywhere else in the chart, and so does its shadow: a hard line between who's in the clan and who isn't, drawn less by logic than by familiarity. When a bargain goes unspoken and then gets broken, resentment lands harder here than the situation usually warrants — not because you're petty, but because an unspoken agreement is still an agreement to Tribal circuitry. The guidance is almost mechanical in its simplicity: say the terms out loud, every time, before you're depending on someone to hold up their end.",
  },
  Integration: {
    keynote: 'Survival',
    passage:
      "The four Integration channels — Power, Charisma, Awakening, and Perfected Form — aren't really a fourth circuit group; they're a separate structure entirely, tying the Throat, G Center, Sacral, and Spleen into what this system calls the survival backbone. Where Individual, Collective, and Tribal are all in some way social — mutating, sharing, or supporting other people — Integration isn't. It's the spine that lets you stand on your own conviction, right now, regardless of what any group thinks. Lived out of balance, that self-referencing intensity can look like reckless overdrive, an intuitive fear with no clear source, or a self-worth that quietly erodes when there's no external mirror confirming it. Lived in balance, it's simply the part of you that doesn't need permission to exist. If Integration is your strongest theme, the work isn't finding your tribe or your audience — it's trusting the immediate, gut-level, in-the-moment read your own design is already giving you.",
  },
  Even: {
    keynote: 'Synthesis',
    passage:
      "No single circuit dominates your design — two or more of Individual, Collective, Tribal, and Integration are running in close to equal measure. That's not indecision or a diluted version of any one theme; it makes you a natural translator between genuinely different operating systems. Depending on which circuits are tied, you might generate a personal knowing and shape it into something shareable with a wider audience, or ground a collective idea in what actually supports the people closest to you, or hold your own immediate conviction steady while still building toward something for the group — one circuit doing what another circuit can't. The friction shows up as an internal tug-of-war rather than a single clear pull: competing, equally legitimate demands, all wanting to run at once. Don't expect your mind to referee that argument — it can't, and every attempt just adds noise. Strategy and Authority already knows which circuit is correct for this specific moment; the balance was never a problem to solve, only a range to trust.",
  },
  None: {
    keynote: 'Reflection',
    passage:
      "You have no active channels running any of the three Circuit Groups — consistent with a Reflector configuration, where every Center stays open and nothing runs as a fixed circuit of your own. Circuitry, in the usual sense, isn't where your design does its work; your resistant, sampling aura is. Rather than generating a fixed pattern to mutate, share, or support, you take in whatever circuitry is active in the people and places around you and reflect it back with startling clarity — often becoming the clearest mirror in any room for how a group, a family, or even the wider culture is actually doing. That's not an absence; it's a different mechanism entirely, and its correctness depends almost completely on getting your environment and your timing right.",
  },
};

// All 36 Channels, with their gate pair, name, and circuit classification.
export const CHANNELS: ChannelCircuit[] = [
  { gates: [61, 24], name: 'Awareness',      group: 'Individual', subCircuit: 'Knowing' },
  { gates: [43, 23], name: 'Structuring',    group: 'Individual', subCircuit: 'Knowing' },
  { gates: [8, 1],   name: 'Inspiration',    group: 'Individual', subCircuit: 'Knowing' },
  { gates: [2, 14],  name: 'The Beat',       group: 'Individual', subCircuit: 'Knowing' },
  { gates: [3, 60],  name: 'Mutation',       group: 'Individual', subCircuit: 'Knowing' },
  { gates: [28, 38], name: 'Struggle',       group: 'Individual', subCircuit: 'Knowing' },
  { gates: [57, 20], name: 'The Brainwave',  group: 'Individual', subCircuit: 'Knowing' },
  { gates: [39, 55], name: 'Emoting',        group: 'Individual', subCircuit: 'Knowing' },
  { gates: [12, 22], name: 'Openness',       group: 'Individual', subCircuit: 'Knowing' },
  { gates: [51, 25], name: 'Initiation',     group: 'Individual', subCircuit: 'Centering' },
  { gates: [34, 10], name: 'Exploration',    group: 'Individual', subCircuit: 'Centering' },

  { gates: [64, 47], name: 'Abstraction',    group: 'Collective', subCircuit: 'Sensing/Abstract' },
  { gates: [11, 56], name: 'Curiosity',      group: 'Collective', subCircuit: 'Sensing/Abstract' },
  { gates: [13, 33], name: 'The Prodigal',   group: 'Collective', subCircuit: 'Sensing/Abstract' },
  { gates: [46, 29], name: 'Discovery',      group: 'Collective', subCircuit: 'Sensing/Abstract' },
  { gates: [35, 36], name: 'Transitoriness', group: 'Collective', subCircuit: 'Sensing/Abstract' },
  { gates: [41, 30], name: 'Recognition',    group: 'Collective', subCircuit: 'Sensing/Abstract' },
  { gates: [53, 42], name: 'Maturation',     group: 'Collective', subCircuit: 'Sensing/Abstract' },

  { gates: [63, 4],  name: 'Logic',          group: 'Collective', subCircuit: 'Understanding/Logic' },
  { gates: [17, 62], name: 'Acceptance',     group: 'Collective', subCircuit: 'Understanding/Logic' },
  { gates: [31, 7],  name: 'The Alpha',      group: 'Collective', subCircuit: 'Understanding/Logic' },
  { gates: [15, 5],  name: 'Rhythm',         group: 'Collective', subCircuit: 'Understanding/Logic' },
  { gates: [16, 48], name: 'The Wavelength', group: 'Collective', subCircuit: 'Understanding/Logic' },
  { gates: [18, 58], name: 'Judgment',       group: 'Collective', subCircuit: 'Understanding/Logic' },
  { gates: [9, 52],  name: 'Concentration',  group: 'Collective', subCircuit: 'Understanding/Logic' },

  { gates: [50, 27], name: 'Preservation',   group: 'Tribal', subCircuit: 'Defense' },
  { gates: [59, 6],  name: 'Mating',         group: 'Tribal', subCircuit: 'Defense' },

  { gates: [44, 26], name: 'Surrender',      group: 'Tribal', subCircuit: 'Ego' },
  { gates: [19, 49], name: 'Synthesis',      group: 'Tribal', subCircuit: 'Ego' },
  { gates: [37, 40], name: 'Community',      group: 'Tribal', subCircuit: 'Ego' },
  { gates: [21, 45], name: 'The Money Line', group: 'Tribal', subCircuit: 'Ego' },
  { gates: [32, 54], name: 'Transformation', group: 'Tribal', subCircuit: 'Ego' },

  { gates: [57, 34], name: 'Power',          group: 'Integration', subCircuit: 'Integration' },
  { gates: [34, 20], name: 'Charisma',       group: 'Integration', subCircuit: 'Integration' },
  { gates: [20, 10], name: 'Awakening',      group: 'Integration', subCircuit: 'Integration' },
  { gates: [10, 57], name: 'Perfected Form', group: 'Integration', subCircuit: 'Integration' },
];

/** Look up a channel's circuit info by its two gate numbers, in either order. */
export function findChannelCircuit(gateA: number, gateB: number): ChannelCircuit | undefined {
  return CHANNELS.find(
    ch => (ch.gates[0] === gateA && ch.gates[1] === gateB) ||
          (ch.gates[0] === gateB && ch.gates[1] === gateA)
  );
}
