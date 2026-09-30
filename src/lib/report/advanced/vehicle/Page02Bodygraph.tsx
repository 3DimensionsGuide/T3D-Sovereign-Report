/**
 * Advanced Sovereign Report — Vehicle Section — Your Bodygraph
 *
 * A schematic Human Design bodygraph: the 9 Centers positioned in their
 * classic relative layout, filled when defined / hollow when open, with
 * the channel network drawn between them — solid amber where a channel is
 * actually active, faint dashed where the slot exists but isn't activated.
 * Hanging gates (same calculateSplitBridges() data Page03Bridges uses) are
 * drawn as a short dotted stub reaching from the live gate's Center toward
 * its still-open partner Center, so "Where You Need a Bridge" has a visual
 * anchor instead of living only in a paragraph.
 *
 * Sits right after Page02Definition and before the conditional
 * Page03Bridges — a visual recap of Definition that also previews the
 * bridge-gate detail the next page (when present) goes on to unpack.
 *
 * This is a schematic, not a to-scale astrological instrument: Center
 * positions and channel routing follow the standard bodygraph convention,
 * simplified for a static, single-page react-pdf SVG rather than
 * reproducing every nuance of a live interactive bodygraph tool.
 *
 * Channel-to-Center pairing is derived at import time straight from
 * CHANNELS + GATE_KEYNOTES (section3/gate-content.ts) — the same source
 * calculateSplitBridges() reads — so the diagram's wiring can't silently
 * drift out of sync with the actual 36-channel table.
 */

import React from 'react';
import { Page, View, Text, StyleSheet, Svg, Polygon, Rect, Line, Circle, G } from '@react-pdf/renderer';
import { TechnicalLines } from '../../shared/PageComponents';
import { C, F, PAGE, calculateDefinition, calculateSplitBridges } from '../../tokens';
import { CENTER_DISPLAY_NAME, ALL_CENTERS } from '../../section3/hd-content';
import { CHANNELS, GATE_KEYNOTES } from '../../section3/gate-content';
import type { ReportData } from '../../tokens';

const S = StyleSheet.create({
  page: { paddingBottom: PAGE.marginV, backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  amberLine: { width: PAGE.width, height: 1.5, backgroundColor: C.amber },
  content: { flex: 1, paddingHorizontal: PAGE.marginH, paddingTop: 40 },

  sectionTag: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 2.5, color: C.parchmentFaint, textTransform: 'uppercase', marginBottom: 8,
  },
  heading: {
    fontFamily: F.display, fontSize: 22, fontWeight: 400, color: C.base, lineHeight: 1.15, marginBottom: 8,
  },
  subheading: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.parchmentFaint,
    lineHeight: 1.5, marginBottom: 18, maxWidth: 440,
  },
  headingRule: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 20 },

  body: { flexDirection: 'row', gap: 24 },
  diagramCol: { width: 232 },
  legendCol: { flex: 1, paddingTop: 4 },

  keyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  keyItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  keySwatch: { width: 8, height: 8 },
  keyText: { fontFamily: F.sans, fontSize: 6.5, color: C.base, opacity: 0.55 },

  legendLabel: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 700, letterSpacing: 1.4,
    color: C.amberDim, textTransform: 'uppercase', marginBottom: 6, marginTop: 14,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pillDefined: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500, color: '#FFFFFF',
    backgroundColor: C.amber, paddingVertical: 4, paddingHorizontal: 9, borderRadius: 2,
  },
  pillOpen: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 400, color: C.base, opacity: 0.55,
    borderWidth: 0.5, borderColor: C.base, paddingVertical: 3.5, paddingHorizontal: 9, borderRadius: 2,
  },
  emptyNote: { fontFamily: F.sans, fontSize: 8.5, fontWeight: 300, color: C.base, opacity: 0.55 },

  bridgeGateRow: { marginBottom: 7 },
  bridgeGateText: { fontFamily: F.sans, fontSize: 8.5, fontWeight: 500, color: C.base, lineHeight: 1.4 },
  bridgeGateSub: { fontFamily: F.sans, fontSize: 7.5, fontWeight: 300, color: C.base, opacity: 0.6, lineHeight: 1.4 },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: PAGE.marginH, paddingBottom: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: { fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2, color: C.parchmentFaint, textTransform: 'uppercase' },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

