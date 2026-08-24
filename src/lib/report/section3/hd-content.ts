/**
 * T3D Report — Human Design Content Library
 *
 * All lookup tables for Section 3: The Vehicle (Pages 10–17).
 * Organized by: Type, Authority, Profile, Center Capacities, Open Terrain, Friction.
 *
 * Copy frame for Pages 11–16:
 *   (45–70 words plain language)
 *   You may recognize this when... (3 short examples)
 *   Watch for... (one friction pattern)
 *   Try this... (one testable response)
 */

// ─── TYPE DATA ────────────────────────────────────────────────────────────────
export interface TypeContent {
  type:      string;
  strategy:  string;
  signature: string; // feeling when aligned
  notSelf:   string; // feeling when misaligned
  plain:     string; // 45-70 words
  recognize: [string, string, string]; // three examples
  watchFor:  string;
  tryThis:   string;
  strategyPractice: string; // one-line strategy instruction
}

export const TYPE_CONTENT: Record<string, TypeContent> = {
  'Manifesting Generator': {
    type:      'Manifesting Generator',
    strategy:  'To Respond — then initiate',
    signature: 'Satisfaction',
    notSelf:   'Frustration',
    plain:     'You carry the Manifestor\'s capacity to initiate and the Generator\'s capacity to sustain. Your energy is abundant, multidirectional, and built to move fast when your gut confirms. You are not built to wait passively — but the sequence matters. Gut first. Then move.',
    recognize: [
      'You find yourself interested in several things at once — and progressing in all of them',
      'Work that lights you up leaves you with more energy than you started with',
      'When you\'re doing the wrong thing, your energy drops faster than seems reasonable',
    ],
    watchFor:  'Initiating from the mind before the gut has confirmed — it produces the right output at the wrong time, which exhausts you.',
    tryThis:   'The next time an opportunity arrives, pause before responding. Notice your gut reaction — not your reasoning about whether it\'s a good idea.',
    strategyPractice: 'Before committing, wait for something to respond to. Then move — and skip the steps your gut says are unnecessary.',
  },
  'Generator': {
    type:      'Generator',
    strategy:  'To Respond',
    signature: 'Satisfaction',
    notSelf:   'Frustration',
    plain:     'Your energy is life\'s most reliable engine — consistent, renewable, and magnetic when it\'s pointed at what genuinely lights you up. The key word is genuine. Forcing, initiating from your mind, or tolerating work that drains you corrodes the engine quietly until it stops.',
    recognize: [
      'The right work energizes you rather than depleting you',
      'A slow, building exhaustion sets in when you\'ve been doing things out of obligation',
      'You\'ve had moments where something arrived and your body reacted before your mind had processed it',
    ],
    watchFor:  'Initiating without a gut response — committing to things because they seem like a good idea rather than because something moved in you.',
    tryThis:   'Notice the difference between a full-body yes and a polite yes. They produce different sensations. The polite one has a slight flatness.',
    strategyPractice: 'Wait for life to offer something — a question, an opportunity, an invitation. Then check your gut before you answer.',
  },
  'Projector': {
    type:      'Projector',
    strategy:  'Wait for the Invitation',
    signature: 'Success',
    notSelf:   'Bitterness',
    plain:     'You are designed to guide, not generate. Your energy is focused and penetrating — built to understand systems and people with unusual depth. But that clarity lands differently depending on whether it was invited. Offered freely, it meets resistance. Invited, it transforms things.',
    recognize: [
      'You understand a situation faster than most people in the room',
      'You feel genuinely depleted after long periods of working in the same way as everyone else',
      'When someone asks your opinion, you suddenly have more clarity than you realized you had',
    ],
    watchFor:  'Sharing your clarity before being invited — even when you can see exactly what\'s needed. The unsolicited offer meets more resistance than the invited one.',
    tryThis:   'The next time you feel the urge to share an insight, pause. Has someone asked? If not, hold it — and notice what happens when the invitation eventually comes.',
    strategyPractice: 'Wait for someone to recognize you and invite your input. Then give it fully, without managing how it\'s received.',
  },
  'Manifestor': {
    type:      'Manifestor',
    strategy:  'To Inform and then Initiate',
    signature: 'Peace',
    notSelf:   'Anger',
    plain:     'You are the only type designed to initiate without waiting. Your energy is impact-oriented and independent. You move first — and others feel the wake of that movement. The resistance you create isn\'t a character flaw. It\'s the wake of a vessel that\'s built to lead. Informing before moving reduces unnecessary friction.',
    recognize: [
      'You\'ve made major decisions before others have started thinking about them',
      'You feel genuinely constrained when required to get permission or build consensus first',
      'When you inform people before you move, things go smoother — even when it feels unnecessary',
    ],
    watchFor:  'Moving without informing — then spending energy managing the resistance that follows, which costs more than the conversation would have.',
    tryThis:   'Before your next major move, tell the people it will affect. Not to ask. Just to bring them along. Notice the difference in what follows.',
    strategyPractice: 'Before initiating, identify who will be impacted. Inform them. Then move freely.',
  },
  'Reflector': {
    type:      'Reflector',
    strategy:  'Wait a Lunar Cycle',
    signature: 'Delight',
    notSelf:   'Disappointment',
    plain:     'You are the rarest type — without consistent energy centers, you sample and amplify the energy of those around you. Your wisdom about any situation deepens across a full lunar cycle. The environment you\'re in shapes how you experience yourself, which makes choosing your environments one of your most important skills.',
    recognize: [
      'You feel noticeably different in different environments — sometimes dramatically so',
      'The same decision can look completely different depending on who you\'re around',
      'You need more time than others to arrive at genuine clarity, and the clarity is worth waiting for',
    ],
    watchFor:  'Deciding during a high-energy moment before the full picture has arrived. The first reaction is never the whole story for you.',
    tryThis:   'Write down your initial response to a current decision. Return to it in one week. Return again at the full moon. Notice what\'s shifted — and what hasn\'t.',
    strategyPractice: 'For major decisions, give yourself at least a full lunar cycle. For minor ones, a week or two. Clarity is cumulative for you.',
  },
};

