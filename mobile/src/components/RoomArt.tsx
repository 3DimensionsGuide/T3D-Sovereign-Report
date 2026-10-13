import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Polygon, Stop } from 'react-native-svg';
import { useReduceMotion } from '@/lib/motion';
import { LENS_COLOR } from '@/components/Lens';
import type { RoomArt as ArtKind } from '@/theme/rooms';

const HEIGHT = 460;

/** A fixed set of star positions, so the sky looks the same every time you open the tab. */
const STARS = (() => {
  let seed = 7;
  const next = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: 34 }, () => ({ x: next() * 100, y: next() * 330, r: 0.5 + next() * 0.9, o: 0.12 + next() * 0.33 }));
})();

/**
 * One piece of faint line art behind a room's content. Decorative only: hidden from screen readers,
 * ignores touches, and never moves.
 */
export function RoomArtLayer({ kind, color, width }: { kind: ArtKind; color: string; width: number }) {
  const fade = `fade${useId().replace(/\W/g, '')}`;
  const reduce = useReduceMotion();
  if (kind === 'none') return null;
  return (
    <Animated.View
      key={kind}
      entering={reduce ? undefined : FadeIn.duration(700)}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.fill}
    >
      <Svg width="100%" height={HEIGHT}>
        <Defs>
          <LinearGradient id={fade} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={HEIGHT}>
            <Stop offset="0" stopColor={color} stopOpacity={0.3} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        {kind === 'stars'
          ? STARS.map((s, i) => (
              <Circle key={i} cx={`${s.x}%`} cy={s.y + 40} r={s.r} fill={color} opacity={s.o} />
            ))
          : null}
        {kind === 'road'
          ? [-0.55, -0.28, 0, 0.28, 0.55].map((spread) => (
              <Line
                key={spread}
                x1={width / 2}
                y1={60}
                x2={width / 2 + spread * width * 1.6}
                y2={HEIGHT}
                stroke={`url(#${fade})`}
                strokeWidth={1}
              />
            ))
          : null}
        {kind === 'rings'
          ? [46, 78, 112, 150, 196].map((r, i) => (
              <Circle
                key={r}
                cx={width * 0.86}
                cy={74}
                r={r}
                fill="none"
                stroke={color}
                strokeWidth={0.8}
                strokeDasharray={i % 2 === 1 ? '2 5' : undefined}
                opacity={0.16 - i * 0.02}
              />
            ))
          : null}
        {kind === 'diamonds' ? <Diamonds color={color} width={width} /> : null}
        {kind === 'triangles' ? <Triangles color={color} width={width} /> : null}
        {kind === 'orbits' ? <Orbits color={color} width={width} /> : null}
        {kind === 'sunpath' ? <SunPath color={color} width={width} /> : null}
      </Svg>
    </Animated.View>
  );
}

/** Readings, Vehicle: nested diamonds like the centers of a bodygraph, with a channel of light running through them. */
function Diamonds({ color, width }: { color: string; width: number }) {
  const cx = width * 0.84;
  const cy = 96;
  return (
    <>
      <Line x1={cx} y1={0} x2={cx} y2={cy + 190} stroke={color} strokeWidth={0.8} opacity={0.12} />
      {[38, 66, 98, 134, 176].map((r, i) => (
        <Polygon
          key={r}
          points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={0.9}
          strokeLinejoin="round"
          opacity={0.26 - i * 0.04}
        />
      ))}
      {[38, 98].map((r) => (
        <Circle key={r} cx={cx} cy={cy - r} r={2.6} fill={color} opacity={0.5} />
      ))}
    </>
  );
}

/** Readings, Road: triangles stacked on one base, a climb in steps. */
function Triangles({ color, width }: { color: string; width: number }) {
  const cx = width * 0.82;
  const base = 200;
  return (
    <>
      {[54, 92, 132, 176, 224].map((h, i) => (
        <Polygon
          key={h}
          points={`${cx},${base - h} ${cx + h * 0.58},${base} ${cx - h * 0.58},${base}`}
          fill="none"
          stroke={color}
          strokeWidth={0.9}
          strokeLinejoin="round"
          opacity={0.28 - i * 0.045}
        />
      ))}
      <Line x1={cx - 150} y1={base} x2={cx + 150} y2={base} stroke={color} strokeWidth={0.8} opacity={0.14} />
    </>
  );
}

/** Readings, Stoplight: orbits with a planet on each. */
function Orbits({ color, width }: { color: string; width: number }) {
  const cx = width * 0.82;
  const cy = 90;
  const planets = [
    { r: 44, a: 35, s: 3.2 }, { r: 80, a: 150, s: 2.4 }, { r: 118, a: 262, s: 4.4 }, { r: 160, a: 328, s: 2.8 }, { r: 206, a: 84, s: 3.4 },
  ];
  return (
    <>
      {planets.map((p, i) => (
        <Circle key={p.r} cx={cx} cy={cy} r={p.r} fill="none" stroke={color} strokeWidth={0.8} opacity={0.2 - i * 0.025} />
      ))}
      {planets.map((p) => {
        const rad = (p.a * Math.PI) / 180;
        return <Circle key={`d${p.r}`} cx={cx + Math.cos(rad) * p.r} cy={cy + Math.sin(rad) * p.r} r={p.s} fill={color} opacity={0.5} />;
      })}
    </>
  );
}

/** Practice: the sun's path over one day, with a marker for each of the three daily check-ins. */
function SunPath({ color, width }: { color: string; width: number }) {
  const x0 = width * 0.06;
  const x1 = width * 0.94;
  const xc = width / 2;
  const horizon = 250;
  const peak = -110; // control point height, which puts the top of the arc near y = 70
  const at = (t: number) => ({
    x: (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * xc + t * t * x1,
    y: (1 - t) * (1 - t) * horizon + 2 * (1 - t) * t * peak + t * t * horizon,
  });
  const marks = [
    { t: 0.2, c: LENS_COLOR.vehicle },
    { t: 0.5, c: LENS_COLOR.road },
    { t: 0.8, c: LENS_COLOR.stoplight },
  ];
  return (
    <>
      <Line x1={0} y1={horizon} x2={width} y2={horizon} stroke={color} strokeWidth={0.8} opacity={0.1} />
      <Path d={`M ${x0} ${horizon} Q ${xc} ${peak} ${x1} ${horizon}`} fill="none" stroke={color} strokeWidth={1} strokeDasharray="2 7" opacity={0.2} />
      {marks.map((m) => {
        const pt = at(m.t);
        return (
          <G key={m.t}>
            <Circle cx={pt.x} cy={pt.y} r={9} fill="none" stroke={m.c} strokeWidth={0.9} opacity={0.35} />
            <Circle cx={pt.x} cy={pt.y} r={4.2} fill={m.c} opacity={0.75} />
          </G>
        );
      })}
    </>
  );
}


const styles = StyleSheet.create({ fill: { position: 'absolute', top: 0, left: 0, right: 0, height: HEIGHT } });
