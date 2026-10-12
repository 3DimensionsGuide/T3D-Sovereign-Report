import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

test('lens and signal markers each have their own shape and a written label', () => {
  const lens = read('mobile/src/components/Lens.tsx');
  for (const k of ['vehicle', 'road', 'stoplight', 'flow', 'friction', 'caution']) {
    assert.match(lens, new RegExp(`kind === '${k}'|lens === '${k}'`), `${k} has a drawn shape`);
  }
  for (const label of ['The Vehicle', 'The Road', 'The Stoplight', 'Flow', 'Friction', 'Caution']) {
    assert.ok(lens.includes(`'${label}'`), `${label} has a text label`);
  }
});

test('the page glow fades out instead of ending in a hard edge', () => {
  const glow = read('mobile/src/components/Glow.tsx');
  assert.match(glow, /stopOpacity=\{0\}/);
  const screen = read('mobile/src/components/Screen.tsx');
  assert.ok(!/borderRadius:\s*260/.test(screen), 'no hard-edged circle on the page');
});

test('onboarding lets people enter the emailed code or skip it', () => {
  const onboarding = read('mobile/src/app/onboarding.tsx');
  assert.match(onboarding, /confirmOptInCode/);
  assert.match(onboarding, /Skip for now/);
  assert.match(onboarding, /Send a new code/);
  const api = read('mobile/src/lib/api.ts');
  assert.match(api, /\/api\/email-optin\/confirm/);
  assert.match(api, /\/api\/email-optin\/send/);
});

test('Today opens with a signal block and uses the shared markers for every transit', () => {
  const today = read('mobile/src/app/(tabs)/today.tsx');
  assert.match(today, /<TodaySignal /);
  assert.ok(!today.includes('NATURE_LABEL'), 'the old mixed text markers are gone');
  const signal = read('mobile/src/components/TodaySignal.tsx');
  for (const word of ['flow', 'friction', 'retrograde']) assert.ok(signal.includes(word));
});

