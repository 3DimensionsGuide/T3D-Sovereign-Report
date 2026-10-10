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
  assert.match(onboarding, /SEND A NEW CODE/);
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
  assert.match(g, /Jump to letter/);
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
