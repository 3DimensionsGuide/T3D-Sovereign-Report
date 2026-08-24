/**
 * T3D Report — Astrology Content Library
 * Section 5: The Stoplight (Pages 26–33)
 *
 * Selection rule: only placements that change the reader's
 * behavior or self-understanding. This is a navigation system,
 * not a chart catalog.
 */

// ─── SIGN CLASSIFICATION ──────────────────────────────────────────────────────
export const SIGN_ELEMENT: Record<string, 'Fire' | 'Earth' | 'Air' | 'Water'> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};

export const SIGN_MODALITY: Record<string, 'Cardinal' | 'Fixed' | 'Mutable'> = {
  Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal',
  Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed',
  Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable',
};

export const SIGN_INDEX: Record<string, number> = {
  Aries: 0, Taurus: 1, Gemini: 2, Cancer: 3, Leo: 4, Virgo: 5,
  Libra: 6, Scorpio: 7, Sagittarius: 8, Capricorn: 9, Aquarius: 10, Pisces: 11,
};

// ─── SUN SIGN: CORE ORIENTATION ───────────────────────────────────────────────
export const SUN_SIGN_CONTENT: Record<string, {
  orientation: string;
  recognize:   [string, string, string];
  watchFor:    string;
}> = {
  Aries: {
    orientation: 'Your core orientation is toward initiation and self-definition — you bring the heat of beginning into situations that have grown static. At your best, you model the courage to start. The friction arrives when speed outpaces the wisdom needed to choose direction.',
    recognize: [
      'You\'ve felt most alive at the start of something — the moment before it becomes routine',
      'Waiting for consensus produces a specific internal pressure that often leads you to move anyway',
      'Others describe your energy as galvanizing — sometimes more than the moment calls for',
    ],
    watchFor: 'Acting from momentum rather than from choice — beginning because beginning is what you do, not because this beginning is what\'s needed.',
  },
  Taurus: {
    orientation: 'Your core orientation is toward what endures — quality, substance, and the satisfaction of building something real. You are the stabilizing presence others organize around. At your best, you make staying worthwhile. The friction is resistance to change that has already become necessary.',
    recognize: [
      'You invest in things and relationships deeply, and you expect that investment to compound over time',
      'Abrupt change or disrupted plans lands harder for you than it appears to from the outside',
      'Others rely on your steadiness — sometimes so much that your own needs for movement go unmet',
    ],
    watchFor: 'Holding what has run its course — maintaining stability where what\'s actually needed is release.',
  },
  Gemini: {
    orientation: 'Your core orientation is toward synthesis and connection — building bridges between ideas and people others haven\'t linked yet. At your best, you make the complex feel navigable and the isolated feel included. The friction is scattered attention when depth is what the situation requires.',
    recognize: [
      'You think best in conversation — ideas arrive through exchange, not in isolation',
      'You\'ve been told you\'re inconsistent when what was actually happening was evolution',
      'Boredom is a signal, not a character flaw — you are wired for variety',
    ],
    watchFor: 'Moving to the next idea before the current one has been fully tested or transmitted.',
  },
  Cancer: {
    orientation: 'Your core orientation is toward belonging and protection — the preservation of what matters and the creation of conditions where people feel held. At your best, you offer a depth of care others rarely experience. The friction is over-protecting what needs to change, or carrying others\' needs until there\'s nothing left.',
    recognize: [
      'You read the emotional temperature of a room faster than most people know there is one',
      'Home — as a feeling, not necessarily a location — is foundational to how you function',
      'The line between your feelings and others\' is porous in ways you\'ve spent years navigating',
    ],
    watchFor: 'Using care as a way to control — protecting others from discomfort they may need to feel.',
  },
  Leo: {
    orientation: 'Your core orientation is toward self-expression and the extension of that warmth to others. You understand visibility as a gift, not just a need. At your best, you make people around you feel more alive and more seen. The friction is performing rather than being — which produces recognition but not the connection you actually want.',
    recognize: [
      'You\'ve had moments where the room changed when you entered it — and that wasn\'t accidental',
      'Recognition matters to you more than you always admit, and its absence lands harder than it should need to',
      'The most difficult thing for you is not being seen — it\'s being misread',
    ],
    watchFor: 'Maintaining a persona that gets a good response rather than the presence that actually belongs to you.',
  },
  Virgo: {
    orientation: 'Your core orientation is toward usefulness and refinement — making things work better, more precisely, and with greater care. At your best, you see what others miss and improve what others accept. The friction is a perfectionism that prevents things from being finished or shared.',
    recognize: [
      'You notice errors and inefficiencies that others genuinely cannot see — not because you\'re looking for them, but because they\'re obvious to you',
      'Service produces a satisfaction that\'s difficult to find elsewhere, but obligation produces a specific depletion',
      'You are harder on yourself than you are on others — and others rarely notice the standard you hold yourself to',
    ],
    watchFor: 'Withholding what\'s ready because it isn\'t perfect — when what\'s needed is useful, not flawless.',
  },
  Libra: {
    orientation: 'Your core orientation is toward balance, relationship, and aesthetic intelligence — the quality of how things are, not just what they produce. At your best, you restore proportion where others created imbalance. The friction is indecision or self-erasure in service of harmony that may have already ended.',
    recognize: [
      'You sense when something is aesthetically or relationally out of proportion before you can explain what\'s wrong',
      'Conflict is genuinely painful — not merely uncomfortable — which can lead you to carry discord internally rather than externally',
      'Making decisions for yourself is harder than making them for others — the criteria feel more elusive',
    ],
    watchFor: 'Maintaining the appearance of balance while carrying the actual imbalance alone.',
  },
  Scorpio: {
    orientation: 'Your core orientation is toward depth and truth — you are not interested in what something appears to be, only in what it actually is. At your best, you hold what others need to examine without flinching. The friction is the intensity that keeps others at a distance when intimacy is what you actually want.',
    recognize: [
      'You read beneath the surface of situations and people — often before you have the words for what you\'ve sensed',
      'Trust is not extended easily, and once broken, it is rarely fully restored',
      'Betrayal lands harder than almost any other experience — not because you were naive, but because you were deliberate',
    ],
    watchFor: 'Protecting yourself from the intimacy you most deeply want by making trust tests almost impossible to pass.',
  },
  Sagittarius: {
    orientation: 'Your core orientation is toward expansion, meaning, and the next horizon — you are drawn toward what enlarges rather than what confines. At your best, you help others see a larger version of what\'s possible. The friction is a restlessness that mistakes movement for growth.',
    recognize: [
      'You are most energized when you can see the larger meaning or direction behind what you\'re doing',
      'Confinement — physical, philosophical, or institutional — produces a specific frustration that builds quickly',
      'You\'ve ended up in places and situations that seemed to call you rather than ones you planned toward',
    ],
    watchFor: 'Moving to the next thing before the current thing has taught you what it came to teach.',
  },
  Capricorn: {
    orientation: 'Your core orientation is toward mastery, structure, and the long game — you are building something, and you are serious about it. At your best, you provide the framework that allows other people\'s gifts to function. The friction is a seriousness that forecloses on rest and joy as though they were distractions.',
    recognize: [
      'You think naturally in terms of milestones, disciplines, and outcomes that are years or decades away',
      'Your standards are high enough that few people — including yourself — consistently meet them',
      'What you\'ve accomplished looks different from the inside than from the outside: the work is always obvious to you; the achievement less so',
    ],
    watchFor: 'Treating rest, play, and connection as rewards that must be earned rather than as conditions that enable the work.',
  },
  Aquarius: {
    orientation: 'Your core orientation is toward collective intelligence and the future — you carry an awareness of systems and patterns that others often aren\'t yet ready for. At your best, you advance what needs to advance. The friction is a detachment that keeps you ahead of the room but out of meaningful contact with the people in it.',
    recognize: [
      'You have often understood something — about a situation, a system, a direction — before others could see it',
      'Belonging to a conventional structure produces a recurring sense of not quite fitting',
      'Your independence is real and important to you, and the moments when it\'s threatened produce disproportionate discomfort',
    ],
    watchFor: 'Using ideas as a substitute for the intimacy and belonging that you actually want.',
  },
  Pisces: {
    orientation: 'Your core orientation is toward depth, imagination, and the dissolving of separation. You are the most available presence in the room — absorbing, reflecting, and holding what others are carrying. The friction is a permeability that makes it genuinely difficult to distinguish your experience from those around you.',
    recognize: [
      'You absorb the emotional environment of any room you enter — often before you know you\'ve done it',
      'Imagination, creativity, and solitude are not luxuries — they are maintenance',
      'The line between empathy and losing yourself is one you navigate constantly and imperfectly',
    ],
    watchFor: 'Carrying others\' emotions as though they were yours — and then trying to process what isn\'t actually your material.',
  },
};

