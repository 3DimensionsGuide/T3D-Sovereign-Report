import { StyleSheet, Text, View } from 'react-native';
import { useIsFocused } from 'expo-router';
import { useSharedValue } from 'react-native-reanimated';
import { Pressable } from '@/components/Pressable';
import Svg, { Circle, Defs, LinearGradient, Line, Polygon, Stop } from 'react-native-svg';
import type { ChartResult } from '@/lib/api';
import { LENS_COLOR, LENS_LABEL, LENS_TEXT, type LensName } from '@/components/Lens';
import { TriadCircuit, fireSurge } from '@/components/TriadCircuit';
import { lensTap, tap } from '@/lib/haptics';
import { useReduceMotion } from '@/lib/motion';
import { CORE, CORE_RING, CORNER_R, CORNER_S, CORNER_V } from '@/lib/triadCircuit';
import { colors, fonts } from '@/theme/tokens';

/**
 * The T3D triangle: one corner per lens, joined by lines that blend the lens colours.
 * Drawn in a 100 x 100 box that scales to any width. Each corner carries its lens shape,
 * its name and one headline fact, written out so nothing depends on colour alone.
 */
const V = CORNER_V;
const R = CORNER_R;
const S = CORNER_S;
const HEIGHT_UNITS = 100;
const pct = (y: number) => `${(y / HEIGHT_UNITS) * 100}%` as const;

interface Props {
  chart: ChartResult;
  /** Each corner opens that lens's reading. */
  onOpenLens?: (lens: LensName) => void;
  /** Draws the powered-on circuit version, with depth and moving sparks. Off for share images. */
  live?: boolean;
}

export function TriadPortrait({ chart, onOpenLens, live = false }: Props) {
  const reduce = useReduceMotion();
  const surge = useSharedValue(0);
  const focused = useIsFocused();
  const { humanDesign: hd, numerology: num, astrology: astro } = chart;
  const profileLines = hd.profile.match(/\d\/\d/)?.[0] ?? hd.profile;
  const vehicle = { head: hd.type, sub: `Profile ${profileLines}` };
  const road = { head: `Life Path ${num.lifePath}`, sub: `Destiny ${num.destiny}` };
  const stoplight = { head: `Sun in ${astro.tropicalSun.sign}`, sub: `Moon in ${astro.tropicalMoon.sign}` };

  const open = (lens: LensName, name: string, fact: { head: string; sub: string }) => ({
    accessibilityRole: 'button' as const,
    accessibilityLabel: `${name}: ${fact.head}, ${fact.sub}. Opens your ${LENS_LABEL[lens]} reading.`,
    disabled: !onOpenLens,
    onPress: () => {
      lensTap(lens);
      onOpenLens?.(lens);
    },
  });

  return (
    <View style={styles.wrap}>
      {live ? <TriadCircuit reduce={reduce} surge={surge} paused={!focused} /> : null}
      {live ? null : <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 100 ${HEIGHT_UNITS}`} preserveAspectRatio="xMidYMid meet">
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
      </Svg>}

      <Pressable {...open('vehicle', 'The Vehicle', vehicle)} style={[styles.corner, styles.top, { top: 0 }]}>
        <Text style={[styles.lens, { color: LENS_TEXT.vehicle }]}>{LENS_LABEL.vehicle}</Text>
        <Text style={styles.head}>{vehicle.head}</Text>
        <Text style={styles.sub}>{vehicle.sub}</Text>
      </Pressable>
      <Pressable {...open('road', 'The Road', road)} style={[styles.corner, styles.left, { top: pct(S.y + 10) }]}>
        <Text style={[styles.lens, { color: LENS_TEXT.road }]}>{LENS_LABEL.road}</Text>
        <Text style={styles.head}>{road.head}</Text>
        <Text style={styles.sub}>{road.sub}</Text>
      </Pressable>
      <Pressable {...open('stoplight', 'The Stoplight', stoplight)} style={[styles.corner, styles.right, { top: pct(S.y + 10) }]}>
        <Text style={[styles.lens, { color: LENS_TEXT.stoplight }]}>{LENS_LABEL.stoplight}</Text>
        <Text style={[styles.head, styles.alignRight]}>{stoplight.head}</Text>
        <Text style={[styles.sub, styles.alignRight]}>{stoplight.sub}</Text>
      </Pressable>
      {live ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="T3D. Tap to send a pulse through the circuit"
          onPress={() => { tap(); fireSurge(surge); }}
          style={[styles.core, { top: pct(CORE.y - CORE_RING), height: `${((CORE_RING * 2) / HEIGHT_UNITS) * 100}%` }]}
        >
          <Text style={styles.coreText}>T3D</Text>
        </Pressable>
      ) : (
        <Text importantForAccessibility="no" accessibilityElementsHidden style={[styles.centre, { top: pct(51) }]}>T3D</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', aspectRatio: 100 / HEIGHT_UNITS },
  corner: { position: 'absolute', gap: 2, minHeight: 48 },
  top: { left: 0, right: 0, alignItems: 'center' },
  left: { left: 0, width: '46%' },
  right: { right: 0, width: '46%', alignItems: 'flex-end' },
  lens: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 0.3 },
  head: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 17, lineHeight: 22, color: colors.parchment },
  sub: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.parchmentMuted },
  alignRight: { textAlign: 'right' },
  core: { position: 'absolute', left: '50%', width: '20%', marginLeft: '-10%', alignItems: 'center', justifyContent: 'center' },
  coreText: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 20, color: 'transparent' },
  centre: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 22, color: colors.parchmentMuted },
});
