/**
 * T3D Report — Road (Numerology) Content Library
 *
 * All lookup tables for Section 4: The Road (Pages 18–25).
 * Life Path interpretations follow the copy frame:
 *   — Plain language (45–70 words)
 *   — You may recognize this when... (3 examples)
 *   — Watch for... (shadow / friction)
 *   — Try this... (one testable response)
 *
 * Pinnacle and Challenge content: brief, practical, reframed as terrain.
 *
 * Technical note: compound numbers (e.g., 34/7) are computed in the
 * route and stored in ReportData. This file contains only content.
 */

// ─── LIFE PATH CONTENT ────────────────────────────────────────────────────────
export interface LifePathContent {
  number:     number;
  name:       string;   // the archetype name
  direction:  string;   // core direction (1 sentence)
  plain:      string;   // 45-70 words
  recognize:  [string, string, string];
  watchFor:   string;
  tryThis:    string;
  gifts:      string[];
  shadow:     string;
  overreach:  string;
  underexpression: string;
  borrowed:   string;   // "borrowed expectations" pattern
  reset:      { title: string; instruction: string };
}

export const LIFE_PATH_CONTENT: Record<number, LifePathContent> = {
  1: {
    number:    1,
    name:      'The Pioneer',
    direction: 'A life of self-definition, independence, and original direction — you are here to forge the path, not follow one.',
    plain:     'You carry the energy of initiation. Your growth arrives through the courage to lead — to define yourself by your own standards rather than inherited ones. When you\'re living the 1 fully, you don\'t need permission to begin. The challenge is staying open to support without interpreting it as dependence.',
    recognize: [
      'You\'ve felt most alive when doing something that hadn\'t been done before — in your family, your industry, or your own life',
      'Waiting for consensus or approval produces a particular kind of frustration in you',
      'You often see the direction clearly before others can articulate the problem',
    ],
    watchFor:  'Leadership from ego rather than vision — needing to be first rather than being effective. Isolation disguised as independence.',
    tryThis:   'Name one area where you\'re waiting for permission to lead that you\'ve already earned.',
    gifts:     ['Independence', 'Courage', 'Originality', 'The capacity to begin'],
    shadow:    'Stubbornness, isolation, difficulty receiving — the strengths of self-reliance pushed past their useful edge.',
    overreach: 'Needing to be right more than needing to be effective. Turning every conversation into a leadership moment.',
    underexpression: 'Waiting in the background to avoid conflict. Shrinking the scope of what you\'re willing to attempt.',
    borrowed:  'Building someone else\'s definition of success and calling it ambition.',
    reset: {
      title:       'The Permission Audit',
      instruction: 'List one thing you\'ve been waiting to begin. Ask: "Whose permission am I actually waiting for?" Then ask whether that person has the authority to grant it.',
    },
  },

  2: {
    number:    2,
    name:      'The Diplomat',
    direction: 'A life of partnership, sensitivity, and cooperative intelligence — you learn through relationship and teach through listening.',
    plain:     'Your power lives in the space between people — in what you sense, balance, and make possible through presence. The 2 doesn\'t lead from the front; it leads through understanding. Your sensitivity is not a liability. It is a finely calibrated instrument that others rely on even when they don\'t acknowledge it.',
    recognize: [
      'You often sense what someone needs before they say it — and feel the weight of whether to offer it or hold back',
      'Relationships are where you learn the most about yourself — often uncomfortably so',
      'Conflict pulls your energy in multiple directions at once, even when the conflict isn\'t yours',
    ],
    watchFor:  'People-pleasing until there\'s nothing left of your own position. Mistaking peace-keeping for peace-making.',
    tryThis:   'Notice the difference between what you want and what you\'ve agreed to want. Write one down.',
    gifts:     ['Intuition', 'Patience', 'Diplomacy', 'Emotional intelligence'],
    shadow:    'Over-dependence, difficulty asserting needs, suppressing friction in relationships until it erupts.',
    overreach: 'Dissolving into another person\'s reality. Making yourself responsible for others\' emotional states.',
    underexpression: 'Maintaining emotional distance to avoid being needed — which produces loneliness rather than safety.',
    borrowed:  'Keeping relationships and situations together that no longer serve, out of fear of being alone.',
    reset: {
      title:       'The Need Statement',
      instruction: 'Identify one thing you\'ve been wanting in a current relationship that you haven\'t asked for. Say it plainly to yourself first, then decide whether to say it to the other person.',
    },
  },

  3: {
    number:    3,
    name:      'The Communicator',
    direction: 'A life of creative expression, joy, and articulation — you are here to give voice to what others feel but cannot say.',
    plain:     'The 3 is built to express. Not to perform — to genuinely translate internal experience into something others can receive. Your creativity is not decoration; it is the medium through which your intelligence moves. When you suppress or over-edit yourself, the energy that was meant to create turns inward and becomes scattered or melancholy.',
    recognize: [
      'You\'ve found yourself carrying an emotion or idea that felt unbearable — until you said it, wrote it, or made something from it',
      'Social connection energizes you until it doesn\'t — and the line between the two isn\'t always visible in advance',
      'You have a tendency toward self-criticism that isn\'t always audible to others but is almost constant internally',
    ],
    watchFor:  'Performing rather than expressing. Using humor, charm, or social ease to avoid the depth that actually wants to come through.',
    tryThis:   'Create something this week without an audience in mind. Not for feedback — for the making of it.',
    gifts:     ['Creativity', 'Wit', 'Emotional expression', 'The ability to uplift'],
    shadow:    'Scattered energy, emotional avoidance through performance, self-criticism that suppresses expression at the source.',
    overreach: 'Entertaining as a substitute for being honest. Expressing what will be received rather than what is true.',
    underexpression: 'Choosing safety over authentic voice. Waiting until something is perfect before releasing it.',
    borrowed:  'Performing the version of yourself that gets the best response rather than the most honest one.',
    reset: {
      title:       'The Unedited Page',
      instruction: 'Write for ten minutes without stopping. Don\'t read it back. Don\'t edit. Let the 3 speak without your approval. Notice what arrived that you wouldn\'t have planned.',
    },
  },

  4: {
    number:    4,
    name:      'The Builder',
    direction: 'A life of foundation, discipline, and methodical mastery — what you build lasts precisely because the process was patient.',
    plain:     'The 4 learns through the work itself — through sustained, careful effort applied over time. Your power is not in speed; it\'s in reliability. You can take an abstract vision and turn it into something that actually stands. The shadow of the 4 is not laziness — it\'s overwork that mistakes effort for progress, and rigidity that confuses structure with safety.',
    recognize: [
      'You can see the practical steps needed to accomplish something while others are still talking about why it might not work',
      'You\'ve stayed in structures — jobs, relationships, plans — longer than was productive because leaving felt like abandoning something real',
      'When things feel chaotic, your instinct is to organize — and that instinct is usually right, but not always welcome',
    ],
    watchFor:  'Building what you were told to build rather than what you actually believe in. Confusing obedience with integrity.',
    tryThis:   'Identify one structure in your life — a routine, a commitment, a plan — that you\'re maintaining out of habit rather than intention. Decide consciously to keep it or release it.',
    gifts:     ['Reliability', 'Practicality', 'Discipline', 'The ability to bring vision to ground'],
    shadow:    'Rigidity, overwork, resistance to change, suppressing spontaneity in service of consistency.',
    overreach: 'Working without questioning what you\'re building or why. Productivity as a substitute for meaning.',
    underexpression: 'Refusing to begin because the outcome isn\'t guaranteed. Waiting for the perfect conditions that will never arrive.',
    borrowed:  'Building someone else\'s definition of stability and calling it your own foundation.',
    reset: {
      title:       'The Foundation Question',
      instruction: 'Name the most important thing you\'re currently building. Then ask: "Is this mine to build, or did I inherit this project from someone else\'s expectations?" Let the answer be what it is.',
    },
  },

  5: {
    number:    5,
    name:      'The Explorer',
    direction: 'A life of freedom, adaptability, and multisensory experience — you are here to be changed by what you encounter and to carry that changeability forward.',
    plain:     'The 5 moves. That\'s not a character trait — it\'s a design specification. Your growth comes from variety, from encountering the full spectrum of human experience, from releasing what has been fully absorbed and moving toward what hasn\'t. The shadow of the 5 is mistaking movement for growth — skipping from one thing to the next before the lesson of the current one has landed.',
    recognize: [
      'You\'ve had phases where you wanted to leave everything and start over — sometimes that was avoidance, sometimes it was wisdom, and distinguishing the two is ongoing work',
      'Boredom is genuinely painful for you, not merely uncomfortable',
      'You learn from experience more reliably than from instruction — you need to encounter something to understand it',
    ],
    watchFor:  'Using freedom as an escape route. Leaving before the lesson completes because the discomfort of staying feels like a sign to go.',
    tryThis:   'Identify one thing you\'ve been thinking about leaving. Ask: "What have I not yet learned here?" Stay until you have the answer.',
    gifts:     ['Adaptability', 'Curiosity', 'Communication', 'The ability to release what no longer serves'],
    shadow:    'Restlessness, inconsistency, commitment avoidance, using sensation as a substitute for depth.',
    overreach: 'Seeking novelty to avoid intimacy. Moving past experiences before they can change you.',
    underexpression: 'Staying in situations out of obligation until the suppressed need for change erupts — and then overcorrecting.',
    borrowed:  'Performing stability for others while privately running out of the room.',
    reset: {
      title:       'The Completion Check',
      instruction: 'Name one thing you\'re currently considering leaving. Ask: "Am I done here — or am I just uncomfortable?" If uncomfortable: stay one more week. If done: what is the one thing you need to say or complete before you go?',
    },
  },

  6: {
    number:    6,
    name:      'The Nurturer',
    direction: 'A life of responsibility, harmony, and beauty — you are here to create conditions where others can thrive, while learning the cost of doing this without reciprocity.',
    plain:     'The 6 has an orientation toward care that runs deep. Your aesthetic sense, your capacity for loyalty, your attentiveness to what others need — these are not small things. The tension is in discovering that giving without receiving produces a specific exhaustion that looks like virtue from the outside but feels like depletion from inside.',
    recognize: [
      'You\'ve taken responsibility for situations that weren\'t originally yours to manage',
      'You notice when something is beautiful or broken — and feel a pull to either protect it or fix it',
      'Relationships where there\'s no genuine reciprocity drain you faster than you admit',
    ],
    watchFor:  'Perfectionism as a way of maintaining control. Giving so much that withdrawal becomes the only way to protect yourself.',
    tryThis:   'Name one relationship or situation where you\'re giving more than you\'re receiving. Ask: "Is this sustainable — or is this martyrdom in disguise?"',
    gifts:     ['Nurturing', 'Aesthetic intelligence', 'Responsibility', 'Capacity for deep loyalty'],
    shadow:    'Perfectionism, martyrdom, control disguised as care, confusing what you want with what others need.',
    overreach: 'Taking on burdens that belong to others. Making yourself responsible for outcomes you cannot control.',
    underexpression: 'Refusing to commit to relationship or community to protect yourself from the vulnerability of actually caring.',
    borrowed:  'Defining your worth by how much others depend on you — and then resenting the dependence.',
    reset: {
      title:       'The Reciprocity Audit',
      instruction: 'List three relationships that are currently active in your life. Next to each, note whether the flow of care is roughly mutual, or whether one person is consistently giving and the other receiving. Don\'t fix it yet. Just see it clearly.',
    },
  },

  7: {
    number:    7,
    name:      'The Seeker',
    direction: 'A life of investigation, depth, and wisdom through solitude — you are here to understand what others overlook, and to trust that depth is the point.',
    plain:     'The 7 moves inward before it moves outward. Your intelligence is investigative — you need to understand the root of things, not just the surface presentation. Solitude is not a problem you have; it\'s a resource you need. The shadow is using analysis as armor, and calling intellectual distance "discernment" when it\'s actually protection.',
    recognize: [
      'You\'ve often known something was off before you could explain it — and been right',
      'Shallow conversations drain you faster than silence does',
      'You need time alone to process experiences before you can speak about them meaningfully',
    ],
    watchFor:  'Retreating into the mind as a way to avoid the risk of being known. Mistaking analysis for wisdom — which requires being changed, not just being right.',
    tryThis:   'Notice one thing you\'ve been thinking about for a long time without sharing. Decide whether it\'s unready — or whether you\'re protecting yourself.',
    gifts:     ['Analysis', 'Intuition', 'Wisdom through depth', 'The ability to see what others miss'],
    shadow:    'Isolation, cynicism, emotional distance, using analysis as a defense against intimacy.',
    overreach: 'Withholding to maintain the position of observer. Never committing to a direction because something might still be ununderstood.',
    underexpression: 'Hiding depth to appear more accessible. Suppressing the need for solitude out of guilt.',
    borrowed:  'Performing sociability and availability while internally counting the minutes until you can be alone.',
    reset: {
      title:       'The Depth Offer',
      instruction: 'Share one insight you\'ve been holding privately with one person who you trust won\'t dismiss it. Not to convince them — just to practice letting what you know be seen.',
    },
  },

  8: {
    number:    8,
    name:      'The Authority',
    direction: 'A life of power, material mastery, and executive capacity — you are here to build and lead significant endeavors, and to learn that real authority comes from integrity rather than force.',
    plain:     'The 8 is designed to operate at scale — to build organizations, manage resources, and lead with executive clarity. The challenge is learning that real authority is given, not seized. When the 8 tries to control outcomes rather than earn trust, it produces the friction that most limits its effectiveness.',
    recognize: [
      'You think naturally in terms of strategy, resource, and long-term outcomes — the scope of most conversations feels small to you',
      'You\'ve been accused of being too driven or too focused on results at the expense of relationships',
      'The question of worth — who deserves what, and whether you\'re being properly compensated or recognized — is one that recurs',
    ],
    watchFor:  'Confusing control with authority. Equating financial accumulation or position with actual power, which moves independently of both.',
    tryThis:   'Identify one situation where you\'re managing rather than leading. Ask what would happen if you trusted the people in the room.',
    gifts:     ['Leadership', 'Strategic thinking', 'The ability to manifest at scale', 'Executive capacity'],
    shadow:    'Control, materialism, ruthlessness, equating worth with achievement or accumulation.',
    overreach: 'Pursuing power for its own sake. Managing rather than leading. Confusing what you own or control with who you are.',
    underexpression: 'Shrinking from positions of real authority out of fear of the cost. Giving power away and then resenting those who hold it.',
    borrowed:  'Working within someone else\'s definition of success so long that you mistake it for your own ambition.',
    reset: {
      title:       'The Real Power Question',
      instruction: 'Name one area where you\'re exerting control. Ask: "Is this control producing the result I actually want — or am I maintaining it because letting go feels like losing?" The answer will be instructive.',
    },
  },

  9: {
    number:    9,
    name:      'The Sage',
    direction: 'A life of completion, wisdom, and compassionate release — you are here to serve the long arc, and to discover that the more you give from fullness, the more returns.',
    plain:     'The 9 carries a wide-angle lens. Your compassion extends naturally beyond the personal — you feel the weight of the collective, the long timeline, the people who are not in the room. The paradox of the 9 is that the wisdom you\'re here to offer only flows when you\'re full. Service from depletion is not the path — it is the shadow.',
    recognize: [
      'You carry concerns that extend well beyond your immediate circumstances — the world, systems, people you\'ll never meet',
      'You have difficulty releasing things that have run their course — relationships, projects, identities — even when you know it\'s time',
      'Your compassion sometimes extends to everyone except yourself',
    ],
    watchFor:  'Martyrdom disguised as generosity. Giving past the point where giving is sustainable, and resenting the people you chose to give to.',
    tryThis:   'Identify one thing you\'ve been holding on to past its natural end. Ask what you would need to believe in order to release it.',
    gifts:     ['Compassion', 'Wisdom', 'The capacity to see the long arc', 'Humanitarian perspective'],
    shadow:    'Martyrdom, bitterness, difficulty releasing what has run its course, giving from depletion.',
    overreach: 'Sacrificing self to the point of emptiness. Choosing others consistently over yourself and calling it virtue.',
    underexpression: 'Withholding wisdom and compassion out of fear of being taken advantage of, or out of exhaustion.',
    borrowed:  'Carrying the weight of a family system, a cultural expectation, or a community need that isn\'t yours to carry alone.',
    reset: {
      title:       'The Release Inventory',
      instruction: 'List three things — a relationship, a project, a role, an identity — that you suspect have run their natural course. For each one, ask: "What am I afraid will happen if I let this go?" The answer is where the work actually is.',
    },
  },

  11: {
    number:    11,
    name:      'The Illuminator',
    direction: 'A Master Path of spiritual insight, heightened sensitivity, and the capacity to inspire — you are here to carry and translate a frequency that others feel but cannot name.',
    plain:     'The 11 is not lived through ambition — it is lived through alignment. Your sensitivity is not weakness; it is the instrument through which you receive and transmit something that doesn\'t have a straightforward name. When you try to force this into conventional success structures, the mismatch produces a specific kind of anxiety that no amount of achievement resolves.',
    recognize: [
      'You\'ve been called "intense" or "too much" in contexts where you were simply being present',
      'You often sense the emotional undercurrent of situations that others only notice after the fact',
      'There is a gap between the life you feel called to and the life that seems legible to the people around you',
    ],
    watchFor:  'Performing spirituality rather than embodying it. Trying to inspire rather than simply being — the 11 is felt before it is heard.',
    tryThis:   'In one conversation this week, resist the urge to explain or enlighten. Be present without an agenda. Notice what the other person receives.',
    gifts:     ['Spiritual sensitivity', 'Intuition', 'The capacity to inspire and illuminate', 'Emotional precision'],
    shadow:    'Anxiety, over-idealism, nervous exhaustion, reducing to a 2 when the 11 frequency feels too large to hold.',
    overreach: 'Living so far ahead of the room that no one can receive what you\'re offering. Inspiration without grounding.',
    underexpression: 'Shrinking to a 2 to feel more ordinary. Playing small to avoid the intensity of your own frequency.',
    borrowed:  'Trying to be legible to people who don\'t have the capacity to receive what you actually are.',
    reset: {
      title:       'The Frequency Check',
      instruction: 'Close your eyes and ask: "Am I living at 2 or at 11 right now?" The 2 feels like managing, accommodating, shrinking. The 11 feels like presence — sometimes uncomfortable, but real. What would it take to take one step toward the 11 today?',
    },
  },

  22: {
    number:    22,
    name:      'The Master Builder',
    direction: 'A Master Path of large-scale vision and disciplined building — you are here to translate extraordinary possibility into lasting, functional structure.',
    plain:     'The 22 operates at a scope most people don\'t attempt. Your design is to build things that outlive your personal timeline — systems, organizations, works that carry forward. The challenge is that this scope requires an unusual tolerance for complexity and failure, and a capacity to serve something larger than your own recognition.',
    recognize: [
      'You think naturally at the level of systems, not just tasks — the architecture of things rather than the pieces',
      'You\'ve had visions for what could be built that felt almost too large to say aloud',
      'When you\'re living at the 4 rather than the 22, something feels persistently small — like you\'re doing the right work at the wrong scale',
    ],
    watchFor:  'Trying to build everything rather than the next thing. Overreaching out of urgency and producing the thing the 4 could have built more durably.',
    tryThis:   'Identify the one project or endeavor that, if you built it well, would matter most. Then ask: "Am I building this — or am I building around it?"',
    gifts:     ['Vision at scale', 'Discipline', 'The ability to translate possibility into structure', 'Legacy-oriented thinking'],
    shadow:    'Overreaching ambition, perfectionism, carrying more than is sustainable, collapsing into 4.',
    overreach: 'Trying to do everything at the level the 22 can reach — which produces neither the 22\'s scope nor the 4\'s reliability.',
    underexpression: 'Avoiding the full scope of your design. Reducing to a 4 and building carefully but small.',
    borrowed:  'Accepting a version of your life that other people can understand, when what you\'re actually built to do is harder to explain.',
    reset: {
      title:       'The Scale Question',
      instruction: 'Identify what you\'re currently building. Ask: "Am I building this at the scale it deserves — or have I made it smaller so it\'s more manageable?" Then ask what it would cost to build it at full scale.',
    },
  },

  33: {
    number:    33,
    name:      'The Master Teacher',
    direction: 'The rarest Master Path — a life of compassionate service, creative mastery, and teaching through the living example of integration.',
    plain:     'The 33 is not about what you teach — it is about what you embody. Your presence carries weight that extends beyond your words. The challenge is learning to receive care as well as give it, and to recognize that sustainable service comes from fullness, not from self-sacrifice. When the 33 is lived from depletion, it serves no one.',
    recognize: [
      'Others frequently bring you their most vulnerable questions — not because you advertised yourself as an expert, but because something about your presence suggests you can hold it',
      'The quality of compassion you offer is not always returned in kind, which creates a particular kind of loneliness',
      'You feel most alive when you\'re in genuine service — but the wrong kind of service leaves you emptier than when you started',
    ],
    watchFor:  'Self-sacrifice mistaken for virtue. Giving so much that what you offer eventually has nothing to carry it.',
    tryThis:   'Identify one person in your life who is genuinely capable of caring for you. Let them do it for one week without deflecting.',
    gifts:     ['Compassion', 'Creative mastery', 'The ability to carry others through transformation', 'Teaching through embodiment'],
    shadow:    'Self-sacrifice to the point of collapse, martyrdom, carrying the weight of others without allowing yourself to receive.',
    overreach: 'Taking on the suffering of everyone within reach. Making yourself responsible for healing what you cannot heal.',
    underexpression: 'Withdrawing from service entirely to protect yourself from depletion — and losing the sense of purpose that makes life feel meaningful.',
    borrowed:  'Serving from obligation or fear rather than genuine capacity. Giving what you don\'t have because you believe you should.',
    reset: {
      title:       'The Receiving Practice',
      instruction: 'For one week, let someone help you with something you would normally handle alone. Notice the discomfort — and notice what it costs you to allow it. That discomfort is where your recalibration is.',
    },
  },
};