// ─── MOON SIGN: EMOTIONAL NEEDS ───────────────────────────────────────────────
export const MOON_SIGN_CONTENT: Record<string, string> = {
  Aries:       'You need emotional directness and freedom to express what you feel immediately. Extended ambiguity or suppressed conflict creates internal pressure that either erupts or turns inward. At your best emotionally, you have agency, speed, and the ability to respond.',
  Taurus:      'You need stability, sensory comfort, and the reassurance that what you\'ve built is secure. You process emotion slowly — what you feel becomes clear over time, not instantly. Abrupt change is genuinely destabilizing in ways that others can underestimate.',
  Gemini:      'You need to talk through what you feel in order to understand it. Emotional processing is partly intellectual — you make sense of feelings by articulating them. Isolation from conversation or stimulation produces an anxiety that looks like restlessness but is actually a search for contact.',
  Cancer:      'You need to feel emotionally safe before you can be fully present. Home, family, and familiar environments are not preferences — they are conditions. When these conditions are met, you offer a depth of care that others rarely experience.',
  Leo:         'You need to feel seen and appreciated — not performed at, but genuinely noticed. You give warmth generously and need it returned in kind. When recognition is absent, the emotional temperature drops noticeably, in ways others may not anticipate.',
  Virgo:       'You need order, usefulness, and the sense that things are functioning properly. Emotional distress frequently arrives as physical symptoms or hyper-focus on what needs fixing. Rest is genuinely difficult — it often requires justification that shouldn\'t be necessary.',
  Libra:       'You need relational harmony and aesthetic coherence in your environment. Conflict and discord are genuinely painful, which can lead you to suppress your own needs to maintain peace. At your best, you create environments where everyone feels balanced — the cost is carrying more than you show.',
  Scorpio:     'You need depth, truth, and unconditional trust from the few people you allow close. You feel intensely and hold emotion for a long time. At your best, you can hold the heaviest emotional material without flinching. The friction is the wall between you and the people you most want to be closest to.',
  Sagittarius: 'You need freedom, meaning, and the sense that you are moving toward something larger. Confinement or loss of hope produces a restlessness that can look like avoidance. At your best, you lift the emotional temperature of situations by connecting others to what\'s possible.',
  Capricorn:   'You need to feel competent and in control of your circumstances. Emotional vulnerability is uncomfortable — you tend to process through structure and action rather than expression. At your best, you provide emotional steadiness when others are destabilized.',
  Aquarius:    'You need intellectual freedom and emotional space — too much intensity or demand can cause full withdrawal. You process feelings analytically and may need time alone to locate what you actually feel. At your best, you bring non-judgmental calm to difficult emotional territory.',
  Pisces:      'You need gentleness, beauty, and the space to dissolve into feeling and imagination without being questioned. Your emotional sensitivity is exquisitely fine-tuned — you absorb the emotional field of every room you enter. At your best, you offer empathy so complete that others feel truly understood.',
};