// ─── AUTHORITY DATA ───────────────────────────────────────────────────────────
export interface AuthorityContent {
  authority:    string;
  mechanism:    string; // how it works (2-3 sentences)
  falseUrgency: string; // the pattern that overrides it
  doList:       string[];
  doNotList:    string[];
  reset:        { title: string; instruction: string; };
}

export const AUTHORITY_CONTENT: Record<string, AuthorityContent> = {
  'Sacral': {
    authority:    'Sacral',
    mechanism:    'Your authority lives in your gut — a pre-verbal body response that says yes or no before your mind has had time to reason. The Sacral speaks in sensations, not sentences. It does not explain itself. It simply moves, or it doesn\'t.',
    falseUrgency: 'The Sacral is routinely overridden by the mind\'s need to appear decisive, reasonable, or available. The real authority is quieter, simpler, and requires you to stop thinking long enough to feel it.',
    doList: [
      'Notice your gut\'s response before your reasoning begins',
      'Ask yes/no questions aloud and feel what moves — or doesn\'t',
      'Follow a full, warm lift or pull — even before you can justify it',
    ],
    doNotList: [
      'Override your Sacral with what you think you should want',
      'Commit from politeness, obligation, or social pressure',
      'Confuse a mental yes with a Sacral yes — they feel different',
    ],
    reset: {
      title:       'The Yes/No Reset',
      instruction: 'Take one pending decision. Ask yourself simple yes/no versions of it aloud — "Should I do X?" Notice what moves in your body before your mind formulates an answer. The Sacral speaks first.',
    },
  },
  'Emotional': {
    authority:    'Emotional Solar Plexus',
    mechanism:    'Your authority is the emotional wave — a natural rhythm of highs and lows your nervous system moves through. Clarity doesn\'t arrive at the peak of excitement or the trough of disappointment. It arrives in the stillness between them, when the wave has settled and a calm knowing remains.',
    falseUrgency: 'You will frequently feel pressure to decide now. This pressure is almost never real. Deciding at the peak of enthusiasm produces the same regret as deciding at the bottom of a low. The wave always looks different at its extremes.',
    doList: [
      'Give yourself time across multiple emotional states before committing',
      'Commit when the feeling is calm, consistent, and quiet — not exciting',
      'Notice when the wave has settled and the knowing is still there',
    ],
    doNotList: [
      'Decide at the height of enthusiasm or the depth of a low',
      'Let others\' timelines override your need for emotional clarity',
      'Mistake emotional neutrality for disinterest — stillness is your signal',
    ],
    reset: {
      title:       'The Wave Wait',
      instruction: 'Write down your current feeling about a pending decision. Mark the date. Return tomorrow and write again. Return after a few days. Decide when the response has been consistent across different emotional states — not when it felt most alive.',
    },
  },
  'Splenic': {
    authority:    'Splenic',
    mechanism:    'Your authority speaks once, quietly, in the first moment of contact with a decision. It does not repeat itself. It does not explain its reasoning. By the time you\'re analyzing, the signal has already arrived — and usually already been overridden.',
    falseUrgency: 'The Splenic signal is consistently buried under the noise of mental analysis. Once you begin thinking through a decision, you\'ve moved past the moment when your authority spoke. The work is retrieval, not deliberation.',
    doList: [
      'Return to the first moment you encountered a decision — before thinking began',
      'Trust quiet, non-verbal knowing even without rational justification',
      'Act on the Splenic signal when it arrives, not after deliberating about it',
    ],
    doNotList: [
      'Override the first quiet signal with subsequent analysis',
      'Wait for the signal to repeat — it won\'t',
      'Expect a feeling of certainty — the Splenic signal is often subtle',
    ],
    reset: {
      title:       'First Signal Retrieval',
      instruction: 'Close your eyes. Return to the moment you first encountered the decision you\'re facing — before you started thinking about it. What did you know in that first instant? That signal is your authority speaking. The analysis that followed was not.',
    },
  },
  'Self-Projected': {
    authority:    'Self-Projected',
    mechanism:    'Your authority lives in your own voice — specifically, in what you hear yourself say when you speak freely about a decision to someone who listens without advising. The clarity does not arrive through thinking. It arrives through speaking. You need to say it out loud to know what you actually think.',
    falseUrgency: 'Mental deliberation produces confusion for this authority, not clarity. The more you think through a decision alone, the more options seem equally valid. You are not built to decide in your own head. You need a witness.',
    doList: [
      'Find a trusted person who will listen without offering advice',
      'Talk through the decision freely and notice what you actually say',
      'Pay attention to the moments when surprising clarity arrives in your own voice',
    ],
    doNotList: [
      'Make major decisions alone in your mind',
      'Ask for advice — you need a witness, not a consultant',
      'Mistake the need to speak with being indecisive',
    ],
    reset: {
      title:       'The Speaking Practice',
      instruction: 'Find one person who will listen without advising. Say everything you\'re thinking and feeling about a current decision — out loud, without editing. Afterward, notice: what did you hear yourself say that surprised you? That is your authority.',
    },
  },
  'Ego': {
    authority:    'Ego (Heart)',
    mechanism:    'Your authority is the will — your genuine desire, your commitment to yourself, what you actually want when you remove social expectation from the equation. The question is not "should I?" The question is "do I want this, and am I willing to fully commit to it?"',
    falseUrgency: 'The Ego authority is consistently confused by obligation and social pressure. "I should want this" is not the same as "I want this." The distinction produces very different outcomes — one sustains, one exhausts.',
    doList: [
      'Ask honestly and directly: do I want this?',
      'Commit fully or not at all — half-hearted commitment doesn\'t work here',
      'Notice the difference between genuine desire and what you think you should desire',
    ],
    doNotList: [
      'Commit because it seems admirable or socially valued',
      'Override genuine desire with obligation or expectation',
      'Confuse willpower with genuine will — they have different qualities',
    ],
    reset: {
      title:       'The Want Test',
      instruction: 'Finish this sentence without editing: "I want to..." Say the first thing that comes. Is it true? Is it what you actually want — or what seems like what you should want? The distance between those two answers is where your authority lives.',
    },
  },
  'None': {
    authority:    'No Inner Authority (Mental)',
    mechanism:    'Your authority is environmental — you don\'t have a single internal signal. Clarity arrives through moving through different environments, conversations, and contexts over time. You are sampling the world. Your sense of what\'s right accumulates from the outside in.',
    falseUrgency: 'Any pressure to decide immediately is almost always false. Your clarity is not internal and not instant — it\'s environmental and cumulative. Rushing the process consistently produces outcomes you later wish you\'d waited on.',
    doList: [
      'Give yourself time across different environments before deciding',
      'Notice what you think, say, and feel in varied contexts',
      'Seek the environments and people that consistently produce clarity for you',
    ],
    doNotList: [
      'Try to find clarity through internal deliberation alone',
      'Make major decisions in a single sitting or conversation',
      'Let others\' timelines override your environmental process',
    ],
    reset: {
      title:       'The Environment Test',
      instruction: 'Take a current decision into three different physical environments — a quiet space, a social one, outdoors. Notice how it feels in each. The clarity you\'re looking for is in the pattern across contexts, not in a single moment of internal certainty.',
    },
  },
  'Lunar': {
    authority:    'Lunar (Reflector)',
    mechanism:    'Your authority is the lunar cycle — twenty-eight days of moving through all sixty-four gates as the Moon transits them. Major decisions deserve a full cycle. Minor ones can be felt across a week or two. Your clarity is cyclical by design.',
    falseUrgency: 'Almost all urgency you encounter is not genuine. Decisions that feel life-or-death immediate rarely are. Your design is built to assess across time, not to respond in the moment.',
    doList: [
      'Wait for the full lunar cycle before committing to major decisions',
      'Note your response to a decision at several points in the cycle',
      'Let clarity accumulate — it is not an event, it\'s a process',
    ],
    doNotList: [
      'Decide in the first emotional response to an opportunity',
      'Let others\' urgency become your urgency',
      'Skip the cycle when external pressure builds',
    ],
    reset: {
      title:       'The Cycle Tracking Practice',
      instruction: 'Pick one pending decision. Write down how you feel about it tonight. Mark the date on a calendar. Return to the note at the new moon, the full moon, and the following new moon. Let the picture develop across the cycle before deciding.',
    },
  },
};

