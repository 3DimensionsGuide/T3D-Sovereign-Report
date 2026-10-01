/**
 * Advanced Sovereign Report — Section IV — Now, Drive: Synthesized
 *
 * Closing page of the entire Advanced Sovereign Report. Unlike the other
 * four Integration pages (Stack, Hierarchy, Mistakes — all fixed doctrine
 * copy), this page's paragraph is generated per reader by
 * integrationSynthesisEngine.ts, which calls the Claude API to show how
 * this specific reader's Vehicle, Road, and Stoplight configuration
 * resolves into one decision hierarchy, validated against the same
 * language guide-rails as the rest of the report.
 *
 * The synthesis text and its source ('api' | 'fallback') must be generated
 * server-side BEFORE this component renders — same pattern as every other
 * per-section Synthesis page in this report — this component only
 * displays the result, it never calls the API itself.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../../shared/PageComponents';
import { C, F, PAGE } from '../../tokens';

const S = StyleSheet.create({
  page: { paddingTop: 0, paddingLeft: 0, paddingRight: 0, paddingBottom: PAGE.marginV, backgroundColor: '#F5F5F3', fontFamily: F.sans }, // QA fix: explicit edges, no padding shorthand (see Page05Transits.tsx)
  triLine: { width: PAGE.width, height: 1.5, flexDirection: 'row' },
  triLineSeg: { flex: 1, height: 1.5 },
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
    borderLeftWidth: 3, borderLeftStyle: 'solid', borderLeftColor: C.base,
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
    flexDirection: 'row', gap: 24,
  },
  configItem: { gap: 3 },
  configDot: { width: 6, height: 6, borderRadius: 3, marginBottom: 2 },
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

export interface Page05SynthesisData {
  hdType: string;
  hdAuthority: string;
  lifePathDisplay: string;
  sunSign: string;
  integrationSynthesis: string;
  integrationSynthesisSource?: 'api' | 'fallback';
}

interface Props {
  data: Page05SynthesisData;
}

export default function Page05Synthesis({ data }: Props) {
  const isApiGenerated = data.integrationSynthesisSource !== 'fallback';

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.triLine}>
        <View style={[S.triLineSeg, { backgroundColor: C.amber }]} />
        <View style={[S.triLineSeg, { backgroundColor: C.emerald }]} />
        <View style={[S.triLineSeg, { backgroundColor: C.crimson }]} />
      </View>
      <View style={S.content}>
        <Text style={S.sectionTag}>Advanced Sovereign Report · The Integration</Text>
        <Text style={S.heading}>Now, Drive</Text>
        <Text style={S.subheading}>
          Your Vehicle, your Road, and your Stoplight — read as one instrument, written
          specifically for this configuration, not pulled from a template.
        </Text>
        <View style={S.headingRule} />

        <View style={S.synthesisContainer}>
          <Text style={S.synthesisText}>{data.integrationSynthesis}</Text>
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
            <View style={[S.configDot, { backgroundColor: C.amber }]} />
            <Text style={S.configKey}>Vehicle</Text>
            <Text style={S.configVal}>{`${data.hdType} · ${data.hdAuthority}`}</Text>
          </View>
          <View style={S.configItem}>
            <View style={[S.configDot, { backgroundColor: C.emerald }]} />
            <Text style={S.configKey}>Road</Text>
            <Text style={S.configVal}>{`Life Path ${data.lifePathDisplay}`}</Text>
          </View>
          <View style={S.configItem}>
            <View style={[S.configDot, { backgroundColor: C.crimson }]} />
            <Text style={S.configKey}>Stoplight</Text>
            <Text style={S.configVal}>{`${data.sunSign} Sun`}</Text>
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
