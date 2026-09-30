/**
 * T3D Advanced Sovereign Report — Road (Numerology) Content Library
 *
 * Content for the Advanced Road section's deepened topics: Inner Drivers
 * (Destiny/Expression, Soul Urge, Personality), Hidden Passion, Karmic
 * Lessons, Pinnacles, and Challenges.
 *
 * Content is T3D's own paraphrase of the underlying material — never
 * verbatim transcript text — matching the T3D voice used throughout the
 * report.
 *
 * Sourcing notes by topic:
 * - Destiny/Soul Urge/Personality: T3D PHILOSOPHER notebook (Felicia Bender,
 *   "The Practical Numerologist"; Shemsuniverse).
 * - Hidden Passion 1, 2, 5, 7, 8, 9: T3D PHILOSOPHER notebook, dedicated
 *   Shemsuniverse videos on Hidden Passion specifically.
 * - Hidden Passion 3, 4, 6: no dedicated Hidden Passion video exists in the
 *   notebook. Grounded instead in the notebook's Felicia Bender Pinnacle/
 *   Challenge-cycle material for these same digits — in Pythagorean
 *   numerology a digit's core meaning holds across techniques, so the
 *   underlying archetype is the same one Shemsuniverse would be describing.
 * - Karmic Lessons (all 9): the T3D PHILOSOPHER notebook has no coverage of
 *   this topic at all (confirmed absent even after two source-add passes).
 *   Built from standard, well-established Pythagorean numerology teaching
 *   (the "missing number" framework as documented across mainstream
 *   reference numerologists — Hans Decoz, Faith Javane & Dusty Bunker, and
 *   others), per Tyler's explicit direction to use leading-expert general
 *   knowledge where the notebook has nothing to draw from.
 */

export interface NameNumberContent {
  theme: string;          // core theme — what this number is built to do/feel/project
  overexpressed: string;  // misapplied / overactive pattern
  underexpressed: string; // suppressed / underactive pattern
}

/**
 * General mechanism explainer: how the three name-based numbers relate to
 * each other and to the Life Path. Paraphrased from Felicia Bender's
 * "Rising Sign" framing (Life Path : Destiny :: Sun Sign : Rising Sign).
 */
export const INNER_DRIVERS_MECHANISM =
  "Your Life Path comes from your birth date — the mission itself. Your full " +
  "birth name, though, encodes three more layers underneath it: what you're " +
  "built to output, what actually satisfies you once the noise clears, and " +
  "what people register about you before they know anything real. All three " +
  "come from the same name, split three different ways. Every letter " +
  "combined gives your Destiny (or Expression) Number — the specific talents " +
  "and working style through which you carry out your Life Path, the way a " +
  "Rising Sign colors how a Sun Sign actually gets lived. The vowels alone " +
  "give your Soul Urge — the private craving underneath the visible action. " +
  "The consonants alone give your Personality — the outer read, the vibe a " +
  "stranger gets in the first exchange, before any deeper layer is visible.";

