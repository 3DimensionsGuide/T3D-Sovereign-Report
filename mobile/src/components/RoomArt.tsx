import { useEffect, useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing, FadeIn, cancelAnimation, useAnimatedProps, useSharedValue, withDelay, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Polygon, Stop } from 'react-native-svg';
import { useReduceMotion } from '@/lib/motion';
import { LENS_COLOR } from '@/components/Lens';
import type { RoomArt as ArtKind } from '@/theme/rooms';

const HEIGHT = 460;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** A fixed set of star positions, so the sky looks the same every time you open the tab. */
const STARS = (() => {
  let seed = 7;
  const next = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: 34 }, () => ({ x: next() * 100, y: next() * 330, r: 0.5 + next() * 0.9, o: 0.12 + next() * 0.33 }));
})();

/** One star that slowly brightens and dims, out of step with its neighbours. Only the opacity changes. */
function TwinkleStar({ x, y, r, color, low, index, paused }: { x: number; y: number; r: number; color: string; low: number; index: number; paused: boolean }) {
  const glow = useSharedValue(low);
  useEffect(() => {
    if (paused) {
      cancelAnimation(glow);
      glow.value = low;
      return;
    }
    const period = 2200 + (index % 5) * 700;
    glow.value = withDelay(
      (index % 7) * 450,
      withRepeat(
        withSequence(
          withTiming(Math.min(0.85, low + 0.5), { duration: period, easing: Easing.inOut(Easing.sin) }),
          withTiming(low, { duration: period, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );
    return () => cancelAnimation(glow);
  }, [glow, low, index, paused]);
  const animatedProps = useAnimatedProps(() => ({ opacity: glow.value }));
  return <AnimatedCircle cx={`${x}%`} cy={y} r={r} fill={color} animatedProps={animatedProps} />;
}

/**
 * One piece of faint line art behind a room's content. Decorative only: hidden from screen readers,
 * ignores touches, and drifts slowly as the page scrolls (see ParallaxLayer).
 */
export function RoomArtLayer({
  kind, color, width, opacity = 1, paused = false,
}: { kind: ArtKind; color: string; width: number; opacity?: number; paused?: boolean }) {
  const fade = `fade${useId().replace(/\W/g, '')}`;
  const reduce = useReduceMotion();
  if (kind === 'none' || opacity < 0.01) return null;
  return (
    <Animated.View
      key={kind}
      entering={reduce ? undefined : FadeIn.duration(700)}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.fill, { opacity }]}
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
              i % 6 === 0 && !reduce ? (
                <TwinkleStar key={i} x={s.x} y={s.y + 40} r={s.r + 0.3} color={color} low={s.o} index={i} paused={paused} />
              ) : (
                <Circle key={i} cx={`${s.x}%`} cy={s.y + 40} r={s.r} fill={color} opacity={s.o} />
              )
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

/**
 * The daytime counterpart of the stars: a sun with rings and short rays, riding the same arc as the warm light
 * (rising in the east, high at noon, setting in the west). Faint enough to sit behind any text, hidden at night.
 */
export function SkySun({ color, width, sun }: { color: string; width: number; sun: { opacity: number; cx: number; y: number } }) {
  const reduce = useReduceMotion();
  if (sun.opacity < 0.02) return null;
  const x = (sun.cx / 100) * width;
  const rays = Array.from({ length: 12 }, (_, i) => (i * Math.PI) / 6);
  return (
    <Animated.View
      entering={reduce ? undefined : FadeIn.duration(700)}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.fill, { opacity: sun.opacity }]}
    >
      <Svg width="100%" height={HEIGHT}>
        {[64, 98, 140].map((r, i) => (
          <Circle key={r} cx={x} cy={sun.y} r={r} fill="none" stroke={color} strokeWidth={0.9} opacity={0.3 - i * 0.08} />
        ))}
        {rays.map((a) => (
          <Line
            key={a}
            x1={x + Math.cos(a) * 36}
            y1={sun.y + Math.sin(a) * 36}
            x2={x + Math.cos(a) * 54}
            y2={sun.y + Math.sin(a) * 54}
            stroke={color}
            strokeWidth={1.4}
            strokeLinecap="round"
            opacity={0.55}
          />
        ))}
        <Circle cx={x} cy={sun.y} r={26} fill={color} opacity={0.5} />
        <Circle cx={x} cy={sun.y} r={18} fill={color} opacity={0.75} />
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
  // A shallow arc kept above the page title, so no marker ever sits behind a line of text.
  const horizon = 92;
  const peak = 14; // control point height, which puts the top of the arc near y = 53
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