// ─── RISING SIGN: INTERFACE WITH LIFE ─────────────────────────────────────────
export const RISING_SIGN_CONTENT: Record<string, string> = {
  Aries:       'Others encounter you as direct, energetic, and already in motion. Your interface is heat — an urgency that others find either galvanizing or overwhelming, depending on what the moment requires.',
  Taurus:      'Others encounter you as grounded, steady, and unhurried. Your presence tends to slow situations down — which is frequently the exact thing they need. The interface is substance: others sense that what you offer has weight behind it.',
  Gemini:      'Others encounter you as quick, curious, and easy to talk to. Your interface is adaptability — you meet people where they are and shift registers effortlessly. The friction is that adaptability can read as inconsistency across time.',
  Cancer:      'Others encounter you as warm, perceptive, and careful about what they share. Your interface is attentiveness — people sense quickly that you notice what others miss. The friction is a guardedness that others may not know how to move past.',
  Leo:         'Others encounter you immediately — there is a quality of presence that makes you visible even when you\'re trying not to be. Your interface is warmth and authority. The friction is that the persona can be mistaken for the whole person.',
  Virgo:       'Others encounter you as precise, attentive, and competent. There is a quality of careful observation in how you engage — you miss very little. Your interface is usefulness. The friction is that the analytical quality can read as critical.',
  Libra:       'Others encounter you as gracious, aesthetically aware, and easy to be with. Your interface is consideration — you make the interaction itself feel well-designed. The friction is that graciousness can look like agreement when it isn\'t.',
  Scorpio:     'Others encounter you as intense, private, and quietly evaluating. Your interface is depth — people sense there is more beneath than is being shown, which can feel either compelling or intimidating. The friction is a guardedness that makes trust difficult to establish quickly.',
  Sagittarius: 'Others encounter you as open, expansive, and direct. Your interface is enthusiasm — you make conversations feel larger. The friction is that directness can arrive without the packaging that softer moments require.',
  Capricorn:   'Others encounter you as composed, competent, and serious. Your interface is authority — people often grant you credibility before you\'ve demonstrated it. The friction is a formality that keeps warmth at a distance even when you want it close.',
  Aquarius:    'Others encounter you as unusual, independent, and a step ahead of the current conversation. Your interface is distinctiveness — people remember you. The friction is an otherness that keeps connection at arm\'s length even when you want it near.',
  Pisces:      'Others encounter you as soft, perceptive, and gently present. Your interface is receptivity — you absorb people\'s experience of themselves, which they often find relieving. The friction is a diffuseness that others can find hard to get hold of.',
};