// ─── DESTINY / EXPRESSION NUMBER ──────────────────────────────────────────────
// What you're built to output — your talents, capabilities, and the specific
// style through which you express your Life Path.
export const DESTINY_CONTENT: Record<number, NameNumberContent> = {
  1: {
    theme: 'Independent leadership — pioneering new ground, initiating what hasn’t been tried, building momentum through self-reliance.',
    overexpressed: 'Bulldozing others to stay first; refusing input; running everything through ego rather than vision.',
    underexpressed: 'Deferring your own authority to someone else’s, chronic self-doubt, quietly conforming to avoid standing out.',
  },
  2: {
    theme: 'Diplomacy and intuitive partnership — mediating, harmonizing groups, building through cooperation rather than force.',
    overexpressed: 'People-pleasing past the point of having a position left; passive-aggression instead of honest disagreement.',
    underexpressed: 'Withdrawing from collaboration entirely; manufacturing conflict rather than risking real closeness.',
  },
  3: {
    theme: 'Creative, joyful communication — translating feeling into words, art, or performance that lifts a room.',
    overexpressed: 'Gossip, exaggeration, and scattering your energy across a dozen half-finished expressions.',
    underexpressed: 'Swallowing your voice, going quiet under criticism, letting real feeling calcify into mood.',
  },
  4: {
    theme: 'Methodical building — turning an abstract plan into something structurally sound through patient, disciplined effort.',
    overexpressed: 'Rigid workaholism; mistaking control for stability; refusing any plan you didn’t design yourself.',
    underexpressed: 'Cutting corners, disorganization, starting without ever actually finishing.',
  },
  5: {
    theme: 'Adaptive freedom — learning through variety, movement, and direct hands-on experience rather than theory.',
    overexpressed: 'Compulsive risk-taking, sensory overload, an inability to commit to anything long enough to master it.',
    underexpressed: 'Clinging to routine out of fear, refusing new experience, quietly resenting the stagnation.',
  },
  6: {
    theme: 'Nurturing responsibility — creating harmony at home and in community, building beauty others can rely on.',
    overexpressed: 'Controlling the people you claim to care for; martyring yourself to prove your devotion.',
    underexpressed: 'Neglecting the people who depend on you; going cold rather than risk being needed.',
  },
  7: {
    theme: 'Analytical depth — researching until you reach the actual root of a thing, then quietly mastering it.',
    overexpressed: 'Intellectual arrogance, suspicion of others’ motives, analysis that never resolves into action.',
    underexpressed: 'Superficial thinking, gullibility, drowning your own intuition in noise to avoid the discomfort of solitude.',
  },
  8: {
    theme: 'Executive mastery — building material and organizational power through disciplined, large-scale ambition.',
    overexpressed: 'Ruthless materialism; treating relationships as transactions; measuring your worth in numbers alone.',
    underexpressed: 'A poverty mindset that refuses responsibility, sabotaging your own success out of fear of what it costs.',
  },
  9: {
    theme: 'Humanitarian breadth — compassion and creative wisdom applied at a scale larger than any one relationship.',
    overexpressed: 'Preachy idealism, martyrdom, burning out trying to carry problems that were never yours alone to solve.',
    underexpressed: 'Bitterness, narrow-mindedness, hoarding what you have out of an old, unexamined grudge against the world.',
  },
  11: {
    theme: 'Intuitive illumination — a messenger frequency, translating what others sense but can’t yet name.',
    overexpressed: 'Nervous exhaustion, spiritual superiority, forcing inspiration onto people who didn’t ask for it.',
    underexpressed: 'Denying the gift entirely and living small as an undercharged 2, afraid of your own visibility.',
  },
  22: {
    theme: 'Master-scale building — translating an outsized vision into something concrete enough to actually stand.',
    overexpressed: 'Dictatorial ambition, crushing yourself and everyone near you under the weight of the vision.',
    underexpressed: 'Shrinking the scope of what you attempt until it’s merely a well-built 4 — safe, but too small.',
  },
  33: {
    theme: 'Compassionate mastery — teaching and healing simply through the example of how fully you live.',
    overexpressed: 'A messiah complex; absorbing everyone else’s suffering until it costs you your own life.',
    underexpressed: 'Refusing the mantle entirely — going quiet, petty, or withholding the care you’re actually built to give.',
  },
};

