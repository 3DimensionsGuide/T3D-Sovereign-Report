/**
 * Firdaria interpretive content — one entry per planet in the ruling sequence.
 * Used by Page 31b (Your Current Time Lord). Kept deliberately universal across
 * Human Design types/Authorities — the page composes one additional Authority-aware
 * sentence at render time from AUTHORITY_PROTOCOL, rather than hard-coding a single
 * Authority mechanic into this content.
 */

import type { FirdariaPlanet } from '../tokens';

export interface FirdariaAnalysis {
  quote:      string;         // italic framing line under the current-period label
  paragraphs: [string, string];
  watchFor:   string;
}

export const FIRDARIA_ANALYSIS: Record<FirdariaPlanet, FirdariaAnalysis> = {
  Sun: {
    quote: 'A decade ruled by the Sun — the planet of vitality, self-expression, and visible identity.',
    paragraphs: [
      'The Sun governs a decade built around visibility and vitality rather than background support. What you initiate, and how directly you’re willing to be seen, both carry more weight than usual — this is not a period for staying quietly behind the work.',
      'Confidence built during a Sun period tends to be durable, because it’s earned through actual output rather than performance. What you lead now, you tend to keep leading.',
    ],
    watchFor: 'Watch for ego inflation dressed as confidence — the Sun period rewards genuine self-expression, not self-importance.',
  },
  Venus: {
    quote: 'A decade ruled by Venus — the planet of relationship, beauty, and aesthetic intelligence.',
    paragraphs: [
      'Venus governs a decade oriented around harmony, attraction, and the quality of your close relationships. Partnerships — romantic, creative, and professional — carry unusual weight, and what you build during this period tends to be judged by how well it holds together, not just how well it performs.',
      'This is fertile ground for anything that depends on taste, collaboration, or genuine rapport. The corresponding risk is conflict avoidance — smoothing over real disagreement to preserve harmony costs more here than it would in another period.',
    ],
    watchFor: 'Watch for accommodating past the point of honesty — Venus periods can make peace feel more urgent than truth.',
  },
  Mercury: {
    quote: 'A decade ruled by Mercury — the planet of analysis, exchange, and information.',
    paragraphs: [
      'Mercury governs a decade built around analysis, exchange, and the gathering of information. Ideas move faster here, and the ability to synthesize, write, teach, or negotiate becomes unusually load-bearing.',
      'Whatever your Vehicle already does well with communication, this decade asks you to do more of it, more visibly. The corresponding risk is staying in analysis past the point of usefulness.',
    ],
    watchFor: 'Watch for research replacing action — Mercury periods reward synthesis, not permanent deliberation.',
  },
  Moon: {
    quote: 'A decade ruled by the Moon — the planet of memory, rhythm, and emotional response.',
    paragraphs: [
      'The Moon governs a decade built around receptivity, rhythm, and emotional memory rather than initiation. This period rewards presence — noticing what recurs, what nourishes, and what depletes — over forcing new ground.',
      'Home, daily routine, and the people you’re closest to tend to move to the foreground. What gets built here is rarely dramatic; it’s cumulative — the decade’s real output shows up as consistency, not as a single visible milestone.',
    ],
    watchFor: 'Watch for mood mistaken for signal — a Moon period generates more raw emotional material than usual, so the gap between a genuine response and a passing feeling matters more than ever.',
  },
  Saturn: {
    quote: 'A decade ruled by Saturn — the planet of structure, mastery, and long consolidation.',
    paragraphs: [
      'Saturn governs a decade built around discipline, patience, and the slow accumulation of real competence. Progress here is rarely fast and rarely glamorous — but what gets built during a Saturn period tends to be the most durable output of your entire life.',
      'This is not a decade to force quick wins. Saturn periods reward showing up consistently for something that won’t pay off for years, and they’re unusually good at revealing which commitments were real and which were convenient.',
    ],
    watchFor: 'Watch for mistaking restriction for failure — a Saturn period’s slowness is structural, not a sign that something is wrong.',
  },
  Jupiter: {
    quote: 'A decade ruled by Jupiter — the planet of expansion, opportunity, and growth.',
    paragraphs: [
      'Jupiter governs a decade built around genuine expansion — more opportunity, more reach, and more room to grow than the periods around it. Doors that were closed tend to open, often through people, travel, or education.',
      'The risk that comes with Jupiter is overextension — saying yes to every opportunity simply because it appeared. The decade rewards growth with direction, not growth for its own sake.',
    ],
    watchFor: 'Watch for scope creep — Jupiter periods make everything look like an opportunity worth pursuing.',
  },
  Mars: {
    quote: 'A decade ruled by Mars — the planet of initiative, drive, and direct action.',
    paragraphs: [
      'Mars governs a decade built around momentum and direct action. Energy runs higher, patience runs shorter, and the capacity to simply start — before every condition is perfect — becomes the decade’s defining skill.',
      'Used well, this is one of the most productive periods in the whole cycle. Used poorly, it produces conflict for its own sake, or burnout from sustained intensity with no recovery built in.',
    ],
    watchFor: 'Watch for urgency mistaken for necessity — not everything that feels like it must happen now actually does.',
  },
  'North Node': {
    quote: 'A short, forward-leaning period ruled by the North Node — momentum toward unfamiliar terrain.',
    paragraphs: [
      'The North Node governs a brief, transitional period oriented toward what’s unfamiliar rather than what’s comfortable. It tends to feel like being pulled forward faster than usual, into terrain your prior periods didn’t fully prepare you for.',
      'Treat this window as a bridge rather than a destination — it’s short by design, and its job is to point you toward the next long chapter, not to resolve everything on its own.',
    ],
    watchFor: 'Watch for disorientation mistaken for wrong direction — unfamiliar isn’t the same as incorrect.',
  },
  'South Node': {
    quote: 'A brief, closing period ruled by the South Node — release, integration, and finishing loops.',
    paragraphs: [
      'The South Node governs the shortest period in the cycle, oriented toward release and integration rather than new initiation. What’s unfinished from the prior periods tends to surface here, asking to be closed rather than carried forward.',
      'This is not a period to start anything major — it’s a period to finish what’s already in motion, so the next full cycle can begin clean.',
    ],
    watchFor: 'Watch for nostalgia mistaken for direction — this period looks backward by design; don’t mistake it for where you’re headed.',
  },
};