// ─── ELEMENT BLEND PATTERNS ───────────────────────────────────────────────────
export interface ElementPattern {
  label:    string;
  pacing:   string;
  change:   string;
  emotion:  string;
  gift:     string;
  friction: string;
}

export function getElementPattern(elements: string[]): ElementPattern {
  const counts: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  for (const e of elements) if (e in counts) counts[e]!++;

  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const top = dominant[0]![0];
  const second = dominant[1]![0];
  const topCount = dominant[0]![1];

  if (topCount >= 2) {
    // Dominant element
    const patterns: Record<string, ElementPattern> = {
      Fire: {
        label:    'Fire Dominant',
        pacing:   'Burst-and-recover rather than sustained. You move fast and need recovery periods others may not anticipate.',
        change:   'Strong appetite for the new. Stagnation is genuinely uncomfortable — not a preference, a physical fact.',
        emotion:  'Through action and forward motion. You process by moving — sitting with feeling for too long produces pressure.',
        gift:     'The capacity to initiate, inspire, and bring heat to situations that have gone cold.',
        friction: 'The qualities of the other elements — groundedness, depth, and reflection — may arrive late or underrepresented.',
      },
      Earth: {
        label:    'Earth Dominant',
        pacing:   'Steady and methodical. You move at a pace others sometimes mistake for slowness, but it\'s actually precision.',
        change:   'Cautious and deliberate. You evaluate before you move — which means you move correctly more often than most.',
        emotion:  'Slowly and privately. You tend to feel after the fact — the emotion surfaces once the situation has passed.',
        gift:     'The capacity to build, sustain, and produce results in a world that increasingly rewards only the beginning.',
        friction: 'Fire, Air, and Water — initiation, abstraction, and emotional fluency — may arrive later than they\'re needed.',
      },
      Air: {
        label:    'Air Dominant',
        pacing:   'Fast in thought, variable in action. You can see the whole map quickly; getting from here to the destination is the work.',
        change:   'Conceptually open, sometimes resistant in practice. You can think your way around any change faster than you can feel your way into it.',
        emotion:  'Analytically. You understand what you feel by articulating it — which can produce clarity but sometimes delays the feeling itself.',
        gift:     'The capacity to synthesize, communicate, and make complexity navigable for others.',
        friction: 'Earth and Water — grounding and emotional depth — may be the terrain that consistently asks for more attention.',
      },
      Water: {
        label:    'Water Dominant',
        pacing:   'Rhythmic and cyclical rather than linear. You move in flows — periods of immersion and withdrawal rather than constant forward motion.',
        change:   'Conditional on emotional safety. You need to trust the new before you move toward it — which means you move more certainly, if more slowly.',
        emotion:  'Immersively. You feel first and understand later. The processing is ongoing rather than resolved.',
        gift:     'The capacity for depth, empathy, and the sustained presence that transformation requires.',
        friction: 'Fire and Air — initiation and abstraction — may feel foreign or depleting rather than energizing.',
      },
    };
    return patterns[top] ?? patterns['Air']!;
  }

  // Mixed patterns
  const pair = [top, second].sort().join('-');
  const mixed: Record<string, ElementPattern> = {
    'Earth-Fire': {
      label:    'Fire-Earth Blend',
      pacing:   'You begin fast and build carefully — the transition between those two speeds is where most of the friction lives.',
      change:   'You want movement but need evidence. The combination makes you unusually effective when vision and practicality align.',
      emotion:  'Through action and consolidation — you process by doing and by building, not by talking or feeling your way through.',
      gift:     'Vision grounded in practicality. You can see what could be and build what actually is.',
      friction: 'Sustaining the momentum of beginning through the slower work of building. The gap between those two speeds is the recurring terrain.',
    },
    'Air-Fire': {
      label:    'Fire-Air Blend',
      pacing:   'High mobility in thought and action. You generate quickly and move quickly — follow-through and depth are the recurring invitation.',
      change:   'Welcome and frequent. You are comfortable moving before the full picture is visible.',
      emotion:  'Through articulation and movement. You make sense of what you feel by speaking it and by acting on it.',
      gift:     'The capacity to inspire and mobilize — to make people believe something is possible and take the first step.',
      friction: 'Depth, completion, and sustained emotional intimacy — the qualities of Earth and Water that ground what you generate.',
    },
    'Fire-Water': {
      label:    'Fire-Water Blend',
      pacing:   'Variable — you can be fast-moving or deeply still depending on what you\'re feeling. Others may find the shifts unpredictable.',
      change:   'Wanted when the feeling supports it; resisted when it doesn\'t. The emotional state often determines the readiness.',
      emotion:  'Intensely. Your fire makes you reactive; your water makes you deep. The combination produces passion that has been tested by feeling.',
      gift:     'The capacity to initiate from a place of genuine emotional investment — a rare combination of drive and depth.',
      friction: 'Internal conflict between what you feel (Water) and what you want to do about it (Fire). These don\'t always agree.',
    },
    'Air-Earth': {
      label:    'Earth-Air Blend',
      pacing:   'Thoughtful and methodical — you think clearly and work carefully. The gap between conception and execution can be wide.',
      change:   'Evaluated conceptually before accepted practically. You can see the argument for change before you\'re ready to make it.',
      emotion:  'Through analysis and structure. You understand feelings by thinking about them — which can clarify but can also delay.',
      gift:     'The capacity to take complex thinking and make it functional — idea made into form, theory made into practice.',
      friction: 'Fire and Water — the warmth of spontaneity and the depth of feeling — may be less accessible than the clarity of mind.',
    },
    'Earth-Water': {
      label:    'Earth-Water Blend',
      pacing:   'Deliberate and deep. You move carefully and feel deeply — the combination produces unusual staying power.',
      change:   'Slow and considered. Both Earth and Water resist releasing what they\'ve committed to, for good reasons and at real costs.',
      emotion:  'Deeply and privately. You feel things fully and process slowly — others may not see the emotional depth until it surfaces.',
      gift:     'The capacity to build something that lasts in the context of genuine care. What you create, you mean.',
      friction: 'Releasing what has run its course — which both Earth and Water tend to hold beyond its useful life.',
    },
    'Air-Water': {
      label:    'Air-Water Blend',
      pacing:   'Thoughtful and feeling — you process through both mind and emotion, sometimes simultaneously, sometimes at odds.',
      change:   'Understood quickly, felt slowly. You can see the case for change before your emotional body is ready to make it.',
      emotion:  'Through articulation and immersion — you feel deeply and need to understand what you\'re feeling. Both are true.',
      gift:     'Emotional intelligence that can be expressed — empathy that can speak. A rare and useful combination.',
      friction: 'Fire and Earth — initiation and consolidation — may arrive later than the moment needs them.',
    },
  };
  return mixed[pair] ?? mixed['Air-Water']!;
}

