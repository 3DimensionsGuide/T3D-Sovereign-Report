/**
 * T3D app glossary: the "tap any term to understand it" content.
 *
 * Every entry has an id of the form "<group>:<kind>:<key>" (for example
 * "astro:planet:saturn", "hd:gate:41", "num:7"). Entries reuse the written
 * interpretation from the reports wherever it exists (Types, Authorities,
 * Profiles, Centers, Gates, Circuits, Godheads, numbers). Plain definitions
 * for technical terms (orb, retrograde, ingress...) are authored here.
 *
 * Personalisation ("In your chart") is added at request time from the
 * person's saved results by buildEntry(). Nothing here is a formula; it is
 * all reading text, so it stays server-side like the other app content.
 */

import {
  AUTHORITY_CONTENT,
  CENTER_CAPACITIES,
  CENTER_DISPLAY_NAME,
  OPEN_CENTER_THEMES,
  PROFILE_CONTENT,
  TYPE_CONTENT,
} from '@/lib/report/section3/hd-content';
import {
  CHANNELS,
  CIRCUIT_GROUP_MEANING,
  GATE_KEYNOTES,
} from '@/lib/report/section3/gate-content';
import { GODHEAD_MECHANISM, findGodheadByGate } from '@/lib/report/section3/godhead-content';
import { DEFINITION_MEANING, VARIABLES_MECHANISM } from '@/lib/report/tokens';
import { SIGN_ELEMENT, SIGN_MODALITY, SIGN_INDEX } from '@/lib/report/section5/astro-content';
import { HOUSE_NAMES, HOUSE_THEMES } from '@/lib/report/advanced/stoplight/transits-content';
import {
  HIDDEN_PASSION_MECHANISM,
  INNER_DRIVERS_MECHANISM,
  KARMIC_LESSONS_MECHANISM,
} from '@/lib/report/advanced/road/road-content';
import { DAY_NUMBER_CONTENT } from '@/server/engines/dayNumerology';
import { withArticle } from './article';

export type GlossaryGroup = 'Human Design' | 'Astrology' | 'Numerology' | 'Timing';

/**
 * The free view of an entry: its one-line summary and its "In your chart" line stay, the long
 * explanation is withheld and the entry says so. Premium gets everything.
 * (Until purchases exist the app states whether it is Premium; the route will check a real entitlement later.)
 */
export function gateEntry<T extends { body: string[] }>(entry: T, premium: boolean): T & { locked: boolean } {
  return premium ? { ...entry, locked: false } : { ...entry, body: [], locked: true };
}

export interface GlossaryEntry {
  id: string;
  group: GlossaryGroup;
  title: string;
  summary: string;
  body: string[];
  related: string[];
}

/** What the person's saved results can tell us. Every field is optional. */
export interface ChartContext {
  hd?: {
    type?: string;
    authority?: string;
    profile?: string;
    definedCenters?: string[];
    activeChannels?: { gates?: number[]; name?: string }[];
    activeGates?: { gate: number; line: number; planet: string; epoch: string }[];
    incarnationCross?: string;
  } | null;
  tropical?: Record<string, { longitude?: number; sign?: string; formatted?: string; retrograde?: boolean }> & {
    houses?: { ascendant?: number; mc?: number };
  } | null;
  numerology?: {
    lifePath?: number;
    destiny?: number;
    soulUrge?: number;
    personality?: number;
    hiddenPassion?: number;
    karmicLessons?: number[];
    pinnacles?: { number: number }[];
    challenges?: { number: number }[];
  } | null;
}

// ─── static, authored entries ────────────────────────────────────────────────

type Static = Omit<GlossaryEntry, 'id'>;
const S: Record<string, Static> = {};

function add(id: string, group: GlossaryGroup, title: string, summary: string, body: string[], related: string[] = []): void {
  S[id] = { group, title, summary, body, related };
}

// Planets and points
const PLANETS: [string, string, string, string][] = [
  ['sun', 'Sun', 'Your core identity and vitality.', 'The Sun is the centre of the chart: who you are becoming, what keeps you vital, and the kind of recognition you seek. Its sign shows your basic orientation; its house shows the area of life where you shine most.'],
  ['moon', 'Moon', 'Your emotional needs and instincts.', 'The Moon describes what makes you feel safe, how you react before you think, and your habits of care. It moves fastest of all the bodies, so it colours each day and is the main driver of the Today screen.'],
  ['mercury', 'Mercury', 'How you think, speak and learn.', 'Mercury is your mental style: how you take in information, put things into words and make connections. Its sign describes the tone of your thinking.'],
  ['venus', 'Venus', 'What you love and value.', 'Venus shows what you are drawn to, how you express affection and how you value people, beauty and money.'],
  ['mars', 'Mars', 'Your drive and how you act.', 'Mars is your energy to pursue and defend: how you start things, how you compete and how anger shows up in you.'],
  ['jupiter', 'Jupiter', 'Where you grow and find opportunity.', 'Jupiter is expansion: belief, generosity and the areas where things tend to open up for you when you lean in.'],
  ['saturn', 'Saturn', 'Where you are tested and build mastery.', 'Saturn is structure, limits and responsibility. It shows where you meet resistance and where steady effort eventually earns real authority.'],
  ['uranus', 'Uranus', 'Disruption and the call for freedom.', 'Uranus moves slowly (about seven years per sign), so its sign is shared by a whole generation. What is personal is the house it occupies: the area of life that keeps asking for change.'],
  ['neptune', 'Neptune', 'Inspiration, dissolving boundaries and illusion.', 'Neptune takes about fourteen years per sign. Its house shows where boundaries blur, imagination runs high and clarity takes extra care.'],
  ['pluto', 'Pluto', 'Deep transformation and power.', 'Pluto takes more than a decade per sign. Its house shows where life asks for the deepest kind of change: letting an old form end so a truer one can form.'],
  ['northNode', 'North Node', 'A point of growth in your chart.', 'The Moon’s nodes are where its orbit crosses the Sun’s apparent path. The North Node is read as a direction of growth that feels unfamiliar but worth moving toward.'],
  ['southNode', 'South Node', 'A point of familiar patterns.', 'The South Node sits exactly opposite the North Node and is read as familiar habits and gifts you already carry.'],
];
for (const [key, name, summary, body] of PLANETS) {
  add(`astro:planet:${key}`, 'Astrology', name, summary, [body, 'In the T3D framework a planet is never a command. It is weather that you read, then decide through your Strategy and Authority.'], ['astro:house:1', 'astro:aspect:conjunction']);
}

// Signs
const SIGN_LINES: Record<string, string> = {
  Aries: 'Initiative, directness and a drive to begin.',
  Taurus: 'Steadiness, the senses and building what lasts.',
  Gemini: 'Curiosity, communication and variety.',
  Cancer: 'Care, memory and emotional protection.',
  Leo: 'Self-expression, warmth and creative pride.',
  Virgo: 'Discernment, craft and usefulness.',
  Libra: 'Balance, relationship and fairness.',
  Scorpio: 'Depth, intensity and transformation.',
  Sagittarius: 'Meaning, exploration and big-picture faith.',
  Capricorn: 'Structure, ambition and long-term mastery.',
  Aquarius: 'Independence, ideas and collective vision.',
  Pisces: 'Imagination, empathy and dissolving edges.',
};
for (const sign of Object.keys(SIGN_INDEX)) {
  add(
    `astro:sign:${sign}`,
    'Astrology',
    sign,
    `${SIGN_ELEMENT[sign] ?? ''} · ${SIGN_MODALITY[sign] ?? ''}. ${SIGN_LINES[sign] ?? ''}`,
    [
      `${sign} is a ${SIGN_ELEMENT[sign]?.toLowerCase()} sign of the ${SIGN_MODALITY[sign]?.toLowerCase()} modality. ${SIGN_LINES[sign]}`,
      'A sign describes the style a planet uses. The planet says what is happening; the sign says how it tends to happen.',
    ],
    ['astro:house:1'],
  );
}

