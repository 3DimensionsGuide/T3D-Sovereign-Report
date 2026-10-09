/**
 * T3D Advanced Sovereign Report — Stoplight (Astrology) Content Library
 *
 * Content for the Advanced Stoplight section's first deep-dive topic:
 * the planets the base report calculates but never interprets — Mercury,
 * Venus, Mars, Jupiter, and Saturn (read by ZODIAC SIGN, since these move
 * fast enough that sign placement is genuinely personal), and Uranus,
 * Neptune, and Pluto (read by WHOLE-SIGN HOUSE instead, since these move
 * slowly enough that their sign is shared by an entire generation — what's
 * personal about them is which area of life, i.e. house, they land in).
 *
 * Content is T3D's own paraphrase of the underlying material — never
 * verbatim transcript text — matching the T3D voice used throughout the
 * report. Sourced from the T3D PHILOSOPHER notebook's astrology coverage
 * (The Astrology Podcast with Chris Brennan; Mastering the Zodiac), which
 * covers planet-by-planet natal meanings and zodiac sign meanings in
 * depth, cross-referenced against standard, widely-taught astrological
 * convention for each planet's core significations.
 *
 * Transits (Phase 2 of the Stoplight Advanced build) are not part of this
 * file — they require new calculation-engine work (nothing in
 * src/server/engines/astrology.ts computes "now" or aspect angles yet)
 * and will get their own content file once that engine work lands.
 */

import { firdariaWholeSignHouse } from '../../tokens';

export interface PlanetSignContent {
  theme: string;     // what this placement is built to do/express
  gift: string;       // the integrated strength when it's consciously used
  friction: string;   // the pattern when it's out of balance
}

/** Whole-Sign house (1–12) a planet occupies, given its own sign and the Ascendant's sign. */
export function getPlanetHouse(planetSign: string, ascSign: string): number | null {
  return firdariaWholeSignHouse(planetSign, ascSign);
}

// ─── MERCURY — communication & thinking style (by sign) ───────────────────────
export const MERCURY_CONTENT: Record<string, PlanetSignContent> = {
  Aries: {
    theme: 'Quick, decisive thinking that reaches conclusions fast and says them straight — considering comes after speaking, not before.',
    gift: 'Cuts through hesitation and gets a stalled conversation moving; direct in a way that saves everyone time.',
    friction: 'Argues before fully hearing the other side out, and can read as impatient with anyone still working through it.',
  },
  Taurus: {
    theme: 'Slow, deliberate thinking that trusts what can be touched, tested, and repeated over what’s merely clever.',
    gift: 'Grounded, practical judgment — rarely swayed by a good pitch alone, and reliably right about what actually holds up.',
    friction: 'Stubborn attachment to an opinion once it’s formed, slow to update even after the evidence has already shifted.',
  },
  Gemini: {
    theme: 'Fast, associative thinking that links ideas across subjects most people keep separate; naturally curious and verbally quick.',
    gift: 'Makes complex things easy to explain, and keeps a conversation genuinely alive.',
    friction: 'Skims rather than finishes, and can talk circles around a feeling instead of sitting with it.',
  },
  Cancer: {
    theme: 'Emotionally toned thinking — memory and mood color the read on a situation as much as the facts do.',
    gift: 'Picks up on the emotional subtext of a conversation that a purely logical read would miss entirely.',
    friction: 'Takes a disagreement personally, and lets an old hurt reshape how a new, unrelated conversation gets heard.',
  },
  Leo: {
    theme: 'Confident, expressive thinking, delivered with warmth and a sense of its own performance.',
    gift: 'Makes an idea land — persuasive, memorable, genuinely entertaining to listen to.',
    friction: 'Struggles to hear a correction without it landing as a blow to pride, and can dramatize a point past its actual substance.',
  },
  Virgo: {
    theme: 'Precise, analytical thinking that notices the detail everyone else stepped over.',
    gift: 'Editorial clarity — finds the actual error, the actual gap, the actual fix.',
    friction: 'Criticizes before affirming, and can get stuck refining a point long after it needed to just be said.',
  },
  Libra: {
    theme: 'Weighing, comparative thinking that naturally sees every side of a question before landing anywhere.',
    gift: 'Genuinely fair-minded — good at mediating, at finding the version of an idea that works for more than one person.',
    friction: 'Indecision that looks like open-mindedness, and a habit of softening a real disagreement into vague diplomacy.',
  },
  Scorpio: {
    theme: 'Penetrating, investigative thinking that wants the real motive underneath the stated one.',
    gift: 'Sees through spin fast, and asks the one question that gets past a comfortable half-truth.',
    friction: 'Suspicion where none is warranted, and a tendency to interrogate rather than simply ask.',
  },
  Sagittarius: {
    theme: 'Big-picture thinking that reaches for the wider meaning before nailing down the detail.',
    gift: 'Genuinely broadens a conversation — connects a specific problem to the larger pattern it’s part of.',
    friction: 'Overstates a claim to make the point land, and loses patience with the fine print.',
  },
  Capricorn: {
    theme: 'Structured, strategic thinking that filters an idea through what it will actually cost and take.',
    gift: 'Realistic planning — separates what sounds good from what will actually work.',
    friction: 'Dismisses an idea too early for lacking a business case yet, and can sound flatly discouraging by default.',
  },
  Aquarius: {
    theme: 'Detached, systems-level thinking that steps outside a problem to see the pattern running it.',
    gift: 'Genuinely original angles — solves a problem by reframing it rather than pushing harder at it.',
    friction: 'Intellectualizes a feeling instead of just having it, and can be contrarian for its own sake.',
  },
  Pisces: {
    theme: 'Impressionistic, associative thinking that moves in images and feelings more than a straight line.',
    gift: 'Picks up what’s unsaid in a room, and communicates in a way that lands emotionally, not just logically.',
    friction: 'Loses the thread of an argument, and can say what someone wants to hear rather than what’s actually true.',
  },
};

