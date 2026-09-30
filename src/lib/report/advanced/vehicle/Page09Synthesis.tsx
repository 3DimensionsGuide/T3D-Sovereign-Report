/**
 * Advanced Sovereign Report — Vehicle Section — Your Vehicle, Synthesized
 *
 * Closing page of the Vehicle section (after Definition, Bridges, Circuitry,
 * Incarnation Cross, Godhead, Light & Shadow, and Variables). Unlike every
 * other page in this section, the paragraph here is NOT templated content —
 * it's generated per reader by vehicleSynthesisEngine.ts (schema/
 * vehicleSynthesisEngine.ts), which calls the Claude API to find the one
 * throughline connecting all eight pages' findings, validated against the
 * same language guide-rails as the rest of the report.
 *
 * The synthesis text and its source ('api' | 'fallback') must be generated
 * server-side BEFORE this component renders (same pattern as the basic
 * report's PageSynthesis.tsx / sovereignReportGenerator.ts) — this component
 * only displays the result, it never calls the API itself.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../../shared/PageComponents';
import { C, F, PAGE } from '../../tokens';
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
    lineHeight: 1.5, marginBottom: 20, maxWidth: 440,
  },
  headingRule: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 24 },

  synthesisContainer: {
    padding: 20,
    borderLeftWidth: 3, borderLeftStyle: 'solid', borderLeftColor: C.amber,
    backgroundColor: '#F5F3EE',
    marginBottom: 16,
  },
  synthesisText: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.base, lineHeight: 1.65,
  },

  sourceNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 24 },
  sourceIcon: {
    width: 12, height: 12, borderRadius: 6,
    borderWidth: 0.5, borderColor: C.parchmentFaint, borderStyle: 'solid',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 1,
  },
  sourceIconText: { fontFamily: F.sans, fontSize: 6, color: C.parchmentFaint },
  sourceText: {
    flex: 1, fontFamily: F.sans, fontSize: 8, fontWeight: 300,
    color: C.parchmentFaint, lineHeight: 1.5, fontStyle: 'italic',
  },

  configRef: {
    paddingTop: 14, borderTopWidth: 0.5, borderTopColor: C.base,
    flexDirection: 'row', gap: 28,
  },
  configItem: { gap: 3 },
  configKey: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 500, letterSpacing: 1.5,
    textTransform: 'uppercase', color: C.parchmentFaint,
  },
  configVal: { fontFamily: F.sans, fontSize: 9.5, fontWeight: 400, color: C.base },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: PAGE.marginH, paddingBottom: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: { fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2, color: C.parchmentFaint, textTransform: 'uppercase' },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

interface Props {
  data: Pick<ReportData, 'hdType' | 'hdAuthority' | 'hdProfile' | 'hdIncarnationCross'> & {
    vehicleSynthesis: string;
    vehicleSynthesisSource?: 'api' | 'fallback';
  };
}

export default function Page09Synthesis({ data }: Props) {
  const isApiGenerated = data.vehicleSynthesisSource !== 'fallback';

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.amberLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Advanced Sovereign Report · The Vehicle</Text>
        <Text style={S.heading}>Your Vehicle, Synthesized</Text>
        <Text style={S.subheading}>
          Eight pages, one throughline — written specifically for this configuration, not
          pulled from a template.
        </Text>
        <View style={S.headingRule} />

        <View style={S.synthesisContainer}>
          <Text style={S.synthesisText}>{data.vehicleSynthesis}</Text>
        </View>

        <View style={S.sourceNote}>
          <View style={S.sourceIcon}>
            <Text style={S.sourceIconText}>{isApiGenerated ? '✓' : '·'}</Text>
          </View>
          <Text style={S.sourceText}>
            {isApiGenerated
              ? 'This synthesis was generated for this specific configuration. It will differ for every reader.'
              : 'This synthesis is based on your configuration pattern. A fully personalized version is generated when the live connection is available.'}
          </Text>
        </View>

        <View style={S.configRef}>
          <View style={S.configItem}>
            <Text style={S.configKey}>Type · Authority</Text>
            <Text style={S.configVal}>{data.hdType} · {data.hdAuthority}</Text>
          </View>
          <View style={S.configItem}>
            <Text style={S.configKey}>Profile</Text>
            <Text style={S.configVal}>{data.hdProfile}</Text>
          </View>
          <View style={S.configItem}>
            <Text style={S.configKey}>Incarnation Cross</Text>
            <Text style={S.configVal}>{data.hdIncarnationCross}</Text>
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