// ─── BODYGRAPH GEOMETRY — classic schematic layout, fixed regardless of chart ─

const VB_W = 240;
const VB_H = 432;

type Shape = 'tri-up' | 'tri-down' | 'tri-left' | 'tri-right' | 'rect' | 'diamond';

interface CenterGeo {
  cx: number; cy: number; shape: Shape; hw: number; hh: number;
  labelDx: number; labelDy: number; anchor: 'start' | 'middle' | 'end';
}

// Classic relative bodygraph positions: Head/Ajna/Throat/G/Sacral/Root run
// down the spine; Heart sits to the upper right of G Center; Spleen (left)
// and Solar Plexus (right) flank the Sacral at the same height. Every label
// is placed to stay inside the 0–240 viewBox at its own anchor — Head and
// Ajna read to the side rather than above/below (no room above Head's apex
// at the top of the canvas), and Heart/Spleen/Solar Plexus read above or
// below rather than further out to the side (there's no margin left before
// the canvas edge on either flank).
const CENTER_GEO: Record<string, CenterGeo> = {
  head:         { cx: 120, cy: 56,  shape: 'tri-up',   hw: 26, hh: 24, labelDx: 34, labelDy: 4,   anchor: 'start'  },
  ajna:         { cx: 120, cy: 112, shape: 'tri-down', hw: 26, hh: 24, labelDx: 34, labelDy: 4,   anchor: 'start'  },
  throat:       { cx: 120, cy: 170, shape: 'rect',     hw: 32, hh: 20, labelDx: 40, labelDy: 4,   anchor: 'start'  },
  g_center:     { cx: 120, cy: 242, shape: 'diamond',  hw: 34, hh: 34, labelDx: -42,labelDy: 4,   anchor: 'end'    },
  heart:        { cx: 196, cy: 252, shape: 'tri-left', hw: 22, hh: 20, labelDx: 0,  labelDy: -30, anchor: 'middle' },
  spleen:       { cx: 46,  cy: 312, shape: 'tri-right',hw: 26, hh: 30, labelDx: 0,  labelDy: 44,  anchor: 'middle' },
  sacral:       { cx: 120, cy: 312, shape: 'rect',     hw: 28, hh: 24, labelDx: 0,  labelDy: 44,  anchor: 'middle' },
  solar_plexus: { cx: 196, cy: 312, shape: 'tri-left', hw: 26, hh: 30, labelDx: 0,  labelDy: 44,  anchor: 'middle' },
  root:         { cx: 120, cy: 386, shape: 'rect',     hw: 28, hh: 20, labelDx: 0,  labelDy: 36,  anchor: 'middle' },
};

function shapePoints(geo: CenterGeo): string | null {
  const { cx, cy, hw, hh, shape } = geo;
  switch (shape) {
    case 'tri-up':    return `${cx},${cy - hh} ${cx - hw},${cy + hh} ${cx + hw},${cy + hh}`;
    case 'tri-down':  return `${cx},${cy + hh} ${cx - hw},${cy - hh} ${cx + hw},${cy - hh}`;
    case 'tri-left':  return `${cx - hw},${cy} ${cx + hw},${cy - hh} ${cx + hw},${cy + hh}`;
    case 'tri-right': return `${cx + hw},${cy} ${cx - hw},${cy - hh} ${cx - hw},${cy + hh}`;
    case 'diamond':   return `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`;
    default:          return null; // 'rect' is drawn with <Rect>, not a polygon
  }
}

// Every unique Center-pair connected by at least one of the 36 canonical
// channels, computed once from CHANNELS + GATE_KEYNOTES — the identical
// source calculateSplitBridges() reads in tokens.ts — so this can't drift
// out of sync with the real channel table.
interface CenterPairGeo {
  centers: [string, string];
  channels: { gates: [number, number]; name: string }[];
}
const CENTER_PAIRS: CenterPairGeo[] = (() => {
  const map = new Map<string, CenterPairGeo>();
  for (const ch of CHANNELS) {
    const [a, b] = ch.gates;
    const ca = GATE_KEYNOTES[a]?.center;
    const cb = GATE_KEYNOTES[b]?.center;
    if (!ca || !cb || ca === cb) continue;
    const key = [ca, cb].sort().join('|');
    if (!map.has(key)) map.set(key, { centers: [ca, cb] as [string, string], channels: [] });
    map.get(key)!.channels.push({ gates: [a, b], name: ch.name });
  }
  return [...map.values()];
})();