// ─── PINNACLE THEMES ──────────────────────────────────────────────────────────
export const PINNACLE_THEMES: Record<number, { theme: string; terrain: string }> = {
  1: { theme: 'Independence and Origination', terrain: 'A phase that calls for defining your own direction. The learning is in stepping into leadership without waiting for permission.' },
  2: { theme: 'Partnership and Sensitivity', terrain: 'A phase in which relationships teach the most. Patience, diplomacy, and collaboration are the primary curriculum.' },
  3: { theme: 'Creative Expression', terrain: 'A phase that asks for genuine expression. What you communicate — through work, relationships, or art — carries more weight than usual.' },
  4: { theme: 'Building and Foundation', terrain: 'A phase of methodical construction. What you commit to and build during this period becomes foundational infrastructure for what follows.' },
  5: { theme: 'Change and Expansion', terrain: 'A phase marked by movement and variety. Adaptability is the skill most rewarded. Holding too tightly to what was produces friction.' },
  6: { theme: 'Responsibility and Relationships', terrain: 'A phase in which home, family, community, and close relationships take center stage. Service and care are the recurring themes.' },
  7: { theme: 'Reflection and Inner Development', terrain: 'A phase that rewards solitude, investigation, and depth. The growth is internal first. External expansion follows later.' },
  8: { theme: 'Material Mastery and Authority', terrain: 'A phase in which professional and material concerns move to the foreground. Real authority — earned through integrity — is what this phase tests.' },
  9: { theme: 'Completion and Release', terrain: 'A phase of endings, harvesting, and integration. What no longer serves is meant to be released. What has been built is ready to be assessed.' },
  11: { theme: 'Heightened Intuition and Spiritual Development', terrain: 'A phase of amplified sensitivity and unusual insight. The learning is in trusting what you sense before you can explain it.' },
  22: { theme: 'Large-Scale Building', terrain: 'A phase in which vision and discipline converge. What you build during this period has unusual reach and durability.' },
};