// ─── VENUS — love language, values & aesthetics (by sign) ─────────────────────
export const VENUS_CONTENT: Record<string, PlanetSignContent> = {
  Aries: {
    theme: 'Loves through pursuit — drawn to the chase, to directness, to a partner who can keep up.',
    gift: 'Brings real heat and initiative to a relationship; says what it wants instead of waiting to be asked.',
    friction: 'Loses interest once the chase is over, and can turn a partnership into a competition without meaning to.',
  },
  Taurus: {
    theme: 'Loves through steadiness — physical affection, consistency, and the pleasure of what’s reliably good.',
    gift: 'Deeply loyal once committed, and skilled at making ordinary time together feel sensually rich.',
    friction: 'Possessive when insecure, and slow to let go of a relationship that has clearly already ended.',
  },
  Gemini: {
    theme: 'Loves through conversation — wit, curiosity, and a partner it can genuinely talk to.',
    gift: 'Keeps a relationship mentally alive; flirtation and banter as real intimacy, not just surface charm.',
    friction: 'Gets bored by routine affection, and can flirt past the point that feels safe to a committed partner.',
  },
  Cancer: {
    theme: 'Loves through care — nurturing, emotional safety, and a bond that feels like home.',
    gift: 'Builds real intimacy fast through attentiveness; remembers what matters to the people it loves.',
    friction: 'Clings when afraid of loss, and can smother a partner with a need for reassurance.',
  },
  Leo: {
    theme: 'Loves through generosity and display — grand gestures, loyalty, and being someone’s whole audience.',
    gift: 'Makes a partner feel genuinely adored — warm, romantic, unafraid to go big.',
    friction: 'Needs visible appreciation to feel secure, and can sulk when attention goes elsewhere.',
  },
  Virgo: {
    theme: 'Loves through service — small, practical acts done consistently rather than declared.',
    gift: 'Shows love by actually noticing what someone needs and quietly handling it.',
    friction: 'Criticizes a partner in the name of helping them, and struggles to receive care as easily as it gives it.',
  },
  Libra: {
    theme: 'Loves through partnership — genuinely happiest paired, and skilled at making a relationship feel balanced.',
    gift: 'Natural diplomacy and aesthetic sense; makes both people feel heard and the relationship feel graceful.',
    friction: 'Avoids real conflict to keep the peace, and can stay in a relationship past its expiration out of fear of being alone.',
  },
  Scorpio: {
    theme: 'Loves through intensity — all-or-nothing bonding, and a hunger for real emotional and physical depth.',
    gift: 'Capable of profound loyalty and real intimacy once trust is earned — rarely superficial.',
    friction: 'Jealousy and control when insecure, and a habit of testing a partner’s loyalty rather than just trusting it.',
  },
  Sagittarius: {
    theme: 'Loves through freedom — a partner who’s also a fellow explorer, not a cage.',
    gift: 'Brings genuine adventure and optimism into a relationship; rarely possessive.',
    friction: 'Avoids commitment out of a fear of confinement, and can be careless with a partner’s feelings while chasing the next horizon.',
  },
  Capricorn: {
    theme: 'Loves through commitment — takes a relationship seriously, builds it like something meant to last.',
    gift: 'Reliable, loyal, genuinely willing to put in the long-term work most people avoid.',
    friction: 'Treats a relationship like a project to manage, and can withhold real warmth until it feels "earned."',
  },
  Aquarius: {
    theme: 'Loves through friendship — wants a partner who is also a genuine equal and intellectual companion.',
    gift: 'Unusually accepting of a partner’s individuality; rarely possessive or conventional.',
    friction: 'Keeps emotional distance even when close, and can intellectualize intimacy instead of just feeling it.',
  },
  Pisces: {
    theme: 'Loves through merging — wants to dissolve the distance between itself and the person it loves.',
    gift: 'Deeply romantic and compassionate; capable of a rare, unconditional kind of devotion.',
    friction: 'Idealizes a partner past what’s real, and can lose its own boundaries entirely inside someone else’s life.',
  },
};

