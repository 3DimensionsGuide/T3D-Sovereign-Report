/**
 * Advanced Sovereign Report — Vehicle Section — Your Godhead
 *
 * Fifth "architecture" page (after Definition, Bridges, Circuitry, Incarnation
 * Cross). Where Page05 named the four literal gates of the reader's cross and
 * its Right/Juxtaposition/Left Angle family, this page goes one layer deeper:
 * the mythic archetype governing the whole cross, determined solely by the
 * gate of the Personality (conscious) Sun.
 *
 * There are 16 Godheads across 4 Quarters of the wheel (Initiation,
 * Civilization, Duality, Mutation) — a clean, non-overlapping partition of
 * all 64 gates, verified against T3D's source library (section3/
 * godhead-content.ts has the full provenance note). calculateGodhead() in
 * tokens.ts resolves the reader's one Godhead from hdActiveGates; this page
 * opens with a general "What Is A Godhead?" mechanism explainer, then
 * displays the reader's specific Godhead, its Quarter, its keynote passage,
 * and the source gate that produced it. The integrated/distorted (light vs
 * shadow) expression of that same Godhead continues on the companion page,
 * Page07GodheadLightShadow.tsx, which needs more room than fits here.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../../shared/PageComponents';
import { C, F, PAGE, calculateGodhead } from '../../tokens';
import { GATE_KEYNOTES } from '../../section3/gate-content';
import { GODHEAD_MECHANISM } from '../../section3/godhead-content';
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

  // Godhead name display — the star of the page
  godheadBlock: { marginBottom: 6 },
  godheadLabel: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500, letterSpacing: 1.8,
    color: C.parchmentFaint, textTransform: 'uppercase', marginBottom: 4,
  },
  godheadName: {
    fontFamily: F.display, fontSize: 32, fontWeight: 700, color: C.amber, lineHeight: 1.1,
  },
  archetypeText: {
    fontFamily: F.display, fontSize: 13, fontStyle: 'italic', color: C.base, marginTop: 4, marginBottom: 10,
  },
  quarterBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 },
  quarterTag: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 700, letterSpacing: 1.2,
    color: '#FFFFFF', backgroundColor: C.amber, textTransform: 'uppercase',
    paddingVertical: 3, paddingHorizontal: 8, borderRadius: 2,
  },
  quarterThemeText: {
    fontFamily: F.sans, fontSize: 9.5, fontWeight: 300, fontStyle: 'italic', color: C.base, opacity: 0.6,
    lineHeight: 1.4, maxWidth: 440,
  },

  // Main keynote passage
  meaningBlock: {
    padding: 18, backgroundColor: '#F5F3EE',
    borderLeftWidth: 2, borderLeftColor: C.amber, borderLeftStyle: 'solid',
    marginBottom: 22,
  },
  meaningText: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.base, lineHeight: 1.55, opacity: 0.9,
  },

  // Source gate card
  gateGridLabel: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500, letterSpacing: 1.6,
    color: C.parchmentFaint, textTransform: 'uppercase', marginBottom: 10,
  },
  gateCard: {
    padding: 16, backgroundColor: '#FFFFFF',
    borderWidth: 0.75, borderColor: C.base, borderStyle: 'solid', borderRadius: 3,
  },
  gateCardRole: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 700, letterSpacing: 1, color: C.amberDim, textTransform: 'uppercase',
    marginBottom: 5,
  },
  gateCardName: {
    fontFamily: F.display, fontSize: 13, fontStyle: 'italic', color: C.base, marginBottom: 5,
  },
  gateCardMeaning: {
    fontFamily: F.sans, fontSize: 9.5, fontWeight: 400, color: C.base, lineHeight: 1.45,
    paddingTop: 6, borderTopWidth: 0.5, borderTopColor: C.base, borderTopStyle: 'solid',
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

export default function Page06Godhead({ data }: Props) {
  const result = calculateGodhead(data.hdActiveGates);
  const { godhead, personalitySunGate } = result;
  const sourceKeynote = personalitySunGate ? GATE_KEYNOTES[personalitySunGate] : undefined;

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.amberLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Advanced Sovereign Report · The Vehicle</Text>
        <Text style={S.heading}>Your Godhead</Text>
        <Text style={S.subheading}>
          One layer beneath your Incarnation Cross sits its mythic face — a single archetype,
          set entirely by the gate of your Personality Sun, that governs the whole of your
          life&rsquo;s theme.
        </Text>
        <View style={S.headingRule} />

        <View style={S.mechanismBlock}>
          <Text style={S.mechanismLabel}>What Is A Godhead?</Text>
          <Text style={S.mechanismText}>{GODHEAD_MECHANISM}</Text>
        </View>

        {godhead ? (
          <>
            <View style={S.godheadBlock}>
              <Text style={S.godheadLabel}>Your Godhead</Text>
              <Text style={S.godheadName}>{godhead.name}</Text>
              <Text style={S.archetypeText}>{godhead.archetype}</Text>
            </View>
            <View style={S.quarterBadgeRow}>
              <Text style={S.quarterTag}>Quarter of {godhead.quarter}</Text>
            </View>
            <Text style={S.quarterThemeText}>{godhead.quarterTheme}</Text>

            <View style={{ height: 18 }} />

            <View style={S.meaningBlock}>
              <Text style={S.meaningText}>{godhead.keynote}</Text>
            </View>

            <Text style={S.gateGridLabel}>The Gate Behind This Reading</Text>
            <View style={S.gateCard}>
              <Text style={S.gateCardRole}>Personality Sun · Gate {personalitySunGate}</Text>
              {sourceKeynote && <Text style={S.gateCardName}>{sourceKeynote.ichingName}</Text>}
              {sourceKeynote && <Text style={S.gateCardMeaning}>{sourceKeynote.coreMeaning}</Text>}
            </View>
          </>
        ) : (
          <View style={S.meaningBlock}>
            <Text style={S.meaningText}>
              Your Personality Sun activation wasn&rsquo;t available to resolve a Godhead reading.
            </Text>
          </View>
        )}
      </View>

      <View style={S.footer} fixed>
        <Text style={S.footerText}>T3D Advanced Sovereign Report</Text>
        <Text style={S.pageNum} render={({ pageNumber }) => pageNumber} />
      </View>
    </Page>
  );
}