// ─── SOUL URGE / HEART'S DESIRE NUMBER ────────────────────────────────────────
// What genuinely satisfies you underneath, once the external noise clears.
export const SOUL_URGE_CONTENT: Record<number, NameNumberContent> = {
  1: {
    theme: 'A craving for total self-sovereignty — to answer to no one but the direction you’ve chosen yourself.',
    overexpressed: 'Secret resentment of anyone with authority over you; a private need to always come first.',
    underexpressed: 'Burying your own wants to keep the peace, then wondering why you feel invisible.',
  },
  2: {
    theme: 'A craving for real intimacy — peace, closeness, and being genuinely understood without having to perform.',
    overexpressed: 'Desperate neediness; managing situations from behind the scenes rather than risking a direct ask.',
    underexpressed: 'Numbing the heart shut, pushing people away before they can get close enough to disappoint you.',
  },
  3: {
    theme: 'A craving for emotional joy and creative freedom — being fully, expressively, unmistakably yourself.',
    overexpressed: 'Needing constant attention to feel real; running from pain through distraction and indulgence.',
    underexpressed: 'Burying real feeling under a flat, careful surface; hiding the very creativity that would heal you.',
  },
  4: {
    theme: 'A craving for order and safety — a foundation solid enough that you can finally stop bracing.',
    overexpressed: 'Gripping control so tightly that any change registers as a threat.',
    underexpressed: 'Living unanchored, neglecting the basic structure — health, home, routine — that would actually steady you.',
  },
  5: {
    theme: 'A craving for unrestrained experience — travel, sensation, and the freedom to not yet know what’s next.',
    overexpressed: 'Chronic restlessness; chasing novelty to outrun a stillness that scares you.',
    underexpressed: 'Feeling trapped in a life too small for you, without admitting it even to yourself.',
  },
  6: {
    theme: 'A craving to be needed — to build a home, a family, a circle that depends on your care.',
    overexpressed: 'Guilt-tripping the people you love into needing you more than they actually do.',
    underexpressed: 'Cold detachment from the very relationships that would fulfill you, to avoid the risk of obligation.',
  },
  7: {
    theme: 'A craving for quiet, private understanding — solving the deeper mystery beneath the obvious answer.',
    overexpressed: 'Paranoid withdrawal; feeling superior to a life you’ve decided is beneath your depth.',
    underexpressed: 'Drowning your own intuition in constant noise and company, avoiding what silence would show you.',
  },
  8: {
    theme: 'A craving for real, earned power — material self-sufficiency and the respect that comes with it.',
    overexpressed: 'An obsession with status that turns every relationship into a transaction of leverage.',
    underexpressed: 'A private poverty mindset — feeling powerless, and quietly letting others make your decisions for you.',
  },
  9: {
    theme: 'A craving for universal compassion — to matter to something larger than your own immediate life.',
    overexpressed: 'Giving until there’s nothing left, then feeling righteous about the depletion.',
    underexpressed: 'A quiet resentment toward a world that never gave back what you gave it, curdling into indifference.',
  },
  11: {
    theme: 'A soul-level craving for spiritual illumination — to be a clear channel rather than a closed circuit.',
    overexpressed: 'Absorbing everyone’s ambient emotion until your own nervous system gives out.',
    underexpressed: 'Denying the intuitive hits entirely, settling for a quieter, safer 2-level peace.',
  },
  22: {
    theme: 'A craving to build something monumental — structures that actually outlast your own lifetime.',
    overexpressed: 'Crushing internal pressure to achieve at a scale nothing could satisfy.',
    underexpressed: 'Feeling secretly impotent next to your own enormous dreams, and settling for smaller ones instead.',
  },
  33: {
    theme: 'A soul-deep calling toward selfless love — healing and nurturing wherever you can reach.',
    overexpressed: 'Total self-abnegation; absorbing the emotional weight of everyone around you until it breaks you.',
    underexpressed: 'Turning away from suffering you could have eased, out of quiet emotional self-protection.',
  },
};