// ─── MARS — drive, action & anger (by sign) ────────────────────────────────────
export const MARS_CONTENT: Record<string, PlanetSignContent> = {
  Aries: {
    theme: 'Acts immediately — direct, competitive, most alive when moving toward a clear target.',
    gift: 'Genuine courage and initiative; gets things started that everyone else was still discussing.',
    friction: 'Impulsive follow-through, and anger that flares fast and burns out just as quickly.',
  },
  Taurus: {
    theme: 'Acts slowly and steadily — builds momentum through persistence rather than speed.',
    gift: 'Real staying power; finishes what it starts long after faster energy has quit.',
    friction: 'Anger that takes a long time to surface but is very hard to de-escalate once it has.',
  },
  Gemini: {
    theme: 'Acts through communication and multitasking — drive expressed as mental and verbal energy.',
    gift: 'Genuinely productive across several fronts at once; persuasive when it wants something.',
    friction: 'Scatters effort across too many things, and can use words as a weapon when provoked.',
  },
  Cancer: {
    theme: 'Acts to protect — drive is strongest when defending someone or something it loves.',
    gift: 'Fiercely protective loyalty; will act decisively for someone else even when hesitant for itself.',
    friction: 'Indirect anger — passive aggression, mood, or withdrawal instead of a direct confrontation.',
  },
  Leo: {
    theme: 'Acts to be seen — drive is amplified by an audience and a stake worth being proud of.',
    gift: 'Genuine, confident leadership energy that others want to follow.',
    friction: 'Ego-driven anger when overlooked or challenged in front of others.',
  },
  Virgo: {
    theme: 'Acts through precision — drive channeled into getting the details right, not just moving fast.',
    gift: 'Reliable, high-quality follow-through; effective in a crisis because it stays focused on what’s fixable.',
    friction: 'Anger that turns inward as self-criticism, or outward as nitpicking instead of a direct confrontation.',
  },
  Libra: {
    theme: 'Acts through negotiation — reluctant to move until there’s some form of agreement or fairness in place.',
    gift: 'Effective at getting others aligned before acting, which prevents a lot of unnecessary conflict.',
    friction: 'Avoids direct confrontation so long that resentment builds quietly underneath the calm.',
  },
  Scorpio: {
    theme: 'Acts with intensity and control — strategic, private about its real motives until it’s ready to move.',
    gift: 'Formidable follow-through once committed; rarely gives up on something it has actually decided to pursue.',
    friction: 'Anger that goes underground and resurfaces later as control, manipulation, or quiet retaliation.',
  },
  Sagittarius: {
    theme: 'Acts toward expansion — drive shows up as a need to keep moving toward something bigger.',
    gift: 'Genuine enthusiasm that energizes a whole group, not just itself.',
    friction: 'Careless follow-through once the initial excitement fades, and blunt honesty that can land as tactless.',
  },
  Capricorn: {
    theme: 'Acts strategically — patient, disciplined drive aimed at a long-term result.',
    gift: 'Real staying power toward an ambitious goal; takes responsibility seriously.',
    friction: 'Anger expressed as cold withdrawal or quiet contempt rather than a direct confrontation.',
  },
  Aquarius: {
    theme: 'Acts on principle — drive shows up in service of an idea or cause more than a personal want.',
    gift: 'Willing to act against convention for something it actually believes in.',
    friction: 'Detached, intellectualized anger that can feel more like a lecture than a real confrontation.',
  },
  Pisces: {
    theme: 'Acts intuitively — drive follows feeling and inspiration more than a fixed plan.',
    gift: 'Compassionate, adaptable action that responds to what a moment actually needs.',
    friction: 'Passive or avoidant when direct action is actually required, and prone to escapism under real pressure.',
  },
};

