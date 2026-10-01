/**
 * Advanced Sovereign Report — Vehicle Section — Your Variables
 *
 * Sixth "architecture" page (after Definition, Bridges, Circuitry,
 * Incarnation Cross, Godhead + Light/Shadow). Variables (PHS — Primary
 * Health System) are four Left/Right arrows, each read off a different pair
 * of planetary activations: Digestion (Design Sun), Environment (Design
 * Node), Perspective (Personality Node), Motivation (Personality Sun).
 *
 * calculateVariables() in tokens.ts resolves the Tone (1-6) and resulting
 * arrow for each of the four points from hdActiveGates. This page reads at
 * the arrow level only (Left/Right) — the named practical reading per arrow
 * (VARIABLE_ARROW_LABEL / VARIABLE_ARROW_MEANING, sourced from the T3D
 * PHILOSOPHER notebook) rather than going the full six-tone depth, laid out
 * as a 2×2 grid matching the natural quadrant structure of the four points.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../../shared/PageComponents';
import {
  C, F, PAGE, calculateVariables,
  VARIABLES_MECHANISM, VARIABLE_ARROW_LABEL, VARIABLE_ARROW_MEANING,
  type ArrowDirection, type VariableReading,
} from '../../tokens';
import type { ReportData } from '../../tokens';

const S = StyleSheet.create({
  page: { paddingTop: 0, paddingLeft: 0, paddingRight: 0, paddingBottom: PAGE.marginV, backgroundColor: '#F5F5F3', fontFamily: F.sans }, // QA fix: explicit edges, no padding shorthand (see Page05Transits.tsx)
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

  mechanismBlock: {
    padding: 16, backgroundColor: '#F5F3EE',
    borderLeftWidth: 2, borderLeftColor: C.amber, borderLeftStyle: 'solid',
    marginBottom: 22,
  },
  mechanismLabel: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 700, letterSpacing: 1.2,
    color: C.amberDim, textTransform: 'uppercase', marginBottom: 6,
  },
  mechanismText: {
    fontFamily: F.sans, fontSize: 9.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.88,
  },

  // 2x2 grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: (PAGE.contentWidth - 10) / 2,
    padding: 15, backgroundColor: '#FFFFFF',
    borderWidth: 0.75, borderColor: C.base, borderStyle: 'solid', borderRadius: 3,
    marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cardLabel: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 700, letterSpacing: 1.2,
    color: C.parchmentFaint, textTransform: 'uppercase',
  },
  arrowGlyph: {
    fontFamily: F.sans, fontSize: 13, fontWeight: 700, color: C.amber,
  },
  cardName: {
    fontFamily: F.display, fontSize: 14, fontStyle: 'italic', color: C.base, marginBottom: 6,
  },
  cardText: {
    fontFamily: F.sans, fontSize: 9, fontWeight: 300, color: C.base, lineHeight: 1.45,
    paddingTop: 6, borderTopWidth: 0.5, borderTopColor: C.base, borderTopStyle: 'solid', opacity: 0.88,
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
  data: Pick<ReportData, 'hdActiveGates'>;
}

const VARIABLE_ORDER: { key: 'digestion' | 'environment' | 'perspective' | 'motivation'; label: string }[] = [
  { key: 'digestion', label: 'Digestion' },
  { key: 'environment', label: 'Environment' },
  { key: 'perspective', label: 'Perspective' },
  { key: 'motivation', label: 'Motivation' },
];

const ARROW_GLYPH: Record<ArrowDirection, string> = { Left: '←', Right: '→' };

export default function Page08Variables({ data }: Props) {
  const result = calculateVariables(data.hdActiveGates);

  const readings: Record<'digestion' | 'environment' | 'perspective' | 'motivation', VariableReading | null> = {
    digestion: result.digestion,
    environment: result.environment,
    perspective: result.perspective,
    motivation: result.motivation,
  };

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.amberLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Advanced Sovereign Report · The Vehicle</Text>
        <Text style={S.heading}>Your Variables</Text>
        <Text style={S.subheading}>
          Four more arrows, read separately from Type, Profile, and your Incarnation Cross —
          the specific operating conditions your Vehicle runs on: how you digest, where you
          thrive physically, how you naturally see, and what actually drives your mind.
        </Text>
        <View style={S.headingRule} />

        <View style={S.mechanismBlock}>
          <Text style={S.mechanismLabel}>What Are Variables?</Text>
          <Text style={S.mechanismText}>{VARIABLES_MECHANISM}</Text>
        </View>

        <View style={S.grid}>
          {VARIABLE_ORDER.map(({ key, label }) => {
            const reading = readings[key];
            const arrow = reading?.arrow;
            const name = arrow ? VARIABLE_ARROW_LABEL[key][arrow] : null;
            const text = arrow ? VARIABLE_ARROW_MEANING[key][arrow] : null;

            return (
              <View key={key} style={S.card}>
                <View style={S.cardHeader}>
                  <Text style={S.cardLabel}>{label}</Text>
                  {arrow && <Text style={S.arrowGlyph}>{ARROW_GLYPH[arrow]}</Text>}
                </View>
                <Text style={S.cardName}>{name ?? 'Not Available'}</Text>
                <Text style={S.cardText}>
                  {text ?? "This point wasn't available to resolve a reading."}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={S.footer} fixed>
        <Text style={S.footerText}>T3D Advanced Sovereign Report</Text>
        <Text style={S.pageNum} render={({ pageNumber }) => pageNumber} />
      </View>
    </Page>
  );
}