// ─── PROFILE DATA ────────────────────────────────────────────────────────────
export interface ProfileContent {
  profile:      string;
  role:         string; // natural role (concise)
  socialPattern:string; // social learning pattern
  visibility:   string; // relationship to visibility
  plain:        string; // 45-60 words
}

export const PROFILE_CONTENT: Record<string, ProfileContent> = {
  '1/3': {
    profile:       '1/3',
    role:          'The empirical investigator — you build authority through deep research, then test it through direct experience.',
    socialPattern: 'You need a solid foundation of knowledge before you\'re ready to share. Your learning happens through trial and error — what doesn\'t work teaches you as much as what does.',
    visibility:    'You don\'t seek visibility for its own sake. You prefer to know your ground thoroughly before entering the room. Your credibility grows as your experience deepens.',
    plain:         'The 1/3 is built to investigate and experiment. You need to know the foundation deeply, and you discover what works through what doesn\'t — sometimes dramatically. This is not failure. It is how your design gathers the evidence it needs to move forward with genuine authority.',
  },
  '1/4': {
    profile:       '1/4',
    role:          'The foundation builder and networked teacher — you establish deep knowledge, then share it through trusted relationships.',
    socialPattern: 'Your learning is private and thorough. Your influence spreads through the network — people you know, who trust you, who send others.',
    visibility:    'You are not built for broad public platforms. Your reach travels through relationships, further than you can see from where you are.',
    plain:         'The 1/4 builds knowledge carefully and shares it through proximity — through a close, loyal network rather than wide audiences. Security comes from knowing the ground. Influence comes from the people who trust what you\'ve built.',
  },
  '2/4': {
    profile:       '2/4',
    role:          'The natural talent who is called out by relationships — your gifts are often more visible to others than to yourself.',
    socialPattern: 'You need significant alone time to develop and consolidate what you know. Others tend to call you out of your space into roles they can see you in better than you can.',
    visibility:    'You resist being seen — until you\'re called. The calling feels different from general attention. When the right invitation arrives, it tends to feel inevitable.',
    plain:         'The 2/4 has natural gifts it doesn\'t fully recognize, and a network that tends to see those gifts before you do. The hermit in you requires solitude to integrate. The opportunist in you spreads through loyal, trusted relationships.',
  },
  '2/5': {
    profile:       '2/5',
    role:          'The natural who is seen as a solution — others project practical capability onto you, sometimes before you\'re ready.',
    socialPattern: 'You need time alone to develop. When you emerge, others frequently see you as the answer to a problem they\'re carrying. Managing projection is part of your landscape.',
    visibility:    'Visibility comes to you — it is not something you have to seek. The challenge is managing who sees what, and ensuring the projection matches your actual capacity.',
    plain:         'The 2/5 is called out naturally and projected onto practically. People see solutions in you. The solitude you need to develop your gifts is real and non-negotiable — not laziness. The projection field you carry requires deliberate navigation.',
  },
  '3/5': {
    profile:       '3/5',
    role:          'The experiential problem-solver — you discover what works through what doesn\'t, then others see you as the practical answer.',
    socialPattern: 'Your learning is kinetic and experiential. You try things. Some don\'t work. The accumulation of that experience becomes the foundation of genuine practical wisdom.',
    visibility:    'Others project leadership and capability onto you based on what they sense — not always what you\'ve claimed. Your credibility is grounded in lived experience, which people can feel.',
    plain:         'The 3/5 gathers wisdom through trial, error, and resilience. Nothing that didn\'t work was wasted — it was research. Others sense the grounded practicality this produces and project solutions onto you, which creates both opportunity and responsibility.',
  },
  '3/6': {
    profile:       '3/6',
    role:          'The resilient role model — you learn through what doesn\'t work, then eventually live what you\'ve learned.',
    socialPattern: 'Three-phase life: learning (0–30), observation from the roof (30–50), embodied example (50+). Each phase is legitimate and has its own demands.',
    visibility:    'Visibility is uncomfortable in the first phase and grows more natural over time. By the third phase, others look to you as a living example of integration — whether or not you\'ve sought that role.',
    plain:         'The 3/6 runs on two overlapping programs: the 3\'s need to experiment and the 6\'s long arc toward becoming a role model. Your resilience is genuine. Your eventual authority comes not from theory but from having tried things, survived things, and integrated them.',
  },
  '4/6': {
    profile:       '4/6',
    role:          'The networked role model — influence spreads through trusted relationships; wisdom deepens into a living example.',
    socialPattern: 'Your impact is relational. Your network is how your influence travels. By the third phase of life, who you are and how you live carries as much weight as what you say.',
    visibility:    'You don\'t seek the spotlight. Your example is the message. The people closest to you absorb what you embody before you\'ve said a word.',
    plain:         'The 4/6 builds through relationships and matures into example. Others look to you not for your theories but for how you live. The first half of life gathers the material. The second half begins expressing what\'s been integrated.',
  },
  '4/1': {
    profile:       '4/1',
    role:          'The networked investigator — your influence spreads through trusted relationships, grounded in a foundation you\'ve built deeply.',
    socialPattern: 'You build security through knowledge, then your impact travels through your network. You prefer depth with a few to breadth with many. Loyalty runs in both directions.',
    visibility:    'You don\'t seek wide audiences. Your reach travels through the people who trust you, further than you tend to see.',
    plain:         'The 4/1 builds its foundation quietly and lets its network carry its influence. Security comes from knowing the ground deeply. Opportunity comes through the people who already know and trust you — not through outreach or publicity.',
  },
  '5/1': {
    profile:       '5/1',
    role:          'The practical authority — others project solutions onto you and you must be able to deliver on what they see.',
    socialPattern: 'You are a universal figure in people\'s lives — seen as someone who can fix what isn\'t working. That projection requires a real foundation beneath it. The 1\'s investigative depth keeps the 5\'s projection field honest.',
    visibility:    'Visibility is frequently thrust upon you. The challenge is managing projection — ensuring that what others see matches what you can actually deliver, and that your reputation remains intact across encounters.',
    plain:         'The 5/1 carries a projection field that others consistently fill with "this person has the answer." The 1 beneath it is what keeps that true. Your depth of investigation is what makes the heretic\'s projected authority real rather than claimed.',
  },
  '5/2': {
    profile:       '5/2',
    role:          'The called-out solution — you are seen as practical and capable, and called out from your natural solitude to fill that role.',
    socialPattern: 'You need significant alone time to develop. Others see in you a practical capability you may not be conscious of. The calling, when it comes from the right source, often feels like a recognition of something you already know.',
    visibility:    'You resist visibility until called by the right invitation. Once called, your natural talent is more visible to others than to yourself.',
    plain:         'The 5/2 is pulled between solitude and projection. Others see a practical solution in you. You see someone who needs more time alone. Both are true. The right invitation bridges them.',
  },
  '6/2': {
    profile:       '6/2',
    role:          'The embodied example with natural talent — by the third phase of life, how you live becomes the message.',
    socialPattern: 'Three-phase arc toward becoming a living example. Your natural gifts are called out by others who sense something in you before you\'ve claimed it.',
    visibility:    'Visibility was uncomfortable early. By the third phase it becomes something you embody rather than seek. Others look to how you live, not what you say.',
    plain:         'The 6/2 moves through three phases: experimenting (0–30), observing from a higher vantage (30–50), and embodying (50+). Your natural talent is called out throughout. By the final phase, the example you\'ve become is the most useful thing you offer.',
  },
  '6/3': {
    profile:       '6/3',
    role:          'The resilient role model — you learn through what doesn\'t work, then embody what you\'ve integrated.',
    socialPattern: 'You gather wisdom through direct experience, including experiences that fail or hurt. That accumulated resilience is what gives your eventual role-model status its weight.',
    visibility:    'Visibility is uncomfortable in the first phase and grows more natural as your arc completes. By the third phase, your life itself is the teaching.',
    plain:         'The 6/3 runs on a long arc. The 3\'s trial-and-error produces the material. The 6\'s three-phase life integrates it. You are not failing when things don\'t work — you are gathering the only kind of authority that will eventually make your example worth following.',
  },
};

