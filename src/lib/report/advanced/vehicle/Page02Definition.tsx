/**
 * Advanced Sovereign Report — Vehicle Section — Your Definition
 *
 * First "architecture" page. Shows how the reader's defined Centers group
 * into one or more connected circuits (Single / Split / Triple Split /
 * Quadruple Split / No Definition), via calculateDefinition() in tokens.ts.
 *
 * Layout intent: a split shows up as a genuine gap between two visual
 * clusters, not a bullet point — the shape of the data IS the diagram here,
 * so no separate illustration is needed, just honest spacing.
 *
 * Deliberately scoped to fit on one page: the specific bridge-gate detail
 * (narrow vs wide split, per group pair) has its own page — Page03Bridges —
 * so this page never has to guess at where react-pdf's automatic reflow
 * will land the footer.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../../shared/PageComponents';
import { C, F, PAGE, calculateDefinition, DEFINITION_MEANING } from '../../tokens';
import { CENTER_DISPLAY_NAME } from '../../section3/hd-content';
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
    lineHeight: 1.5, marginBottom: 20, maxWidth: 400,
  },
  headingRule: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 24 },

  // Type badge block
  typeBlock: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 6 },
  typeLabel: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500, letterSpacing: 1.8,
    color: C.parchmentFaint, textTransform: 'uppercase',
  },
  typeName: {
    fontFamily: F.display, fontSize: 26, fontWeight: 700, color: C.amber, lineHeight: 1.1,
  },
  circuitCountNote: {
    fontFamily: F.sans, fontSize: 9.5, fontWeight: 300, color: C.base, opacity: 0.55,
    marginBottom: 28,
  },

  // Diagram: one row per circuit group, groups separated by a bridge gap
  diagram: { flexDirection: 'column', gap: 0, marginBottom: 32 },
  groupRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  centerPill: {
    paddingVertical: 7, paddingHorizontal: 13,
    backgroundColor: C.amberLight, borderWidth: 0.75, borderColor: C.amber, borderStyle: 'solid',
    borderRadius: 3,
  },
  centerPillText: {
    fontFamily: F.sans, fontSize: 9, fontWeight: 500, color: C.amberDim, letterSpacing: 0.3,
  },
  bridgeGap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginVertical: 14, paddingLeft: 4,
  },
  bridgeDots: {
    width: 90, height: 0, borderTopWidth: 1, borderTopColor: C.base,
    borderStyle: 'dashed', opacity: 0.3,
  },
  bridgeLabel: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 500, letterSpacing: 1.4,
    color: C.parchmentFaint, textTransform: 'uppercase',
  },

  // Meaning block
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
  data: Pick<ReportData, 'hdDefinedCenters' | 'hdChannels'>;
}

export default function Page02Definition({ data }: Props) {
  const result = calculateDefinition(data.hdDefinedCenters, data.hdChannels);
  const meaning = DEFINITION_MEANING[result.type]
    ?? 'Your defined Centers form a configuration unique to you — the specific pattern of what runs consistently versus what depends on connection.';

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.amberLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Advanced Sovereign Report · The Vehicle</Text>
        <Text style={S.heading}>Your Definition</Text>
        <Text style={S.subheading}>
          Definition describes how your defined Centers connect to one another — whether your
          energy runs as one continuous circuit, or as separate circuits that need something
          (or someone) else to bridge them.
        </Text>
        <View style={S.headingRule} />

        <View style={S.typeBlock}>
          <Text style={S.typeLabel}>Your Definition</Text>
          <Text style={S.typeName}>{result.type}</Text>
        </View>
        <Text style={S.circuitCountNote}>
          {result.circuitCount === 0
            ? 'No defined Centers — a Reflector configuration.'
            : `${result.circuitCount} connected ${result.circuitCount === 1 ? 'circuit' : 'circuits'} across ${data.hdDefinedCenters.length} defined ${data.hdDefinedCenters.length === 1 ? 'Center' : 'Centers'}.`}
        </Text>

        <View style={S.diagram}>
          {result.groups.map((group, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <View style={S.bridgeGap}>
                  <View style={S.bridgeDots} />
                  <Text style={S.bridgeLabel}>Bridge Required</Text>
                  <View style={S.bridgeDots} />
                </View>
              )}
              <View style={S.groupRow}>
                {group.map(center => (
                  <View key={center} style={S.centerPill}>
                    <Text style={S.centerPillText}>{CENTER_DISPLAY_NAME[center] ?? center}</Text>
                  </View>
                ))}
              </View>
            </React.Fragment>
          ))}
        </View>

        <View style={S.meaningBlock}>
          <Text style={S.meaningText}>{meaning}</Text>
        </View>
      </View>

      <View style={S.footer} fixed>
        <Text style={S.footerText}>T3D Advanced Sovereign Report</Text>
        <Text style={S.pageNum} render={({ pageNumber }) => pageNumber} />
      </View>
    </Page>
  );
}