// Houses
for (let h = 1; h <= 12; h++) {
  add(
    `astro:house:${h}`,
    'Astrology',
    `House ${h}: ${HOUSE_NAMES[h]}`,
    HOUSE_THEMES[h] ?? '',
    [
      HOUSE_THEMES[h] ?? '',
      'T3D uses whole-sign houses: your rising sign is your 1st house, the next sign is the 2nd, and so on around the wheel. Houses show the area of life where a planet’s energy plays out.',
    ],
    ['astro:wholesign', 'astro:ascendant'],
  );
}

// Aspects
const ASPECTS: [string, string, string, string, string][] = [
  ['conjunction', 'Conjunction', '0°', 'Two points in the same place.', 'A conjunction blends two energies so strongly that they act as one. Its quality depends on the planets involved. T3D marks it as neutral.'],
  ['sextile', 'Sextile', '60°', 'A supportive angle that offers an opening.', 'A sextile is an easy connection between two points. It offers an opportunity that you still have to use. T3D marks it as flow.'],
  ['square', 'Square', '90°', 'A tense angle that creates friction and action.', 'A square sets two energies at odds. The friction is uncomfortable, and it is also what pushes things to move. T3D marks it as friction.'],
  ['trine', 'Trine', '120°', 'An easy angle where energies work together.', 'A trine joins two energies that cooperate naturally. It can be so easy that it goes unused. T3D marks it as flow.'],
  ['opposition', 'Opposition', '180°', 'Two points facing each other across the chart.', 'An opposition pulls in two directions and asks for balance and awareness of both sides. T3D marks it as friction.'],
];
for (const [key, name, angle, summary, body] of ASPECTS) {
  add(`astro:aspect:${key}`, 'Astrology', name, `${angle} · ${summary}`, [body, `The exact angle is ${angle}. T3D counts a contact as active within 3° and as peak within 1°.`, 'Flow and friction are descriptions of the weather, not scores. Neither one is good or bad.'], ['astro:orb', 'astro:transit']);
}

