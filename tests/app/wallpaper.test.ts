import test from 'node:test';
import assert from 'node:assert/strict';
import { WALLPAPER, WALLPAPER_CAPTURE, wallpaperLayout } from '../../mobile/src/lib/wallpaper';

test('the card has the same shape as the saved image', () => {
  assert.ok(Math.abs(WALLPAPER.width / WALLPAPER.height - WALLPAPER_CAPTURE.width / WALLPAPER_CAPTURE.height) < 0.001);
});

test('lock screen keeps the clock area clear and the Sigil fully visible', () => {
  const l = wallpaperLayout('lock');
  assert.ok(l.top >= WALLPAPER.height * 0.35, 'starts below the clock');
  assert.ok(l.top + l.sigilSize <= WALLPAPER.height, 'fits on the screen');
  assert.equal(l.opacity, 1);
});

test('home screen centres a dimmer Sigil', () => {
  const l = wallpaperLayout('home');
  assert.equal(l.top * 2 + l.sigilSize, WALLPAPER.height);
  assert.ok(l.opacity < 1 && l.opacity >= 0.4);
  assert.ok(l.sigilSize < wallpaperLayout('lock').sigilSize);
});
