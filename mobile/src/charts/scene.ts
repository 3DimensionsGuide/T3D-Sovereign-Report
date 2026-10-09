/**
 * A tiny, renderer-agnostic drawing description. The chart builders produce a
 * Scene (pure data); SceneView.tsx draws it with react-native-svg, and
 * toSvg.ts can turn it into a plain SVG string for previews and tests.
 */
/** 'symbol' = the phone's own system font (astrological glyphs aren't in our brand fonts). */
export type SceneFont = 'display' | 'body' | 'bold' | 'symbol';

export type Prim =
  | { k: 'line'; x1: number; y1: number; x2: number; y2: number; stroke: string; w: number; dash?: string; op?: number }
  | { k: 'path'; d: string; fill?: string; stroke?: string; w?: number; op?: number; dash?: string }
  | { k: 'circle'; cx: number; cy: number; r: number; fill?: string; stroke?: string; w?: number; op?: number }
  | {
      k: 'text';
      x: number;
      y: number;
      s: string;
      size: number;
      fill: string;
      anchor?: 'start' | 'middle' | 'end';
      font?: SceneFont;
      op?: number;
    };

export interface Scene {
  w: number;
  h: number;
  prims: Prim[];
}
