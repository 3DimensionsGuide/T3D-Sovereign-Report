import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { LOGO_HALO, LOGO_LIGHTS, LOGO_ORDER, LOGO_SIZE } from '../../mobile/src/lib/logoLights';

const root = new URL('../../mobile/', import.meta.url).pathname;
const config = JSON.parse(readFileSync(`${root}app.json`, 'utf8')).expo;

test('the three logo lights are one stack, evenly spaced, inside the image', () => {
  assert.equal(LOGO_LIGHTS.length, 3);
  const gap = LOGO_LIGHTS[1].cy - LOGO_LIGHTS[0].cy;
  assert.ok(Math.abs(LOGO_LIGHTS[2].cy - LOGO_LIGHTS[1].cy - gap) < 2);
  for (const l of LOGO_LIGHTS) {
    assert.equal(l.cx, LOGO_LIGHTS[0].cx);
    assert.ok(l.cx - LOGO_HALO > 0 && l.cy - LOGO_HALO > 0 && l.cy + LOGO_HALO < LOGO_SIZE.height);
  }
  assert.ok(gap > LOGO_LIGHTS[0].r * 2, 'lights do not touch');
  assert.deepEqual([...LOGO_ORDER], [0, 1, 2]);
});

test('every image the app config points to exists', () => {
  const paths = [config.icon, config.ios.icon.light, config.ios.icon.dark, config.ios.icon.tinted,
    config.android.adaptiveIcon.foregroundImage, config.android.adaptiveIcon.backgroundImage, config.android.adaptiveIcon.monochromeImage,
    config.web.favicon, ...config.plugins.filter((p: unknown) => Array.isArray(p) && p[0] === 'expo-splash-screen').map((p: [string, { image: string }]) => p[1].image)];
  for (const p of paths) assert.ok(existsSync(`${root}${p.replace('./', '')}`), p);
});

test('the iOS icon has light, dark and tinted versions, and the splash logo is large enough to read', () => {
  assert.ok(config.ios.icon.light && config.ios.icon.dark && config.ios.icon.tinted);
  const splash = config.plugins.find((p: unknown) => Array.isArray(p) && p[0] === 'expo-splash-screen')[1];
  assert.ok(splash.imageWidth >= 260);
});

test('no unused image files ship in assets', () => {
  const used = readFileSync(`${root}app.json`, 'utf8');
  const code = readdirSync(`${root}src`, { recursive: true }).filter((f) => /\.tsx?$/.test(String(f))).map((f) => readFileSync(`${root}src/${f}`, 'utf8')).join('\n');
  for (const f of readdirSync(`${root}assets/images`)) {
    assert.ok(used.includes(f) || code.includes(f), `${f} is not used`);
  }
});

test('the welcome logo draws the wordmark image and the animated lights, and describes itself once', () => {
  const w = readFileSync(`${root}src/app/welcome.tsx`, 'utf8');
  assert.match(w, /logo-t3d-wordmark\.png/);
  assert.match(w, /<LogoLights reduce=\{reduceMotion\}/);
  assert.match(w, /accessibilityLabel="The 3 Dimensions logo: T3D with three lights, red, amber and green"/);
});