// ─── JUPITER — growth, expansion & belief (by sign) ────────────────────────────
export const JUPITER_CONTENT: Record<string, PlanetSignContent> = {
  Aries: {
    theme: 'Grows through initiative and courage — expands fastest when taking a genuine risk on itself.',
    gift: 'Real confidence to go first, and a knack for turning boldness into actual opportunity.',
    friction: 'Overconfidence that skips real preparation, and impatience with anything that grows slowly.',
  },
  Taurus: {
    theme: 'Grows through patient accumulation — trusts that steady effort compounds into something real.',
    gift: 'Genuine ability to build lasting material security and enjoy it without guilt.',
    friction: 'Excess for its own sake, and a resistance to growth that requires giving up comfort.',
  },
  Gemini: {
    theme: 'Grows through learning and connection — expands its world by gathering ideas and people.',
    gift: 'Broad, genuinely useful knowledge, and a real gift for connecting people who should know each other.',
    friction: 'Spreads too thin across too many interests to develop any one of them deeply.',
  },
  Cancer: {
    theme: 'Grows through emotional security — expands from a foundation of home and belonging.',
    gift: 'Generous nurturing that genuinely helps others grow, not just itself.',
    friction: 'Overprotectiveness that limits its own or others’ growth in the name of safety.',
  },
  Leo: {
    theme: 'Grows through confident self-expression — expands by being generously, visibly itself.',
    gift: 'Real generosity of spirit; genuinely lifts others up while pursuing its own growth.',
    friction: 'Growth tied to needing recognition, and overextension driven by pride rather than actual capacity.',
  },
  Virgo: {
    theme: 'Grows through refinement and service — expands by getting incrementally better at something useful.',
    gift: 'Practical, well-earned expertise, and generosity expressed through genuinely useful help.',
    friction: 'Perfectionism that mistakes "not perfect yet" for "not ready to grow," stalling real progress.',
  },
  Libra: {
    theme: 'Grows through partnership and fairness — expands through relationships and mutual benefit.',
    gift: 'A genuine talent for growing opportunity through good relationships and fair dealing.',
    friction: 'Growth delayed by indecision, or overextended trying to please every party involved.',
  },
  Scorpio: {
    theme: 'Grows through transformation — expands by facing what’s uncomfortable rather than avoiding it.',
    gift: 'Real depth of growth once committed; capable of genuinely remaking itself.',
    friction: 'Excess control or intensity that turns a growth opportunity into a power struggle.',
  },
  Sagittarius: {
    theme: 'Grows through meaning and exploration — expands by chasing what feels genuinely larger than itself.',
    gift: 'Real optimism and a gift for seeing opportunity where others see a wall.',
    friction: 'Overpromising, and a restlessness that abandons a real opportunity for a shinier, unproven one.',
  },
  Capricorn: {
    theme: 'Grows through discipline and structure — expands by building something that can actually bear weight.',
    gift: 'Genuinely durable growth — success that holds up because the foundation was real.',
    friction: 'Growth throttled by excessive caution, or by measuring worth only in tangible achievement.',
  },
  Aquarius: {
    theme: 'Grows through innovation and community — expands by connecting to something bigger than itself.',
    gift: 'A real gift for growing through unconventional means and genuine collective benefit.',
    friction: 'Growth for the sake of being different, detached from what’s actually needed.',
  },
  Pisces: {
    theme: 'Grows through faith and compassion — expands by trusting something beyond what’s provable.',
    gift: 'Genuine spiritual and creative generosity; growth that uplifts more than just itself.',
    friction: 'Escapism or excess dressed up as faith, avoiding the practical work growth actually requires.',
  },
};