// ─── MODALITY BLEND PATTERNS ──────────────────────────────────────────────────
export function getModalityPattern(modalities: string[]): {
  label: string; description: string;
} {
  const counts: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  for (const m of modalities) if (m in counts) counts[m]!++;

  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const top = dominant[0]![0];
  const topCount = dominant[0]![1];

  if (topCount >= 2) {
    const patterns: Record<string, { label: string; description: string }> = {
      Cardinal: {
        label:       'Cardinal Dominant',
        description: 'You initiate well and begin often. The recurring invitation is completion — not because you can\'t finish, but because the next beginning often arrives before the current one is done.',
      },
      Fixed: {
        label:       'Fixed Dominant',
        description: 'Deep staying power. Once committed, you remain committed through most pressure to quit. The recurring invitation is release — knowing when what you\'re holding has served its purpose.',
      },
      Mutable: {
        label:       'Mutable Dominant',
        description: 'High adaptability and genuine comfort with complexity. The recurring invitation is consistency — a steady direction that others can organize around, even as the approach continues to adapt.',
      },
    };
    return patterns[top] ?? patterns['Mutable']!;
  }

  const second = dominant[1]![0];
  const pair = [top, second].sort().join('-');

  const mixed: Record<string, { label: string; description: string }> = {
    'Cardinal-Fixed': {
      label:       'Cardinal + Fixed',
      description: 'The initiator who can sustain. You begin with momentum and hold with durability — a powerful combination. The friction is the rigidity that sets in once you\'ve committed to a direction, even when adjustment is needed.',
    },
    'Cardinal-Mutable': {
      label:       'Cardinal + Mutable',
      description: 'The initiator who adapts. You begin well and adjust fluidly, which makes you effective in complex environments. The invitation is sustained direction — a course held steady even as the approach evolves.',
    },
    'Fixed-Mutable': {
      label:       'Fixed + Mutable',
      description: 'Deep commitments expressed through flexible methods. You look more adaptable than you are — internally, your core direction is serious and slow to change. The gift is navigation: holding a direction while adjusting how you move through it.',
    },
  };
  return mixed[pair] ?? mixed['Cardinal-Mutable']!;
}

