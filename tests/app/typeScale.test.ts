import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { TRACKING_STEPS, TYPE_STEPS, colors } from '../../mobile/src/theme/tokens';

const ROOT = new URL('../../mobile/src/', import.meta.url).pathname;
function walk(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx$/.test(f)) out.push(p);
  }
  return out;
}
// Share cards and wallpapers are drawn on fixed canvases and keep their own sizes.
const files = walk(ROOT).filter((p) => !/ShareCard|SigilWallpaper/.test(p));
const blocks = (s: string) => [...s.matchAll(/\{[^{}]*\}/g)].map((m) => m[0]);

test('every in-app font size is a step on the type scale', () => {
  const bad: string[] = [];
  for (const f of files) {
    for (const b of blocks(readFileSync(f, 'utf8'))) {
      const m = b.match(/fontSize:\s*(\d+(?:\.\d+)?)/);
      if (m && !TYPE_STEPS.includes(Number(m[1]))) bad.push(`${f.replace(ROOT, '')}: ${m[1]}`);
    }
  }
  assert.deepEqual(bad, []);
});

test('every in-app letter-spacing is one of the tracking steps', () => {
  const bad: string[] = [];
  for (const f of files) {
    for (const b of blocks(readFileSync(f, 'utf8'))) {
      const m = b.match(/letterSpacing:\s*(\d+(?:\.\d+)?)/);
      if (m && !TRACKING_STEPS.includes(Number(m[1]))) bad.push(`${f.replace(ROOT, '')}: ${m[1]}`);
    }
  }
  assert.deepEqual(bad, []);
});

test('a line height is never tighter than 1.05 times its font size', () => {
  const bad: string[] = [];
  for (const f of files) {
    for (const b of blocks(readFileSync(f, 'utf8'))) {
      const s = b.match(/fontSize:\s*(\d+(?:\.\d+)?)/);
      const l = b.match(/lineHeight:\s*(\d+(?:\.\d+)?)/);
      if (s && l && Number(l[1]) < Number(s[1]) * 1.05) bad.push(`${f.replace(ROOT, '')}: ${s[1]}/${l[1]}`);
    }
  }
  assert.deepEqual(bad, []);
});

test('there is one light red: errors use the same tint as Stoplight text', () => {
  assert.equal(colors.danger.toLowerCase(), '#f79a95');
});