// ─── ALL NINE HD CENTERS ──────────────────────────────────────────────────────
export const ALL_CENTERS = [
  'head', 'ajna', 'throat', 'g_center', 'heart',
  'sacral', 'solar_plexus', 'spleen', 'root',
] as const;

export const CENTER_DISPLAY_NAME: Record<string, string> = {
  head:          'Head',
  ajna:          'Ajna',
  throat:        'Throat',
  g_center:      'Identity (G Center)',
  heart:         'Heart (Ego)',
  sacral:        'Sacral',
  solar_plexus:  'Solar Plexus',
  spleen:        'Spleen',
  root:          'Root',
};

// ─── DEFINED CENTER → LIVED CAPACITY ────────────────────────────────────────
export interface CenterCapacity {
  title:       string;
  description: string;
  centers:     string[]; // which centers contribute to this capacity
}

export const CENTER_CAPACITIES: Record<string, CenterCapacity> = {
  sacral: {
    title:       'Renewable Life Force',
    description: 'A consistent energy source that replenishes when engaged in the right work. Your body knows the difference between aligned effort and forced effort — and communicates that difference clearly.',
    centers:     ['sacral'],
  },
  throat: {
    title:       'Direct Expression',
    description: 'A consistent capacity to translate what you know into voice and action. You are built to speak, to initiate speech, and to have what you say received — when the timing is right.',
    centers:     ['throat'],
  },
  g_center: {
    title:       'Consistent Sense of Direction',
    description: 'A stable inner compass for identity and direction. You have a consistent sense of who you are and where you\'re headed — even when circumstances change.',
    centers:     ['g_center'],
  },
  heart: {
    title:       'Consistent Will',
    description: 'A reliable source of willpower and commitment. When you decide you want something, you can sustain that commitment. The key is ensuring the commitment was genuine before you made it.',
    centers:     ['heart'],
  },
  solar_plexus: {
    title:       'Emotional Intelligence',
    description: 'A consistent emotional nature that moves in waves. You feel things fully and have access to emotional depth. Over time, this produces a nuanced sensitivity to the emotional landscape of situations and people.',
    centers:     ['solar_plexus'],
  },
  spleen: {
    title:       'Physical and Intuitive Intelligence',
    description: 'A finely tuned body sense and timing awareness. You sense what\'s off in an environment, a person, or a situation before you can articulate why. This is information, not anxiety.',
    centers:     ['spleen'],
  },
  root: {
    title:       'Grounded Drive',
    description: 'Consistent access to motivation and adrenaline. You carry a steady internal pressure that moves things forward — when it\'s pointed at what genuinely interests you, it\'s one of your most useful assets.',
    centers:     ['root'],
  },
  ajna: {
    title:       'Consistent Thinking',
    description: 'A stable mental perspective. You process information in a consistent way — once you\'ve arrived at a conclusion, it tends to stay concluded. This gives your thinking a reliable quality.',
    centers:     ['ajna'],
  },
  head: {
    title:       'Sustained Mental Pressure',
    description: 'A consistent drive to think, question, and seek understanding. You experience mental pressure as a constant — the key is directing it toward questions worth answering rather than spinning on what doesn\'t matter.',
    centers:     ['head'],
  },
};