// ─── CHART RULER BY RISING SIGN ──────────────────────────────────────────────
export const CHART_RULER: Record<string, {
  ruler:       string;
  description: string;
  arena:       string;
}> = {
  Aries:       { ruler: 'Mars',           description: 'Your chart is ruled by Mars. Where you direct your drive determines much of what your life builds. The quality of your Mars — how you deploy energy and navigate conflict — shapes everything downstream.', arena: 'Initiative, assertion, and how you pursue what matters.' },
  Taurus:      { ruler: 'Venus',          description: 'Your chart is ruled by Venus. What you value and what you find beautiful are not peripheral concerns — they are organizing principles. Your relationship to pleasure, worth, and what you\'re willing to work for runs everything.', arena: 'Resources, values, and what you build toward.' },
  Gemini:      { ruler: 'Mercury',        description: 'Your chart is ruled by Mercury. How you think, communicate, and process information is not just a preference — it is the lens through which everything else passes. The quality of your mental environment shapes your life significantly.', arena: 'Communication, learning, and how you navigate information.' },
  Cancer:      { ruler: 'the Moon',       description: 'Your chart is ruled by the Moon. Your emotional life, your sense of home, and your intuitive intelligence are not background conditions — they are the central operating system. Where and how you feel safe is foundational to everything else.', arena: 'Home, belonging, emotional safety, and intuition.' },
  Leo:         { ruler: 'the Sun',        description: 'Your chart is ruled by the Sun. Your identity, your direction, and your relationship to self-expression and recognition are not secondary — they are the primary text of your life. How you inhabit your own center shapes everything else.', arena: 'Self-expression, identity, and what you bring into visibility.' },
  Virgo:       { ruler: 'Mercury',        description: 'Your chart is ruled by Mercury. How you analyze, refine, and communicate is the mechanism through which your life happens. The gap between what you think and what you produce is where most of your developmental work lives.', arena: 'Discernment, craft, and what you make useful.' },
  Libra:       { ruler: 'Venus',          description: 'Your chart is ruled by Venus. Relationship, balance, and aesthetic intelligence are not preferences — they are the medium in which your life unfolds. How you relate to others is not peripheral to your development; it is central.', arena: 'Partnership, balance, and the quality of your environment.' },
  Scorpio:     { ruler: 'Mars and Pluto', description: 'Your chart is co-ruled by Mars and Pluto. The tension between drive and transformation — between what you want and what you must let go of — is not incidental. It is the primary dynamic your life returns to.', arena: 'Depth, transformation, and what you are willing to face.' },
  Sagittarius: { ruler: 'Jupiter',        description: 'Your chart is ruled by Jupiter. Your relationship to expansion, meaning, and the larger picture is not background noise — it is the signal. Where your optimism points is often where your life wants to go.', arena: 'Meaning, expansion, and what you believe is possible.' },
  Capricorn:   { ruler: 'Saturn',         description: 'Your chart is ruled by Saturn. What you are willing to commit to over time, and the standards you hold yourself to, are not incidental — they are the architecture of your life. Your authority grows through what you master.', arena: 'Mastery, structure, and what you are willing to build over the long game.' },
  Aquarius:    { ruler: 'Saturn and Uranus', description: 'Your chart is co-ruled by Saturn and Uranus. The tension between what you commit to building and what you need to disrupt is not a problem — it is the central creative tension of your design.', arena: 'Innovation, community, and the systems you are part of or trying to change.' },
  Pisces:      { ruler: 'Jupiter and Neptune', description: 'Your chart is co-ruled by Jupiter and Neptune. Your relationship to meaning, imagination, and what lies beneath the surface is not a side note — it is the primary current. What you believe about possibility shapes everything you attempt.', arena: 'Imagination, spiritual inquiry, and what transcends the immediate.' },
};

// ─── HOUSE BY SUN SIGN RELATIVE TO RISING ────────────────────────────────────
export function getSunHouse(sunSign: string, risingSign: string): number {
  const sunIdx = SIGN_INDEX[sunSign] ?? 0;
  const risingIdx = SIGN_INDEX[risingSign] ?? 0;
  return ((sunIdx - risingIdx + 12) % 12) + 1;
}

