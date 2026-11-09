import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { colors, themes } from '../../mobile/src/theme/tokens';

const read = (p: string) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');
const lensSource = read('mobile/src/components/Lens.tsx');
const icon = read('mobile/src/components/AspectIcon.tsx');
const reading = read('mobile/src/components/readings/StoplightReading.tsx');

/** Where the aspect cards sit. */
const SURFACE = themes.readings.surface;

type Rgb = { r: number; g: number; b: number };
const hex = (h: string): Rgb => ({
  r: parseInt(h.slice(1, 3), 16),
  g: parseInt(h.slice(3, 5), 16),
  b: parseInt(h.slice(5, 7), 16),
});

/** A token may be a tint; composite it onto the surface before judging it. */
function onSurface(token: string): Rgb {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/.exec(token);
  if (!m) return hex(token);
  const a = m[4] ? parseFloat(m[4]) : 1;
  const b = hex(SURFACE);
  return {
    r: Math.round(Number(m[1]) * a + b.r * (1 - a)),
    g: Math.round(Number(m[2]) * a + b.g * (1 - a)),
    b: Math.round(Number(m[3]) * a + b.b * (1 - a)),
  };
}

function hueAndSaturation(c: Rgb): { hue: number; saturation: number } {
  const [r, g, b] = [c.r / 255, c.g / 255, c.b / 255];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let hue = 0;
  if (d) {
    hue = max === r ? 60 * (((g - b) / d) % 6) : max === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4);
  }
  if (hue < 0) hue += 360;
  return { hue, saturation: max ? d / max : 0 };
}

function contrast(a: Rgb, b: Rgb): number {
  const lum = (c: Rgb) => {
    const f = (v: number) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** flow and friction are written as hex in Lens.tsx; neutral comes from the palette. */
function signalColours(): { flow: string; friction: string; neutral: string } {
  const start = lensSource.indexOf('export const SIGNAL_COLOR');
  assert.ok(start > -1, 'SIGNAL_COLOR is no longer declared in Lens.tsx');
  const block = lensSource.slice(start, lensSource.indexOf('};', start));
  const flow = /flow:\s*'(#[0-9A-Fa-f]{6})'/.exec(block)?.[1];
  const friction = /friction:\s*'(#[0-9A-Fa-f]{6})'/.exec(block)?.[1];
  assert.ok(flow && friction, 'flow and friction are no longer plain hex — update this test');
  return { flow, friction, neutral: colors.parchmentMuted };
}

/**
 * An aspect's nature was told by a shape and a sentence, and by a colour that was red whichever
 * nature it was: friction sat at hue 3° and a blend took the Stoplight's own red at 0°. Three
 * degrees apart is not a distinction anybody makes while scrolling, so a list of aspects read as
 * one long warning.
 */
test('the three aspect signals cannot be mistaken for one another', () => {
  const s = signalColours();
  const read = (token: string) => hueAndSaturation(onSurface(token));

  const flow = read(s.flow);
  const friction = read(s.friction);
  const neutral = read(s.neutral);

  // Neutral earns its place by having no colour to compete with, rather than by sitting a
  // certain distance from the others in hue.
  assert.ok(neutral.saturation < 0.15, `neutral is a colour now (${Math.round(neutral.saturation * 100)}% saturation)`);

  // The two that are colours have to be far apart in hue, which is what the eye scans.
  const apart = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));
  const gap = apart(flow.hue, friction.hue);
  assert.ok(gap >= 60, `flow and friction are only ${Math.round(gap)}° apart in hue`);
});

test('a blend is not painted in the lens colour', () => {
  // This is the collision itself: the Stoplight's red against friction's coral.
  const s = signalColours();
  const stoplight = hueAndSaturation(onSurface(colors.stoplight));
  const friction = hueAndSaturation(onSurface(s.friction));
  const apart = Math.min(Math.abs(stoplight.hue - friction.hue), 360 - Math.abs(stoplight.hue - friction.hue));
  assert.ok(apart < 30, 'the lens red and friction have moved apart — this test records why they must not both be used');

  assert.match(icon, /const c = SIGNAL_COLOR\.neutral;/);
  assert.ok(!/LENS_TEXT/.test(icon), 'AspectIcon reaches for a lens colour again');
});

test('every aspect signal stays visible on the card it sits on', () => {
  const s = signalColours();
  for (const [name, token] of Object.entries(s)) {
    const ratio = contrast(onSurface(token), hex(SURFACE));
    // 3:1, the floor for something that carries meaning without being text.
    assert.ok(ratio >= 3, `${name} is ${ratio.toFixed(2)}:1 on ${SURFACE}`);
  }
});

test('an aspect card is ringed by its nature, and everything else by the lens', () => {
  assert.match(reading, /accent=\{SIGNAL_COLOR\[feelSignal\(a\.feel\)\]\}/);
  // The default stays the lens colour, so planets, nodes and elements are unchanged.
  assert.match(reading, /accent \?\? colors\.stoplight/);
});

test('the colour is never the only thing saying which is which', () => {
  // Each nature keeps its own shape and its own sentence, so the colour is a third cue.
  assert.match(icon, /kind="flow"/);
  assert.match(icon, /kind="friction"/);
  assert.match(reading, /FEEL_WORD\[a\.feel\]/);
  for (const word of ['Flows easily', 'Creates friction', 'Blends together']) {
    assert.ok(reading.includes(word), `${word} is gone`);
  }
});