// ─── CHALLENGE THEMES ─────────────────────────────────────────────────────────
export const CHALLENGE_THEMES: Record<number, { terrain: string; skill: string; reframe: string }> = {
  0: {
    terrain: 'The terrain of all challenges — a recurring call to integrate every number\'s lesson without the dominance of any single one.',
    skill:   'Wholeness. The ability to draw on any number\'s quality when it is called for.',
    reframe: 'This is not the absence of a challenge — it is the challenge of everything. The 0 asks for unusual breadth.',
  },
  1: {
    terrain: 'A recurring invitation to trust your own direction over others\' expectations. The terrain of self-definition.',
    skill:   'Independence without isolation. Acting from your own center while remaining in genuine relationship.',
    reframe: 'The difficulty here is not weakness — it is the friction of becoming your own authority in a world that often wants you to defer.',
  },
  2: {
    terrain: 'A recurring invitation to remain in relationship without losing yourself to it. The terrain of balanced partnership.',
    skill:   'Interdependence. The ability to be close without being absorbed, to give without disappearing.',
    reframe: 'The sensitivity that makes this terrain difficult is the same quality that makes you unusually perceptive in relationship.',
  },
  3: {
    terrain: 'A recurring invitation to express authentically rather than perform safely. The terrain of genuine voice.',
    skill:   'Self-expression without over-editing. Speaking and creating from your actual experience rather than managing others\' responses.',
    reframe: 'The self-criticism that makes this terrain difficult is proportionate to the depth of what wants to come through.',
  },
  4: {
    terrain: 'A recurring invitation to build steadily and patiently without rigidity. The terrain of disciplined commitment.',
    skill:   'Consistent effort without the suppression of spontaneity. Discipline that serves, not discipline that controls.',
    reframe: 'What feels like difficulty here is the tension between your capacity for sustained work and your resistance to being defined by it.',
  },
  5: {
    terrain: 'A recurring invitation to embrace change without becoming addicted to it. The terrain of adaptive freedom.',
    skill:   'Change that integrates rather than escapes. The ability to move on at the right time, not just when staying becomes uncomfortable.',
    reframe: 'The restlessness that makes this terrain difficult is an intelligence — it is pointing toward real movement, not just the avoidance of stillness.',
  },
  6: {
    terrain: 'A recurring invitation to take responsibility without over-responsibility. The terrain of healthy care.',
    skill:   'Nurturing that sustains both giver and receiver. Learning which things are genuinely yours to carry.',
    reframe: 'The over-giving tendency here is not a character flaw — it is a calibration that\'s slightly off. The care is real; the question is which targets deserve it.',
  },
  7: {
    terrain: 'A recurring invitation to trust depth without retreating entirely into the interior. The terrain of wisdom and openness.',
    skill:   'Investigation without withdrawal. The capacity to go deep and return — to let what you\'ve found inside change how you engage outside.',
    reframe: 'The distance this terrain produces is a version of self-protection. The question is whether what you\'re protecting is actually at risk.',
  },
  8: {
    terrain: 'A recurring invitation to build power and authority without abusing either. The terrain of effective leadership.',
    skill:   'Authority that is earned rather than seized. The capacity to lead from integrity rather than force.',
    reframe: 'What looks like ambition here is often an attempt to compensate for an underlying uncertainty about worth. Real power doesn\'t need that compensation.',
  },
};