export const HOUSE_ARENA: Record<number, { name: string; description: string }> = {
  1:  { name: 'Identity & Self-Expression',   description: 'Your Sun in the 1st house means identity and self-definition are where your life\'s energy concentrates. How you show up is inseparable from what you\'re here to express.' },
  2:  { name: 'Resources & Values',           description: 'Your Sun in the 2nd house means material security, what you value, and what you\'re willing to build are primary life themes. Your relationship to money and worth is developmental.' },
  3:  { name: 'Communication & Learning',     description: 'Your Sun in the 3rd house means thinking, speaking, and connecting locally are where your life happens most actively. How you communicate shapes what you accomplish.' },
  4:  { name: 'Foundation & Home',            description: 'Your Sun in the 4th house means the quality of your private life and roots has outsized influence on everything else. Home — as a condition, not a location — is foundational.' },
  5:  { name: 'Creativity & Expression',      description: 'Your Sun in the 5th house means creativity, play, and self-expression are not peripheral — they are the path. What you create and how you enjoy life are central to your development.' },
  6:  { name: 'Work & Daily Practice',        description: 'Your Sun in the 6th house means daily practice, health, and usefulness are where your purpose most concretely operates. How you work matters as much as what you work toward.' },
  7:  { name: 'Partnership & Relationship',   description: 'Your Sun in the 7th house means close partnership is the primary mirror of your own development. The quality of your one-to-one relationships reflects — and shapes — everything else.' },
  8:  { name: 'Transformation & Depth',       description: 'Your Sun in the 8th house means depth, endings, and regeneration are recurring themes. The pattern of things ending and being remade is not incidental to your life — it is the curriculum.' },
  9:  { name: 'Meaning & Expansion',          description: 'Your Sun in the 9th house means the questions you live with about meaning, belief, and the larger pattern are not abstract — they shape every significant choice.' },
  10: { name: 'Public Role & Mastery',        description: 'Your Sun in the 10th house means what you are known for and what you build publicly are central to your purpose. Your relationship to authority and achievement is developmental and prominent.' },
  11: { name: 'Community & Collective Vision', description: 'Your Sun in the 11th house means your relationship to collective vision, community, and the future is where your life wants to contribute. Chosen community matters more than most people\'s does.' },
  12: { name: 'Integration & Inner Life',     description: 'Your Sun in the 12th house means the inner life, solitude, and what operates beneath consciousness are foundational to your development. What happens when you\'re alone with yourself is often where the real work lives.' },
};

// ─── SUN-MOON DYNAMIC (Core Pattern for Page 30) ─────────────────────────────
export function getSunMoonPattern(sunSign: string, moonSign: string): {
  label:    string;
  tension:  string;
  resource: string;
  practice: string;
} {
  const sunEl  = SIGN_ELEMENT[sunSign]  ?? 'Fire';
  const moonEl = SIGN_ELEMENT[moonSign] ?? 'Water';
  const sunMod  = SIGN_MODALITY[sunSign]  ?? 'Cardinal';
  const moonMod = SIGN_MODALITY[moonSign] ?? 'Fixed';

  if (sunEl === moonEl) {
    return {
      label:    `${sunEl} reinforcement — ${sunSign} Sun, ${moonSign} Moon`,
      tension:  `Your Sun and Moon share the ${sunEl} element, which means the qualities of this element run deep and consistent. The tension is not between Sun and Moon — it is between this configuration and what it doesn\'t strongly represent. The qualities of the opposite element tend to arrive late or feel like effort.`,
      resource: `The coherence of this configuration is a genuine asset — your conscious orientation and emotional needs point in the same direction. Decisions made from this alignment tend to be right and sustainable.`,
      practice: `Notice what the opposite element would bring — and intentionally seek encounters with it. If you\'re Fire-dominant, find the grounding. If Earth-dominant, find the spark. The missing element is often where your growth lives.`,
    };
  }

  // Complementary pairs: Fire-Air, Earth-Water
  const complementary = (
    (sunEl === 'Fire' && moonEl === 'Air') || (sunEl === 'Air' && moonEl === 'Fire') ||
    (sunEl === 'Earth' && moonEl === 'Water') || (sunEl === 'Water' && moonEl === 'Earth')
  );

  if (complementary) {
    return {
      label:    `Complementary flow — ${sunSign} Sun, ${moonSign} Moon`,
      tension:  `Your Sun and Moon are in complementary elements, which creates a relatively harmonious internal dynamic. The friction in this configuration tends to be external — navigating environments or people whose rhythms don\'t match yours — rather than an internal war between what you want and what you feel.`,
      resource: `The natural flow between your Sun\'s orientation and your Moon\'s emotional needs means you can sustain yourself in situations that deplete more conflicted configurations. When you\'re aligned, you replenish rather than drain.`,
      practice: `Trust the ease. When Sun and Moon agree, the decision is often the right one — even if it feels less dramatic than the choices that required more deliberation.`,
    };
  }

  // Challenging: Fire-Water, Earth-Air
  return {
    label:    `Productive tension — ${sunSign} Sun, ${moonSign} Moon`,
    tension:  `Your Sun (${sunSign}, ${sunEl}) and Moon (${moonSign}, ${moonEl}) are in elements that tend to create internal friction. Your conscious orientation wants what ${sunEl} brings, while your emotional needs want what ${moonEl} brings. These don\'t always agree — and the disagreement is not a design flaw. It is the core creative tension of your chart.`,
    resource: `The most important things you\'ve built or understood have probably come from working this tension rather than resolving it. The friction between ${sunEl} and ${moonEl} is where your most interesting and durable development lives.`,
    practice: `When you\'re facing a significant decision, ask both: what does my Sun orientation say (what I want to do), and what does my Moon need (what I need to feel safe doing it). Only proceed when both have been heard — even if they don\'t fully agree.`,
  };
}