// ─── OPEN CENTER → SENSITIVITY THEME ─────────────────────────────────────────
export interface OpenCenterTheme {
  title:       string;
  sensitivity: string; // what gets amplified
  wisdom:      string; // what the openness eventually produces
  notDefect:   string; // reframe: this is not a problem
  priority:    number; // higher = more impactful theme (for selecting top 3)
}

export const OPEN_CENTER_THEMES: Record<string, OpenCenterTheme> = {
  head: {
    title:       'Amplified Mental Pressure',
    sensitivity: 'You absorb and amplify others\' questions, doubts, and mental pressures. Environments filled with unresolved questions can feel overwhelming — not because you\'re anxious, but because you\'re a receiver.',
    wisdom:      'You become wise at distinguishing which questions are actually worth answering — and which are simply noise someone else generated.',
    notDefect:   'This is not scattered thinking. It is sensitivity to the mental field around you.',
    priority:    2,
  },
  ajna: {
    title:       'Openness to Certainty',
    sensitivity: 'You amplify others\' need to be certain — and may feel pressure to arrive at fixed positions on things you\'re genuinely uncertain about.',
    wisdom:      'You develop a rare comfort with uncertainty and multiple truths. You become wise at holding complexity without collapsing it prematurely.',
    notDefect:   'This is not indecision. It is an ability to hold more than one perspective at once.',
    priority:    2,
  },
  throat: {
    title:       'Variable Expression',
    sensitivity: 'Your ability to speak and be heard varies with context. You may find yourself over-speaking in some environments and going silent in others — absorbing the communication dynamics around you.',
    wisdom:      'You become wise at knowing when expression matters and when silence is more powerful.',
    notDefect:   'This is not inconsistency. It is sensitivity to what a situation needs from you.',
    priority:    3,
  },
  g_center: {
    title:       'Fluid Identity and Direction',
    sensitivity: 'Your sense of self and direction is shaped significantly by your environment and the people in it. The wrong environment or relationships can make you feel lost. The right ones clarify everything.',
    wisdom:      'You develop wisdom about environments and people — you know, deeply, how profoundly they shape you. This becomes a sophisticated navigational sense.',
    notDefect:   'This is not identity confusion. It is environmental sensitivity — which, when understood, becomes a reliable compass.',
    priority:    4,
  },
  heart: {
    title:       'Amplified Willpower',
    sensitivity: 'You absorb others\' drive to prove their worth — and may feel a recurring pressure to justify your value, your effort, or your presence.',
    wisdom:      'The wisdom of this openness is profound: you have nothing to prove. That recognition, once genuinely arrived at, becomes one of your most powerful operating positions.',
    notDefect:   'This is not lack of ambition. It is sensitivity to worth and willpower in your environment.',
    priority:    5,
  },
  solar_plexus: {
    title:       'Emotional Amplification',
    sensitivity: 'You absorb and amplify the emotional states of those around you. Other people\'s feelings can feel like your own — which makes clarity difficult in emotionally charged environments.',
    wisdom:      'You develop an unusually precise ability to read the emotional field of any room. This becomes a sophisticated social intelligence.',
    notDefect:   'This is not over-sensitivity. It is a finely tuned emotional receiver.',
    priority:    5,
  },
  spleen: {
    title:       'Amplified Fear and Attachment',
    sensitivity: 'You tend to amplify others\' fears — particularly around health, security, and belonging. This can show up as difficulty releasing what\'s no longer serving you.',
    wisdom:      'The wisdom of this openness is in understanding what attachment truly costs — and developing a finely calibrated sense of what\'s worth holding and what isn\'t.',
    notDefect:   'This is not fearfulness. It is sensitivity to what others need to feel safe.',
    priority:    3,
  },
  root: {
    title:       'Absorbed Pressure',
    sensitivity: 'You absorb and amplify others\' stress and urgency. When you\'re around pressured people, their pressure can feel like your own — which can drive you to resolve things quickly in order to relieve a stress that was never originally yours.',
    wisdom:      'You become wise at discerning genuine urgency from transmitted urgency — learning to ask whose pressure you\'re actually feeling before you act on it.',
    notDefect:   'This is not anxiety-proneness. It is sensitivity to the pressure field around you.',
    priority:    4,
  },
};

