import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { contrastRatio, type Rgb } from '../../mobile/src/lib/glass';
import { colors } from '../../mobile/src/theme/tokens';

const src = (p: string) => readFileSync(new URL(`../../mobile/src/${p}`, import.meta.url), 'utf8');
const onboarding = src('app/onboarding.tsx');
const field = src('components/Field.tsx');

const hex = (h: string): Rgb => ({
  r: parseInt(h.slice(1, 3), 16),
  g: parseInt(h.slice(3, 5), 16),
  b: parseInt(h.slice(5, 7), 16),
});

/** A token may be a flat hex or a parchment tint; a tint is composited onto the background first. */
const onBackground = (token: string, background: string): Rgb => {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/.exec(token);
  if (!m) return hex(token);
  const a = m[4] ? parseFloat(m[4]) : 1;
  const b = hex(background);
  return {
    r: Math.round(Number(m[1]) * a + b.r * (1 - a)),
    g: Math.round(Number(m[2]) * a + b.g * (1 - a)),
    b: Math.round(Number(m[3]) * a + b.b * (1 - a)),
  };
};

/**
 * Onboarding swaps six screens in place without navigating: three wizard steps, the place
 * check, the calculation, the reveal, the email ask and the code. A screen reader is told
 * nothing by a re-render, so without this the person is left on a stale focus while the page
 * under them becomes a different one.
 */
test('every change of onboarding screen is announced', () => {
  assert.match(onboarding, /AccessibilityInfo\.announceForAccessibility\(stageHeading\)/);
  // Every screen the flow can be on has a heading to announce.
  for (const heading of [
    'Check your email',
    'Where can we reach you\\?',
    'Your chart is ready',
    'Calculating your chart',
    'Is this where you were born\\?',
  ]) {
    assert.match(onboarding, new RegExp(heading), `no spoken heading for: ${heading}`);
  }
  // The wizard steps speak their own title and their place in the sequence.
  assert.match(onboarding, /\$\{TITLES\[step\]\} Step \$\{step \+ 1\} of 3\./);
});

test('the first screen is not announced over', () => {
  // A screen reader reads a screen it has just arrived at. Announcing on top of that talks
  // across it, so the ref starts at the current stage rather than empty.
  assert.match(onboarding, /const spoken = useRef\(stage\);/);
  assert.match(onboarding, /if \(spoken\.current === stage\) return;/);
});

/**
 * A `why` renders as its own line under the input. Sighted people read it without asking;
 * before this it was reachable by a screen reader only by swiping past the field you were
 * already standing on, which is where nobody looks for the reason they are being asked.
 */
test('a field that explains why it is asked says so to a screen reader too', () => {
  assert.match(field, /accessibilityHint=\{why\}/);
  assert.match(field, /accessibilityLabel=\{label\}/);
  // The field whose entire purpose is the explanation.
  assert.match(onboarding, /label="State or province"[\s\S]{0,320}why="Town names repeat across states/);
});

test('every onboarding heading is marked as one', () => {
  const titles = onboarding.match(/<Text accessibilityRole="header"/g) ?? [];
  // The wizard shares one heading across its three steps, so: wizard, place, email, code.
  assert.ok(titles.length >= 4, `only ${titles.length} headings are marked`);
});

test('the time switch is labelled for what it does, not for the state it is in', () => {
  assert.match(onboarding, /accessibilityLabel="I don't know my birth time"/);
  assert.match(onboarding, /value=\{!timeKnown\}/);
});

test('nothing in onboarding is told by colour alone', () => {
  // The progress bars are colour, so the step is also written out in words.
  assert.match(onboarding, /accessibilityLabel=\{`Step \$\{step \+ 1\} of 3`\}/);
  assert.match(onboarding, /Step \{step \+ 1\} of 3/);
  // The chosen place is a gold dot, so it is spoken as selected as well.
  assert.match(onboarding, /accessibilityState=\{\{ selected: i === chosen \}\}/);
  // Errors carry a warning sign, never redness alone.
  assert.match(src('components/ErrorLine.tsx'), /\{'⚠ {2}'\}/);
});

test('onboarding text stays at 13 points or more', () => {
  const sizes = [...onboarding.matchAll(/fontSize: (\d+)/g)].map((m) => Number(m[1]));
  assert.ok(sizes.length > 10, `only found ${sizes.length} sizes — the styles moved`);
  const small = sizes.filter((n) => n < 13);
  assert.deepEqual(small, [], `text below 13pt: ${small.join(', ')}`);
});

test('every onboarding row and control clears the 48 point touch minimum', () => {
  const heights = [...onboarding.matchAll(/minHeight: (\d+)/g)].map((m) => Number(m[1]));
  assert.ok(heights.length > 0, 'no minHeight found — the styles moved');
  const short = heights.filter((n) => n < 48);
  assert.deepEqual(short, [], `touch targets under 48pt: ${short.join(', ')}`);
});

test('the colours onboarding puts on its background are all AAA', () => {
  // 7:1, the floor this project holds itself to, rather than the 4.5:1 of AA.
  for (const background of [colors.obsidian, colors.charcoal]) {
    for (const [name, token] of Object.entries({
      parchment: colors.parchment,
      parchmentMuted: colors.parchmentMuted,
      gold: colors.gold,
      danger: colors.danger,
    })) {
      const ratio = contrastRatio(onBackground(token, background), hex(background));
      assert.ok(ratio >= 7, `${name} on ${background} is ${ratio.toFixed(2)}:1`);
    }
  }
});

test('the entrance animation is skipped under Reduce Motion', () => {
  // Onboarding leans on FadeIn for every screen, including the new email ask.
  assert.match(onboarding, /<FadeIn>/);
  assert.match(src('components/FadeIn.tsx'), /isReduceMotionEnabled/);
  assert.match(src('components/FadeIn.tsx'), /if \(reduce\) \{\s*progress\.setValue\(1\);/);
});
