/**
 * The twelve sign symbols with the "text style" marker after each, so the phone draws them as plain
 * glyphs in the text colour and not as purple emoji badges.
 */
const TEXT_STYLE = '︎';

export const SIGN_GLYPH: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

for (const key of Object.keys(SIGN_GLYPH)) SIGN_GLYPH[key] = `${SIGN_GLYPH[key]}${TEXT_STYLE}`;