// ─── ATTITUDE NUMBER DESCRIPTIONS ────────────────────────────────────────────
export const ATTITUDE_DESCRIPTIONS: Record<number, string> = {
  1:  'You meet new situations with the stance of a leader or initiator — others often sense your direction before you\'ve said a word. First impressions tend toward confidence, even when you don\'t feel it.',
  2:  'You meet new situations with attentiveness and receptivity — others often experience you as perceptive and easy to trust. First impressions lean toward diplomacy and quiet awareness.',
  3:  'You meet new situations with warmth and social intelligence — others often experience you as engaging and expressive. First impressions carry an energy that makes people feel welcome.',
  4:  'You meet new situations with practicality and groundedness — others often experience you as dependable and thorough. First impressions communicate that you\'re not going to cut corners.',
  5:  'You meet new situations with curiosity and adaptability — others often experience you as energetic and interesting. First impressions convey openness to what\'s possible.',
  6:  'You meet new situations with warmth and aesthetic attentiveness — others often experience you as caring and visually aware. First impressions communicate responsibility and trustworthiness.',
  7:  'You meet new situations with quiet observation — others often experience you as thoughtful and discerning. First impressions may seem reserved, which often makes people want to know what you\'re actually thinking.',
  8:  'You meet new situations with authority and executive presence — others often sense competence before you\'ve demonstrated it. First impressions carry weight whether or not you intend them to.',
  9:  'You meet new situations with compassion and perspective — others often experience you as wise or understanding. First impressions convey depth and an absence of judgment.',
  11: 'You meet new situations with unusual sensitivity — others often feel something from your presence before they understand what it is. First impressions carry an intensity that can feel like recognition.',
  22: 'You meet new situations with quiet gravitas — others often sense that you\'re thinking at a different scale. First impressions suggest capacity without the need for elaboration.',
};