const gateKey = (gates: number[]) => [...gates].sort((x, y) => x - y).join('-');

interface Props {
  data: Pick<ReportData, 'hdDefinedCenters' | 'hdChannels' | 'hdActiveGates'>;
}

export default function Page02Bodygraph({ data }: Props) {
  const definedSet = new Set(data.hdDefinedCenters);
  const openCenters = ALL_CENTERS.filter(c => !definedSet.has(c));
  const activeGateKeys = new Set(data.hdChannels.map(ch => gateKey(ch.gates)));

  const result = calculateDefinition(data.hdDefinedCenters, data.hdChannels);
  const bridges = result.groups.length > 1
    ? calculateSplitBridges(result.groups, data.hdActiveGates)
    : [];
  // Dedupe by partnerGate — one physical open gate can hang off more than
  // one channel at once (e.g. Gate 57 completing both 57-20 and 57-34),
  // same rule Page03Bridges applies before rendering its own detail.
  const hangingGates = Array.from(
    new Map(
      bridges
        .filter(b => b.classification === 'narrow')
        .flatMap(b => b.hangingGates)
        .map(hg => [hg.partnerGate, hg] as const)
    ).values()
  );

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.amberLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Advanced Sovereign Report · The Vehicle</Text>
        <Text style={S.heading}>Your Bodygraph</Text>
        <Text style={S.subheading}>
          The same Definition you just read, drawn as the machine it actually describes — filled
          Centers run consistently, open Centers are where you take in and amplify what&rsquo;s
          around you, and the lines between them are the specific gates doing the connecting.
        </Text>
        <View style={S.headingRule} />

        <View style={S.body}>
          <View style={S.diagramCol}>
            <Svg viewBox={`0 0 ${VB_W} ${VB_H}`} width={232} height={Math.round(232 * (VB_H / VB_W))}>
              {/* Channel slots — drawn first so Center shapes sit cleanly on top of the ends */}
              {CENTER_PAIRS.map((pair, i) => {
                const a = CENTER_GEO[pair.centers[0]];
                const b = CENTER_GEO[pair.centers[1]];
                if (!a || !b) return null;
                const isActive = pair.channels.some(c => activeGateKeys.has(gateKey(c.gates)));
                return (
                  <Line
                    key={`pair-${i}`}
                    x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy}
                    stroke={isActive ? C.amber : C.base}
                    strokeWidth={isActive ? 2.5 : 0.75}
                    strokeOpacity={isActive ? 1 : 0.16}
                    strokeDasharray={isActive ? undefined : '2,3'}
                  />
                );
              })}

              {/* Hanging-gate stubs — a live reach toward the still-open partner Center.
                  The circle + gate number are nudged a few points perpendicular to the
                  stub (alternating side by index) so that when two hanging gates share
                  the same Center pair — or one lands on a straight run toward a Center
                  whose own label sits further along that same line — the markers don't
                  stack on top of each other or on a Center's name. The stub line itself
                  stays exactly on the true Center-to-Center path. */}
              {hangingGates.map((hg, i) => {
                const from = CENTER_GEO[hg.center];
                const to = CENTER_GEO[hg.partnerCenter];
                if (!from || !to) return null;
                const t = 0.46; // stops shy of halfway — a reach, not a completed channel
                const midX = from.cx + (to.cx - from.cx) * t;
                const midY = from.cy + (to.cy - from.cy) * t;
                const dx = to.cx - from.cx, dy = to.cy - from.cy;
                const len = Math.hypot(dx, dy) || 1;
                const px = -dy / len, py = dx / len; // unit vector perpendicular to the stub
                const side = i % 2 === 0 ? 1 : -1;
                const offset = 10 * side;
                const markX = midX + px * offset;
                const markY = midY + py * offset;
                return (
                  <G key={`hang-${hg.partnerGate}`}>
                    <Line
                      x1={from.cx} y1={from.cy} x2={midX} y2={midY}
                      stroke={C.amberDim} strokeWidth={1.75} strokeDasharray="1,2.5" strokeOpacity={0.9}
                    />
                    <Circle cx={markX} cy={markY} r={3} fill={C.amberLight} stroke={C.amberDim} strokeWidth={1} />
                    <Text
                      x={markX} y={markY - 6}
                      {...({ fontSize: 7, fontFamily: F.sans, fill: C.amberDim, textAnchor: 'middle' } as any)}
                    >
                      {hg.partnerGate}
                    </Text>
                  </G>
                );
              })}

              {/* Centers — filled amber when defined, hollow parchment when open */}
              {Object.entries(CENTER_GEO).map(([center, geo]) => {
                const isDefined = definedSet.has(center);
                const shared = {
                  fill: isDefined ? C.amber : '#F5F5F3',
                  stroke: isDefined ? C.amberDim : C.base,
                  strokeWidth: 1.25,
                  strokeOpacity: isDefined ? 1 : 0.3,
                };
                return (
                  <G key={center}>
                    {geo.shape === 'rect' ? (
                      <Rect x={geo.cx - geo.hw} y={geo.cy - geo.hh} width={geo.hw * 2} height={geo.hh * 2} {...shared} />
                    ) : (
                      <Polygon points={shapePoints(geo)!} {...shared} />
                    )}
                    <Text
                      x={geo.cx + geo.labelDx} y={geo.cy + geo.labelDy}
                      {...({ fontSize: 7, fontFamily: F.sans, fill: C.base, fillOpacity: 0.7, textAnchor: geo.anchor } as any)}
                    >
                      {CENTER_DISPLAY_NAME[center] ?? center}
                    </Text>
                  </G>
                );
              })}
            </Svg>

            <View style={S.keyRow}>
              <View style={S.keyItem}>
                <View style={[S.keySwatch, { backgroundColor: C.amber }]} />
                <Text style={S.keyText}>Defined</Text>
              </View>
              <View style={S.keyItem}>
                <View style={[S.keySwatch, { borderWidth: 0.75, borderColor: C.base, opacity: 0.4 }]} />
                <Text style={S.keyText}>Open</Text>
              </View>
              {hangingGates.length > 0 && (
                <View style={S.keyItem}>
                  <View style={[S.keySwatch, { backgroundColor: C.amberDim }]} />
                  <Text style={S.keyText}>Hanging Gate</Text>
                </View>
              )}
            </View>
          </View>

          <View style={S.legendCol}>
            <Text style={S.legendLabel}>Defined Centers</Text>
            <View style={S.pillRow}>
              {data.hdDefinedCenters.length > 0 ? (
                data.hdDefinedCenters.map(c => (
                  <Text key={c} style={S.pillDefined}>{CENTER_DISPLAY_NAME[c] ?? c}</Text>
                ))
              ) : (
                <Text style={S.emptyNote}>None — a Reflector configuration.</Text>
              )}
            </View>

            <Text style={S.legendLabel}>Open Centers</Text>
            <View style={S.pillRow}>
              {openCenters.map(c => (
                <Text key={c} style={S.pillOpen}>{CENTER_DISPLAY_NAME[c] ?? c}</Text>
              ))}
            </View>

            {hangingGates.length > 0 && (
              <>
                <Text style={S.legendLabel}>Your Hanging Gates</Text>
                {hangingGates.map(hg => (
                  <View key={hg.partnerGate} style={S.bridgeGateRow}>
                    <Text style={S.bridgeGateText}>Gate {hg.partnerGate}</Text>
                    <Text style={S.bridgeGateSub}>
                      Reaches toward {CENTER_DISPLAY_NAME[hg.partnerCenter] ?? hg.partnerCenter} — see &ldquo;Where You Need a Bridge&rdquo;.
                    </Text>
                  </View>
                ))}
              </>
            )}
          </View>
        </View>
      </View>

      <View style={S.footer} fixed>
        <Text style={S.footerText}>T3D Advanced Sovereign Report</Text>
        <Text style={S.pageNum} render={({ pageNumber }) => pageNumber} />
      </View>
    </Page>
  );
}
