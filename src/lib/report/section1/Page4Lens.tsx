/**
 * Page 4 — The T3D Lens
 *
 * Visual #4 — T3D System Diagram implemented here.
 * Explains the distinct job of each dimension before the reader
 * encounters any of the three system sections.
 *
 * The diagram is functional, not decorative:
 *   "Each dimension answers a distinct question.
 *    Vehicle decides. Road contextualizes. Stoplight informs timing."
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { C, F, PAGE } from '../tokens';
import { TechnicalLines } from '../shared/PageComponents';
import { T3DSystemDiagram, ChartCaption, CHART_CAPTIONS } from '../shared/ChartComponents';

const S = StyleSheet.create({
  page: { backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },

  triBar: { flexDirection: 'row', width: PAGE.width },
  barA:   { flex: 1, height: 1.5, backgroundColor: C.amber },
  barE:   { flex: 1, height: 1.5, backgroundColor: C.emerald },
  barC:   { flex: 1, height: 1.5, backgroundColor: C.crimson },

  content: { flex: 1, paddingHorizontal: PAGE.marginH, paddingTop: 44, paddingBottom: PAGE.marginV },

  sectionTag: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 2.5, color: C.parchmentFaint, textTransform: 'uppercase', marginBottom: 8,
  },
  heading: {
    fontFamily: F.display, fontSize: 22, fontWeight: 400,
    color: C.base, lineHeight: 1.15, marginBottom: 6,
  },
  sub: {
    fontFamily: F.sans, fontSize: 9.5, fontWeight: 300,
    color: C.parchmentFaint, lineHeight: 1.5, marginBottom: 20, maxWidth: 440,
  },
  rule: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 20 },

  // Diagram spacing
  diagramContainer: { marginBottom: 16 },

  // Reading key below the diagram
  keyBlock: {
    flexDirection: 'row', gap: 12, marginTop: 16,
    paddingTop: 14, borderTopWidth: 0.5, borderTopColor: 'rgba(13,13,14,0.1)',
  },
  keyItem: { flex: 1, gap: 4 },
  keyNumber: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 700,
    letterSpacing: 1.5, color: C.parchmentFaint, textTransform: 'uppercase',
  },
  keyText: {
    fontFamily: F.sans, fontSize: 9.5, fontWeight: 300,
    color: C.base, lineHeight: 1.5, opacity: 0.82,
  },

  // Tone of report note
  toneBlock: {
    marginTop: 20, padding: 14,
    backgroundColor: 'rgba(13,13,14,0.03)',
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.1)',
    gap: 5,
  },
  toneLabel: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase', color: C.parchmentFaint,
  },
  toneText: {
    fontFamily: F.display, fontSize: 10.5, fontWeight: 400,
    fontStyle: 'italic', color: C.base, lineHeight: 1.5, opacity: 0.8,
  },

  footer: {
    paddingHorizontal: PAGE.marginH, paddingBottom: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: { fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2, color: C.parchmentFaint, textTransform: 'uppercase' },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

export default function Page4Lens() {
  const howToRead = [
    {
      num: 'Section III',
      text: 'The Vehicle (Pages 10–17) — your energy type, authority, profile, defined centers. The decision mechanism is here.',
    },
    {
      num: 'Section IV',
      text: 'The Road (Pages 18–25) — your life path, developmental phases, inner drivers. The developmental arc is here.',
    },
    {
      num: 'Section V',
      text: 'The Stoplight (Pages 26–33) — your Sun, Moon, Rising, element pattern. The environmental reading is here.',
    },
  ];

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.triBar}><View style={S.barA} /><View style={S.barE} /><View style={S.barC} /></View>

      <View style={S.content}>
        <Text style={S.sectionTag}>Section 1 — Arrival</Text>
        <Text style={S.heading}>How To Use The T3D Lens</Text>
        <Text style={S.sub}>
          Three systems. Three distinct questions. One navigation instrument.
        </Text>
        <View style={S.rule} />

        {/* Visual #4 — T3D System Diagram */}
        <View style={S.diagramContainer}>
          <T3DSystemDiagram variant="full" />
          <ChartCaption text={CHART_CAPTIONS.systemDiagram} />
        </View>

        {/* Where to find each system */}
        <View style={S.keyBlock}>
          {howToRead.map(item => (
            <View key={item.num} style={S.keyItem}>
              <Text style={S.keyNumber}>{item.num}</Text>
              <Text style={S.keyText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Tone note */}
        <View style={S.toneBlock}>
          <Text style={S.toneLabel}>On The Tone Of This Report</Text>
          <Text style={S.toneText}>
            None of these systems produce verdicts. They produce lenses — useful, testable, correctable ways of looking at the same person. What serves you, keep. What doesn't, set aside. The report is not asking for belief. It is offering orientation.
          </Text>
        </View>
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNum}>4</Text>
      </View>
    </Page>
  );
}
