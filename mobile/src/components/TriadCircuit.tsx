import { useEffect, useId } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, G, Line, LinearGradient, Polygon, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import { LENS_COLOR } from '@/components/Lens';
import {
  CORE, CORE_CIRCUMFERENCE, CORE_DISC, CORE_RING, CORNERS, CORNER_R, CORNER_S, CORNER_V, EDGES, SPOKES,
  backOf, clamp01, mixHex, pulseOffset, stagger, wrap01, type Pt, type Trace,
} from '@/lib/triadCircuit';
import { colors, fonts } from '@/theme/tokens';

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedText = Animated.createAnimatedComponent(SvgText);

const LENSES = [LENS_COLOR.vehicle, LENS_COLOR.road, LENS_COLOR.stoplight] as const;
const SPARK = '#FFF6D6';
const PULSE_DASH = 9;
const SPOKE_DASH = 5;

interface Clock {
  /** 0 to 1 while the circuit powers on, then stays at 1. */
  on: SharedValue<number>;
  /** Loops 0 to 1 forever, once every few seconds. */
  t: SharedValue<number>;
  /** 0 normally, flashes to 1 and fades when the core is tapped. */
  surge: SharedValue<number>;
}

/** One triangle edge: a trace that draws itself in, then carries a travelling spark. */
function Edge({ trace, index, gradient, clock, animate }: { trace: Trace; index: number; gradient: string; clock: Clock; animate: boolean }) {
  const { on, t, surge } = clock;
  const len = trace.length;
  const base = useAnimatedProps(() => ({ strokeDashoffset: len * (1 - stagger(on.value, index, 3)) }));
  const spark = useAnimatedProps(() => {
    const lit = clamp01((on.value - 0.55) * 4);
    return {
      strokeDashoffset: pulseOffset(wrap01(t.value + index / 3), len, PULSE_DASH),
      strokeOpacity: lit * (0.9 + surge.value * 0.1),
      strokeWidth: 1.1 + surge.value * 1.2,
    };
  });
  const glow = useAnimatedProps(() => {
    const lit = clamp01((on.value - 0.55) * 4);
    return {
      strokeDashoffset: pulseOffset(wrap01(t.value + index / 3), len, PULSE_DASH),
      strokeOpacity: lit * (0.28 + surge.value * 0.3),
    };
  });
  const { from, to } = trace;
  return (
    <>
      <AnimatedLine x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={gradient} strokeWidth={0.8} strokeDasharray={`${len} ${len}`} animatedProps={base} />
      {animate ? (
        <>
          <AnimatedLine x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={LENSES[index]} strokeWidth={3} strokeLinecap="round" strokeDasharray={`${PULSE_DASH} ${len * 2}`} animatedProps={glow} />
          <AnimatedLine x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={SPARK} strokeLinecap="round" strokeDasharray={`${PULSE_DASH} ${len * 2}`} animatedProps={spark} />
        </>
      ) : null}
    </>
  );
}

/** One spoke from the core out to a corner: a dotted trace with pads at each end and energy flowing outward. */
function Spoke({ trace, index, clock, animate }: { trace: Trace; index: number; clock: Clock; animate: boolean }) {
  const { on, t, surge } = clock;
  const len = trace.length;
  const color = LENSES[index];
  const fade = useAnimatedProps(() => ({ strokeOpacity: 0.55 * stagger(on.value, index, 3) }));
  const padFade = useAnimatedProps(() => ({ fillOpacity: stagger(on.value, index, 3) }));
  const flow = useAnimatedProps(() => ({
    strokeDashoffset: pulseOffset(wrap01(t.value * 1.5 + 0.5 + index / 3), len, SPOKE_DASH),
    strokeOpacity: clamp01((on.value - 0.7) * 3.3) * (0.95 + surge.value * 0.05),
    strokeWidth: 0.9 + surge.value * 1.1,
  }));
  const { from, to } = trace;
  return (
    <>
      <AnimatedLine x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={color} strokeWidth={0.5} strokeDasharray="1.1 1.4" animatedProps={fade} />
      <AnimatedCircle cx={from.x} cy={from.y} r={0.95} fill={color} animatedProps={padFade} />
      <AnimatedCircle cx={to.x} cy={to.y} r={0.95} fill={color} animatedProps={padFade} />
      {animate ? (
        <AnimatedLine x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={mixHex(color, '#FFFFFF', 0.55)} strokeLinecap="round" strokeDasharray={`${SPOKE_DASH} ${len * 2}`} animatedProps={flow} />
      ) : null}
    </>
  );
}

