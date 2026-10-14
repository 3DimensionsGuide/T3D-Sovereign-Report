import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { themes } from '../../mobile/src/theme/tokens';
import { contrastRatio, type Rgb } from '../../mobile/src/lib/glass';

const rgb = (h: string): Rgb => ({ r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) });
const lin = (v: number) => { const s = v / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
function lab(c: Rgb): [number, number, number] {
  const [r, g, b] = [lin(c.r), lin(c.g), lin(c.b)];
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047, y = r * 0.2126 + g * 0.7152 + b * 0.0722, z = (b * 0.9505 + g * 0.1192 + r * 0.0193) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}
const delta = (a: string, b: string) => Math.hypot(...lab(rgb(a)).map((v, i) => v - lab(rgb(b))[i]) as [number, number, number]);

const ORDER = ['today', 'chart', 'readings', 'timeline', 'practice'] as const;

test('the tabs read Today, My Chart, Readings, Timeline, Practice', () => {
  const src = readFileSync('mobile/src/app/(tabs)/_layout.tsx', 'utf8');
  const names = [...src.matchAll(/<Tabs\.Screen\s+name="(\w+)"/g)].map((m) => m[1]);
  assert.deepEqual(names, [...ORDER]);
});

test('neighbouring tabs have card colours you can tell apart', () => {
  for (let i = 0; i < ORDER.length - 1; i++) {
    const d = delta(themes[ORDER[i]].surface, themes[ORDER[i + 1]].surface);
    assert.ok(d >= 5, `${ORDER[i]} → ${ORDER[i + 1]}: difference ${d.toFixed(1)}`);
  }
});

test('text stays AAA on every tab card', () => {
  for (const name of ORDER) {
    const bg = rgb(themes[name].surface), raised = rgb(themes[name].raised);
    for (const b of [bg, raised]) {
      assert.ok(contrastRatio({ r: 245, g: 245, b: 243 }, b) >= 7, name);
      const m = (k: number) => Math.round(245 * 0.72 + k * 0.28);
      assert.ok(contrastRatio({ r: m(b.r), g: m(b.g), b: m(b.b) }, b) >= 7, `${name} muted`);
    }
  }
});

test('My Chart cards carry the three-colour Triad edge and the tab bar line follows the room', () => {
  assert.match(readFileSync('mobile/src/components/TriadEdge.tsx', 'utf8'), /vehicle[\s\S]*road[\s\S]*stoplight/);
  assert.match(readFileSync('mobile/src/app/(tabs)/chart.tsx', 'utf8'), /<TriadEdge \/>/);
  assert.match(readFileSync('mobile/src/components/ChartPanels.tsx', 'utf8'), /<TriadEdge \/>/);
  assert.match(readFileSync('mobile/src/app/(tabs)/_layout.tsx', 'utf8'), /borderTopColor: topLine/);
});