// ─── PERSONALITY NUMBER ────────────────────────────────────────────────────────
// What people register about you before they know anything real — the outer
// read, the vibe a stranger gets in the first exchange.
export const PERSONALITY_CONTENT: Record<number, NameNumberContent> = {
  1: {
    theme: 'Reads as confident and decisive — a commanding, self-directed presence from the first exchange.',
    overexpressed: 'Comes across as arrogant, dismissive, or intimidating before anyone’s earned the right to judge.',
    underexpressed: 'Reads as timid or easily pushed around, undercutting the actual authority underneath.',
  },
  2: {
    theme: 'Reads as warm and approachable — gentle, diplomatic, quietly gracious in how you meet people.',
    overexpressed: 'Comes across as a pushover, or sweetly manipulative underneath the softness.',
    underexpressed: 'Reads as cold, awkward, or distant — harder to approach than you actually are.',
  },
  3: {
    theme: 'Reads as magnetic and witty — expressive, stylish, genuinely fun to be around.',
    overexpressed: 'Comes across as loud, attention-seeking, or too dramatic to take seriously.',
    underexpressed: 'Reads as stiff, humorless, or socially closed-off — flattening real charm into caution.',
  },
  4: {
    theme: 'Reads as grounded and trustworthy — practical, tidy, someone people take at their word.',
    overexpressed: 'Comes across as rigid, overly serious, or nitpicking about details no one else notices.',
    underexpressed: 'Reads as careless or unreliable — undercutting real competence with a messy presentation.',
  },
  5: {
    theme: 'Reads as charismatic and adaptable — energetic, curious, a little unpredictable in the best way.',
    overexpressed: 'Comes across as chaotic, flighty, or impossible to pin down.',
    underexpressed: 'Reads as dull or overly cautious — hiding real magnetism behind a stiff, careful front.',
  },
  6: {
    theme: 'Reads as warm and protective — a comforting, dependable presence people relax around.',
    overexpressed: 'Comes across as meddling or self-righteous — care that starts to feel like control.',
    underexpressed: 'Reads as cold or neglectful, undercutting the actual warmth underneath.',
  },
  7: {
    theme: 'Reads as composed and intellectually dignified — quietly deep, a little mysterious.',
    overexpressed: 'Comes across as aloof, elitist, or suspicious of anyone getting too close.',
    underexpressed: 'Reads as scattered or shallow — hiding real depth behind noise or nervous chatter.',
  },
  8: {
    theme: 'Reads as powerful and capable — executive presence, sleek competence, someone worth taking seriously.',
    overexpressed: 'Comes across as domineering or obsessed with status and appearances.',
    underexpressed: 'Reads as unkempt or under-resourced — undercutting real authority before it can register.',
  },
  9: {
    theme: 'Reads as generous and broad-minded — a warm, inspiring presence people feel bigger around.',
    overexpressed: 'Comes across as preachy or dramatically detached from ordinary, practical concerns.',
    underexpressed: 'Reads as petty or narrow — hiding a genuinely expansive nature behind small complaints.',
  },
  11: {
    theme: 'Reads as electric and visionary — gentle, perceptive, faintly otherworldly.',
    overexpressed: 'Comes across as high-strung, erratic, or too intense for the room.',
    underexpressed: 'Shrinks into a quiet, timid 2 — hiding the spark to avoid the exposure of being truly seen.',
  },
  22: {
    theme: 'Reads as immensely capable — a magnetic, structural authority people trust with big things.',
    overexpressed: 'Comes across as heavy, oppressive, or impossible to please.',
    underexpressed: 'Reads as merely competent — a well-organized 4, playing far smaller than the real scope inside.',
  },
  33: {
    theme: 'Reads as deeply comforting — a genuine, wise, healing presence people feel safe around.',
    overexpressed: 'Comes across as martyred or sanctimonious — carrying visible grief as if it were a badge.',
    underexpressed: 'Withdraws into self-protection, failing to project the warmth that’s actually there.',
  },
};

export const HIDDEN_PASSION_MECHANISM =
  "Beneath your Destiny, Soul Urge, and Personality sits one more number, easy " +
  "to miss because nothing about it is announced the way Life Path or Destiny " +
  "are. Take every letter of your full birth name, convert each to its " +
  "Pythagorean value, and see which digit — 1 through 9 — shows up more than " +
  "any other. That recurring digit is your Hidden Passion: a drive that's " +
  "been running underneath your personality since birth, whether or not " +
  "you've ever had language for it. It's not your mission (that's Life Path) " +
  "or your method (that's Destiny) — it's closer to an instrument that's " +
  "always been in your hands, whether or not you ever picked it up.";

export const KARMIC_LESSONS_MECHANISM =
  "Run the same letter-to-number conversion across your full birth name, but " +
  "look this time at what's absent rather than what repeats. Any digit, 1 " +
  "through 9, that never once appears among your letters is a Karmic Lesson " +
  "— an energy your name simply didn't hand you, so it has to be built on " +
  "purpose, through lived practice, rather than drawn on as something " +
  "already installed. It isn't a deficiency; it's closer to the one muscle " +
  "your training program never happened to work, which means it's also the " +
  "one most worth training deliberately.";

