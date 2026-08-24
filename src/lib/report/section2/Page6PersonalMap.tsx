/**
 * Page 6 — Your Personal Map
 *
 * Reader need: "How Do The Three Systems Relate In Me?"
 *
 * A single T3D synthesis graphic:
 *   Three connected modules, each with one sentence
 *   Labels: "How you move," "What you are learning through,"
 *           "When and how you meet the world"
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../shared/PageComponents';
import {
  C, F, PAGE,
  hdTypeSynthesis,
  lifePathSynthesis,
  sunSignSynthesis,
} from '../tokens';
import type { ReportData } from '../tokens';

const S = StyleSheet.create({
  page: {
    backgroundColor: '#F5F5F3',
    padding: 0,
    fontFamily: F.sans,
  },
  topRuleRow: {
    flexDirection: 'row',
    width: PAGE.width,
  },
  topRuleAmber:   { flex: 1, height: 1.5, backgroundColor: C.amber },
  topRuleEmerald: { flex: 1, height: 1.5, backgroundColor: C.emerald },
  topRuleCrimson: { flex: 1, height: 1.5, backgroundColor: C.crimson },

  content: {
    flex: 1,
    paddingHorizontal: PAGE.marginH,
    paddingTop: 44,
    paddingBottom: PAGE.marginV,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  sectionTag: {
    fontFamily: F.sans,
    fontSize: 8.5,
    fontWeight: 500,
    letterSpacing: 2.5,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heading: {
    fontFamily: F.display,
    fontSize: 24,
    fontWeight: 400,
    color: C.base,
    lineHeight: 1.15,
    marginBottom: 6,
  },
  subheading: {
    fontFamily: F.sans,
    fontSize: 10.5,
    fontWeight: 300,
    color: C.parchmentFaint,
    marginBottom: 28,
  },
  headingRule: {
    width: PAGE.contentWidth,
    height: 0.5,
    backgroundColor: C.base,
    opacity: 0.1,
    marginBottom: 32,
  },

  // ── The three connected modules ───────────────────────────────────────────
  mapContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
  },

  // Module box
  module: {
    width: PAGE.contentWidth,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },

  // Left side — system info
  moduleLeft: {
    width: 120,
    flexShrink: 0,
    gap: 4,
  },
  moduleKeyword: {
    fontFamily: F.sans,
    fontSize: 8,
    fontWeight: 500,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  moduleSystem: {
    fontFamily: F.sans,
    fontSize: 6,
    fontWeight: 400,
    letterSpacing: 1.2,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  moduleRole: {
    fontFamily: F.display,
    fontSize: 11,
    fontWeight: 400,
    fontStyle: 'italic',
    color: C.base,
    lineHeight: 1.3,
  },

  // Vertical divider between left and right
  moduleDivider: {
    width: 0.5,
    backgroundColor: C.base,
    opacity: 0.12,
    marginTop: 4,
  },

  // Right side — synthesis sentence
  moduleRight: {
    flex: 1,
    paddingLeft: 4,
  },

  // Primary value (HD Type / Life Path / Sun Sign)
  primaryValue: {
    fontFamily: F.display,
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 1.15,
    marginBottom: 8,
  },
  synthesisSentence: {
    fontFamily: F.sans,
    fontSize: 10.5,
    fontWeight: 300,
    color: C.base,
    lineHeight: 1.5,
    opacity: 0.85,
  },

  // ── Connector element between modules ────────────────────────────────────
  connector: {
    width: PAGE.contentWidth,
    alignItems: 'center',
    paddingVertical: 8,
  },
  connectorLine: {
    width: 0.5,
    height: 20,
    backgroundColor: C.base,
    opacity: 0.2,
  },
  connectorDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.base,
    opacity: 0.2,
    marginVertical: 2,
  },
  connectorLabel: {
    fontFamily: F.sans,
    fontSize: 8,
    fontWeight: 400,
    letterSpacing: 1.5,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
  },

  // ── Synthesis note at bottom ─────────────────────────────────────────────
  synthesisNote: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(13,13,14,0.1)',
  },
  synthesisNoteText: {
    fontFamily: F.display,
    fontSize: 11,
    fontWeight: 400,
    fontStyle: 'italic',
    color: C.base,
    lineHeight: 1.55,
    textAlign: 'center',
    opacity: 0.7,
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: PAGE.marginH,
    paddingBottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 400,
    letterSpacing: 1.2,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
  },
  pageNumber: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 400,
    color: C.parchmentFaint,
  },
});

interface Props {
  data: Pick<ReportData, 'hdType' | 'lifePath' | 'sunSign'>;
}

export default function Page6PersonalMap({ data }: Props) {
  const modules = [
    {
      keyword:   'The Vehicle',
      system:    'Human Design',
      role:      'How you move',
      color:     C.amber,
      value:     data.hdType,
      synthesis: hdTypeSynthesis(data.hdType),
    },
    {
      keyword:   'The Road',
      system:    'Numerology',
      role:      'What you are learning through',
      color:     C.emerald,
      value:     `Life Path ${data.lifePath}`,
      synthesis: lifePathSynthesis(data.lifePath),
    },
    {
      keyword:   'The Stoplight',
      system:    'Astrology',
      role:      'When and how you meet the world',
      color:     C.crimson,
      value:     `${data.sunSign} Sun`,
      synthesis: sunSignSynthesis(data.sunSign),
    },
  ];

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />


      {/* Three hairline rules */}
      <View style={S.topRuleRow}>
        <View style={S.topRuleAmber}   />
        <View style={S.topRuleEmerald} />
        <View style={S.topRuleCrimson} />
      </View>

      <View style={S.content}>
        <Text style={S.sectionTag}>Section 2 — Your Coordinates</Text>
        <Text style={S.heading}>Your Personal Map</Text>
        <Text style={S.subheading}>
          Three systems. Three questions answered. One person described.
        </Text>
        <View style={S.headingRule} />

        {/* Three connected modules */}
        <View style={S.mapContainer}>
          {modules.map((mod, i) => (
            <React.Fragment key={mod.keyword}>
              {/* Module */}
              <View style={[S.module, {
                backgroundColor: i % 2 === 0 ? '#F5F3EE' : '#F5F5F3',
                borderWidth: 0.5,
                borderColor: 'rgba(13,13,14,0.08)',
              }]}>
                {/* Left — system identity */}
                <View style={S.moduleLeft}>
                  <Text style={[S.moduleKeyword, { color: mod.color }]}>{mod.keyword}</Text>
                  <Text style={S.moduleSystem}>{mod.system}</Text>
                  <Text style={S.moduleRole}>{mod.role}</Text>
                </View>

                {/* Divider */}
                <View style={[S.moduleDivider, { height: 60 }]} />

                {/* Right — synthesis */}
                <View style={S.moduleRight}>
                  <Text style={[S.primaryValue, { color: mod.color }]}>{mod.value}</Text>
                  <Text style={S.synthesisSentence}>{mod.synthesis}</Text>
                </View>
              </View>

              {/* Connector between modules */}
              {i < modules.length - 1 && (
                <View style={S.connector}>
                  <View style={S.connectorLine} />
                  <View style={S.connectorDot} />
                  <View style={S.connectorLine} />
                </View>
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Synthesis note */}
        <View style={S.synthesisNote}>
          <Text style={S.synthesisNoteText}>
            No dimension outranks the others. Each answers a different question about the same person.
          </Text>
        </View>
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNumber}>6</Text>
      </View>
    </Page>
  );
}
