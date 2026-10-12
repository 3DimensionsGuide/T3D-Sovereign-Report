import { useMemo } from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { buildMiniWheel, longitudeFromPlacement } from '@/lib/miniDrawings';
import { colors } from '@/theme/tokens';
import type { ChartResult } from '@/lib/api';

/**
 * Your birth sky in miniature: the twelve signs round a ring (Aries at the left), the Sun as a solid dot,
 * the Moon as an open ring and the Rising sign as a bar through the ring. The signs are written beside it.
 */
export function MiniWheel({ astro, size = 64 }: { astro: ChartResult['astrology']; size?: number }) {
  const wheel = useMemo(
    () =>
      buildMiniWheel(
        longitudeFromPlacement(astro.tropicalSun.sign, astro.tropicalSun.degreeInSign, astro.tropicalSun.minuteInSign),
        longitudeFromPlacement(astro.tropicalMoon.sign, astro.tropicalMoon.degreeInSign, astro.tropicalMoon.minuteInSign),
        Number.isFinite(astro.tropicalAscendant) ? ((astro.tropicalAscendant % 360) + 360) % 360 : null,
        { sun: astro.tropicalSun.sign, moon: astro.tropicalMoon.sign, rising: signOf(astro.tropicalAscendant) },
        size,
      ),
    [astro, size],
  );
  return (
    <Svg width={wheel.size} height={wheel.size} accessibilityRole="image" accessibilityLabel={wheel.spoken}>
      <Circle cx={wheel.c} cy={wheel.c} r={wheel.ringR} fill="none" stroke={colors.parchmentMuted} strokeWidth={1} />
      {wheel.ticks.map((t, i) => (
        <Line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={colors.parchmentMuted} strokeWidth={1} />
      ))}
      {wheel.marks.map((m) =>
        m.who === 'Rising' ? (
          <Line key={m.who} x1={m.x} y1={m.y} x2={m.x2} y2={m.y2} stroke={colors.stoplight} strokeWidth={3} strokeLinecap="round" />
        ) : m.who === 'Sun' ? (
          <Circle key={m.who} cx={m.x} cy={m.y} r={5} fill={colors.stoplight} />
        ) : (
          <Circle key={m.who} cx={m.x} cy={m.y} r={4} fill="none" stroke={colors.parchment} strokeWidth={1.5} />
        ),
      )}
    </Svg>
  );
}

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
function signOf(longitude: number): string {
  return SIGNS[Math.floor((((longitude % 360) + 360) % 360) / 30)] ?? '';
}
