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
 * - Pinnacles/Challenges (all values): fully sourced from the T3D
 *   PHILOSOPHER notebook (Felicia Bender, "The Practical Numerologist";
 *   Hans Decoz for the four phase names and the timing model).
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

// ─── PINNACLES ───────────────────────────────────────────────────────────────
// Four life phases, each with its own governing number: the environmental
// climate, opportunity set, and "degree program" you're enrolled in during
// that stretch of years. Timing: Phase 1 runs birth to (36 − Life Path);
// Phases 2 and 3 are each a following 9-year cycle; Phase 4 runs from the
// end of Phase 3 for the rest of life. Pinnacles preserve Master Numbers
// (11, 22, 33) — they run on their root number's timeline (11→2, 22→4,
// 33→6) at a higher, more demanding voltage.
export interface PinnacleContent {
  coreMandate: string;       // the overall lesson this number's Pinnacle asks for
  phases?: [string, string, string, string]; // lived experience in Phase 1–4, in order; Master Numbers use coreMandate only
}

export const PINNACLE_CONTENT: Record<number, PinnacleContent> = {
  1: {
    coreMandate: 'Independence, self-reliance, and leadership — the demand to build real self-confidence, break free of codependence, and lead in a direction that’s actually your own.',
    phases: [
      'Separating your own identity from your birth family — through quiet compliance or open rebellion, whichever it takes to find out who you are apart from them.',
      'Developing a thicker skin: learning to fail forward and take the entrepreneurial risks nobody hands you a safety net for.',
      'Learning co-creation — holding your independence while actually accounting for the people working alongside you.',
      'Standing up and being counted on your own terms — marching to your own drum without steamrolling the people around you.',
    ],
  },
  2: {
    coreMandate: 'Harmony, partnership, and sensitivity — cooperation, diplomacy, and mastering your own emotional and energetic landscape.',
    phases: [
      'Managing a hair-trigger sensitivity — learning to mediate conflict without absorbing everyone else’s emotional weight as your own.',
      'Relationships, marriage, and family move to the center — practicing "us before me" and the patience that takes.',
      'Setting genuinely clean energetic and emotional boundaries while still practicing real tact and diplomacy.',
      'A deep, earned fulfillment through group connection and family — finally feeling valued rather than just useful.',
    ],
  },
  3: {
    coreMandate: 'Creativity, expression, and communication — cultivating artistic talent, real emotional intelligence, and an authentic voice.',
    phases: [
      'Developing your creative or artistic talents — or working through the feeling of being blocked, unheard, or misunderstood.',
      'Stepping into performance, writing, or public presentation, and healing old emotional wounds through honest self-expression.',
      'Inspiring the people around you, bringing real lightness and humor to your environment, and raising your own emotional intelligence.',
      'A lighter, freer era — joy, travel, uninhibited creative pursuit, and actually letting yourself enjoy what you built.',
    ],
  },
  4: {
    coreMandate: 'Hard work, organization, and building foundations — practical effort, systematic planning, and tangible security earned the slow way.',
    phases: [
      'Taking on adult responsibility early, or working with limited resources, while learning methodical, step-by-step execution.',
      'Putting down physical roots — home, family, structure — and building genuine order out of whatever chaos came before.',
      'Climbing steadily through your field via practical, patient, frugal, long-range planning rather than any shortcut.',
      'Harvesting decades of labor into a lasting legacy — with a real requirement to schedule rest before your body forces the issue.',
    ],
  },
  5: {
    coreMandate: 'Freedom, change, and adaptability — rapid shifts, travel, and the paradox of finding freedom through self-discipline.',
    phases: [
      'Discovering freedom through adventure or travel, or by breaking out of restrictive home or social circumstances.',
      'Adapting to shifts you didn’t choose, resisting the pull toward escapism, and genuinely expanding your horizons.',
      'Reaching real financial or health freedom, walking away from outdated structures, and a real spiritual expansion.',
      'A fast-paced, freewheeling era of adventure and travel, backed for once by solid ground underneath it.',
    ],
  },
  6: {
    coreMandate: 'Responsibility, family, and service — domestic duty, caretaking, and accepting the "perfection of imperfection."',
    phases: [
      'Early family duty — caretaking siblings or parents — while adjusting expectations that started out too idealistic.',
      'A domestic focus: marriage, children, and the ongoing work of balancing duty with actual personal boundaries.',
      'Home and family become the central pillar — caretaking elders or children, and real community or artistic service.',
      'Reward through unconditional love, mentorship, and a genuinely nurturing home life.',
    ],
  },
  7: {
    coreMandate: 'Spiritual development, introspection, and specialization — slow internal growth, deep expertise, and trust in what can’t be proven.',
    phases: [
      'Feeling like an observer who doesn’t quite fit — turning to study, research, or alternative paths when the standard answers fail.',
      'Refining a specialized skill or analytical depth, introverted reflection, and integrating logic with the less provable kind of wisdom.',
      'A deep spiritual foundation — contemplation, nature, and real inner mastery built in relative quiet.',
      'Gathering and passing on what you’ve learned — higher learning, contemplative practice, and hard-won peace.',
    ],
  },
  8: {
    coreMandate: 'Empowerment, authority, and financial mastery — stepping into real power over the material world, ethically.',
    phases: [
      'Step up or get stepped on: learning empowerment through early hardship, scarcity, or a fight for authority that toughens you.',
      'Real traction — business, organizational responsibility, career expansion — and learning to balance ambition with the rest of your life.',
      'Establishing real financial and executive influence, thinking long-range, and starting to give back what you’ve built.',
      'Wealth and executive power meeting a genuine ethical center — the chance to leave a legacy you’d actually stand behind.',
    ],
  },
  9: {
    coreMandate: 'Compassion, universal service, and letting go — selfless contribution at scale, and mastering impermanence.',
    phases: [
      'High sensitivity to the world’s pain, championing whoever’s been overlooked, and slowly releasing ego and arrogance.',
      'Family and marriage blending with social cause and community service — care that extends past your own front door.',
      'Global interests, travel, and real selfless service — plus learning to read loss as a lesson in letting go rather than only grief.',
      'Clearing out what’s just facade and keeping only what brings real joy — forgiveness, generosity, and a heart-led final chapter.',
    ],
  },
  11: {
    coreMandate: 'Intuitive illumination and spiritual diplomacy — Pinnacle 2’s partnership theme, amplified by a heightened, almost channel-like intuition. Runs on the 2 timeline, at Master Number voltage.',
  },
  22: {
    coreMandate: 'Master-scale building — Pinnacle 4’s organization and discipline, amplified into the capacity to turn an outsized, idealistic vision into concrete, global reality. Runs on the 4 timeline, at Master Number voltage.',
  },
  33: {
    coreMandate: 'Universal nurturing and master teaching — Pinnacle 6’s caretaking, amplified into selfless devotion, spiritual mentorship, and the ability to lift an entire community through unconditional love. Runs on the 6 timeline, at Master Number voltage.',
  },
};

