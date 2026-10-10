import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Line, Polygon, Stop } from 'react-native-svg';
import type { ChartResult } from '@/lib/api';
import { LENS_COLOR, LENS_LABEL, LENS_TEXT } from '@/components/Lens';
import { colors, fonts } from '@/theme/tokens';

/**
 * The T3D triangle: one corner per lens, joined by lines that blend the lens colours.
 * Drawn in a 100 x 95 box that scales to any width. Each corner carries its lens shape,
 * its name and one headline fact, written out so nothing depends on colour alone.
 */
const V = { x: 50, y: 22 };
const R = { x: 17, y: 69 };
const S = { x: 83, y: 69 };
const HEIGHT_UNITS = 95;
const pct = (y: number) => `${(y / HEIGHT_UNITS) * 100}%` as const;

interface Props {
  chart: ChartResult;
}

export function TriadPortrait({ chart }: Props) {
  const { humanDesign: hd, numerology: num, astrology: astro } = chart;
  const profileLines = hd.profile.match(/\d\/\d/)?.[0] ?? hd.profile;
  const vehicle = { head: hd.type, sub: `Profile ${profileLines}` };
  const road = { head: `Life Path ${num.lifePath}`, sub: `Destiny ${num.destiny}` };
  const stoplight = { head: `Sun in ${astro.tropicalSun.sign}`, sub: `Moon in ${astro.tropicalMoon.sign}` };

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Your Triad. The Vehicle: ${vehicle.head}, ${vehicle.sub}. The Road: ${road.head}, ${road.sub}. The Stoplight: ${stoplight.head}, ${stoplight.sub}.`}
      style={styles.wrap}
    >
      <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 100 ${HEIGHT_UNITS}`} preserveAspectRatio="xMidYMid meet">
        <Defs>
          <LinearGradient id="vr" gradientUnits="userSpaceOnUse" x1={V.x} y1={V.y} x2={R.x} y2={R.y}>
            <Stop offset="0" stopColor={LENS_COLOR.vehicle} />
            <Stop offset="1" stopColor={LENS_COLOR.road} />
          </LinearGradient>
          <LinearGradient id="rs" gradientUnits="userSpaceOnUse" x1={R.x} y1={R.y} x2={S.x} y2={S.y}>
            <Stop offset="0" stopColor={LENS_COLOR.road} />
            <Stop offset="1" stopColor={LENS_COLOR.stoplight} />
          </LinearGradient>
          <LinearGradient id="sv" gradientUnits="userSpaceOnUse" x1={S.x} y1={S.y} x2={V.x} y2={V.y}>
            <Stop offset="0" stopColor={LENS_COLOR.stoplight} />
            <Stop offset="1" stopColor={LENS_COLOR.vehicle} />
          </LinearGradient>
        </Defs>
        <Polygon points={`${V.x},${V.y} ${R.x},${R.y} ${S.x},${S.y}`} fill={colors.amethyst} fillOpacity={0.55} />
        <Line x1={V.x} y1={V.y} x2={R.x} y2={R.y} stroke="url(#vr)" strokeWidth={0.7} />
        <Line x1={R.x} y1={R.y} x2={S.x} y2={S.y} stroke="url(#rs)" strokeWidth={0.7} />
        <Line x1={S.x} y1={S.y} x2={V.x} y2={V.y} stroke="url(#sv)" strokeWidth={0.7} />

        {/* Vehicle: diamond */}
        <Circle cx={V.x} cy={V.y} r={7.5} fill={LENS_COLOR.vehicle} fillOpacity={0.14} />
        <Polygon points={`${V.x},${V.y - 4.6} ${V.x + 4.6},${V.y} ${V.x},${V.y + 4.6} ${V.x - 4.6},${V.y}`} fill={LENS_COLOR.vehicle} />
        {/* Road: triangle */}
        <Circle cx={R.x} cy={R.y} r={7.5} fill={LENS_COLOR.road} fillOpacity={0.18} />
        <Polygon points={`${R.x},${R.y - 4.6} ${R.x + 4.6},${R.y + 3.6} ${R.x - 4.6},${R.y + 3.6}`} fill={LENS_COLOR.road} />
        {/* Stoplight: dot */}
        <Circle cx={S.x} cy={S.y} r={7.5} fill={LENS_COLOR.stoplight} fillOpacity={0.16} />
        <Circle cx={S.x} cy={S.y} r={4.2} fill={LENS_COLOR.stoplight} />
      </Svg>

      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={[styles.corner, styles.top, { top: 0 }]}>
        <Text style={[styles.lens, { color: LENS_TEXT.vehicle }]}>{LENS_LABEL.vehicle}</Text>
        <Text style={styles.head}>{vehicle.head}</Text>
        <Text style={styles.sub}>{vehicle.sub}</Text>
      </View>
      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={[styles.corner, styles.left, { top: pct(S.y + 10) }]}>
        <Text style={[styles.lens, { color: LENS_TEXT.road }]}>{LENS_LABEL.road}</Text>
        <Text style={styles.head}>{road.head}</Text>
        <Text style={styles.sub}>{road.sub}</Text>
      </View>
      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={[styles.corner, styles.right, { top: pct(S.y + 10) }]}>
        <Text style={[styles.lens, { color: LENS_TEXT.stoplight }]}>{LENS_LABEL.stoplight}</Text>
        <Text style={[styles.head, styles.alignRight]}>{stoplight.head}</Text>
        <Text style={[styles.sub, styles.alignRight]}>{stoplight.sub}</Text>
      </View>
      <Text importantForAccessibility="no" accessibilityElementsHidden style={[styles.centre, { top: pct(54) }]}>T3D</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', aspectRatio: 100 / HEIGHT_UNITS },
  corner: { position: 'absolute', gap: 2 },
  top: { left: 0, right: 0, alignItems: 'center' },
  left: { left: 0, width: '46%' },
  right: { right: 0, width: '46%', alignItems: 'flex-end' },
  lens: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 0.4 },
  head: { fontFamily: fonts.display, fontSize: 17, lineHeight: 22, color: colors.parchment },
  sub: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.parchmentMuted },
  alignRight: { textAlign: 'right' },
  centre: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontFamily: fonts.display, fontSize: 22, color: colors.parchmentMuted },
});