// ─── SEASONAL ORIENTATION ─────────────────────────────────────────────────────
export function getSeasonalOrientation(personalYear: number): {
  title:       string;
  season:      string;
  orientation: string;
} {
  const month = new Date().getMonth() + 1; // 1-12

  let season: string;
  let orientation: string;

  if (month >= 3 && month <= 5) {
    season = 'Spring';
    orientation = 'The collective energy favors new beginnings, planting, and the first emergence of what will grow through the year. This is initiation season — the environment supports starting more than finishing.';
  } else if (month >= 6 && month <= 8) {
    season = 'Summer';
    orientation = 'The collective energy favors expression, visibility, and full engagement. This is the season of maximum expansion — what was planted is visible, what was started is in motion. It also contains the seeds of the harvest decision: what stays and what releases.';
  } else if (month >= 9 && month <= 11) {
    season = 'Autumn';
    orientation = 'The collective energy favors harvest, integration, and the honest assessment of what has and hasn\'t grown. This is the season of discernment — deciding what to take forward and what to compost before the cycle closes.';
  } else {
    season = 'Winter';
    orientation = 'The collective energy favors rest, reflection, and the quiet that allows the next cycle to form in the interior before it\'s visible outside. This is preparation season — what you clarify here shapes what you plant next.';
  }

  return {
    title:       `${season} — Personal Year ${personalYear}`,
    season,
    orientation,
  };
}

// ─── STOPLIGHT FRICTION PATTERNS ─────────────────────────────────────────────
export interface FrictionPattern {
  confusion:   string;
  signal:      string;
  recalibrate: string;
}

export const STOPLIGHT_FRICTION: FrictionPattern[] = [
  {
    confusion:   'Mistaking emotional weather for cosmic instruction',
    signal:      '"I feel anxious, so this must not be the right time." The Stoplight can tell you about conditions — it cannot tell you whether your anxiety is information or noise.',
    recalibrate: 'Ask: Is this feeling pointing to something specific in the situation — or is it a general emotional climate I\'m carrying? The distinction matters.',
  },
  {
    confusion:   'Mistaking environmental energy for personal directive',
    signal:      '"Everyone around me seems excited, so I should be too." Or its reverse: "The mood in the room is heavy, so this must not be the right time to move." Others\' energy is data, not instruction.',
    recalibrate: 'Ask: Is this feeling mine — or am I amplifying what\'s around me? Return to your own Vehicle and Road before acting on an ambient signal.',
  },
  {
    confusion:   'Mistaking Sun sign patterns for current reality',
    signal:      '"I\'m a Libra, so I avoid conflict." The Stoplight describes tendencies — not fixed behaviors. Treating your chart as a fixed identity rather than a map of tendencies removes your agency.',
    recalibrate: 'Use your chart as orientation, not as verdict. The pattern describes a tendency; what you do with it remains a choice.',
  },
  {
    confusion:   'Mistaking urgency for a signal to move',
    signal:      '"I feel like I need to decide now." Urgency is a sensation, not a cosmic direction. External pressure can activate internal urgency without there being any real reason to hurry.',
    recalibrate: 'Return to your Authority. Check your Road. Then check the Stoplight. If all three point toward movement, move. If only the urgency is pushing, that\'s information about the urgency, not the decision.',
  },
];
