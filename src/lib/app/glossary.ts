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

export type GlossaryGroup = 'Human Design' | 'Astrology' | 'Numerology' | 'Timing';

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
add('astro:ascendant', 'Astrology', 'Ascendant (Rising sign)', 'The sign rising on the eastern horizon at your birth.', ['Your Ascendant shows how you meet the world and how the world first meets you. It is also the starting point for the houses, so it needs an accurate birth time.', 'If no birth time was entered, the app uses 12:00 noon, and the Rising sign and houses are only approximate.'], ['astro:house:1', 'astro:wholesign']);
add('astro:midheaven', 'Astrology', 'Midheaven', 'The highest point of your chart.', ['The Midheaven (MC) points to your public role and what you are known for. Like the Ascendant, it depends on your birth time.'], ['astro:house:10']);
add('astro:retrograde', 'Astrology', 'Retrograde (℞)', 'A planet that appears to move backward.', ['From Earth, planets sometimes seem to slow, stop and move backward across the sky. This is an effect of perspective, and astrologers read it as a time to review and revisit rather than push forward.', 'A retrograde is not a malfunction. It changes the tempo of that planet’s themes.'], ['astro:planet:mercury']);
add('astro:orb', 'Astrology', 'Orb', 'How far from exact an aspect is.', ['The orb is the gap, in degrees, between the actual angle and the perfect one. A smaller orb means a stronger contact.', 'T3D uses 1° or less for peak and 3° or less for active.'], ['astro:aspect:conjunction', 'astro:applying']);
add('astro:applying', 'Astrology', 'Applying', 'An aspect that is getting closer to exact.', ['An applying aspect is still building toward its exact moment. It is often felt as anticipation or mounting pressure.'], ['astro:separating', 'astro:orb']);
add('astro:separating', 'Astrology', 'Separating', 'An aspect that is moving away from exact.', ['A separating aspect has passed its exact moment and is fading. It is often felt as the aftermath: what the contact brought up is now settling.'], ['astro:applying', 'astro:orb']);
add('astro:transit', 'Astrology', 'Transit', 'Where a planet is in the sky right now.', ['A transit is a planet’s current position compared against your birth chart. A transiting planet making an aspect to one of your natal planets is a transit contact.', 'T3D treats transits as weather: information about the conditions, never an instruction. You decide through your Strategy and Authority.'], ['astro:natal', 'astro:aspect:square']);
add('astro:natal', 'Astrology', 'Natal chart', 'The sky at the moment you were born.', ['Your natal chart is a snapshot of the planets at your birth time and place. It stays fixed. Everything that changes (transits, timelines) is read against it.'], ['astro:transit']);
add('astro:tropical', 'Astrology', 'Tropical zodiac', 'The zodiac anchored to the seasons.', ['The tropical zodiac starts Aries at the spring equinox. It is the system most Western astrology uses, including most "sun sign" content.'], ['astro:sidereal']);
add('astro:sidereal', 'Astrology', 'Sidereal zodiac', 'The zodiac anchored to the stars.', ['The sidereal zodiac is measured against the fixed stars. The two zodiacs have drifted about 24° apart, so many planets fall in a different sign. T3D shows both so you can see the two lenses.'], ['astro:tropical']);
add('astro:wholesign', 'Astrology', 'Whole-sign houses', 'Each house is one full sign.', ['In the whole-sign system your rising sign is the 1st house, the next sign the 2nd, and so on. It is the oldest house system and the one T3D uses.'], ['astro:ascendant']);
add('astro:phase', 'Astrology', 'Moon phase', 'Where the Moon is in its monthly cycle.', ['A waxing Moon is growing toward full and is read as a time of building and beginning. A waning Moon is shrinking toward new and is read as a time of release and review.'], ['astro:planet:moon']);
add('astro:eclipse', 'Astrology', 'Eclipse', 'A New or Full Moon on the Moon’s nodes.', ['Eclipses happen about twice a year in pairs and mark turning points. Their effect is read over the following weeks to months, especially when they touch your chart.'], ['astro:planet:northNode']);
add('astro:ingress', 'Astrology', 'Ingress', 'A planet moving into a new sign.', ['An ingress is the moment a planet crosses into the next sign. The planet’s themes take on the style of the new sign until it moves on.'], ['astro:planet:sun']);
add('astro:profection', 'Astrology', 'Lord of the Year', 'The planet in charge of your current year of life.', ['In annual profections you move one house forward each birthday, starting from the 1st house at birth. The planet that rules that house’s sign becomes the Lord of the Year, and its themes get emphasis from birthday to birthday.'], ['astro:wholesign', 'astro:house:1']);
add('astro:season', 'Astrology', 'Season', 'A slow, long-running transit contact.', ['A season is a transit by a slow planet (Jupiter to Pluto) that stays within a few degrees of your chart point for weeks or months, sometimes in several passes.'], ['astro:transit', 'astro:orb']);

