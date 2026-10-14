import { useEffect, useId } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing, cancelAnimation, useAnimatedProps, useSharedValue, withRepeat, withTiming, type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, G, RadialGradient, Stop } from 'react-native-svg';
import { LOGO_HALO, LOGO_LIGHTS, LOGO_SIZE } from '@/lib/logoLights';
import { mixHex, stagger, wrap01 } from '@/lib/triadCircuit';
import { colors } from '@/theme/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);
const LIGHT = [colors.stoplight, colors.vehicle, colors.road] as const;

function Light({ index, gid, on, t, animate }: { index: number; gid: string; on: SharedValue<number>; t: SharedValue<number>; animate: boolean }) {
  const { cx, cy, r } = LOGO_LIGHTS[index];
  const lit = useAnimatedProps(() => ({ opacity: stagger(on.value, index, 3, 0.2) }));
  const halo = useAnimatedProps(() => ({
    fillOpacity: stagger(on.value, index, 3, 0.2) * (0.16 + 0.1 * Math.sin(wrap01(t.value + index / 3) * Math.PI * 2)),
  }));
  return (
    <>
      <Circle cx={cx} cy={cy} r={r} fill={colors.obsidian} stroke={colors.hairline} strokeWidth={2} />
      <AnimatedCircle cx={cx} cy={cy} r={LOGO_HALO} fill={LIGHT[index]} animatedProps={animate ? halo : undefined} fillOpacity={animate ? undefined : 0.18} />
      <AnimatedG animatedProps={animate ? lit : undefined}>
        <Circle cx={cx} cy={cy} r={r} fill={`url(#${gid})`} />
        <Circle cx={cx - 8} cy={cy - 9} r={4.5} fill="#FFFFFF" fillOpacity={0.55} />
      </AnimatedG>
    </>
  );
}

/**
 * The three logo lights, drawn over the wordmark image: they switch on one after another (red, amber,
 * green), then glow softly out of step. Reduce Motion shows them lit and still. Decorative only.
 */
export function LogoLights({ reduce, paused = false }: { reduce: boolean; paused?: boolean }) {
  const uid = useId().replace(/\W/g, '');
  const on = useSharedValue(reduce ? 1 : 0);
  const t = useSharedValue(0);
  const animate = !reduce;

  useEffect(() => {
    if (reduce) {
      on.value = 1;
      return;
    }
    if (paused) {
      cancelAnimation(t);
      return;
    }
    if (on.value < 1) on.value = withTiming(1, { duration: 1800, easing: Easing.out(Easing.cubic) });
    t.value = withRepeat(withTiming(t.value + 1, { duration: 3200, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(t);
  }, [reduce, paused, on, t]);

  return (
    <Svg
      style={StyleSheet.absoluteFill}
      viewBox={`0 0 ${LOGO_SIZE.width} ${LOGO_SIZE.height}`}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Defs>
        {LIGHT.map((c, i) => (
          <RadialGradient key={i} id={`${uid}l${i}`} cx="0.38" cy="0.32" r="0.8">
            <Stop offset="0" stopColor={mixHex(c, '#FFFFFF', 0.5)} />
            <Stop offset="0.5" stopColor={c} />
            <Stop offset="1" stopColor={mixHex(c, '#000000', 0.4)} />
          </RadialGradient>
        ))}
      </Defs>
      {LIGHT.map((_, i) => (
        <Light key={i} index={i} gid={`${uid}l${i}`} on={on} t={t} animate={animate} />
      ))}
    </Svg>
  );
}