// ─── SATURN — discipline, responsibility & mastery (by sign) ──────────────────
// Where you're tested hardest, and where real, earned mastery eventually
// comes precisely because of that testing.
export const SATURN_CONTENT: Record<string, PlanetSignContent> = {
  Aries: {
    theme: 'Tested on self-assertion — learns discipline the hard way, usually through the consequences of acting too fast.',
    gift: 'Once earned: hard-won courage and self-reliance that doesn’t need to prove itself loudly.',
    friction: 'Early fear of taking initiative, overcorrected into either recklessness or excessive caution.',
  },
  Taurus: {
    theme: 'Tested on security — learns that real stability has to be built, not just wished for.',
    gift: 'Once earned: a durable, practical competence with money and resources that others can actually rely on.',
    friction: 'A scarcity fear that clings to control over material things long after the danger has passed.',
  },
  Gemini: {
    theme: 'Tested on communication — learns that words carry real weight and consequence.',
    gift: 'Once earned: a disciplined, credible voice that people actually trust.',
    friction: 'Early self-doubt about being smart or articulate enough, masked as forced overconfidence.',
  },
  Cancer: {
    theme: 'Tested on emotional security — learns that safety has to be built from within, not just supplied by others.',
    gift: 'Once earned: real emotional resilience and the capacity to nurture others without depleting itself.',
    friction: 'A fear of abandonment that manifests as either clinging or premature emotional walls.',
  },
  Leo: {
    theme: 'Tested on self-expression — learns that real confidence doesn’t require an audience’s approval.',
    gift: 'Once earned: quiet, genuine self-respect that doesn’t need constant validation.',
    friction: 'A fear of not being enough, overcorrected into either grandiosity or self-erasure.',
  },
  Virgo: {
    theme: 'Tested on competence — learns that "good enough" is sometimes actually good enough.',
    gift: 'Once earned: real, humble mastery — genuinely excellent without needing to be flawless.',
    friction: 'Chronic self-criticism that mistakes any imperfection for failure.',
  },
  Libra: {
    theme: 'Tested on relationship — learns that real partnership requires showing up as a whole person, not a role.',
    gift: 'Once earned: durable, mature partnerships built on real reciprocity, not just harmony.',
    friction: 'A fear of being alone that settles for the appearance of partnership over the real thing.',
  },
  Scorpio: {
    theme: 'Tested on control and trust — learns the difference between real intimacy and controlling the outcome.',
    gift: 'Once earned: a rare capacity for deep, disciplined trust and real emotional power.',
    friction: 'A fear of betrayal that manifests as control, secrecy, or testing people before it will trust them.',
  },
  Sagittarius: {
    theme: 'Tested on belief — learns that real meaning has to be built and lived, not just asserted.',
    gift: 'Once earned: a hard-won, genuinely grounded philosophy of life that can actually hold weight.',
    friction: 'A fear of being wrong or confined, overcorrected into either dogmatism or evasive restlessness.',
  },
  Capricorn: {
    theme: 'Tested directly on responsibility — this is Saturn’s own sign, so the lesson is the most literal: earn authority the slow way.',
    gift: 'Once earned: genuine mastery and authority that others actually recognize as real.',
    friction: 'A fear of failure that manifests as either relentless overwork or a refusal to attempt anything not already guaranteed.',
  },
  Aquarius: {
    theme: 'Tested on belonging — learns that real individuality doesn’t require rejecting community.',
    gift: 'Once earned: a disciplined, genuinely useful way of contributing to something larger than itself.',
    friction: 'A fear of losing its individuality that manifests as detachment or rigid contrarianism.',
  },
  Pisces: {
    theme: 'Tested on boundaries — learns that compassion needs structure or it dissolves into self-loss.',
    gift: 'Once earned: a rare, disciplined spiritual or creative depth that doesn’t collapse under pressure.',
    friction: 'A fear of the material world’s harshness that manifests as escapism or a martyred lack of boundaries.',
  },
};