// Astrology terms
add('astro:ascendant', 'Astrology', 'Ascendant (Rising sign)', 'The sign rising on the eastern horizon at your birth.', [
  'The degree of the zodiac coming up over the eastern horizon at the moment and place you were born. It moves roughly one degree every four minutes, which makes it the most time-sensitive point in the whole chart.',
  'It describes how you meet the world and how the world first meets you — the approach rather than the motive. Where the Sun is what you are becoming, the Ascendant is the door people come through to get to it.',
  'It is also the structural anchor of the chart. In whole-sign houses the rising sign simply is your 1st house, so every house placement and every profection year is counted from here. Change the Ascendant and the entire house layout moves with it.',
  'If no birth time was entered the app uses 12:00 noon, and the Rising sign and houses are only approximate. The planets are still reliable; the houses are the part that needs the time.',
], ['astro:house:1', 'astro:wholesign']);
add('astro:midheaven', 'Astrology', 'Midheaven', 'The highest point of your chart.', [
  'The Midheaven, or MC, is the point where the ecliptic meets the meridian overhead — the highest the Sun gets on the day and at the place you were born. Like the Ascendant it depends entirely on your birth time.',
  'It points to your public role: the thing you become known for, the direction your reputation grows in. Not what you want privately, and not your job title — what people see from a distance.',
  'In whole-sign houses the MC is not pinned to the 10th house the way it is in other systems. It floats, landing wherever its degree falls, and is read as a sensitive point in whatever house that turns out to be. That is a feature of the system rather than an error in the chart.',
], ['astro:house:10', 'astro:wholesign']);
add('astro:retrograde', 'Astrology', 'Retrograde', 'A planet that appears to move backward.', [
  'From where we stand, a planet sometimes seems to slow, stop and travel backward through the zodiac. It is an effect of perspective — Earth passing an outer planet, or being passed by one — and nothing out there actually reverses.',
  'The practical consequence is duration. A retrograde stretches a transit out and takes it over the same degree three times: forward, back, then forward again. Something you thought was finished in the first pass returns in the second and is settled in the third.',
  'The cadences are regular. Mercury goes retrograde for about three weeks, three times a year. Venus for about forty days every eighteen months. Mars for months at a stretch, once every two years.',
  'It is not a malfunction and not a reason to stop. Retrograde periods are built for reviewing, correcting and consolidating; what they are poor at is launching something that needs to stay as launched.',
], ['astro:planet:mercury', 'astro:transit']);
add('astro:orb', 'Astrology', 'Orb', 'How far from exact an aspect is.', [
  'An aspect is an exact angle — 90 degrees, 120 degrees — and planets are almost never exactly there. The orb is the gap in degrees between the angle as it actually stands and the perfect one. A smaller orb is a stronger contact.',
  'T3D draws the line in two places: 1 degree or less counts as peak, and 3 degrees or less counts as active. Beyond 3 degrees the contact is not shown at all, which is why a transit can appear in the app for a few days and then disappear without anything having happened.',
  'Those cut-offs are a deliberate choice rather than a universal rule. Wide orbs produce a chart where everything aspects everything and nothing stands out; a tight orb is what makes the peak days mean something.',
], ['astro:aspect:conjunction', 'astro:applying']);
add('astro:applying', 'Astrology', 'Applying', 'An aspect that is getting closer to exact.', [
  'The faster of the two bodies is still closing the gap, so the orb is shrinking and the exact angle has not arrived yet.',
  'This is the half of an aspect that is usually felt most: pressure building, something gathering, the sense of a thing about to happen. In traditional practice the applying side is the one that carries the event.',
  'Which makes it the half worth planning around. An applying aspect gives you notice — the exact day is still ahead, and the app can tell you when it lands.',
], ['astro:separating', 'astro:orb']);
add('astro:separating', 'Astrology', 'Separating', 'An aspect that is moving away from exact.', [
  'The exact angle has passed and the orb is widening again. The contact is fading rather than building.',
  'It reads as aftermath: what the aspect brought up is now settling, being absorbed, becoming something you look back on rather than something pressing on you.',
  'The distinction matters for timing more than for meaning. Two charts can show the same aspect at the same orb, and the one applying is still coming while the one separating has already done its work.',
], ['astro:applying', 'astro:orb']);
add('astro:transit', 'Astrology', 'Transit', 'Where a planet is in the sky right now.', [
  'A planet’s position today, measured against your natal chart. When a transiting planet forms an aspect to one of your birth planets, or crosses into one of your houses, that is a transit contact.',
  'Transits are the only moving part of astrology. Your natal chart never changes; everything that develops over a life is read as the current sky passing across that fixed picture.',
  'T3D treats them as weather and nothing more. A transit describes the conditions you are moving through — the terrain, the pressure, what the environment is doing — and it never tells you what to do. The decision stays with your Strategy and Authority, inside the body that has to live with it.',
  'The misunderstanding worth correcting is that a transit makes something happen. It does not act for you. It sets the background conditions in which your own choices take place, which is why the same transit is uneventful in one year and defining in another.',
], ['astro:natal', 'astro:profection', 'hd:authority']);
add('astro:natal', 'Astrology', 'Natal Chart', 'The sky at the moment you were born.', [
  'The positions of the planets, the Ascendant and the houses, calculated for your exact birth time and place. It is a single frozen moment.',
  'It never changes, and that is its whole function. Everything else in the system — transits, profections, the slow outer-planet chapters — only means anything because there is a fixed chart to read it against.',
  'In T3D it sits alongside your Human Design bodygraph and your numerology core: three descriptions of the same birth moment, from three different angles. The natal chart is the one that tells you about timing and environment.',
], ['astro:transit', 'astro:ascendant']);
add('astro:tropical', 'Astrology', 'Tropical zodiac', 'The zodiac anchored to the seasons.', [
  'The tropical zodiac puts 0 degrees of Aries at the spring equinox and divides the year from there. It is tied to the relationship between Earth and Sun, not to the constellations.',
  'It is what almost all Western astrology uses, and it is what every "what is your sign" article means. If you have ever been told your Sun sign, it was a tropical one.',
  'Because the equinox slowly drifts against the stars, the tropical signs no longer line up with the constellations they are named after. That is not an error. The system is measuring the seasonal year, and the seasonal year is what it has always measured.',
], ['astro:sidereal']);
add('astro:sidereal', 'Astrology', 'Sidereal zodiac', 'The zodiac anchored to the stars.', [
  'The sidereal zodiac is measured from the fixed stars rather than the equinox. The offset between the two systems is called the ayanamsha, and T3D uses the Lahiri value, the standard in Indian astrology. It currently runs to about 24 degrees.',
  'That is nearly a whole sign, so most people’s planets fall one sign earlier here than in the tropical chart. Seeing your Sun in a different sign is the system working, not a mistake.',
  'T3D shows both rather than picking one, because the two are measuring different things: the tropical chart holds seasonal space and the sidereal chart holds stellar space. Being made to choose between them is a false choice, and having both is more information than having either.',
], ['astro:tropical']);
add('astro:wholesign', 'Astrology', 'Whole-Sign Houses', 'Each house is one full sign.', [
  'Your rising sign becomes the whole of the 1st house, the next sign the whole of the 2nd, and so on round the chart. Every house is exactly one sign — no house is larger than another and no sign is split between two houses.',
  'It is the oldest house system there is, and it is the one T3D uses throughout. The reason is the Stoplight: when a house boundary and a sign boundary are the same line, a transiting planet changes house at the exact moment it changes sign. The shift is unmistakable, the way a light changing colour is unmistakable.',
  'Systems that cut houses by degree blur that. They can put a planet in one sign and two different houses depending on the method, which is fine for interpretation and useless for timing.',
  'It also makes annual profections work cleanly, since a profection year advances by exactly one sign and therefore by exactly one house.',
], ['astro:ascendant', 'astro:profection']);
add('astro:phase', 'Astrology', 'Moon Phase', 'Where the Moon is in its monthly cycle.', [
  'The angle between the transiting Sun and Moon over a cycle of roughly 29 and a half days. New Moon is the two of them together; Full Moon is them opposite; the quarters are the squares in between.',
  'A waxing Moon is growing toward full and reads as building and beginning. A waning Moon is shrinking toward new and reads as releasing and reviewing. The balsamic phase just before the New Moon is the emptiest and the most inward.',
  'The Moon moves about 13 degrees a day and changes sign every two to three days, which makes it the fastest-moving thing in the chart and the right instrument for daily and weekly scheduling.',
  'Being the fastest also means the shallowest. A single lunar aspect passes in hours, so reading a hard Moon day as a crisis is the most common way to overweight the sky.',
], ['astro:planet:moon', 'astro:transit']);
add('astro:eclipse', 'Astrology', 'Eclipse', 'A New or Full Moon on the Moon’s nodes.', [
  'An eclipse is a New Moon or Full Moon that happens close to one of the lunar nodes, which is why the light is blocked rather than merely waxing or waning.',
  'They come in pairs about every six months, and the pairs belong to a series that works one axis of opposing houses for roughly eighteen months before moving on. So an eclipse is rarely a single event; it is one beat in a chapter that has been running for a year or more in the same two areas of your life.',
  'Their effect is read over the following weeks and months rather than on the day, and it is strongest when the eclipse degree touches something in your own chart.',
  'They are not disasters. What an eclipse disrupts is a routine that had stopped working, and the clearing is the function rather than a side effect.',
], ['astro:planet:northNode', 'astro:phase']);
add('astro:ingress', 'Astrology', 'Ingress', 'A planet moving into a new sign.', [
  'The exact moment a planet crosses from 29 degrees and 59 minutes of one sign to 0 degrees of the next.',
  'The planet keeps doing its own job and changes the style it does it in. The same function arrives wearing a different filter, and because T3D uses whole-sign houses, the planet changes house in the same instant — which is why an ingress is the clearest stoplight in the system.',
  'The cadences set the rhythm of the sky: the Moon every two and a half days, the Sun and Mercury and Venus roughly every month, Mars about every six weeks when direct, Jupiter about once a year, Saturn every two and a half to three years.',
  'An ingress shifts the environment, not you. Nothing in your natal chart or your design changes when a planet moves; the conditions around it do.',
], ['astro:planet:sun', 'astro:wholesign']);
add('astro:profection', 'Astrology', 'Lord of the Year', 'The planet in charge of your current year of life.', [
  'Annual profections step one whole-sign house forward every birthday, starting from the 1st house in your first year of life. The planet that rules the sign of the house you land on becomes the Lord of the Year, and it holds that office from birthday to birthday.',
  'Because there are twelve houses the cycle repeats every twelve years, so ages 0, 12, 24, 36, 48, 60 and 72 are all 1st-house years — years about you and your own body rather than about anything external.',
  'Its real use is as a filter. Transits involving the Lord of the Year, and transits moving through the profected house, are the ones that land; everything else tends to pass in the background.',
  'This is what explains the thing people find hardest about astrology — why a heavy Saturn transit rewrote one person’s life and barely registered for another. Not the transit. Whether it was activated that year.',
], ['astro:wholesign', 'astro:transit']);
add('astro:season', 'Astrology', 'Slow Transit', 'A long contact from a slow planet.', [
  'A transit by one of the slow bodies — Jupiter out to Pluto — that stays within orb of a point in your chart for weeks or months, often arriving in several passes as the planet turns retrograde and comes back over the same degree.',
  'These are the multi-year chapters rather than the daily weather. Saturn spends about two and a half to three years in a sign, Uranus about seven, Neptune about fourteen, Pluto anywhere from twelve to thirty.',
  'Read them as developmental rather than eventful. A slow transit is a long process of structural change, and judging it by what happened on one day of it tells you almost nothing.',
  'The usual mistake is expecting resolution on a schedule. These transits shape whole eras of a life, and they finish when they finish.',
], ['astro:transit', 'astro:retrograde']);