// Human Design
add('hd:strategy', 'Human Design', 'Strategy', 'How your Type is built to meet life.', ['Strategy is the practical entry point to your design, such as responding, waiting for an invitation or informing others before you act. It is how you enter life in a way that creates less resistance.'], ['hd:authority', 'hd:notself']);
add('hd:authority', 'Human Design', 'Authority', 'Where your best decisions come from.', ['Authority is the part of your design that is built to make decisions, such as the gut, the emotions or the spleen’s instinct. T3D puts it above everything else, including the sky.'], ['hd:strategy']);
add('hd:notself', 'Human Design', 'Not-self', 'The signal that you are off track.', ['The not-self theme is a feeling, such as frustration, bitterness, anger or disappointment, that tends to show up when you are not following your Strategy and Authority. It is a signal to adjust, not a flaw.'], ['hd:strategy', 'hd:signature']);
add('hd:signature', 'Human Design', 'Signature', 'The feeling of being aligned.', ['Your signature is the feeling that tends to show up when you are living by your Strategy and Authority, such as satisfaction, success, peace or surprise.'], ['hd:notself']);
add('hd:bodygraph', 'Human Design', 'Bodygraph', 'The map of your design.', ['The bodygraph is the chart of nine Centers connected by channels and gates. Coloured Centers are defined; white Centers are open.'], ['hd:defined', 'hd:open']);
add('hd:defined', 'Human Design', 'Defined center', 'A Center that works the same way all the time.', ['A defined Center is a consistent, reliable source of its theme. People often lean on you for it.'], ['hd:open']);
add('hd:open', 'Human Design', 'Open center', 'A Center that takes in and amplifies.', ['An open Center is receptive and sensitive to the people around you. It is not a weakness, and over time it becomes a source of wisdom.'], ['hd:defined']);
add('hd:hanging', 'Human Design', 'Hanging gate', 'A gate without its channel partner.', ['A hanging gate is one half of a channel. It is active in you but not connected, and it often shows up as a quality you seek in other people.'], ['hd:channel']);
add('hd:channel', 'Human Design', 'Channel', 'Two gates that join two Centers.', ['A channel is formed when both gates at either end of a connecting line are active. It defines both Centers and creates a steady current in you.'], ['hd:hanging']);
add('hd:personality', 'Human Design', 'Personality (conscious)', 'What you know about yourself.', ['Personality activations are calculated from your birth moment. They describe the part of you that you are aware of.'], ['hd:design']);
add('hd:design', 'Human Design', 'Design (unconscious)', 'What your body carries.', ['Design activations are calculated from the moment about 88 days before birth. They describe your body’s unconscious wiring, which other people often notice before you do.'], ['hd:personality']);
add('hd:line', 'Human Design', 'Line', 'A finer layer inside each gate.', ['Each gate has six lines. Lines 1 to 6 are traditionally called Investigator, Hermit, Experimenter, Opportunist, Heretic and Role Model. Your Profile is made from two of them.'], ['hd:profile']);
add('hd:profile', 'Human Design', 'Profile', 'The two lines that describe your role.', ['Your Profile combines the line of your conscious Sun with the line of your unconscious Sun, for example 3/5. It describes how you learn and how you meet the world.'], ['hd:line']);
add('hd:cross', 'Human Design', 'Incarnation Cross', 'The theme of your life’s purpose.', ['Your Incarnation Cross is made from the four gates of your Sun and Earth (conscious and unconscious). It describes a life theme more than a task.'], ['hd:godhead']);
add('hd:godhead', 'Human Design', 'Godhead', 'The archetype your mind wears.', [GODHEAD_MECHANISM], ['hd:cross']);
add('hd:variables', 'Human Design', 'Variables', 'Four Left or Right settings in your body.', [VARIABLES_MECHANISM], ['hd:design']);
for (const [type, c] of Object.entries(TYPE_CONTENT)) {
  add(`hd:type:${type}`, 'Human Design', type, `Strategy: ${c.strategy}`, [c.plain, `When aligned you tend to feel ${c.signature.toLowerCase()}. When off track you tend to feel ${c.notSelf.toLowerCase()}.`], ['hd:strategy', 'hd:authority']);
}
for (const [key, c] of Object.entries(AUTHORITY_CONTENT)) {
  add(`hd:authority:${key}`, 'Human Design', `${c.authority} authority`, c.mechanism.split('. ')[0] + '.', [c.mechanism, c.falseUrgency], ['hd:authority', 'hd:strategy']);
}
for (const [key, c] of Object.entries(PROFILE_CONTENT)) {
  add(`hd:profile:${key}`, 'Human Design', `Profile ${key}`, c.role, [c.plain, c.socialPattern, c.visibility], ['hd:profile', 'hd:line']);
}
for (const [id, name] of Object.entries(CENTER_DISPLAY_NAME)) {
  const cap = CENTER_CAPACITIES[id];
  const open = OPEN_CENTER_THEMES[id];
  add(`hd:center:${id}`, 'Human Design', `${name} Center`, cap?.title ?? name, [
    cap ? `When defined: ${cap.title}. ${cap.description}` : '',
    open ? `When open: ${open.title}. ${open.sensitivity} ${open.wisdom}` : '',
  ].filter(Boolean), ['hd:defined', 'hd:open']);
}
for (const [key, m] of Object.entries(DEFINITION_MEANING)) {
  add(`hd:definition:${key}`, 'Human Design', key === 'No Definition' ? key : `${key} Definition`, 'How your defined Centers connect.', [m], ['hd:defined']);
}
for (const [key, m] of Object.entries(CIRCUIT_GROUP_MEANING)) {
  add(`hd:circuit:${key}`, 'Human Design', `${key} circuitry`, m.keynote, [m.passage], ['hd:channel']);
}