// ─── URANUS — disruption, individuation & awakening (by house) ────────────────
// Uranus moves slowly enough that its sign is generational; what's personal
// is which house — which area of life — carries its charge of disruption
// and the need for real, unapologetic freedom.
export const URANUS_HOUSE_CONTENT: Record<number, PlanetSignContent> = {
  1: {
    theme: 'Disruption lands on identity itself — a need to look and be visibly, unmistakably different from what was expected of you.',
    gift: 'A genuinely original presence; freedom to define yourself on your own terms, not your family’s or culture’s.',
    friction: 'Restlessness with your own identity, changing direction so often it’s hard for others (or you) to pin down who you are.',
  },
  2: {
    theme: 'Disruption lands on money and resources — an unconventional, unstable, or sudden relationship with what you own and value.',
    gift: 'Genuine independence around money; unafraid to earn or live in ways others consider unstable.',
    friction: 'Financial unpredictability, or values that shift so often they’re hard to build real security on.',
  },
  3: {
    theme: 'Disruption lands on communication and immediate environment — a mind that thinks in sudden leaps rather than a straight line.',
    gift: 'Genuinely original ideas and a knack for seeing what a conversation is missing.',
    friction: 'Restlessness with routine learning or communication, and a nervous-system charge that can read as erratic.',
  },
  4: {
    theme: 'Disruption lands on home and family — an unconventional family structure, or a need to break from inherited domestic patterns.',
    gift: 'Freedom to define "home" and "family" on your own terms rather than the ones you were handed.',
    friction: 'Instability in the home environment, or difficulty feeling settled anywhere for very long.',
  },
  5: {
    theme: 'Disruption lands on self-expression and romance — creativity and love that refuse convention.',
    gift: 'Genuinely original creative or romantic expression; unafraid to be the exception.',
    friction: 'Unpredictability in romance or creative follow-through — brilliant starts that don’t always land.',
  },
  6: {
    theme: 'Disruption lands on daily routine and health — a body and work life that resist a fixed schedule.',
    gift: 'Innovative approaches to work and health that a conventional routine would never have found.',
    friction: 'Chronic disruption to routine that makes consistent habits — including healthy ones — genuinely hard to sustain.',
  },
  7: {
    theme: 'Disruption lands on partnership — relationships that need real freedom inside them or they don’t survive.',
    gift: 'Genuinely equal, unconventional partnerships built on freedom rather than convention.',
    friction: 'Sudden endings or instability in close relationships when freedom feels threatened.',
  },
  8: {
    theme: 'Disruption lands on shared resources and intimacy — sudden, transformative experiences around merging with another person.',
    gift: 'A genuine gift for radical honesty and transformation in intimate bonds.',
    friction: 'Instability around shared money, or crisis-level upheaval that arrives without warning.',
  },
  9: {
    theme: 'Disruption lands on belief and worldview — a philosophy that keeps breaking from whatever it was taught.',
    gift: 'Genuinely original thinking about meaning, travel, and the larger picture.',
    friction: 'Restlessness with any fixed belief system, including ones you built yourself not long ago.',
  },
  10: {
    theme: 'Disruption lands on career and public reputation — an unconventional path to authority, or sudden shifts in public standing.',
    gift: 'A genuinely original public role — recognized precisely for not doing it the expected way.',
    friction: 'Career instability or sudden reputational shifts that arrive faster than you can plan around.',
  },
  11: {
    theme: 'Disruption lands on community and long-term goals — friendships and hopes that need real independence inside them.',
    gift: 'A gift for building genuinely progressive communities and goals ahead of their time.',
    friction: 'Difficulty sustaining long-term group commitments, or goals that keep changing before they’re realized.',
  },
  12: {
    theme: 'Disruption lands on the unconscious and the hidden — sudden insight from what usually stays beneath awareness.',
    gift: 'Genuine spiritual or psychological breakthroughs that arrive in flashes rather than slow work.',
    friction: 'Anxiety or disorientation from disruption that comes from somewhere you can’t consciously locate.',
  },
};