// Human Design
add('hd:strategy', 'Human Design', 'Strategy', 'How your Type is built to meet life.', [
  'Strategy comes from your Type, and your Type comes from how your aura works. A Generator responds to what shows up rather than initiating. A Projector waits to be recognised and invited. A Manifestor informs the people affected before acting. A Reflector waits out a full lunar cycle before anything large.',
  'It is not a rule imposed on you. It describes the way your particular energy field already engages the world correctly, so following it mostly removes friction rather than adding discipline.',
  'The real work it does is move the decision out of your head and into your body. Your mind is excellent at analysis and was never built to run your life; Strategy is the handover.',
  'If Strategy feels like a restriction, that is usually the mind objecting to losing the job. What it actually protects is the thing that makes you different from everyone else.',
], ['hd:authority', 'hd:notself']);
add('hd:authority', 'Human Design', 'Authority', 'Where your best decisions come from.', [
  'Authority is the specific place in your body that is built to decide: the gut’s immediate response, the emotions needing time to come to clarity, the spleen’s instant and quiet knowing, or — where no Centre provides it — a process that works through conversation or through a lunar cycle.',
  'It gives signals rather than reasons. A sacral sound, a settled feeling that was not there yesterday, an instinct that arrives once and does not repeat. None of that argues its case the way a pros-and-cons list does.',
  'T3D puts Authority above everything else, including the sky, and the reason is structural rather than reverent. Transits are the conditions outside you; your Authority is inside the body that has to live with the decision. Keep that order and the sky stays what it is — information about the terrain. Reverse it and the weather starts making your choices.',
  'Having no inner Authority is not having no way to decide. It means the process runs through your environment or through time rather than through a defined Centre, which is slower and no less reliable.',
], ['hd:strategy', 'astro:transit']);
add('hd:notself', 'Human Design', 'Not-self', 'The signal that you are off track.', [
  'A specific feeling tied to your Type: frustration for a Generator, bitterness for a Projector, anger for a Manifestor, disappointment for a Reflector.',
  'It tends to appear when the mind has taken over the decisions — usually through an open Centre, where the pressure to prove yourself, to avoid a confrontation or to end the discomfort quickly is strongest.',
  'Read it as instrumentation. It is a light on the dashboard telling you which way you have drifted, and the response it asks for is returning to Strategy and Authority, not self-examination.',
  'It is not a character flaw and not evidence that something is wrong with you. Everybody meets their not-self theme; it is the signal working.',
], ['hd:strategy', 'hd:signature']);
add('hd:signature', 'Human Design', 'Signature', 'The feeling of being aligned.', [
  'The counterpart to the not-self: satisfaction for a Generator, success for a Projector, peace for a Manifestor, surprise for a Reflector.',
  'It shows up as physical ease — the sense of things costing less than they used to — when your energy is being engaged the way it is built to be.',
  'Treat it as confirmation rather than a target. Signature is what happens when the mechanics are right; it is the readout, not the goal.',
  'Which is why it cannot be manufactured. Chasing the feeling directly is the surest way not to get it; the feeling follows the operation.',
], ['hd:notself']);
add('hd:bodygraph', 'Human Design', 'Bodygraph', 'The map of your design.', [
  'The whole chart in one diagram: nine Centres, joined by 36 channels, built from 64 gates. It is drawn twice over — once from your birth moment and once from the design epoch — and the two sets of activations are laid on the same figure.',
  'Coloured Centres are defined and run consistently. White Centres are open and take in what is around them. That single distinction carries most of what the bodygraph has to say.',
  'In T3D terms it maps the Vehicle: the machinery you are driving, where it generates its own power and where it runs on what it picks up from outside.',
  'It is not a personality test. It describes mechanics — how energy moves through a body — rather than traits, and it does not sort people into kinds of person.',
], ['hd:defined', 'hd:open', 'hd:channel']);
add('hd:defined', 'Human Design', 'Defined Center', 'A Center that works the same way all the time.', [
  'A Centre is defined when a complete channel reaches it — both gates at either end of a connecting line active, closing the circuit. Define a channel and you define both Centres it touches.',
  'It then runs the same way all the time, regardless of who you are with. It is reliable in you and, because an aura broadcasts, other people feel it coming off you consistently.',
  'This is the part of you worth leaning on and the part worth watching. Fixed energy is dependable, and it is also the energy you are most likely to press onto someone whose Centre is open there.',
  'Defined is not better than open. It means fixed, and fixed is useful for consistency and useless for flexibility. The open version of the same Centre has advantages this one does not.',
], ['hd:open', 'hd:channel']);
add('hd:open', 'Human Design', 'Open Center', 'A Center that takes in and amplifies.', [
  'A Centre with no complete channel reaching it — whether it holds a hanging gate or nothing at all.',
  'It takes in and amplifies whatever is around it rather than generating its own steady supply, so what you feel there is often not originally yours. In a crowded room an open Centre is reading the room.',
  'Over time it is where you become wise in a way nobody with that Centre defined can be. Having sampled every version of that energy through hundreds of people, you end up able to recognise it in a way someone with it fixed never can.',
  'It is not damage and there is nothing missing. An open Centre is a working sensor, and the trouble only starts when the mind treats what it picks up as a verdict on you.',
], ['hd:defined', 'hd:hanging']);
add('hd:hanging', 'Human Design', 'Hanging gate', 'A gate without its channel partner.', [
  'One end of a channel activated and the other end not. The gate is live in you; the circuit is not closed.',
  'It behaves like a magnet. A hanging gate reaches for the gate that would complete it, which is why certain people feel unusually compelling and why certain transits land harder than others — something that was half-open just closed.',
  'It is a useful thing to know about yourself, because it explains a pattern in who you are drawn to that otherwise looks like coincidence.',
  'It is not a deficiency waiting for another person to fix. The theme is available to you whenever the right connection or transit arrives, and it is not something to go hunting for in a relationship.',
], ['hd:channel', 'hd:open']);
add('hd:channel', 'Human Design', 'Channel', 'Two gates that join two Centers.', [
  'A line between two Centres with both of its gates activated. Completing it defines both Centres at either end and establishes a permanent circuit.',
  'What it produces is not the two gates added together. A channel makes a third thing — one consistent current with its own character, which is why channels have names of their own rather than being listed as pairs.',
  'Your defined channels are where your energy reliably runs. Following Strategy and Authority is what lets them power what you do instead of being pushed.',
  'There are 36 of them, and the ones you have define the shape of your bodygraph. Which Centres end up coloured is entirely a consequence of which channels are complete.',
], ['hd:hanging', 'hd:defined']);
add('hd:personality', 'Human Design', 'Personality (conscious)', 'What you know about yourself.', [
  'The activations calculated from your exact birth moment, drawn in black on the bodygraph.',
  'This is everything you experience as "me": your self-aware thinking, your perspective, the part you could describe if someone asked.',
  'In T3D’s framing it is the passenger rather than the driver. It sees out of the window, and it is good at that — the conscious mind is built to notice and to share what it notices with other people. It is not built to steer.',
  'Which is the correction most worth making: the part of you that feels most like you is not the part designed to make your decisions.',
], ['hd:design']);
add('hd:design', 'Human Design', 'Design (unconscious)', 'What your body carries.', [
  'The activations calculated from the moment the Sun stood exactly 88 degrees of arc earlier than at your birth — roughly 88 to 89 days before, though it is the arc that is measured and not the days. Drawn in red.',
  'That span is not arbitrary. It is the period in which the body is being built, and it ends as the third trimester begins, before the conscious part of you arrives.',
  'It runs your physical intelligence: genetics, instinct, the behaviour people see in you clearly while you have no direct view of it yourself. Others often describe your Design side back to you and it sounds like a stranger.',
  '"Unconscious" here means inaccessible, not damaged. It is the body’s operating system doing its job, and because you cannot reach it by thinking, the only way to work with it is to let it decide — which is what Strategy and Authority are for.',
], ['hd:personality', 'hd:authority']);
add('hd:line', 'Human Design', 'Line', 'A finer layer inside each gate.', [
  'Every one of the 64 gates divides into six lines, numbered from the bottom up. Lines 1 to 6 are the Investigator, the Hermit, the Experimenter, the Opportunist, the Heretic and the Role Model.',
  'The gate says what the energy is; the line says how it behaves. The same gate on a 1st line and on a 6th line will look like two different people using the same equipment.',
  'Your Profile is built from two of them, and the lines that repeat across your activations are worth noticing — a line that keeps appearing is a style that keeps appearing.',
  'A higher number is not a higher grade. The 6th line is not an advanced 1st line; they are different jobs in the same structure, and a hexagram needs all six.',
], ['hd:profile', 'hd:gate:1']);
add('hd:profile', 'Human Design', 'Profile', 'The two lines that describe your role.', [
  'The line of your conscious Sun paired with the line of your unconscious Sun, written as a fraction: 1/3, 4/1, 6/2. There are twelve.',
  'They fall into three geometries. Right Angle profiles live out a personal journey and are much the most common. Juxtaposition is a fixed fate and belongs to the 4/1 alone. Left Angle profiles are transpersonal — their lives turn on other people.',
  'Profile is the costume the purpose wears: how your life unfolds and how other people meet you, rather than what you are here to do.',
  'The 3rd line gets the worst press and deserves better. Trial and error is not failure repeated; it is the method by which anything gets found out to be true, and a 3rd line is the part of the system that does that work for everybody else.',
], ['hd:line', 'hd:cross']);
add('hd:cross', 'Human Design', 'Incarnation Cross', 'The theme of your life’s purpose.', [
  'Four gates: your Sun and Earth in the conscious calculation and again in the unconscious one. Between them they account for the largest share of your imprint, which is why they are read as a theme for the whole life. There are 192 of them.',
  'It sets a background frequency rather than a task — the story that tends to emerge from a life lived as itself, visible mostly in hindsight.',
  'Its angle comes from your Profile, so the two always agree: a 4/1 carries a Juxtaposition cross and nothing else can.',
  'The one thing not to do with it is try to perform it. A cross is not a job description, and deciding to go and fulfil it from the mind is precisely how it does not happen. It arrives as a by-product of living by Strategy and Authority.',
], ['hd:godhead', 'hd:profile']);
add('hd:godhead', 'Human Design', 'Godhead', 'The archetype your mind wears.', [GODHEAD_MECHANISM], ['hd:cross']);
add('hd:variables', 'Human Design', 'Variables', 'Four Left or Right settings in your body.', [VARIABLES_MECHANISM], ['hd:design']);
for (const [type, c] of Object.entries(TYPE_CONTENT)) {
  add(`hd:type:${type}`, 'Human Design', type, `Strategy: ${c.strategy}`, [c.plain, `When aligned you tend to feel ${c.signature.toLowerCase()}. When off track you tend to feel ${c.notSelf.toLowerCase()}.`], ['hd:strategy', 'hd:authority']);
}
for (const [key, c] of Object.entries(AUTHORITY_CONTENT)) {
  add(`hd:authority:${key}`, 'Human Design', /authority/i.test(c.authority) ? c.authority : `${c.authority} Authority`, c.mechanism.split('. ')[0] + '.', [c.mechanism, c.falseUrgency], ['hd:authority', 'hd:strategy']);
}
for (const [key, c] of Object.entries(PROFILE_CONTENT)) {
  add(`hd:profile:${key}`, 'Human Design', `Profile ${key}`, c.role, [c.plain, c.socialPattern, c.visibility], ['hd:profile', 'hd:line']);
}
for (const [id, name] of Object.entries(CENTER_DISPLAY_NAME)) {
  const cap = CENTER_CAPACITIES[id];
  const open = OPEN_CENTER_THEMES[id];
  add(`hd:center:${id}`, 'Human Design', /center/i.test(name) ? name : `${name} Center`, cap?.title ?? name, [
    cap ? `When defined: ${cap.title}. ${cap.description}` : '',
    open ? `When open: ${open.title}. ${open.sensitivity} ${open.wisdom}` : '',
  ].filter(Boolean), ['hd:defined', 'hd:open']);
}
for (const [key, m] of Object.entries(DEFINITION_MEANING)) {
  add(`hd:definition:${key}`, 'Human Design', key === 'No Definition' ? key : `${key} Definition`, m.split('. ')[0]!.replace(/\.?$/, '.'), [m], ['hd:defined']);
}
for (const [key, m] of Object.entries(CIRCUIT_GROUP_MEANING)) {
  add(`hd:circuit:${key}`, 'Human Design', key === 'None' ? 'No Dominant Circuitry' : `${key} Circuitry`, m.keynote, [m.passage], ['hd:channel']);
}

