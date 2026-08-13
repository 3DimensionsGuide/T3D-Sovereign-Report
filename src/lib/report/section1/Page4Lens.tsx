/**
 * Page 4 — The T3D Lens
 *
 * Reader need: "How Do These Systems Work Together?"
 *
 * Establishes the core metaphor:
 *   Vehicle  = Human Design  (Amber)
 *   Road     = Numerology    (Emerald)
 *   Stoplight = Astrology    (Crimson)
 *
 * Key message: No dimension outranks another. Each answers a different question.
 * Includes: system descriptions, question each answers, color legend.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { C, F, PAGE } from '../tokens';

const S = StyleSheet.create({
  page: {
    backgroundColor: '#FAFAF9',
    padding: 0,
    fontFamily: F.sans,
  },
  topRule: {
    width: PAGE.width,
    height: 1.5,
    backgroundColor: C.crimson,
  },
  content: {
    flex: 1,
    paddingHorizontal: PAGE.marginH,
    paddingTop: 52,
    paddingBottom: PAGE.marginV,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  sectionTag: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 500,
    letterSpacing: 2.5,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  heading: {
    fontFamily: F.display,
    fontSize: 28,
    fontWeight: 400,
    color: C.base,
    lineHeight: 1.15,
    marginBottom: 8,
  },
  intro: {
    fontFamily: F.sans,
    fontSize: 10.5,
    fontWeight: 300,
    color: C.base,
    lineHeight: 1.7,
    opacity: 0.8,
    marginBottom: 28,
    maxWidth: 420,
  },
  headingRule: {
    width: PAGE.contentWidth,
    height: 0.5,
    backgroundColor: C.base,
    opacity: 0.12,
    marginBottom: 28,
  },

  // ── Dimension blocks ──────────────────────────────────────────────────────
  dimensionsContainer: {
    gap: 0,
    marginBottom: 28,
  },

  dimensionBlock: {
    paddingVertical: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: C.base,
    borderBottomStyle: 'solid',
    flexDirection: 'row',
    gap: 16,
    opacity: 0.95,
  },
  dimensionBlockLast: {
    paddingVertical: 18,
    flexDirection: 'row',
    gap: 16,
  },

  // Color bar on left side
  colorBar: {
    width: 2,
    flexShrink: 0,
    borderRadius: 1,
  },

  dimensionBody: {
    flex: 1,
    gap: 4,
  },

  // System name row
  dimensionNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 2,
  },
  dimensionKeyword: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 500,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  dimensionSep: {
    fontFamily: F.sans,
    fontSize: 7,
    color: C.parchmentFaint,
  },
  dimensionSystem: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 400,
    letterSpacing: 1.2,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
  },

  // The "name" in Playfair Display
  dimensionName: {
    fontFamily: F.display,
    fontSize: 16,
    fontWeight: 400,
    color: C.base,
    lineHeight: 1.1,
    marginBottom: 6,
  },

  // Question it answers
  dimensionQuestion: {
    fontFamily: F.sans,
    fontSize: 8,
    fontWeight: 500,
    letterSpacing: 0.4,
    color: C.parchmentFaint,
    fontStyle: 'italic',
    marginBottom: 6,
  },

  // Description
  dimensionDesc: {
    fontFamily: F.sans,
    fontSize: 9.5,
    fontWeight: 300,
    color: C.base,
    lineHeight: 1.65,
    opacity: 0.8,
  },

  // ── No dimension outranks another — key statement ─────────────────────────
  keyStatement: {
    padding: 16,
    backgroundColor: '#F0EEE9',
    marginBottom: 24,
  },
  keyStatementText: {
    fontFamily: F.display,
    fontSize: 11,
    fontWeight: 400,
    fontStyle: 'italic',
    color: C.base,
    lineHeight: 1.55,
    textAlign: 'center',
  },

  // ── Color legend ──────────────────────────────────────────────────────────
  legendLabel: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 500,
    letterSpacing: 2.5,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  legendSwatch: {
    width: 12,
    height: 12,
  },
  legendText: {
    fontFamily: F.sans,
    fontSize: 8,
    fontWeight: 400,
    color: C.base,
    letterSpacing: 0.3,
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

const DIMENSIONS = [
  {
    keyword:  'The Vehicle',
    system:   'Human Design',
    name:     'The Vehicle',
    question: 'How am I built to move through the world?',
    desc:     'Your energy type, inner authority, and defined centers. The structural architecture beneath every decision you make — the machinery that was set at birth and doesn\'t change.',
    color:    C.amber,
  },
  {
    keyword:  'The Road',
    system:   'Numerology',
    name:     'The Road',
    question: 'Where are my numbers pointing?',
    desc:     'Your life path, expression number, and active pinnacle cycle. The geometric trajectory your numbers have been tracing since birth — where the route is headed and what phase of it you\'re currently in.',
    color:    C.emerald,
  },
  {
    keyword:  'The Stoplight',
    system:   'Astrology',
    name:     'The Stoplight',
    question: 'What are the current conditions?',
    desc:     'Your natal chart positions and active planetary transits. The environmental signals that shift with time and season — telling you when to move, when to wait, and what the terrain looks like right now.',
    color:    C.crimson,
  },
] as const;

export default function Page4Lens() {
  return (
    <Page size="LETTER" style={S.page}>

      {/* Crimson hairline at top */}
      <View style={S.topRule} />

      <View style={S.content}>

        <Text style={S.sectionTag}>Section 1 — Arrival</Text>
        <Text style={S.heading}>The T3D Lens</Text>
        <Text style={S.intro}>
          Three systems. Three questions. One subject.{'\n'}
          Each dimension describes the same person from a different angle — none of them ranks above the others.
        </Text>
        <View style={S.headingRule} />

        {/* Three dimension blocks */}
        <View style={S.dimensionsContainer}>
          {DIMENSIONS.map((dim, i) => (
            <View
              key={dim.keyword}
              style={i === DIMENSIONS.length - 1 ? S.dimensionBlockLast : S.dimensionBlock}
            >
              {/* Color bar */}
              <View style={[S.colorBar, { backgroundColor: dim.color }]} />

              {/* Content */}
              <View style={S.dimensionBody}>
                <View style={S.dimensionNameRow}>
                  <Text style={[S.dimensionKeyword, { color: dim.color }]}>
                    {dim.keyword}
                  </Text>
                  <Text style={S.dimensionSep}>·</Text>
                  <Text style={S.dimensionSystem}>{dim.system}</Text>
                </View>
                <Text style={S.dimensionQuestion}>"{dim.question}"</Text>
                <Text style={S.dimensionDesc}>{dim.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Key statement */}
        <View style={S.keyStatement}>
          <Text style={S.keyStatementText}>
            Human Design shows you the vehicle.{'\n'}
            Numerology maps the road.{'\n'}
            Astrology reads the current signal.{'\n'}
            All three are required for full navigation.
          </Text>
        </View>

        {/* Color legend */}
        <Text style={S.legendLabel}>System Color Legend</Text>
        <View style={S.legendRow}>
          <View style={S.legendItem}>
            <View style={[S.legendSwatch, { backgroundColor: C.amber }]} />
            <Text style={S.legendText}>Amber — Human Design</Text>
          </View>
          <View style={S.legendItem}>
            <View style={[S.legendSwatch, { backgroundColor: C.emerald }]} />
            <Text style={S.legendText}>Emerald — Numerology</Text>
          </View>
          <View style={S.legendItem}>
            <View style={[S.legendSwatch, { backgroundColor: C.crimson }]} />
            <Text style={S.legendText}>Crimson — Astrology</Text>
          </View>
        </View>

      </View>

      {/* Footer */}
      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNumber}>4</Text>
      </View>

    </Page>
  );
}