// ─── HIDDEN PASSION NUMBER ─────────────────────────────────────────────────────
// The digit (1–9 only — this calculation always reduces Master Numbers) that
// appears most frequently among the letter-values of the full birth name: an
// innate recurring drive or "superpower" running underneath the Life Path and
// Destiny Number, from birth.
export interface HiddenPassionContent {
  theme: string;   // the core frequency this number runs on
  gift: string;     // the integrated strength when this drive is consciously used
  shadow: string;   // the overplayed or blocked pattern when it isn't
}

export const HIDDEN_PASSION_CONTENT: Record<number, HiddenPassionContent> = {
  1: {
    theme: 'A solar frequency — self-initiative, pioneering vision, and the drive to move first, running as an undertone through everything you do.',
    gift: 'Genuinely persuasive presence and oratory instinct; the ability to see a direction others can’t yet see and the will to carry it into being.',
    shadow: 'A private self-doubt that usually traces back further than it looks — often an early critical voice — surfacing as either quiet self-erasure or an overcorrected need to dominate the room.',
  },
  2: {
    theme: 'A lunar frequency — intuitive peacemaking, tuned instinctively to whatever a room or relationship needs to stay in balance.',
    gift: 'Reads people and situations with very little effort; smooths conflict before it escalates; moves others through warmth rather than force.',
    shadow: 'Boundaries that dissolve under pressure — either becoming easy to run over, or quietly turning the softness into behind-the-scenes manipulation.',
  },
  3: {
    theme: 'A creative-expression frequency — the same core 3 energy read straight: feeling that’s built to move outward as words, art, or performance rather than stay trapped inside.',
    gift: 'An ability to trust and voice emotion without needing to justify it first — turning feeling directly into expression that actually lands.',
    shadow: 'Oversensitivity to criticism and a pull to scatter across a dozen surface-level pursuits rather than commit to one — or the opposite: swallowing real feeling behind a falsely rational mask until it leaks out as cutting remarks.',
  },
  4: {
    theme: 'A manifestation frequency — the discipline to take something abstract and, brick by brick, make it real and load-bearing.',
    gift: 'Patient, step-by-step building; a genuine talent for turning plans into structures that actually hold — and, notably, an association with health rather than its absence when this frequency is lived well.',
    shadow: 'Rigidity and workaholism dressed up as responsibility ("I’m the only one who can do this") — or, underused, a drift into disorganization, procrastination, and quiet fear of any change to the plan.',
  },
  5: {
    theme: 'A Mercury-quick frequency — chameleon adaptability built to master new terrain fast, then move before it calcifies into routine.',
    gift: 'Sharp, versatile intelligence paired with real charisma — the rare capacity to walk into almost any field or skill set and pick it up fast.',
    shadow: 'Restlessness that reads as scattered from the outside — starting strong and abandoning the moment mastery starts to feel like maintenance, with a real vulnerability to whatever offers the next hit of stimulation.',
  },
  6: {
    theme: 'A love-and-duty frequency — a pull toward home, family, and community that runs deeper than most, alongside a hard-won acceptance that nothing you build stays perfect.',
    gift: 'Natural mediation and care; the instinct to hold a family or community together, and the willingness to actually do the unglamorous work that takes.',
    shadow: 'Perfectionism and control disguised as care, boundary-crossing "help" nobody asked for, and a martyr’s resentment toward the very people you insisted on rescuing.',
  },
  7: {
    theme: 'A deep introspective frequency — perception that runs well past the surface, tuned to what most people can’t see or won’t look at.',
    gift: 'Genuine intuitive perception bordering on prophetic; an ability to read people and situations at a level that looks uncanny from the outside.',
    shadow: 'A felt distance from ordinary material life — early phobias or restlessness that never fully made sense, and real difficulty translating insight into the practical, moneyed traction the world rewards.',
  },
  8: {
    theme: 'A Saturnian frequency — a natural gravity toward building material power and running things at scale.',
    gift: 'Strategic resilience, monetization instinct, and the executive presence to turn a big vision into a functioning operation.',
    shadow: 'A hardness that can tip into intimidation, or a private preoccupation with status and optics that starts running the show instead of the strategy underneath it.',
  },
  9: {
    theme: 'A heavenly-triad frequency — the 3, 6, and 9 folded into one drive toward compassion applied at the scale of the world, not just the people closest to you.',
    gift: 'Deep natural empathy; a real gift for therapeutic, mediating, or artistic work that leaves people better than it found them.',
    shadow: 'A hard collision with a world that treats kindness as weakness — compassion suppressed for years before it resurfaces, or that curdles into anger when it’s denied an outlet.',
  },
};