// ─── CHALLENGES ──────────────────────────────────────────────────────────────
// The internal friction, blind spot, or character test active during each of
// the same four life phases as the Pinnacles — always a single digit 0–8;
// Master Numbers never apply here. The Third Challenge is the "main"
// lifelong challenge, running as a persistent background theme throughout
// life in addition to its own phase.
export interface ChallengeContent {
  test: string;  // the recurring friction pattern / blind spot
  key: string;   // the resolving skill — the "key to the castle"
}

export const CHALLENGE_CONTENT: Record<number, ChallengeContent> = {
  0: {
    test: 'The Challenge of Choice — this one mathematically stands in for a 9. It can feel like staring into a void: overwhelm, no clear boundary to hold onto, or paralysis from having too many directions available at once.',
    key: 'Cultivating intentional clarity — choosing a genuinely noble purpose and letting that choice, not endless options, organize your energy.',
  },
  1: {
    test: 'Either a dependency on others and a fear of standing alone, or the opposite: overactive stubbornness and bucking every authority out of a well-hidden insecurity.',
    key: 'Building real, healthy willpower — defining your own values and taking assertive leadership of your own life, without needing anyone’s permission first.',
  },
  2: {
    test: 'Hypersensitivity to criticism, chronic approval-seeking, and codependency — or, at the other extreme, a flat emotional insensitivity that keeps real intimacy at a distance.',
    key: 'Disciplining your emotional sensitivity into genuinely clean boundaries, and using it instead as a gift for diplomacy and mediation.',
  },
  3: {
    test: 'Debilitating self-doubt and a fear of criticism that blocks your voice — or a superficial, gossipy over-talkativeness that’s really just covering what you actually feel.',
    key: 'Clearing the block and speaking the unvarnished, authentic version of what you feel — using creative expression on purpose rather than as a leak.',
  },
  4: {
    test: 'Disorganization and expecting results without doing the work — or the mirror image: work-martyrdom and workaholism that manufactures its own hardship.',
    key: 'Building a real step-by-step plan, sticking to routine, and scheduling actual self-care before burnout schedules it for you.',
  },
  5: {
    test: 'Restlessness that runs from anything difficult, or the opposite — feeling suffocated and paralyzed by any restriction at all.',
    key: 'Finding freedom through self-discipline: real follow-through, adapting to change constructively instead of fleeing or freezing.',
  },
  6: {
    test: 'Perfectionism, controlling behavior, crushing idealism, over-enabling the people you love, or quietly martyring yourself for them.',
    key: 'Understanding the perfection of imperfection — offering real help without judgment or control, and setting boundaries even with family.',
  },
  7: {
    test: 'Intellectual cynicism, over-analyzing everything, rejecting anything spiritual, or a felt betrayal by life itself that curdles into isolation.',
    key: 'Moving past cold intellect into real faith — opening to intuition, developing humility, and trusting what can’t be fully proven.',
  },
  8: {
    test: 'Financial volatility — windfalls followed by busts — a victim mentality, legal trouble, or the abuse of whatever power you do have.',
    key: 'Empowering yourself from the ground up: managing money ethically, riding the cycles with resilience, and using influence for something bigger than yourself.',
  },
};