// Numerology
add('num:master', 'Numerology', 'Master numbers', '11, 22 and 33 keep their double digits.', [
  'When a total lands on 11, 22 or 33 it stops there instead of reducing. It is written with its root — 11/2, 22/4, 33/6 — because both halves are live: the master frequency and the ordinary number underneath it.',
  'T3D keeps masters at every step of a calculation, not only at the end, so an 11 that appears partway through survives into the result rather than collapsing to a 2 on the way.',
  'The root is not a footnote. A master number asks you to have built the plain version first: a 22 is asked to master the 4 — patience, structure, finishing things — before the larger building is available to it. Skipping that step is the usual way a master number goes wrong.',
  'And it is not a prize. A master number raises what is being asked, not what is guaranteed. Having one means more friction and more accountability, which is a different thing from more success.',
], ['num:11', 'num:22', 'num:33']);
add('num:lifepath', 'Numerology', 'Life Path', 'The direction your whole life leans toward.', [
  'Your birth month, day and year, each reduced and then added together, reduced once more. Master numbers are kept at every step. It is the only core number that comes from the date alone, and it never changes.',
  'This is the Road itself: the trajectory you are walking and the curriculum you are enrolled in for the whole of a life. Every other number in your chart describes how you travel it.',
  'The thing most people get backwards: your Life Path is not a list of talents you already have. It names what you are growing into, which means it is also where your hardest lessons sit. A 3 Life Path is here to develop expression — and will often meet the deepest blocks around exactly that. Expect your opportunities and your obstacles to cluster in the same place.',
], ['num:destiny', 'num:maturity', 'num:master']);
add('num:destiny', 'Numerology', 'Destiny (Expression)', 'What you are here to do and develop.', [INNER_DRIVERS_MECHANISM], ['num:soulurge', 'num:personality']);
add('num:soulurge', 'Numerology', 'Soul Urge', 'What you want at your core.', [
  'The vowels of your full birth name, converted to their Pythagorean values and reduced. Vowels only — the consonants make your Personality number, and all the letters together make your Destiny.',
  'It is the private motive underneath the visible life: what you actually want, as opposed to what you do or how you come across. People often recognise their Soul Urge as the thing they would do if nobody were watching.',
  'It will not always agree with your Life Path, and that is ordinary rather than a fault. An independent 1 Life Path carrying a 2 Soul Urge is being asked to build something of their own and to do it in company. The work is making room for both rather than picking a side.',
  'It must be the name on your birth certificate — not a married name, a shortened name or the one you go by. In Pythagorean numerology that original name is the record of what you arrived with, and a later name describes something else.',
], ['num:destiny', 'num:personality']);
add('num:personality', 'Numerology', 'Personality Number', 'How others first experience you.', [
  'The consonants of your full birth name, converted and reduced — the mirror image of the Soul Urge, which uses the vowels.',
  'It describes the first impression: the read a stranger gets in the opening minute, before anything deeper is visible. Think of it as the outer filter rather than the person behind it.',
  'Useful precisely because it is not you. Knowing the impression you tend to make is what lets you work with it — leaning on it where it helps and correcting for it where it gives people the wrong idea.',
  'It is the shallowest of the core numbers by design. If your Personality and your Soul Urge seem to describe two different people, that is the system working: one is the door and the other is the room.',
], ['num:destiny', 'num:soulurge']);
add('num:hiddenpassion', 'Numerology', 'Hidden Passion', 'The energy you use most.', [HIDDEN_PASSION_MECHANISM], ['num:karmic']);
add('num:karmic', 'Numerology', 'Karmic Lessons', 'Numbers missing from your name.', [KARMIC_LESSONS_MECHANISM], ['num:hiddenpassion']);
/** Reduce to one digit but keep 11, 22 and 33. */
function reduceKeepMasters(n: number): number {
  let v = n;
  while (v > 9 && v !== 11 && v !== 22 && v !== 33) v = String(v).split('').reduce((a, d) => a + Number(d), 0);
  return v;
}

/** Maturity Number: Life Path plus Destiny (Expression), reduced, keeping 11, 22 and 33. */
export function maturityNumber(lifePath: number, destiny: number): number {
  return reduceKeepMasters(lifePath + destiny);
}