/** A corner: a shaded, lit sphere-like shape inside a halo that sends out slow rings. */
function Node({ at, index, kind, gid, clock, animate }: { at: Pt; index: number; kind: 'diamond' | 'triangle' | 'dot'; gid: string; clock: Clock; animate: boolean }) {
  const { on, t, surge } = clock;
  const color = LENSES[index];
  const lit = useAnimatedProps(() => ({ opacity: stagger(on.value, index, 3) }));
  const ring = useAnimatedProps(() => {
    const ph = wrap01(t.value + index / 3 + 0.2);
    return { r: 7.5 + ph * 5.5, strokeOpacity: (1 - ph) * (0.5 + surge.value * 0.4) * clamp01((on.value - 0.5) * 3) };
  });
  const breath = useAnimatedProps(() => ({ fillOpacity: 0.14 + 0.1 * Math.sin(t.value * Math.PI * 2 + index * 2.1) * clamp01((on.value - 0.5) * 3) + surge.value * 0.2 }));
  const { x, y } = at;
  return (
    <>
      {animate ? <AnimatedCircle cx={x} cy={y} fill="none" stroke={color} strokeWidth={0.5} animatedProps={ring} /> : null}
      <AnimatedG animatedProps={lit}>
        <AnimatedCircle cx={x} cy={y} r={7.5} fill={color} animatedProps={breath} />
        {kind === 'diamond' ? <Polygon points={`${x},${y - 4.8} ${x + 4.8},${y} ${x},${y + 4.8} ${x - 4.8},${y}`} fill={`url(#${gid})`} /> : null}
        {kind === 'triangle' ? <Polygon points={`${x},${y - 4.8} ${x + 4.8},${y + 3.8} ${x - 4.8},${y + 3.8}`} fill={`url(#${gid})`} /> : null}
        {kind === 'dot' ? <Circle cx={x} cy={y} r={4.4} fill={`url(#${gid})`} /> : null}
        <Circle cx={x - 1.3} cy={y - 1.6} r={0.9} fill="#FFFFFF" fillOpacity={0.55} />
      </AnimatedG>
    </>
  );
}

/** The power core: a ring of ticks that charges up like a battery, then a spark circles it. */
function Core({ clock, animate }: { clock: Clock; animate: boolean }) {
  const { on, t, surge } = clock;
  const C = CORE_CIRCUMFERENCE;
  const charge = useAnimatedProps(() => {
    const fill = clamp01((on.value - 0.45) / 0.5);
    return { strokeDasharray: `${C * fill} ${C}`, strokeOpacity: 0.55 + surge.value * 0.45 };
  });
  const comet = useAnimatedProps(() => ({
    strokeDashoffset: -wrap01(t.value) * C,
    strokeOpacity: clamp01((on.value - 0.9) * 10),
  }));
  const breath = useAnimatedProps(() => ({
    fillOpacity: 0.1 + clamp01((on.value - 0.5) * 2) * (0.09 + 0.09 * Math.sin(t.value * Math.PI * 2)) + surge.value * 0.25,
  }));
  const word = useAnimatedProps(() => ({ fillOpacity: 0.4 + 0.4 * clamp01((on.value - 0.5) * 2) }));
  return (
    <>
    <G rotation={-90} origin={`${CORE.x}, ${CORE.y}`}>
      <Circle cx={CORE.x} cy={CORE.y} r={CORE_DISC} fill={colors.obsidian} fillOpacity={0.85} stroke={colors.goldEdge} strokeWidth={0.5} />
      <AnimatedCircle cx={CORE.x} cy={CORE.y} r={CORE_DISC} fill={colors.gold} animatedProps={breath} />
      <Circle cx={CORE.x} cy={CORE.y} r={CORE_RING} fill="none" stroke={colors.gold} strokeOpacity={0.28} strokeWidth={1.5} strokeDasharray="2.2 2.15" />
      <AnimatedCircle cx={CORE.x} cy={CORE.y} r={CORE_RING} fill="none" stroke={colors.gold} strokeWidth={1.5} strokeDasharray={`${C} ${C}`} animatedProps={charge} />
      {animate ? (
        <AnimatedCircle cx={CORE.x} cy={CORE.y} r={CORE_RING} fill="none" stroke={SPARK} strokeWidth={2} strokeLinecap="round" strokeDasharray={`3.5 ${C}`} animatedProps={comet} />
      ) : null}
    </G>
    {/* Drawn inside the tilting layer so the glass of the core can never cover it. */}
    <AnimatedText x={CORE.x} y={CORE.y + 2.7} fontSize={7.6} fontFamily={fonts.display} textAnchor="middle" fill={colors.parchment} animatedProps={word}>T3D</AnimatedText>
    </>
  );
}

interface Props {
  /** True when the person has asked their phone for less movement: the circuit shows fully powered and still. */
  reduce: boolean;
  /** Flashes the whole circuit; the portrait fires it when the core is tapped. */
  surge: SharedValue<number>;
}

/**
 * The live Triad drawing, in the same 100 x 100 box as the still one. It has depth (a back face and
 * struts, tilting gently in perspective), and it powers on: traces draw themselves in, each corner
 * lights in turn, the core charges, then sparks run round the triangle and out along the spokes.
 * Decorative only: hidden from screen readers and ignores touches.
 */
