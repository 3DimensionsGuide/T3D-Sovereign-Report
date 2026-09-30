/**
 * Advanced Sovereign Report — Vehicle Section — Where You Need a Bridge
 *
 * Dedicated page for the Split/Triple Split/Quadruple Split bridge-gate
 * detail — split out from Page02Definition so neither page has to rely on
 * react-pdf's automatic reflow to land the footer somewhere legible.
 *
 * Only meaningful for charts with more than one Definition group. Use
 * hasBridgePage(data) to decide whether to include this page at all when
 * assembling the full document — a Single Definition or Reflector chart has
 * nothing to bridge, and this page should be omitted entirely rather than
 * rendered empty.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../../shared/PageComponents';
import { C, F, PAGE, calculateDefinition, calculateSplitBridges } from '../../tokens';
import { CENTER_DISPLAY_NAME } from '../../section3/hd-content';
import { GATE_KEYNOTES } from '../../section3/gate-content';
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
    lineHeight: 1.5, marginBottom: 20, maxWidth: 420,
  },
  headingRule: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 24 },

  bridgeDetail: { flexDirection: 'column', gap: 16 },
  bridgeCard: {
    padding: 18, backgroundColor: '#FFFFFF',
    borderWidth: 0.75, borderColor: C.base, borderStyle: 'solid', borderRadius: 3,
  },
  bridgeCardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10,
  },
  bridgeCardTag: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 700, letterSpacing: 1.2,
    color: '#FFFFFF', backgroundColor: C.amber, textTransform: 'uppercase',
    paddingVertical: 3, paddingHorizontal: 8, borderRadius: 2,
  },
  bridgeCardTitle: {
    fontFamily: F.display, fontSize: 13, fontWeight: 400, fontStyle: 'italic', color: C.base,
  },
  bridgeCardBody: {
    fontFamily: F.sans, fontSize: 10, fontWeight: 300, color: C.base, lineHeight: 1.55, opacity: 0.88,
  },
  hangingGateRow: {
    marginTop: 10, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: C.base, borderTopStyle: 'solid',
  },
  hangingGateLabel: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 700, letterSpacing: 1, color: C.amberDim, textTransform: 'uppercase',
  },
  hangingGateText: {
    fontFamily: F.sans, fontSize: 10, fontWeight: 400, color: C.base, lineHeight: 1.5, marginTop: 4,
  },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: PAGE.marginH, paddingBottom: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: { fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2, color: C.parchmentFaint, textTransform: 'uppercase' },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

interface Props {
  data: Pick<ReportData, 'hdDefinedCenters' | 'hdChannels' | 'hdActiveGates'>;
}

/** Whether this page has anything to show — Single Definition and Reflector charts don't. */
export function hasBridgePage(data: Props['data']): boolean {
  const result = calculateDefinition(data.hdDefinedCenters, data.hdChannels);
  return result.groups.length > 1;
}

export default function Page03Bridges({ data }: Props) {
  const result = calculateDefinition(data.hdDefinedCenters, data.hdChannels);
  const bridges = calculateSplitBridges(result.groups, data.hdActiveGates);

  const groupLabel = (groupIndex: number) =>
    result.groups[groupIndex]
      .map(c => CENTER_DISPLAY_NAME[c] ?? c)
      .join(' + ');

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.amberLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Advanced Sovereign Report · The Vehicle</Text>
        <Text style={S.heading}>Where You Need a Bridge</Text>
        <Text style={S.subheading}>
          Not every gap is the same. A narrow split means you already hold half of what would
          connect two islands — one specific gate is the difference, and the psychology tends
          to turn inward. A wide split means a whole channel is missing, with no single quality
          of your own that closes it — the psychology tends to turn outward, toward a partner,
          a group, or the world.
        </Text>
        <View style={S.headingRule} />

        <View style={S.bridgeDetail}>
          {bridges.map((bridge, i) => (
            <View key={i} style={S.bridgeCard}>
              <View style={S.bridgeCardHeader}>
                <Text style={S.bridgeCardTag}>
                  {bridge.classification === 'narrow' ? 'Narrow Split' : 'Wide Split'}
                </Text>
                <Text style={S.bridgeCardTitle}>
                  {groupLabel(bridge.groupAIndex)} {'↔'} {groupLabel(bridge.groupBIndex)}
                </Text>
              </View>
              <Text style={S.bridgeCardBody}>
                {bridge.classification === 'narrow'
                  ? "You already carry half of what would connect these two islands — one specific gate is the difference. That tends to turn inward: a quiet sense that you should be able to supply this yourself, and self-blame when you can't."
                  : "An entire channel is missing between these two islands, not just one gate — there's no single quality of your own that closes this gap. That tends to turn outward: toward a partner, a group, or the world to supply what's missing, rather than toward yourself."}
              </Text>
              {bridge.classification === 'narrow' && bridge.hangingGates.length > 0 && (
                <View style={S.hangingGateRow}>
                  <Text style={S.hangingGateLabel}>Your Bridge Gate</Text>
                  {bridge.hangingGates.slice(0, 2).map((hg, hi) => {
                    const partnerKeynote = GATE_KEYNOTES[hg.partnerGate];
                    return (
                      <Text key={hi} style={S.hangingGateText}>
                        Gate {hg.partnerGate}{partnerKeynote ? ` — ${partnerKeynote.ichingName}` : ''}
                        {partnerKeynote ? `: ${partnerKeynote.coreMeaning}` : ''}
                      </Text>
                    );
                  })}
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      <View style={S.footer} fixed>
        <Text style={S.footerText}>T3D Advanced Sovereign Report</Text>
        <Text style={S.pageNum} render={({ pageNumber }) => pageNumber} />
      </View>
    </Page>
  );
}