/** What each number becomes as a Maturity Number (from the T3D PHILOSOPHER knowledge base). */
export const MATURITY_MEANINGS: Record<number, string> = {
  1: 'independent leadership, self-reliance and the courage to stand on your own feet.',
  2: 'quiet diplomacy, patient cooperation and emotional attunement.',
  3: 'creative self-expression, optimistic communication and lifting others through words or art.',
  4: 'practical stability, steady organisation and building lasting foundations.',
  5: 'freedom, adaptability and welcoming constructive change.',
  6: 'family responsibility, nurturing service and accepting imperfection in yourself and others.',
  7: 'inner wisdom, research and trust earned through solitude.',
  8: 'executive authority and handling resources with ethics.',
  9: 'compassion for everyone, service and letting go of ego attachments.',
  11: 'intuitive illumination and visionary insight, held on a diplomatic 2 base.',
  22: 'master building: turning large practical visions into lasting structures, held on a 4 base.',
  33: 'master teaching and selfless care for others, held on a 6 base.',
};

add('num:maturity', 'Numerology', 'Maturity Number', 'Where your life is ripening toward.', [
  'Your Maturity Number is your Life Path plus your Destiny (Expression), reduced to one digit. If the total is 11, 22 or 33 it stays as a master number.',
  'It sits quietly in the background from birth, starts to show itself around ages 35 to 40, and flowers fully in your 50s and later. It does not cancel your earlier numbers. It is a blend of two of them that ripens with time.',
  'Use it as a roadmap to experiment with, not as a verdict.',
], ['num:lifepath', 'num:destiny']);
add('num:subconscious', 'Numerology', 'Subconscious Self', 'How steady you feel when things go wrong.', [
  'Start at 9 and subtract one for every digit from 1 to 9 that never appears in your full birth name. Those gaps are your Karmic Lessons, so the two numbers are the same finding read two ways: the Lessons name which capacities are missing, and the Subconscious Self counts how many you have.',
  'It describes your instinctive response when something catches you off guard — the degree to which you trust your own resources in the second before you have had time to think. A higher number is not a better character; it means more of the nine kinds of competence are already wired in, so fewer situations are unfamiliar.',
  'A lower number does not mean you cope badly. It means the gaps are the places you have had to build a method for deliberately, and a built method holds under pressure just as well as an instinct does — it only takes longer to arrive.',
], ['num:karmic', 'num:hiddenpassion']);
add('num:pinnacle', 'Numerology', 'Pinnacle', 'A long chapter of your life.', [
  'Four long chapters, each built by addition from your birth date: the first from your birth month plus your birth day, the second from your day plus your year, the third from the first two added together, and the fourth from your month plus your year.',
  'Their timing is set by your Life Path. The first Pinnacle runs from birth to the age of 36 minus your Life Path number. The second and third run nine years each. The fourth begins at the end of the third and lasts the rest of your life. A master Life Path uses its root — 11 as 2, 22 as 4, 33 as 6 — for the timing only.',
  'So the first and last chapters are long, often around thirty years each, and the two in the middle are short and intense. That shape is the point: the middle of a life turns over faster than either end.',
  'A Pinnacle describes the environment you are enrolled in rather than events that are going to happen. It explains the kind of terrain and the lessons that keep arriving in it; what you do there is still yours.',
], ['num:challenge', 'num:lifepath']);
add('num:challenge', 'Numerology', 'Challenge', 'The recurring lesson in each chapter.', [
  'Challenges are the one place numerology subtracts instead of adding. The first is the gap between your birth month and birth day, the second the gap between your day and your year, the third the gap between those two, and the fourth the gap between your month and your year. There are no negative numbers, so the smaller always comes off the larger, and no master numbers survive the subtraction.',
  'That makes a Challenge a single digit from 0 to 8. A zero is its own case, sometimes called the Challenge of Choice: nothing is imposed, which is its own kind of difficulty.',
  'Where the Pinnacle describes the environment around you, the Challenge describes the work inside you. The third one is the main one and runs your whole life rather than a single chapter.',
  'It is not a curse or a permanent weakness. A Challenge marks the skill you keep being handed opportunities to build, and the areas people tend to end up strongest in are usually the ones they had to work at.',
], ['num:pinnacle', 'num:lifepath']);
add('num:birthday', 'Numerology', 'Birthday Number', 'The day you were born.', [
  'The day of the month you were born, reduced, unless it is 11 or 22 — those stand as they are.',
  'It is the narrowest and most concrete number in the chart: a specific, ready-made ability you were handed at birth rather than a direction you are growing toward.',
  'Its use is practical. When the Life Path gets difficult, the Birthday number is the tool already in your hand — the thing you are good at without having had to learn it, which can usually be applied to the problem in front of you.',
  'It is one instrument, not the whole kit. It supports the Life Path; it never replaces or overrides it.',
], ['num:lifepath', 'num:attitude']);
add('num:attitude', 'Numerology', 'Attitude Number', 'Your first reaction to the world.', [
  'Your birth month plus your birth day, reduced. It uses two thirds of what makes the Life Path and leaves out the year.',
  'It describes your opening move — the reaction that arrives before you have decided anything. Not what you conclude about a situation, but what you do in the first few seconds of meeting one.',
  'Worth knowing mainly so you can catch it. A reflex you can see coming stops being a reflex, which matters most when the first reaction and the considered one point different ways.',
  'It is not your astrological Sun sign, despite sometimes being called the Sun number, and it is not a second Life Path. Its whole scope is the moment of first contact.',
], ['num:lifepath', 'num:birthday']);
add('num:universalday', 'Numerology', 'Universal Day', 'The energy of today’s date for everyone.', [
  'Reduce the month, reduce the day, add the Universal Year, and reduce again. Nothing about you enters the calculation, so the whole world shares one Universal Day and it lasts twenty-four hours.',
  'It is the collective tone of the date itself — the mood of the room before you walk in. T3D shows it beside your Personal Day so you can see the two separately: what the day is doing generally, and what it is doing for you.',
  'A single Universal Day will not redirect your life. It is a background tone, and when it clashes with your Personal Day that is worth noticing rather than worrying about.',
], ['num:personalday', 'num:universalyear']);
add('num:personalday', 'Numerology', 'Personal Day', 'The energy of today for you.', [
  'Add your Personal Month to today’s date and reduce. It is the narrowest ring of the Road: your year sets the terrain, your month sets the chapter, and the day shades the hours in front of you.',
  'Used well it is a scheduling tool rather than a forecast. A 1 or 8 day suits decisions and the meeting you have been putting off; a 7 day suits research and thinking alone; a 9 day suits finishing and clearing.',
  'No Personal Day is a bad day. The numbers describe a tilt, not a verdict, and reading too much into any single one is the fastest way to misuse the whole system.',
], ['num:universalday', 'num:personalmonth']);
add('num:personalmonth', 'Numerology', 'Personal Month', 'The theme of this month for you.', [
  'Add your Personal Year to the number of the calendar month and reduce. A Personal Year 4 in May gives 4 + 5 = 9.',
  'It breaks the year into twelve chapters, each with its own emphasis, and it always sits inside the Personal Year rather than beside it. A 9 month in a 4 year is still a building year; it is the part of that year where something finishes.',
  'This is the layer most worth planning against. A year is too long to steer by and a day is too short, but a month is roughly the size of an actual project.',
], ['num:personalyear', 'num:personalday']);
add('num:personalyear', 'Numerology', 'Personal Year', 'The theme of this year for you.', [
  'Reduce your birth month, reduce your birth day, add the Universal Year of your most recent birthday, and reduce the total. Master numbers are kept at every step, so an 11, 22 or 33 survives into the result rather than collapsing.',
  'Your Personal Year runs birthday to birthday, not January to December. Until your birthday arrives you are still in the year that began on your last one — which is why T3D works it out from the Universal Year of your most recent birthday rather than from today’s calendar year.',
  'It places you in a nine-year cycle that keeps turning over your whole life. A 1 year opens a new nine-year arc and favours starting; a 4 year is for building foundations; a 7 year pulls inward toward study and reassessment; a 9 year closes the cycle and clears what is finished.',
  'The common mistake is treating every year as a year to push. Each number in the cycle has its own job, and forcing expansion during a year built for consolidation is where most of the friction comes from.',
], ['num:personalmonth', 'num:universalyear']);
add('num:universalyear', 'Numerology', 'Universal Year', 'The energy of the calendar year.', [
  'Add the digits of the calendar year and reduce: 2026 becomes 2+0+2+6 = 10, then 1+0 = 1. That single digit is the Universal Year, and every person alive is in the same one at the same time.',
  'It describes the collective weather — the background current the whole world is moving through for those twelve months — not anything about you specifically. A Universal 1 year tilts toward beginnings and new ventures; an 8 year pulls collective attention toward money, authority and structures.',
  'Its practical job in your chart is to be the base your Personal Year is built from. Read it the way you read the season rather than the forecast: it sets what everyone is working with, and your Personal Year says what you are doing inside it.',
], ['num:personalyear', 'num:universalday']);
for (const [n, c] of Object.entries(DAY_NUMBER_CONTENT)) {
  const num = Number(n);
  const root = num === 11 ? 2 : num === 22 ? 4 : num === 33 ? 6 : null;
  add(`num:${n}`, 'Numerology', root ? `${n}/${root} ${c.label}` : `${n}: ${c.label}`, c.theme, [
    c.theme,
    `Key themes: ${c.keyThemes.join(', ')}.`,
    `Lean in: ${c.leanIn}`,
    `Watch for: ${c.watchFor}`,
  ], root ? ['num:master'] : []);
}