// ─── KARMIC LESSONS ─────────────────────────────────────────────────────────────
// The digit(s) 1–9 that are completely absent from the letters of the full
// birth name. A person can have none, one, or several. Each missing number
// marks an energy that wasn't wired in through the name vibration — meaning
// it has to be built deliberately, through lived practice, rather than drawn
// on as an innate strength.
export interface KarmicLessonContent {
  theme: string;     // what the absence of this number actually means
  practice: string;  // the concrete, ongoing practice that develops it
}

export const KARMIC_LESSON_CONTENT: Record<number, KarmicLessonContent> = {
  1: {
    theme: 'No 1 in your name means self-reliance isn’t wired in as a given — you likely lean on other people’s direction, or other people’s certainty, before you fully trust your own.',
    practice: 'Practice decisions nobody else signs off on first: starting things, leading things, and trusting your own read on a situation even when it’s untested.',
  },
  2: {
    theme: 'No 2 means partnership and patience don’t come pre-installed — the default is going it alone rather than slowing down enough to genuinely take someone else in.',
    practice: 'Practice real collaboration: tact over force, and letting someone else’s perspective actually change your position instead of just being politely heard out.',
  },
  3: {
    theme: 'No 3 means the impulse to express feeling outward — through words, art, humor — isn’t automatic; it tends to get swallowed or over-intellectualized before it ever becomes speech.',
    practice: 'Choose expression on purpose: write, speak, make something, even when it feels indulgent or unnecessary — because for you, specifically, it isn’t.',
  },
  4: {
    theme: 'No 4 means the patient, unglamorous work of finishing what you start doesn’t come pre-installed — momentum is easy for you, but structure has to be built consciously.',
    practice: 'Build order deliberately: systems, routines, and follow-through chosen on purpose rather than waiting to feel motivated into them.',
  },
  5: {
    theme: 'No 5 means comfort with the unknown isn’t a given — routine gets gripped tighter than most, and change tends to register as threat before it registers as opportunity.',
    practice: 'Practice motion on purpose: choose the unfamiliar occasionally, on your own initiative, before life forces the change on you instead.',
  },
  6: {
    theme: 'No 6 means stepping into duty toward the people close to you doesn’t come automatically — it may take real, repeated practice to show up for others without being asked twice.',
    practice: 'Commit to a role someone else can actually depend on — a household, a family, a community — and stay in it past the point where it stops feeling optional.',
  },
  7: {
    theme: 'No 7 means slowing down enough to genuinely listen inward doesn’t come naturally — what’s provable tends to outweigh what’s merely sensed, even when the sensed thing is right.',
    practice: 'Build in deliberate stillness: solitude, reflection, and enough patience with the unanswerable to let a real inner conviction form, instead of reaching straight for the next external fact.',
  },
  8: {
    theme: 'No 8 means claiming real authority over money, power, or scale doesn’t come pre-installed — you may instinctively undersell your own capability in exactly the arenas that would reward you most.',
    practice: 'Practice ownership on purpose: negotiate your worth, take on responsibility for outcomes at scale, and get comfortable being the one actually in charge.',
  },
  9: {
    theme: 'No 9 means giving without an expected return, or releasing what’s already run its course, doesn’t come easily — there’s a pull to hold on past the point of usefulness, out of habit more than need.',
    practice: 'Practice release on purpose: generosity that expects nothing back, and letting go of what’s finished before you’re forced to.',
  },
};
