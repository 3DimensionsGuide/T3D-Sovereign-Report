import { useEffect, useMemo } from 'react';
import { AccessibilityInfo, Animated } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';
import type { Prim, Scene, SceneFont } from '@/charts/scene';
import { fonts } from '@/theme/tokens';

const AnimatedG = Animated.createAnimatedComponent(G);

function fontFamily(font: SceneFont | undefined): string | undefined {
  switch (font) {
    case 'display': return fonts.display;
    case 'bold': return fonts.bodyBold;
    case 'symbol': return undefined;
    default: return fonts.body;
  }
}

function renderPrim(p: Prim, i: number) {
  switch (p.k) {
    case 'line':
      return (
        <Line key={i} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke={p.stroke} strokeWidth={p.w}
          strokeDasharray={p.dash} opacity={p.op} strokeLinecap="round" />
      );
    case 'path':
      return (
        <Path key={i} d={p.d} fill={p.fill ?? 'none'} stroke={p.stroke} strokeWidth={p.w}
          strokeDasharray={p.dash} opacity={p.op} strokeLinejoin="round" strokeLinecap="round" />
      );
    case 'circle':
      return (
        <Circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={p.fill ?? 'none'} stroke={p.stroke}
          strokeWidth={p.w} opacity={p.op} />
      );
    case 'text':
      return (
        <SvgText key={i} x={p.x} y={p.y + p.size * 0.35} fontSize={p.size} fill={p.fill}
          textAnchor={p.anchor ?? 'middle'} fontFamily={fontFamily(p.font)} opacity={p.op}>
          {p.s}
        </SvgText>
      );
  }
}

interface Props {
  scene: Scene;
  label: string;
  /** Fade the scene in layer by layer (skipped when the phone's Reduce Motion is on). */
  reveal?: boolean;
}

/** Draws a chart Scene at full width. `label` is read aloud by screen readers. */
export function SceneView({ scene, label, reveal = false }: Props) {
  const layerIds = useMemo(
    () => Array.from(new Set(scene.prims.map((p) => p.layer ?? 0))).sort((a, b) => a - b),
    [scene],
  );
  const values = useMemo(() => layerIds.map(() => new Animated.Value(reveal ? 0 : 1)), [layerIds, reveal]);

  useEffect(() => {
    if (!reveal) return undefined;
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) {
        values.forEach((v) => v.setValue(1));
        return;
      }
      Animated.stagger(
        380,
        values.map((v) => Animated.timing(v, { toValue: 1, duration: 520, useNativeDriver: false })),
      ).start();
    });
    return () => {
      cancelled = true;
      values.forEach((v) => v.stopAnimation());
    };
  }, [values, reveal]);

  return (
    <Svg
      width="100%"
      viewBox={`0 0 ${scene.w} ${scene.h}`}
      style={{ aspectRatio: scene.w / scene.h }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
    >
      {layerIds.map((id, i) => (
        <AnimatedG key={id} opacity={values[i]}>
          {scene.prims.filter((p) => (p.layer ?? 0) === id).map(renderPrim)}
        </AnimatedG>
      ))}
    </Svg>
  );
}