// ─── dynamic entries: gates and channels ─────────────────────────────────────

function buildGate(n: number): Static | null {
  const k = GATE_KEYNOTES[n];
  if (!k) return null;
  const center = CENTER_DISPLAY_NAME[k.center] ?? k.center;
  const gh = findGodheadByGate(n);
  const channels = CHANNELS.filter((c) => c.gates.includes(n));
  const body = [`Gate ${n}, ${k.ichingName}, sits in the ${center} Center. ${k.coreMeaning}`];
  if (channels.length) body.push(`It is part of ${channels.map((c) => `${c.name} (${c.gates[0]}–${c.gates[1]})`).join(', ')}.`);
  if (gh) body.push(`It belongs to the Godhead ${gh.name}, ${gh.archetype}.`);
  return {
    group: 'Human Design',
    title: `Gate ${n}: ${k.ichingName}`,
    summary: k.coreMeaning,
    body,
    related: [`hd:center:${k.center}`, ...channels.map((c) => `hd:channel:${c.gates[0]}-${c.gates[1]}`)],
  };
}

function buildChannel(a: number, b: number): Static | null {
  const ch = CHANNELS.find((c) => (c.gates[0] === a && c.gates[1] === b) || (c.gates[0] === b && c.gates[1] === a));
  if (!ch) return null;
  const ka = GATE_KEYNOTES[ch.gates[0]];
  const kb = GATE_KEYNOTES[ch.gates[1]];
  const circ = CIRCUIT_GROUP_MEANING[ch.group];
  return {
    group: 'Human Design',
    title: `${ch.name} (${ch.gates[0]}–${ch.gates[1]})`,
    summary: `${ch.group} circuitry · ${ch.subCircuit}`,
    body: [
      `The channel of ${ch.name} joins Gate ${ch.gates[0]} (${ka?.ichingName ?? ''}) in the ${CENTER_DISPLAY_NAME[ka?.center ?? ''] ?? ''} Center with Gate ${ch.gates[1]} (${kb?.ichingName ?? ''}) in the ${CENTER_DISPLAY_NAME[kb?.center ?? ''] ?? ''} Center.`,
      `${ka?.coreMeaning ?? ''} ${kb?.coreMeaning ?? ''}`.trim(),
      `It belongs to the ${ch.group} family (${circ.keynote}).`,
    ],
    related: [`hd:circuit:${ch.group}`, `hd:gate:${ch.gates[0]}`, `hd:gate:${ch.gates[1]}`],
  };
}

// ─── lookup ──────────────────────────────────────────────────────────────────

function lookupStatic(id: string): Static | null {
  const direct = S[id];
  if (direct) return direct;
  const gate = /^hd:gate:(\d{1,2})$/.exec(id);
  if (gate) return buildGate(Number(gate[1]));
  const channel = /^hd:channel:(\d{1,2})-(\d{1,2})$/.exec(id);
  if (channel) return buildChannel(Number(channel[1]), Number(channel[2]));
  return null;
}

const ZODIAC = Object.keys(SIGN_INDEX);

function signOf(longitude: number): string {
  return ZODIAC[Math.floor((((longitude % 360) + 360) % 360) / 30)] ?? '';
}

function houseOf(longitude: number, ascendant: number): number {
  const s = Math.floor((((longitude % 360) + 360) % 360) / 30);
  const a = Math.floor((((ascendant % 360) + 360) % 360) / 30);
  return ((s - a + 12) % 12) + 1;
}

const PLANET_NAME: Record<string, string> = {
  sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn',
  uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto', northNode: 'North Node', southNode: 'South Node',
};