// ─── NOT-SELF VOICE (by type) ─────────────────────────────────────────────────
export const NOT_SELF_VOICE: Record<string, string[]> = {
  'Manifesting Generator': [
    '"I\'ll push through — I just need to keep going."',
    '"I committed to this, so I should finish it."',
    '"I should want this — it\'s a good opportunity."',
  ],
  'Generator': [
    '"I said I would, so I\'m doing it."',
    '"I\'ll wait until it\'s done to see how I feel."',
    '"This is fine. I just need to push through."',
  ],
  'Projector': [
    '"They\'re not doing it right — I can see exactly what\'s needed."',
    '"If I don\'t say something now, the moment will pass."',
    '"Why won\'t anyone ask me? I can see what\'s missing."',
  ],
  'Manifestor': [
    '"I shouldn\'t have to explain myself."',
    '"If I tell them first, they\'ll just slow me down."',
    '"They\'re in the way again."',
  ],
  'Reflector': [
    '"I need to decide now — waiting makes me look indecisive."',
    '"Everyone else knows what they want. What\'s wrong with me?"',
    '"This feels right today — I should commit before it changes."',
  ],
};

// ─── AUTHORITY DISTORTION (by authority) ─────────────────────────────────────
export const AUTHORITY_DISTORTION: Record<string, string> = {
  'Sacral':          'Committing from the mind — talking yourself into what seems reasonable rather than following what your gut actually moved toward.',
  'Emotional':       'Deciding at the peak of enthusiasm or the trough of a low — and then having to manage the consequences of a choice made at the extreme of a wave.',
  'Splenic':         'Overriding the first quiet signal with subsequent reasoning — arriving at a decision after the authority has already spoken and been ignored.',
  'Self-Projected':  'Deliberating alone — going over the decision internally until all options seem equal, when what you actually needed was to speak it out.',
  'Ego':             'Confusing obligation with genuine desire — committing to what seems admirable or expected rather than what you actually want.',
  'None':            'Deciding in a single environment or emotional state — without the cumulative environmental sampling your authority requires.',
  'Lunar':           'Deciding during a high-energy moment or under external pressure — before the lunar cycle has had time to reveal the full picture.',
};
