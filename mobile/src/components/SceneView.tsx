import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import type { Prim, Scene, SceneFont } from '@/charts/scene';
import { fonts } from '@/theme/tokens';

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

/** Draws a chart Scene at full width. `label` is read aloud by screen readers. */
export function SceneView({ scene, label }: { scene: Scene; label: string }) {
  return (
    <Svg
      width="100%"
      viewBox={`0 0 ${scene.w} ${scene.h}`}
      style={{ aspectRatio: scene.w / scene.h }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
    >
      {scene.prims.map(renderPrim)}
    </Svg>
  );
}
