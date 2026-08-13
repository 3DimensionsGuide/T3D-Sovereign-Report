/**
 * T3D Report — Font Registration
 *
 * Registers Playfair Display and DM Sans for use in @react-pdf/renderer.
 * Font files must exist at /public/fonts/ — see setup instructions in README.
 *
 * Required files:
 *   public/fonts/PlayfairDisplay-Regular.ttf
 *   public/fonts/PlayfairDisplay-Italic.ttf
 *   public/fonts/PlayfairDisplay-Bold.ttf
 *   public/fonts/DMSans-Light.ttf
 *   public/fonts/DMSans-Regular.ttf
 *   public/fonts/DMSans-Medium.ttf
 */

import { Font } from '@react-pdf/renderer';
import path from 'path';

let registered = false;

export function registerFonts() {
  if (registered) return;
  registered = true;

  const fontsDir = path.join(process.cwd(), 'public', 'fonts');

  Font.register({
    family: 'Playfair Display',
    fonts: [
      {
        src:       path.join(fontsDir, 'PlayfairDisplay-Regular.ttf'),
        fontWeight: 400,
        fontStyle:  'normal',
      },
      {
        src:       path.join(fontsDir, 'PlayfairDisplay-Italic.ttf'),
        fontWeight: 400,
        fontStyle:  'italic',
      },
      {
        src:       path.join(fontsDir, 'PlayfairDisplay-Bold.ttf'),
        fontWeight: 700,
        fontStyle:  'normal',
      },
    ],
  });

  Font.register({
  family: 'DM Sans',
  fonts: [
    {
      src:        path.join(fontsDir, 'DMSans-Regular.ttf'),
      fontWeight: 300,
      fontStyle:  'normal',
    },
    {
      src:        path.join(fontsDir, 'DMSans-Regular.ttf'),
      fontWeight: 400,
      fontStyle:  'normal',
    },
    {
      src:        path.join(fontsDir, 'DMSans-Medium.ttf'),
      fontWeight: 500,
      fontStyle:  'normal',
    },
    {
      src:        path.join(fontsDir, 'DMSans-Italic.ttf'),
      fontWeight: 300,
      fontStyle:  'italic',
    },
    {
      src:        path.join(fontsDir, 'DMSans-Italic.ttf'),
      fontWeight: 400,
      fontStyle:  'italic',
    },
    {
      src:        path.join(fontsDir, 'DMSans-Italic.ttf'),
      fontWeight: 500,
      fontStyle:  'italic',
    },
  ],
});

  // Disable automatic hyphenation — preserves editorial line breaks
  Font.registerHyphenationCallback((word) => [word]);
}