// ─── BIRTHDAY NUMBER DESCRIPTIONS ────────────────────────────────────────────
export const BIRTHDAY_DESCRIPTIONS: Record<number, string> = {
  1:  'An initiating daily stance. You bring the energy of beginning and direction into ordinary interactions.',
  2:  'A cooperative daily stance. You bring attentiveness, patience, and the capacity for genuine partnership.',
  3:  'An expressive daily stance. You bring creativity, warmth, and a natural ability to connect.',
  4:  'A grounding daily stance. You bring reliability, practicality, and a commitment to what actually works.',
  5:  'An adaptive daily stance. You bring curiosity, flexibility, and an orientation toward possibility.',
  6:  'A nurturing daily stance. You bring care, aesthetic awareness, and a commitment to quality.',
  7:  'An investigative daily stance. You bring depth, discernment, and an orientation toward meaning.',
  8:  'An authoritative daily stance. You bring executive presence, clarity, and a focus on results.',
  9:  'A compassionate daily stance. You bring perspective, generosity, and a long view of what matters.',
  10: 'A pioneering independence expressed through connection — the 1 energy with a cooperative undertone.',
  11: 'Heightened intuition in daily interaction. Your presence carries sensitivity that others often feel as reassurance.',
  12: 'Creative leadership in daily stance — the ability to inspire others toward expression and collaboration.',
  13: 'The capacity to build through disciplined creativity — ideas that become real things.',
  14: 'Adaptability grounded in practicality — the freedom to move paired with the discipline to produce.',
  15: 'Responsibility expressed through creativity — care for others through what you make and communicate.',
  16: 'The investigative mind applied to responsibility — deep thinking in service of what matters to those around you.',
  17: 'Authority through investigation — the ability to lead from knowledge rather than position.',
  18: 'Compassion at scale — humanitarian awareness expressed through personal relationships.',
  19: 'Original leadership with broad compassion — the pioneer who remembers who they\'re pioneering for.',
  20: 'Cooperative sensitivity at its most refined — intuition and patience operating in concert.',
  21: 'Creative partnership — the capacity to express and build alongside others.',
  22: 'The Master Builder stance — a daily orientation toward what can be constructed to last.',
  23: 'Creative freedom — the communicator with the adaptability to speak to many different contexts.',
  24: 'Building through relationship — the capacity to construct enduring things in cooperation with others.',
  25: 'Partnership through depth — the ability to build intimacy and trust through genuine investigation.',
  26: 'Responsibility at scale — the nurturer with executive capacity.',
  27: 'Humanitarian wisdom — the sage who serves through depth and perspective.',
  28: 'Cooperative authority — leadership grounded in relationship and trust.',
  29: 'Sensitive idealism — the 11 expressed through cooperation and partnership.',
  30: 'Pure creative expression — the 3 undiluted, with all its gifts and challenges.',
  31: 'Expressive foundation — creativity that produces something that actually lasts.',
};