/** The "In your chart" line for an entry, or null when nothing personal applies. */
function personalise(id: string, ctx: ChartContext): string | null {
  const hd = ctx.hd ?? null;
  const tr = ctx.tropical ?? null;
  const nm = ctx.numerology ?? null;
  const asc = tr?.houses?.ascendant;

  let m: RegExpExecArray | null;

  if ((m = /^hd:type:(.+)$/.exec(id)) && hd?.type) {
    return hd.type.toLowerCase() === m[1]!.toLowerCase() ? `This is your Type.` : null;
  }
  if ((m = /^hd:authority:(.+)$/.exec(id)) && hd?.authority) {
    return hd.authority.toLowerCase().includes(m[1]!.toLowerCase()) ? `This is your Authority.` : null;
  }
  if ((m = /^hd:profile:(.+)$/.exec(id)) && hd?.profile) {
    return hd.profile === m[1] ? `This is your Profile.` : null;
  }
  if ((m = /^hd:center:(.+)$/.exec(id)) && hd?.definedCenters) {
    const name = CENTER_DISPLAY_NAME[m[1]!] ?? m[1]!;
    return hd.definedCenters.includes(m[1]!) ? `Your ${name} Center is defined.` : `Your ${name} Center is open.`;
  }
  if ((m = /^hd:gate:(\d+)$/.exec(id)) && hd?.activeGates) {
    const n = Number(m[1]);
    const hits = hd.activeGates.filter((g) => g.gate === n);
    if (!hits.length) return `Gate ${n} is not activated in your chart.`;
    return hits
      .map((g) => `${PLANET_NAME[g.planet] ?? g.planet} ${g.epoch === 'personality' ? '(conscious)' : '(unconscious)'}, line ${g.line}`)
      .join('; ')
      .replace(/^/, `You have Gate ${n}: `);
  }
  if ((m = /^hd:channel:(\d+)-(\d+)$/.exec(id)) && hd?.activeChannels) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    const has = hd.activeChannels.some((c) => c.gates?.includes(a) && c.gates?.includes(b));
    if (has) return 'This channel is defined in your chart.';
    const ga = hd.activeGates?.some((g) => g.gate === a);
    const gb = hd.activeGates?.some((g) => g.gate === b);
    if (ga || gb) return `You have Gate ${ga ? a : b} but not its partner, so it is a hanging gate in your chart.`;
    return 'This channel is not defined in your chart.';
  }
  if ((m = /^astro:planet:(.+)$/.exec(id)) && tr) {
    const p = tr[m[1]!] as { longitude?: number; retrograde?: boolean; formatted?: string } | undefined;
    if (p?.longitude === undefined) return null;
    const house = typeof asc === 'number' ? ` in your ${houseOf(p.longitude, asc)}${suffix(houseOf(p.longitude, asc))} house` : '';
    const top = closestAspects(m[1]!, tr)[0];
    const aspect = top ? ` Its closest aspect is ${withArticle(top.type)} to ${PLANET_NAME[top.other] ?? top.other} (${top.orb.toFixed(1)}° from exact).` : '';
    return `Your ${PLANET_NAME[m[1]!] ?? m[1]} is in ${p.formatted ?? signOf(p.longitude)}${house}${p.retrograde ? ', retrograde' : ''}.${aspect}`;
  }
  if ((m = /^astro:sign:(.+)$/.exec(id)) && tr) {
    const here = Object.keys(PLANET_NAME)
      .filter((k) => typeof tr[k]?.longitude === 'number' && signOf(tr[k]!.longitude!) === m![1])
      .map((k) => PLANET_NAME[k]);
    const risingNote = typeof asc === 'number' && signOf(asc) === m[1] ? ['Rising'] : [];
    const list = [...here, ...risingNote];
    return list.length ? `In your chart: ${list.join(', ')}.` : `No planets of yours are in ${m[1]}.`;
  }
  if ((m = /^astro:house:(\d+)$/.exec(id)) && tr && typeof asc === 'number') {
    const h = Number(m[1]);
    const here = Object.keys(PLANET_NAME)
      .filter((k) => typeof tr[k]?.longitude === 'number' && houseOf(tr[k]!.longitude!, asc) === h)
      .map((k) => PLANET_NAME[k]);
    const sign = ZODIAC[(Math.floor((((asc % 360) + 360) % 360) / 30) + h - 1) % 12];
    return here.length
      ? `Your ${h}${suffix(h)} house is in ${sign}. It holds: ${here.join(', ')}.`
      : `Your ${h}${suffix(h)} house is in ${sign}. It has no planets of yours.`;
  }
  if (id === 'astro:ascendant' && typeof asc === 'number') return `Your Rising sign is ${signOf(asc)}.`;
  if (id === 'astro:midheaven' && typeof tr?.houses?.mc === 'number') return `Your Midheaven is in ${signOf(tr.houses.mc)}.`;
  if (id === 'hd:cross' && hd?.incarnationCross) return `Your cross: ${hd.incarnationCross}.`;
  if ((m = /^num:(\d+)$/.exec(id)) && nm) {
    const n = Number(m[1]);
    const where: string[] = [];
    if (nm.lifePath === n) where.push('Life Path');
    if (nm.destiny === n) where.push('Destiny');
    if (nm.soulUrge === n) where.push('Soul Urge');
    if (nm.personality === n) where.push('Personality');
    if (nm.hiddenPassion === n) where.push('Hidden Passion');
    if (nm.karmicLessons?.includes(n)) where.push('a Karmic Lesson (missing from your name)');
    if (nm.pinnacles?.some((p) => p.number === n)) where.push('one of your Pinnacles');
    if (nm.challenges?.some((p) => p.number === n)) where.push('one of your Challenges');
    return where.length ? `In your chart this number is: ${where.join(', ')}.` : null;
  }
  const direct: Record<string, keyof NonNullable<ChartContext['numerology']>> = {
    'num:lifepath': 'lifePath', 'num:destiny': 'destiny', 'num:soulurge': 'soulUrge',
    'num:personality': 'personality', 'num:hiddenpassion': 'hiddenPassion',
  };
  if (id === 'num:maturity' && typeof nm?.lifePath === 'number' && typeof nm.destiny === 'number') {
    const v = maturityNumber(nm.lifePath, nm.destiny);
    const root = v === 11 ? '/2' : v === 22 ? '/4' : v === 33 ? '/6' : '';
    return `Yours is ${v}${root}: your Life Path ${nm.lifePath} plus your Destiny ${nm.destiny}. It ripens toward ${MATURITY_MEANINGS[v] ?? 'a fuller expression of both.'}`;
  }
  if (id === 'num:subconscious' && Array.isArray(nm?.karmicLessons)) {
    const gaps = nm.karmicLessons.length;
    return gaps === 0
      ? 'Yours is 9: every digit from 1 to 9 appears in your name.'
      : `Yours is ${9 - gaps}: ${gaps} ${gaps === 1 ? 'digit is' : 'digits are'} missing from your name.`;
  }
  const field = direct[id];
  if (field && nm) {
    const v = nm[field];
    return typeof v === 'number' ? `Yours is ${v}.` : null;
  }
  return null;
}

function suffix(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return 'th';
  return ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th';
}

const ASPECT_ANGLES: [string, number][] = [['conjunction', 0], ['sextile', 60], ['square', 90], ['trine', 120], ['opposition', 180]];

/** The tightest natal aspect from one planet to the others, within a 5° orb. */
function closestAspects(body: string, tr: NonNullable<ChartContext['tropical']>): { other: string; type: string; orb: number }[] {
  const mine = (tr as Record<string, { longitude?: number } | undefined>)[body]?.longitude;
  if (typeof mine !== 'number') return [];
  const found: { other: string; type: string; orb: number }[] = [];
  for (const other of Object.keys(PLANET_NAME)) {
    if (other === body) continue;
    if ((body === 'northNode' && other === 'southNode') || (body === 'southNode' && other === 'northNode')) continue;
    const lon = (tr as Record<string, { longitude?: number } | undefined>)[other]?.longitude;
    if (typeof lon !== 'number') continue;
    let diff = Math.abs(mine - lon) % 360;
    if (diff > 180) diff = 360 - diff;
    for (const [type, angle] of ASPECT_ANGLES) {
      const orb = Math.abs(diff - angle);
      if (orb <= 5) found.push({ other, type, orb });
    }
  }
  return found.sort((a, b) => a.orb - b.orb);
}

/** Related terms for a planet entry: its own house and its tightest aspect types. Null when the chart is missing. */
function planetRelated(id: string, ctx: ChartContext): string[] | null {
  const m = /^astro:planet:(.+)$/.exec(id);
  const tr = ctx.tropical;
  if (!m || !tr) return null;
  const lon = (tr as Record<string, { longitude?: number } | undefined>)[m[1]!]?.longitude;
  const asc = tr.houses?.ascendant;
  if (typeof lon !== 'number' || typeof asc !== 'number') return null;
  const types: string[] = [];
  for (const a of closestAspects(m[1]!, tr)) {
    const t = `astro:aspect:${a.type}`;
    if (!types.includes(t)) types.push(t);
    if (types.length === 2) break;
  }
  return [`astro:house:${houseOf(lon, asc)}`, ...types];
}

export function buildEntry(id: string, ctx: ChartContext): (GlossaryEntry & { yours: string | null; relatedEntries: { id: string; title: string }[] }) | null {
  const base = lookupStatic(id);
  if (!base) return null;
  const relatedIds = planetRelated(id, ctx) ?? base.related;
  const relatedEntries = relatedIds.flatMap((r) => {
    const e = lookupStatic(r);
    return e ? [{ id: r, title: e.title }] : [];
  });
  return { id, ...base, yours: personalise(id, ctx), relatedEntries };
}

/** Every entry, summary only, for the Glossary list. */
export function listEntries(): { id: string; group: GlossaryGroup; title: string; summary: string }[] {
  const out: { id: string; group: GlossaryGroup; title: string; summary: string }[] = [];
  for (const [id, e] of Object.entries(S)) out.push({ id, group: e.group, title: e.title, summary: e.summary });
  for (let n = 1; n <= 64; n++) {
    const e = buildGate(n);
    if (e) out.push({ id: `hd:gate:${n}`, group: e.group, title: e.title, summary: e.summary });
  }
  for (const c of CHANNELS) {
    const e = buildChannel(c.gates[0], c.gates[1]);
    if (e) out.push({ id: `hd:channel:${c.gates[0]}-${c.gates[1]}`, group: e.group, title: e.title, summary: e.summary });
  }
  return out;
}
