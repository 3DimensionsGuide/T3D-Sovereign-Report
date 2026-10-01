/**
 * Advanced Sovereign Report — Road Section — Your Road, Synthesized
 *
 * Closing page of the Road section (after Destiny/Expression, Soul Urge &
 * Personality, Hidden Passion, Karmic Lessons, Pinnacles, and Challenges).
 * Unlike every other page in this section, the paragraph here is NOT
 * templated content — it's generated per reader by roadSynthesisEngine.ts
 * (schema/roadSynthesisEngine.ts), which calls the Claude API to find the
 * one throughline connecting all seven pages' findings, validated against
 * the same language guide-rails as the rest of the report.
 *
 * The synthesis text and its source ('api' | 'fallback') must be generated
 * server-side BEFORE this component renders (same pattern as the Vehicle
 * section's Page09Synthesis.tsx / vehicleSynthesisEngine.ts) — this
 * component only displays the result, it never calls the API itself.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../../shared/PageComponents';
import { C, F, PAGE } from '../../tokens';
import type { ReportData } from '../../tokens';

const S = StyleSheet.create({
  page: { paddingTop: 0, paddingLeft: 0, paddingRight: 0, paddingBottom: PAGE.marginV, backgroundColor: '#F5F5F3', fontFamily: F.sans }, // QA fix: explicit edges, no padding shorthand (see Page05Transits.tsx)
  emeraldLine: { width: PAGE.width, height: 1.5, backgroundColor: C.emerald },
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
    borderLeftWidth: 3, borderLeftStyle: 'solid', borderLeftColor: C.emerald,
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
    flexDirection: 'row', flexWrap: 'wrap', gap: 22,
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
  data: Pick<ReportData, 'lifePathDisplay' | 'destiny' | 'soulUrge' | 'personality' | 'hiddenPassion' | 'karmicLessons' | 'currentPinnacleIndex' | 'pinnacles'> & {
    roadSynthesis: string;
    roadSynthesisSource?: 'api' | 'fallback';
  };
}

export default function Page08Synthesis({ data }: Props) {
  const isApiGenerated = data.roadSynthesisSource !== 'fallback';
  const currentPinnacle = data.pinnacles[data.currentPinnacleIndex];
  const karmicLabel = data.karmicLessons.length > 0 ? data.karmicLessons.join(', ') : 'None';

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.emeraldLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Advanced Sovereign Report · The Road</Text>
        <Text style={S.heading}>Your Road, Synthesized</Text>
        <Text style={S.subheading}>
          Seven pages, one throughline — written specifically for this configuration, not
          pulled from a template.
        </Text>
        <View style={S.headingRule} />

        <View style={S.synthesisContainer}>
          <Text style={S.synthesisText}>{data.roadSynthesis}</Text>
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
            <Text style={S.configKey}>Life Path</Text>
            <Text style={S.configVal}>{data.lifePathDisplay}</Text>
          </View>
          <View style={S.configItem}>
            <Text style={S.configKey}>Destiny · Soul Urge · Personality</Text>
            <Text style={S.configVal}>{data.destiny} · {data.soulUrge} · {data.personality}</Text>
          </View>
          <View style={S.configItem}>
            <Text style={S.configKey}>Hidden Passion</Text>
            <Text style={S.configVal}>{data.hiddenPassion}</Text>
          </View>
          <View style={S.configItem}>
            <Text style={S.configKey}>Karmic Lessons</Text>
            <Text style={S.configVal}>{karmicLabel}</Text>
          </View>
          <View style={S.configItem}>
            <Text style={S.configKey}>Current Phase</Text>
            <Text style={S.configVal}>Pinnacle {currentPinnacle?.number ?? '—'}</Text>
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