export function TriadCircuit({ reduce, surge }: Props) {
  const uid = useId().replace(/\W/g, '');
  const on = useSharedValue(reduce ? 1 : 0);
  const t = useSharedValue(0);
  const sway = useSharedValue(0);
  const clock: Clock = { on, t, surge };
  const animate = !reduce;

  useEffect(() => {
    if (reduce) {
      on.value = 1;
      return;
    }
    on.value = withTiming(1, { duration: 2400, easing: Easing.out(Easing.cubic) });
    t.value = withRepeat(withTiming(1, { duration: 3600, easing: Easing.linear }), -1, false);
    sway.value = withRepeat(withTiming(1, { duration: 11000, easing: Easing.linear }), -1, false);
  }, [reduce, on, t, sway]);

  const tilt = useAnimatedStyle(() => ({
    transform: [
      { perspective: 700 },
      { rotateY: `${Math.sin(sway.value * Math.PI * 2) * 7}deg` },
      { rotateX: `${8 + Math.cos(sway.value * Math.PI * 2) * 3}deg` },
    ],
  }));

  const id = (n: string) => `${n}${uid}`;
  const [bV, bR, bS] = CORNERS.map(backOf);
  const front = `${CORNER_V.x},${CORNER_V.y} ${CORNER_R.x},${CORNER_R.y} ${CORNER_S.x},${CORNER_S.y}`;
  const back = `${bV.x},${bV.y} ${bR.x},${bR.y} ${bS.x},${bS.y}`;
  const gradients = [
    { id: id('e0'), a: CORNER_V, b: CORNER_R, c0: LENS_COLOR.vehicle, c1: LENS_COLOR.road },
    { id: id('e1'), a: CORNER_R, b: CORNER_S, c0: LENS_COLOR.road, c1: LENS_COLOR.stoplight },
    { id: id('e2'), a: CORNER_S, b: CORNER_V, c0: LENS_COLOR.stoplight, c1: LENS_COLOR.vehicle },
  ];
  const backEdges = [[bV, bR, 0, 1], [bR, bS, 1, 2], [bS, bV, 2, 0]] as const;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, tilt]} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <Defs>
          {gradients.map((g) => (
            <LinearGradient key={g.id} id={g.id} gradientUnits="userSpaceOnUse" x1={g.a.x} y1={g.a.y} x2={g.b.x} y2={g.b.y}>
              <Stop offset="0" stopColor={g.c0} />
              <Stop offset="1" stopColor={g.c1} />
            </LinearGradient>
          ))}
          {LENSES.map((c, i) => (
            <RadialGradient key={i} id={id(`n${i}`)} cx="0.35" cy="0.3" r="0.8">
              <Stop offset="0" stopColor={mixHex(c, '#FFFFFF', 0.55)} />
              <Stop offset="0.5" stopColor={c} />
              <Stop offset="1" stopColor={mixHex(c, '#000000', 0.45)} />
            </RadialGradient>
          ))}
        </Defs>

        {/* Depth: the back face, and a strut from each front corner to its back corner. */}
        <Polygon points={back} fill={colors.obsidian} fillOpacity={0.7} />
        {backEdges.map(([a, b, i, j], k) => (
          <Line key={k} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={mixHex(LENSES[i], LENSES[j], 0.5)} strokeOpacity={0.32} strokeWidth={0.5} />
        ))}
        {CORNERS.map((c, i) => {
          const b = backOf(c);
          return <Line key={i} x1={c.x} y1={c.y} x2={b.x} y2={b.y} stroke={LENSES[i]} strokeOpacity={0.4} strokeWidth={0.5} />;
        })}

        <Polygon points={front} fill={colors.amethyst} fillOpacity={0.55} />

        {EDGES.map((e, i) => (
          <Edge key={i} trace={e} index={i} gradient={`url(#${gradients[i].id})`} clock={clock} animate={animate} />
        ))}
        {SPOKES.map((s, i) => (
          <Spoke key={i} trace={s} index={i} clock={clock} animate={animate} />
        ))}
        <Core clock={clock} animate={animate} />
        <Node at={CORNER_V} index={0} kind="diamond" gid={id('n0')} clock={clock} animate={animate} />
        <Node at={CORNER_R} index={1} kind="triangle" gid={id('n1')} clock={clock} animate={animate} />
        <Node at={CORNER_S} index={2} kind="dot" gid={id('n2')} clock={clock} animate={animate} />
      </Svg>
    </Animated.View>
  );
}

/** Flashes the circuit: up fast, then a slow fade. Call from a tap. */
export function fireSurge(surge: SharedValue<number>): void {
  surge.value = withSequence(withTiming(1, { duration: 160 }), withTiming(0, { duration: 1100, easing: Easing.out(Easing.quad) }));
}