/**
 * Generates the Pinnacle/Challenge interaction insight for the reader's
 * currently active phase. When the Pinnacle and Challenge share the same
 * root number, that lesson is drawn to the front of the line — mastering
 * the Challenge unlocks the Pinnacle directly, since both ask for the exact
 * same skill. When they differ, the Pinnacle opens a door the Challenge
 * doesn't automatically let you walk through — succeeding usually means
 * deliberately borrowing the Challenge's skill and applying it to what the
 * Pinnacle is inviting.
 */
export function getPinnacleChallengeInteraction(pinnacleNumber: number, challengeNumber: number): string {
  // Master Number pinnacles (11/22/33) share a root with 2/4/6 respectively.
  const root = pinnacleNumber === 11 ? 2 : pinnacleNumber === 22 ? 4 : pinnacleNumber === 33 ? 6 : pinnacleNumber;

  if (root === challengeNumber) {
    return (
      `Right now, your Pinnacle and Challenge are drawing on the same root number (${pinnacleNumber} / ` +
      `${challengeNumber}). That pulls this one lesson to the absolute front of the line — it can feel like a ` +
      `repeated, pointed nudge rather than a single test. The upside: because the environment and the test are ` +
      `asking for the exact same skill, mastering the Challenge unlocks the Pinnacle directly, with nothing lost ` +
      `in translation between them.`
    );
  }

  return (
    `Right now, your Pinnacle (${pinnacleNumber}) and Challenge (${challengeNumber}) are pulling in different ` +
    `directions — a real, productive tension. The Pinnacle opens a door the Challenge doesn’t automatically let ` +
    `you walk through. Succeeding here usually means deliberately borrowing the Challenge’s resolving skill and ` +
    `applying it on purpose to whatever the Pinnacle is inviting you toward.`
  );
}
