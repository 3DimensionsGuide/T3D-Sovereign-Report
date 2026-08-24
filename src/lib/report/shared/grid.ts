/**
 * T3D Report — 12-Column Internal Grid
 *
 * Five page types:
 *  #1 Interpretation   [7 cols copy] [5 cols callout]
 *  #2 Dashboard        [4 cols] [4 cols] [4 cols]
 *  #3 Field Practice   [8 cols exercise] [4 cols notation]
 *  #4 Diagram          [12 cols full] + caption
 *  #5 Reflection       [5 cols prompt] [7 cols writing]
 *
 * Usage:
 *   import { GRID } from '../shared/grid';
 *   <View style={{ flexDirection:'row', gap: GRID.gap }}>
 *     <View style={{ flex: GRID.interpretation.copy }}>   // 7
 *     <View style={{ flex: GRID.interpretation.callout }}> // 5
 */

export const PAGE_CONTENT_WIDTH = 492;        // pt after margins
export const COL_UNIT = PAGE_CONTENT_WIDTH / 12;  // 41pt per column
export const GAP = 16;                        // pt — column gutter

export const GRID = {
  gap: GAP,
  interpretation: { copy: 7,    callout: 5 },
  dashboard:      { module: 1 },   // × 3
  fieldPractice:  { exercise: 8,  notation: 4 },
  diagram:        { full: 12 },
  reflection:     { prompt: 5,   writing: 7 },
} as const;

export const COL = {
  s4:  COL_UNIT * 4,   // 164pt — dashboard module
  s5:  COL_UNIT * 5,   // 205pt — reflection prompt / callout
  s7:  COL_UNIT * 7,   // 287pt — interpretation copy
  s8:  COL_UNIT * 8,   // 328pt — field practice exercise
  s12: COL_UNIT * 12,  // 492pt — full width
} as const;