// ─── NEPTUNE — dissolution, inspiration & illusion (by house) ─────────────────
// Where boundaries blur — the area of life where you're both most genuinely
// inspired and most easily deceived, including by yourself.
export const NEPTUNE_HOUSE_CONTENT: Record<number, PlanetSignContent> = {
  1: {
    theme: 'Dissolution touches identity — a self that’s hard to pin down, permeable to whatever’s around it.',
    gift: 'Genuine empathy and charisma; an ability to meet people wherever they are.',
    friction: 'A weak sense of firm identity, or a public image that’s more illusion than substance.',
  },
  2: {
    theme: 'Dissolution touches money and resources — values and finances that are hard to keep boundaries around.',
    gift: 'A generous, non-materialistic relationship to money — genuinely comfortable giving.',
    friction: 'Financial confusion, being taken advantage of, or values so idealistic they’re hard to fund.',
  },
  3: {
    theme: 'Dissolution touches communication — a mind more attuned to impression and imagery than plain fact.',
    gift: 'Genuinely poetic or imaginative communication; ideas that move people, not just inform them.',
    friction: 'Vagueness or miscommunication, and a hard time sticking to a straightforward, literal account of things.',
  },
  4: {
    theme: 'Dissolution touches home and family — a family history that’s foggy, idealized, or hard to fully see clearly.',
    gift: 'A deeply spiritual or artistic sense of what "home" means, beyond the literal building.',
    friction: 'Confusion about family roles or origins, or a home life that never quite feels solid.',
  },
  5: {
    theme: 'Dissolution touches creativity and romance — art and love approached as something almost transcendent.',
    gift: 'Rare artistic or romantic idealism; capable of real creative or romantic magic.',
    friction: 'Romantic illusions that don’t survive contact with a real person, or creative talent that never quite finds form.',
  },
  6: {
    theme: 'Dissolution touches daily routine and health — a body and work life sensitive to what can’t always be measured.',
    gift: 'Genuine compassion in service-oriented work; intuitive sensitivity to what a body actually needs.',
    friction: 'Vague health issues that resist a clear explanation, or work routines that dissolve under stress.',
  },
  7: {
    theme: 'Dissolution touches partnership — relationships approached with idealism that can blur what a partner is actually like.',
    gift: 'A rare capacity for compassionate, soulful partnership.',
    friction: 'Idealizing a partner past the point of seeing them clearly, or being deceived in close relationships.',
  },
  8: {
    theme: 'Dissolution touches shared resources and intimacy — a spiritual, sometimes confusing relationship to merging with another.',
    gift: 'A genuine gift for psychological or spiritual depth in intimate bonds.',
    friction: 'Confusion around shared finances or a partner’s true motives; boundaries that dissolve too easily.',
  },
  9: {
    theme: 'Dissolution touches belief and worldview — a spirituality or philosophy that’s felt more than proven.',
    gift: 'Genuine mystical or spiritual insight; a worldview built on direct experience, not just doctrine.',
    friction: 'A belief system so idealistic it’s hard to apply practically, or gullibility toward whatever inspires it.',
  },
  10: {
    theme: 'Dissolution touches career and public reputation — a professional path that’s hard to pin to one fixed identity.',
    gift: 'A genuinely inspirational public role — the kind of career built on vision rather than convention.',
    friction: 'A foggy sense of direction professionally, or a public image that others project onto more than you control.',
  },
  11: {
    theme: 'Dissolution touches community and long-term goals — friendships and hopes built on shared ideals more than shared logistics.',
    gift: 'A genuine gift for inspiring collective vision and compassionate community.',
    friction: 'Disillusionment when a community or friend group turns out to be less ideal than imagined.',
  },
  12: {
    theme: 'Dissolution touches the unconscious directly — this is Neptune’s own house, so the theme is the most literal: a porous boundary with the unseen.',
    gift: 'Genuine spiritual depth and access to the unconscious that others have to work much harder to reach.',
    friction: 'A pull toward escapism or self-undoing that has to be consciously, repeatedly managed.',
  },
};

