import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contrastRatio, type Rgb } from '../../mobile/src/lib/glass';
import { themes } from '../../mobile/src/theme/tokens';

const src = (p: string) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');
const rgb = (hex: string): Rgb => ({ r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) });

test('lens text tints are AAA (7:1) on every room surface and raised card', () => {
  const lens = src('mobile/src/components/Lens.tsx');
  const block = lens.slice(lens.indexOf('export const LENS_TEXT'), lens.indexOf('};', lens.indexOf('export const LENS_TEXT')));
  const tints = [...block.matchAll(/'(#[0-9A-Fa-f]{6})'/g)].map((m) => m[1]);
  assert.equal(tints.length, 3);
  for (const t of tints) {
    for (const [room, th] of Object.entries(themes)) {
      for (const bg of [th.surface, th.raised]) {
        const r = contrastRatio(rgb(t), rgb(bg));
        assert.ok(r >= 7, `${t} on ${room} ${bg} = ${r.toFixed(2)}`);
      }
    }
  }
});

test('headings in Playfair use lining numerals so numbers sit on the line', () => {
  for (const f of ['TriadPortrait', 'DayDetail', 'RoadToday']) {
    const s = src(`mobile/src/components/${f}.tsx`);
    for (const line of s.split('\n')) {
      if (/fontFamily: fonts\.display(Regular|Italic)?,/.test(line)) assert.ok(/lining-nums/.test(line), `${f}: ${line.trim().slice(0, 60)}`);
    }
  }
});

test('rows and controls meet the 48 point touch minimum', () => {
  for (const f of ['components/Disclosure.tsx', 'components/Explain.tsx', 'components/TransitSheet.tsx', 'components/PlanetSheet.tsx', 'components/ChartPanels.tsx']) {
    assert.ok(!/minHeight: (3\d|4[0-7])\b/.test(src(`mobile/src/${f}`)), f);
  }
  assert.match(src('mobile/src/components/Segmented.tsx'), /compact: \{ minHeight: 48 \}/);
});

test('no in-app text is smaller than 11 points', () => {
  for (const f of ['TriadMap', 'TimeSpine', 'SignalRibbon', 'PlanetSheet', 'TransitSheet', 'readings/NameColumns']) {
    assert.ok(!/fontSize: (8|9|10|10\.\d)\b/.test(src(`mobile/src/components/${f}.tsx`)), f);
  }
});

test('only the Signal lamp carries the gold hero glow on Today', () => {
  assert.match(src('mobile/src/components/SignalLamp.tsx'), /<Glass hero /);
  assert.ok(!/<Glass hero /.test(src('mobile/src/components/TriadTodayCard.tsx')));
  assert.ok(!/heroCard/.test(src('mobile/src/components/MeetTriadCard.tsx')));
});

test('animation loops stop when the screen is not in view', () => {
  assert.match(src('mobile/src/components/Screen.tsx'), /paused=\{!focused\}/);
  assert.match(src('mobile/src/components/TriadPortrait.tsx'), /paused=\{!focused\}/);
  assert.match(src('mobile/src/components/TriadCircuit.tsx'), /cancelAnimation\(t\)/);
  assert.match(src('mobile/src/components/RoomArt.tsx'), /cancelAnimation\(glow\)/);
});

test('the circuit resumes each loop from where it stopped, one whole turn at a time, so returning to the tab does not jump', () => {
  const c = src('mobile/src/components/TriadCircuit.tsx');
  assert.match(c, /withTiming\(t\.value \+ 1,/);
  assert.match(c, /withTiming\(sway\.value \+ 1,/);
});

test('the Today title is one line with no year, since the date pill shows the full date', () => {
  const t = src('mobile/src/app/(tabs)/today.tsx');
  assert.ok(!/\{ year: 'numeric' \}/.test(t.slice(t.indexOf('const dateLabel'), t.indexOf('const relation'))));
  assert.match(t, /style=\{styles\.title\} numberOfLines=\{1\} adjustsFontSizeToFit/);
});