// Numerology
add('num:master', 'Numerology', 'Master numbers', '11, 22 and 33 keep their double digits.', ['When a calculation lands on 11, 22 or 33 it is not reduced further. It is written with its root (11/2, 22/4, 33/6) and read as a higher frequency working through a practical base.'], ['num:11', 'num:22', 'num:33']);
add('num:lifepath', 'Numerology', 'Life Path', 'The direction your whole life leans toward.', ['Your Life Path comes from your full birth date and is the central number in your chart. It describes your lifelong curriculum.'], ['num:destiny']);
add('num:destiny', 'Numerology', 'Destiny (Expression)', 'What you are here to do and develop.', [INNER_DRIVERS_MECHANISM], ['num:soulurge', 'num:personality']);
add('num:soulurge', 'Numerology', 'Soul Urge', 'What you want at your core.', ['The Soul Urge comes from the vowels in your full birth name and describes your inner motivations.'], ['num:destiny']);
add('num:personality', 'Numerology', 'Personality number', 'How others first experience you.', ['The Personality number comes from the consonants in your full birth name and describes the face you present.'], ['num:destiny']);
add('num:hiddenpassion', 'Numerology', 'Hidden Passion', 'The energy you use most.', [HIDDEN_PASSION_MECHANISM], ['num:karmic']);
add('num:karmic', 'Numerology', 'Karmic Lessons', 'Numbers missing from your name.', [KARMIC_LESSONS_MECHANISM], ['num:hiddenpassion']);
add('num:pinnacle', 'Numerology', 'Pinnacle', 'A long chapter of your life.', ['Your life has four Pinnacles, each a chapter of many years with its own theme. The one you are in now sets the main terrain.'], ['num:challenge']);
add('num:challenge', 'Numerology', 'Challenge', 'The recurring lesson in each chapter.', ['Each Pinnacle has a matching Challenge, a skill that life keeps asking you to build during that chapter.'], ['num:pinnacle']);
add('num:birthday', 'Numerology', 'Birthday number', 'The day you were born.', ['The day of the month you were born adds a specific talent to your Life Path.'], ['num:lifepath']);
add('num:attitude', 'Numerology', 'Attitude number', 'Your first reaction to the world.', ['The Attitude number comes from your birth month and day and describes your instinctive stance.'], ['num:lifepath']);
add('num:universalday', 'Numerology', 'Universal Day', 'The energy of today’s date for everyone.', ['The Universal Day is worked out from the calendar date alone, so the whole world shares it.'], ['num:personalday']);
add('num:personalday', 'Numerology', 'Personal Day', 'The energy of today for you.', ['Your Personal Day comes from your Personal Month plus today’s date. It shades how today tends to feel for you.'], ['num:universalday', 'num:personalmonth']);
add('num:personalmonth', 'Numerology', 'Personal Month', 'The theme of this month for you.', ['Your Personal Month is your Personal Year plus the calendar month.'], ['num:personalyear']);
add('num:personalyear', 'Numerology', 'Personal Year', 'The theme of this year for you.', ['Your Personal Year is your birth month and day plus the current Universal Year. It runs on the calendar year.'], ['num:personalmonth']);
add('num:universalyear', 'Numerology', 'Universal Year', 'The energy of the calendar year.', ['The Universal Year is the digit sum of the calendar year. It is shared by everyone and is the base for every Personal Year.'], ['num:personalyear']);
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
    return `Your ${PLANET_NAME[m[1]!] ?? m[1]} is in ${p.formatted ?? signOf(p.longitude)}${house}${p.retrograde ? ', retrograde' : ''}.`;
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

export function buildEntry(id: string, ctx: ChartContext): (GlossaryEntry & { yours: string | null; relatedEntries: { id: string; title: string }[] }) | null {
  const base = lookupStatic(id);
  if (!base) return null;
  const relatedEntries = base.related.flatMap((r) => {
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