test('My Chart: the Triad portrait, tappable wheel, and a bodygraph that switches on in layers', () => {
  assert.match(read('mobile/src/app/(tabs)/chart.tsx'), /<TriadPortrait /);
  const panels = read('mobile/src/components/ChartPanels.tsx');
  assert.match(panels, /scene\.hotspots/);
  assert.match(panels, /reveal/);
  assert.match(panels, /SignalMarker kind=\{ASPECT_SIGNAL/);
  assert.match(read('mobile/src/charts/bodygraph.ts'), /prim\.layer =/);
  assert.match(read('mobile/src/components/SceneView.tsx'), /isReduceMotionEnabled/);
});

test('small lens-coloured text uses the lighter AAA tints', () => {
  const lens = read('mobile/src/components/Lens.tsx');
  assert.match(lens, /LENS_TEXT/);
  assert.match(read('mobile/src/components/TodaySignal.tsx'), /LENS_TEXT\[lens\]/);
});

test('onboarding asks one question at a time, shows the calculation, and the welcome screen has the seal', () => {
  const onboarding = read('mobile/src/app/onboarding.tsx');
  assert.match(onboarding, /Step \$\{step \+ 1\} of 4/);
  assert.match(onboarding, /validateStep/);
  assert.match(onboarding, /<CalculatingView /);
  assert.match(onboarding, /Calculate my chart/);
  assert.match(read('mobile/src/app/welcome.tsx'), /<TriadSeal /);
  assert.match(read('mobile/src/components/CalculatingView.tsx'), /isReduceMotionEnabled/);
});

test('Timeline: signal ribbon, road rail, shared markers and the copy fixes', () => {
  const timeline = read('mobile/src/app/(tabs)/timeline.tsx');
  assert.match(timeline, /<SignalRibbon /);
  assert.ok(!timeline.includes('NATURE_LABEL'));
  assert.match(timeline, /capFirst\(houseTheme/);
  const sky = read('mobile/src/lib/skyText.ts');
  assert.match(sky, /A year ruled by/);
  assert.match(read('mobile/src/app/year.tsx'), /yearQuote\(/);
  assert.match(read('mobile/src/components/readings/StoplightReading.tsx'), /yearQuote\(/);
});

test('step 6: readings pieces exist and are wired', async () => {
  const { readFileSync } = await import('node:fs');
  const r = (p: string) => readFileSync(new URL(`../../mobile/src/${p}`, import.meta.url), 'utf8');
  assert.match(r('components/readings/NumerologyReading.tsx'), /<RoadPath /);
  assert.match(r('components/readings/VehicleReading.tsx'), /<VehicleSnapshot \/>/);
  const sl = r('components/readings/StoplightReading.tsx');
  assert.match(sl, /<StoplightCompare /);
  assert.match(sl, /<ElementBalance /);
  assert.match(r('components/readings/StoplightCompare.tsx'), /Different sign/);
  assert.match(r('components/readings/StoplightCompare.tsx'), /of 3/);
});

test('step 7: practice checks follow Triad order and partner form has no fake default date', () => {
  const d = read('mobile/src/components/practice/DecideFlow.tsx');
  assert.match(d, /ORDER = \['vehicle', 'road', 'stoplight'\]/);
  assert.match(d, /LensLabel/);
  const t = read('mobile/src/components/practice/Together.tsx');
  assert.match(t, /useState<Date \| null>\(saved \? new Date\(`\$\{saved\.birthDate\}/);
  assert.match(t, /Please choose their birth date/);
  assert.match(t, /Choose date/);
});

test('step 8: glossary is grouped by lens, folds gates and channels, and titles are not doubled', async () => {
  const g = read('mobile/src/app/glossary.tsx');
  assert.match(g, /SectionList/);
  assert.match(g, /<LetterStrip/);
  assert.match(read('mobile/src/components/LetterStrip.tsx'), /Jump to letter/);
  assert.match(g, /fold/);
  const { listEntries } = await import('../../src/lib/app/glossary');
  const titles = listEntries().map((e) => e.title);
  assert.ok(!titles.some((t) => /Center\) Center$/.test(t)), 'no doubled Center');
  assert.ok(!titles.some((t) => /\(Mental\) [Aa]uthority$/.test(t)), 'no doubled Authority');
  assert.ok(!titles.some((t) => t.includes('℞')), 'no ℞ glyph in titles');
  const defs = listEntries().filter((e) => e.id.startsWith('hd:definition:')).map((e) => e.summary);
  assert.equal(new Set(defs).size, defs.length, 'definition one-liners are distinct');
});

test('step 9: Stories card is 9:16, uses the Triad portrait, and never shows birth details', () => {
  const c = read('mobile/src/components/StoryShareCard.tsx');
  assert.match(c, /STORY_WIDTH = 340/);
  assert.match(c, /STORY_HEIGHT = 604/);
  assert.match(c, /<TriadPortrait /);
  assert.ok(!/birthDate|birthTime\b|\.city|lastName/.test(c.replace(/birthTimeKnown/g, '')));
  const s = read('mobile/src/app/share-card.tsx');
  assert.match(s, /height: tall \? 1920 : 1350/);
  assert.match(read('mobile/src/components/ProfileShareCard.tsx'), /<TriadSeal /);
});

test('pass A: tab bar uses drawn icons that change shape when selected, and loading shows skeleton cards', () => {
  const tabs = read('mobile/src/app/(tabs)/_layout.tsx');
  for (const n of ['today', 'timeline', 'readings', 'practice', 'chart']) assert.ok(tabs.includes(`icon('${n}')`), `${n} tab has a drawn icon`);
  assert.ok(!/TabGlyph/.test(tabs));
  const icons = read('mobile/src/components/TabIcons.tsx');
  assert.match(icons, /focused \? color : 'none'/);
  for (const f of ['today', 'timeline', 'chart']) assert.match(read(`mobile/src/app/(tabs)/${f}.tsx`), /<SkeletonCards /);
  const sk = read('mobile/src/components/Skeleton.tsx');
  assert.match(sk, /isReduceMotionEnabled/);
});

test('pass A: haptics are wired to buttons, segments, tabs, Decide choices and a finished share', () => {
  const h = read('mobile/src/lib/haptics.ts');
  for (const f of ['tap', 'select', 'success']) assert.match(h, new RegExp(`export function ${f}\\(`));
  assert.match(read('mobile/src/components/GoldButton.tsx'), /tap\(\);/);
  assert.match(read('mobile/src/components/Segmented.tsx'), /select\(\);/);
  assert.match(read('mobile/src/app/(tabs)/_layout.tsx'), /tabPress: \(\) => select\(\)/);
  assert.match(read('mobile/src/components/practice/DecideFlow.tsx'), /select\(\);/);
  assert.match(read('mobile/src/app/share-card.tsx'), /sharedAction\) success\(\)/);
});

test('the signal lamp pairs every lamp with a shape and a word, and honours Reduce Motion', () => {
  const lamp = read('mobile/src/components/SignalLamp.tsx');
  for (const word of ["go: 'Go'", "slow: 'Slow'", "pause: 'Pause'"]) assert.ok(lamp.includes(word), `${word} is written out`);
  assert.match(lamp, /go: 'flow', slow: 'caution', pause: 'friction'/, 'each lamp has its own shape');
  assert.match(lamp, /isReduceMotionEnabled/);
  assert.match(lamp, /Conditions favor waiting/);
  const today = read('mobile/src/app/(tabs)/today.tsx');
  assert.match(today, /<SignalLamp /);
});

test('the Sun and Moon longitudes stay on the server and feed the Vehicle lamp', () => {
  const route = read('src/app/api/app/today/route.ts');
  assert.match(route, /const \{ skyLongitudes, \.\.\.sky \}/, 'taken out of the sky before it leaves the server');
  assert.doesNotMatch(route, /skyLongitudes\.(sun|moon)\s*[,}]/, 'only gates are returned, never the raw longitudes');
  assert.match(route, /gates: \{ sun: longitudeToGate\(skyLongitudes\.sun\)/);
  const triad = read('src/app/api/app/triad-today/route.ts');
  assert.match(triad, /longitudeToGate\(sky\.skyLongitudes\.sun\)/);
  assert.match(triad, /buildTriadToday\(/);
});

test('the Road strip writes its numbers out, opens the Timeline and stays short', () => {
  const strip = read('mobile/src/components/RoadStrip.tsx');
  assert.match(strip, /accessibilityRole="button"/);
  assert.match(strip, /router\.push\('\/timeline'/);
  assert.match(strip, /spokenSummary/);
  assert.match(strip, /styles\.chevron/, 'the whole card is the tap target, marked by a chevron');
  assert.doesNotMatch(strip, /Open your timeline/, 'no separate link line');
  assert.doesNotMatch(strip, /The numbers are your Pinnacles/, 'no key line under the strip');
  const today = read('mobile/src/app/(tabs)/today.tsx');
  assert.match(today, /<RoadStrip /);
});

test('with the signal lamp, Today drops the cards that repeat it', () => {
  const today = read('mobile/src/app/(tabs)/today.tsx');
  assert.match(today, /<SkyTally today=\{today\} bare \/>/, 'the sky tally moves to the transits');
  assert.match(today, /triad\?\.signal \? \(/, 'the three-lens lamp card or the old signal card, never both');
  const card = read('mobile/src/components/TriadTodayCard.tsx');
  assert.match(card, /const compact = !!data\.signal/);
});

test('Today is condensed: frame before the Road strip, one sky card, collapsed details', () => {
  const today = read('mobile/src/app/(tabs)/today.tsx');
  assert.ok(today.indexOf('<SignalLamp') < today.indexOf('<TriadTodayCard'), 'lamp first');
  assert.ok(today.indexOf('<TriadTodayCard') < today.indexOf('<RoadStrip'), 'the frame comes before the Road strip');
  assert.match(today, /<SkyTodayCard today=\{today\} \/>/);
  assert.doesNotMatch(today, /THE MOON|THE SUN/, 'Moon and Sun are one card');
  assert.match(today, /TRANSITS_SHOWN/);
  assert.match(today, /Show all \$\{today\.transits\.length\}/);
  const card = read('mobile/src/components/TriadTodayCard.tsx');
  assert.match(card, /<Disclosure label="How to use today">/);
  assert.match(card, /firstSentence\(data\.frame\)/);
  assert.match(card, /Road\|Sky\) check/, 'with the lamp, only the Road and sky checks are listed');
  const sky = read('mobile/src/components/SkyTodayCard.tsx');
  assert.match(sky, /<Disclosure label="More about the Moon">/);
  const day = read('mobile/src/components/DayNumerologyCard.tsx');
  assert.match(day, /accessibilityState=\{\{ expanded: open \}\}/, 'the day-number card collapses');
  const lamp = read('mobile/src/components/SignalLamp.tsx');
  assert.match(lamp, /numberOfLines=\{open \? undefined : 1\}/, 'lens rows are one line until tapped');
  assert.match(lamp, /Conditions, not a decision\./);
});

test('Challenge cards use a square badge, matching the Challenge drawing; Pinnacles stay round', () => {
  const reading = read('mobile/src/components/readings/NumerologyReading.tsx');
  const challenge = reading.slice(reading.indexOf('function ChallengeBlock'));
  assert.match(challenge, /badgeShape="square"/);
  const pinnacle = reading.slice(reading.indexOf('function PinnacleBlock'), reading.indexOf('function ChallengeBlock'));
  assert.doesNotMatch(pinnacle, /badgeShape/);
  assert.match(read('mobile/src/components/ReadingBlocks.tsx'), /badgeShape === 'square' && styles\.badgeSquare/);
});
