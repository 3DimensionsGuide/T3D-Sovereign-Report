/**
 * Advanced Sovereign Report — Vehicle Section — Your Circuitry
 *
 * Third "architecture" page (after Definition and Bridges). Where Definition
 * showed HOW your Centers connect, Circuitry shows WHAT KIND of energy runs
 * through those connections — tallying the reader's active channels against
 * the 36-channel Individual / Collective / Tribal / Integration table
 * (section3/gate-content.ts) via calculateCircuitBalance() in tokens.ts.
 *
 * Layout intent: a single proportional bar across all four groups (matching
 * the T3D house-style of using the data's own shape as the diagram, as on
 * Page02Definition) plus one meaning passage for whichever group actually
 * dominates. Deliberately scoped to one page — no bridge-style detail table
 * is needed here, so there's no overflow risk to design around.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../../shared/PageComponents';
import { C, F, PAGE, calculateCircuitBalance } from '../../tokens';
import { CIRCUIT_GROUP_MEANING, type CircuitGroup } from '../../section3/gate-content';
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

  // Dominant badge block (matches Page02Definition's typeBlock)
  typeBlock: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 6 },
  typeLabel: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500, letterSpacing: 1.8,
    color: C.parchmentFaint, textTransform: 'uppercase',
  },
  typeName: {
    fontFamily: F.display, fontSize: 26, fontWeight: 700, color: C.amber, lineHeight: 1.1,
  },
  countNote: {
    fontFamily: F.sans, fontSize: 9.5, fontWeight: 300, color: C.base, opacity: 0.55,
    marginBottom: 22,
  },

  // Proportion bar: one row, one segment per group present, widths proportional to count
  barWrap: { marginBottom: 24 },
  bar: {
    flexDirection: 'row', width: PAGE.contentWidth, height: 26,
    borderRadius: 3, overflow: 'hidden',
  },
  barSegment: {
    justifyContent: 'center', alignItems: 'center',
    borderRightWidth: 1, borderRightColor: '#F5F5F3', borderRightStyle: 'solid',
  },
  barSegmentText: { fontFamily: F.sans, fontSize: 8, fontWeight: 700, letterSpacing: 0.3 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontFamily: F.sans, fontSize: 8.5, fontWeight: 400, color: C.base, opacity: 0.65 },

  // Meaning block (matches Page02Definition)
  meaningBlock: {
    padding: 18, backgroundColor: '#F5F3EE',
    borderLeftWidth: 2, borderLeftColor: C.amber, borderLeftStyle: 'solid',
  },
  meaningText: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.base, lineHeight: 1.55, opacity: 0.9,
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
  data: Pick<ReportData, 'hdChannels'>;
}

// Fixed left-to-right group order for the bar and legend, regardless of counts.
const GROUP_ORDER: (CircuitGroup | 'Integration')[] = ['Individual', 'Collective', 'Tribal', 'Integration'];

const GROUP_COLOR: Record<CircuitGroup | 'Integration', string> = {
  Individual: C.amber,
  Collective: '#1F8A4D',
  Tribal: '#C83E3E',
  Integration: '#8A8A8F',
};

export default function Page04Circuitry({ data }: Props) {
  const result = calculateCircuitBalance(data.hdChannels);
  const meaning = CIRCUIT_GROUP_MEANING[result.dominant]
    ?? CIRCUIT_GROUP_MEANING.None;

  const total =
    result.counts.Individual + result.counts.Collective +
    result.counts.Tribal + result.counts.Integration;

  const dominantLabel =
    result.dominant === 'None' ? 'No Active Circuitry'
      : result.dominant === 'Even' ? 'Even Spread'
      : result.dominant;

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.amberLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Advanced Sovereign Report · The Vehicle</Text>
        <Text style={S.heading}>Your Circuitry</Text>
        <Text style={S.subheading}>
          Definition showed how your Centers connect. Circuitry shows what kind of energy moves
          through those connections — whether your design is built to mutate (Individual), share
          (Collective), support (Tribal), or simply survive in the immediate now (Integration).
        </Text>
        <View style={S.headingRule} />

        <View style={S.typeBlock}>
          <Text style={S.typeLabel}>Your Dominant Circuitry</Text>
          <Text style={S.typeName}>{dominantLabel}</Text>
        </View>
        <Text style={S.countNote}>
          {total === 0
            ? 'No active channels run any of the three Circuit Groups.'
            : `${total} active ${total === 1 ? 'channel' : 'channels'} across your design, classified below by circuit.`}
        </Text>

        {total > 0 && (
          <View style={S.barWrap}>
            <View style={S.bar}>
              {GROUP_ORDER.filter(g => result.counts[g] > 0).map(g => (
                <View
                  key={g}
                  style={[
                    S.barSegment,
                    { flexGrow: result.counts[g], backgroundColor: GROUP_COLOR[g] },
                  ]}
                >
                  <Text style={[S.barSegmentText, { color: g === 'Integration' ? '#FFFFFF' : '#FFFFFF' }]}>
                    {result.counts[g]}
                  </Text>
                </View>
              ))}
            </View>
            <View style={S.legend}>
              {GROUP_ORDER.map(g => (
                <View key={g} style={S.legendItem}>
                  <View style={[S.legendDot, { backgroundColor: GROUP_COLOR[g] }]} />
                  <Text style={S.legendText}>{g} · {result.counts[g]}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={S.meaningBlock}>
          <Text style={S.meaningText}>{meaning.passage}</Text>
        </View>
      </View>

      <View style={S.footer} fixed>
        <Text style={S.footerText}>T3D Advanced Sovereign Report</Text>
        <Text style={S.pageNum} render={({ pageNumber }) => pageNumber} />
      </View>
    </Page>
  );
}