// ─── PLUTO — transformation, power & the underworld (by house) ────────────────
// Where you face real power struggles and undergo the deepest, most total
// kind of change — not adjustment, but genuine remaking.
export const PLUTO_HOUSE_CONTENT: Record<number, PlanetSignContent> = {
  1: {
    theme: 'Transformation centers on identity — repeated experiences of being fundamentally remade, not just adjusted.',
    gift: 'A genuinely magnetic, intense presence; hard-won resilience others can feel.',
    friction: 'Power struggles over your own self-definition, or a felt need to control how you’re perceived.',
  },
  2: {
    theme: 'Transformation centers on money and resources — a relationship to security that gets tested at the root, more than once.',
    gift: 'A rare capacity to rebuild financial security from nothing, more than once if needed.',
    friction: 'Power struggles around money, or an intensity about control and possessions that can crowd out other values.',
  },
  3: {
    theme: 'Transformation centers on communication — words used, at some point, as a genuine instrument of power.',
    gift: 'Penetrating, transformative communication that changes how people think, not just what they know.',
    friction: 'Power struggles with siblings or in your immediate environment; a tendency to manipulate rather than simply say it.',
  },
  4: {
    theme: 'Transformation centers on home and family — a family history carrying real intensity, secrets, or power dynamics.',
    gift: 'The capacity to break an inherited pattern that’s been running for generations.',
    friction: 'Deep, sometimes hidden family power struggles that take real work to bring into the open.',
  },
  5: {
    theme: 'Transformation centers on creativity and romance — love and self-expression experienced at maximum intensity.',
    gift: 'Creative or romantic work with the power to genuinely transform whoever encounters it.',
    friction: 'Power struggles in romance, or creative blocks tied to a fear of being truly seen.',
  },
  6: {
    theme: 'Transformation centers on daily routine and health — a body that communicates through crisis when something needs to change.',
    gift: 'A genuine capacity to rebuild health and routine from the ground up when it’s actually necessary.',
    friction: 'Health or work crises that force change rather than inviting it gradually.',
  },
  7: {
    theme: 'Transformation centers on partnership — relationships that go all the way to the bottom, for better or worse.',
    gift: 'The capacity for a profoundly transformative, deeply bonded partnership.',
    friction: 'Power struggles with partners, or relationships that repeatedly end in genuine upheaval rather than a quiet fade.',
  },
  8: {
    theme: 'Transformation centers on shared resources and intimacy — this is Pluto’s own house, so the theme is the most literal: real power, real merging, real loss.',
    gift: 'A rare capacity to face what most people avoid — death, power, the truly hidden — without flinching.',
    friction: 'Recurring, intense power struggles around shared resources, control, or trust.',
  },
  9: {
    theme: 'Transformation centers on belief and worldview — a philosophy of life tested and rebuilt more than once.',
    gift: 'A hard-won, genuinely transformed worldview that can survive real scrutiny.',
    friction: 'Dogmatism or power struggles over belief — either imposing your view or resisting anyone else’s.',
  },
  10: {
    theme: 'Transformation centers on career and public reputation — a professional path marked by real power, and real reversals.',
    gift: 'The capacity to hold real authority and use it to genuinely transform a field or organization.',
    friction: 'Public power struggles, reputational upheaval, or an intense, sometimes controlling relationship to ambition.',
  },
  11: {
    theme: 'Transformation centers on community and long-term goals — friendships and group affiliations that carry real intensity.',
    gift: 'The capacity to transform a group or community from the inside, not just participate in it.',
    friction: 'Power struggles within friend groups or organizations, and hopes that have to be rebuilt more than once.',
  },
  12: {
    theme: 'Transformation centers on the unconscious — deep, often private psychological work that reshapes everything else.',
    gift: 'Rare access to the unconscious and the capacity for genuine, private psychological transformation.',
    friction: 'Hidden fears or compulsions that operate under the surface until they’re consciously faced.',
  },
};

// ─── Mechanism explainers ──────────────────────────────────────────────────────

export const PERSONAL_PLANETS_MECHANISM =
  "Your Sun, Moon, and Rising get the spotlight, but five more planets were " +
  "in motion the moment you were born, and each one runs its own layer " +
  "underneath your Big Three. Mercury shows how you think and communicate. " +
  "Venus shows what you love and value, and how you love. Mars shows how " +
  "you act, pursue, and get angry. Jupiter shows where you naturally grow " +
  "and expand. Saturn shows where you get tested hardest — and where real, " +
  "earned mastery eventually comes because of that testing, not in spite " +
  "of it. All five move fast enough that their zodiac sign is genuinely " +
  "personal to you, the same way your Sun sign is.";

export const SOCIAL_PLANETS_MECHANISM =
  "Jupiter and Saturn move slowly enough that their zodiac sign is shared " +
  "with everyone born in roughly the same year or two — Jupiter changes " +
  "sign about once a year, Saturn only once every two and a half — so in " +
  "a strict sense they're less personal than Mercury, Venus, and Mars. " +
  "But they're not generational the way Uranus, Neptune, and Pluto are " +
  "either, since those can take a decade or more to change sign. " +
  "Astrologers call Jupiter and Saturn the \"social\" planets for exactly " +
  "this reason: they sit at the boundary where your inner world meets the " +
  "wider one, describing how you engage with the structures — " +
  "opportunity, growth, authority, responsibility — that exist outside of " +
  "you and are shared with a broader group of your peers. Jupiter shows " +
  "where you naturally expand and where you find belief and opportunity. " +
  "Saturn shows where you get tested by structure, and where real, " +
  "earned standing eventually comes because of that testing.";

export const OUTER_PLANETS_MECHANISM =
  "Uranus, Neptune, and Pluto move so slowly — years or even decades in a " +
  "single sign — that their sign is shared by your entire generation, not " +
  "just you. What's actually personal about them is which house they " +
  "landed in at your exact birth moment: which specific area of your life " +
  "carries their charge. Uranus is disruption and the demand for real " +
  "freedom. Neptune is dissolution, inspiration, and illusion — the place " +
  "boundaries blur. Pluto is transformation and power — the place you " +
  "face the deepest, most total kind of change.";
