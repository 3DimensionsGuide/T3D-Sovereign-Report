/**
 * Page 29 — The Dual Lens Protocol
 *
 * Reader question: "When Do I Use Each — And What If They Differ?"
 *
 * A calm, high-white-space instructional page.
 * No personal data — this page is purely navigational.
 *
 * Structure:
 *   1. Four-row comparison matrix (exact content per spec)
 *   2. Three-step NOTICE / WIDEN / RETURN protocol
 *   3. Closing statement: "The Stoplight helps you notice conditions.
 *      It does not take the wheel."
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { C, F, PAGE } from '../tokens';
import { TechnicalLines } from '../shared/PageComponents';

const STAR_SLATE = '#6D7797';

// ── Matrix data (exact content from spec) ─────────────────────────────────────
const MATRIX_ROWS = [
  {
    question:  'What pattern feels active in my ordinary lived experience?',
    tropical:  'Start here. Notice the seasonal, familiar story.',
    sidereal:  'Use as 2nd Orientation.',
    t3dUse:    'Observe before attaching identity.',
  },
  {
    question:  'Why does one description feel familiar while another adds new language?',
    tropical:  'Notes the pattern you may already recognize.',
    sidereal:  'May offer a different symbolic reference point.',
    t3dUse:    'Treat both as information, not a verdict.',
  },
  {
    question:  'What if the lenses point to different qualities?',
    tropical:  'Ask what is visible in current context.',
    sidereal:  'Ask what becomes visible when you step back from the familiar narrative.',
    t3dUse:    'Do not choose a winner; return to Authority for action.',
  },
  {
    question:  'What if both emphasize the same theme?',
    tropical:  'Offers one expression of it.',
    sidereal:  'Offers a second reinforcement.',
    t3dUse:    'Treat the overlap as a useful area for observation.',
  },
] as const;

// ── Three-step protocol (exact content from spec) ─────────────────────────────
const PROTOCOL_STEPS = [
  {
    num:    '1',
    label:  'NOTICE',
    color:  C.crimson,
    body:   'Name what the Tropical lens helps you recognize in ordinary life.',
  },
  {
    num:    '2',
    label:  'WIDEN',
    color:  STAR_SLATE,
    body:   'Name what the Sidereal lens adds, complicates, or makes newly visible.',
  },
  {
    num:    '3',
    label:  'RETURN',
    color:  C.amber,
    body:   'Use your Vehicle / Authority to make the actual decision.',
  },
] as const;

// ── Styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page:   { backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  triBar: { flexDirection: 'row', width: PAGE.width },
  barA:   { flex: 1, height: 1.5, backgroundColor: C.amber },
  barE:   { flex: 1, height: 1.5, backgroundColor: C.emerald },
  barC:   { flex: 1, height: 1.5, backgroundColor: C.crimson },

  content: {
    flex: 1,
    paddingHorizontal: PAGE.marginH,
    paddingTop: 36,
    paddingBottom: PAGE.marginV,
  },

  eyebrow: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 500,
    letterSpacing: 2.5, color: C.parchmentFaint,
    textTransform: 'uppercase', marginBottom: 6,
  },
  heading: {
    fontFamily: F.display, fontSize: 20, fontWeight: 400,
    color: C.base, lineHeight: 1.1, marginBottom: 4,
  },
  sub: {
    fontFamily: F.sans, fontSize: 9, fontWeight: 300,
    color: C.parchmentFaint, lineHeight: 1.5,
    marginBottom: 18, maxWidth: 440,
  },
  pageRule: {
    width: PAGE.contentWidth, height: 0.5,
    backgroundColor: C.base, opacity: 0.1, marginBottom: 18,
  },

  // ── Comparison matrix ─────────────────────────────────────────────────────
  matrix: {
    width: PAGE.contentWidth,
    marginBottom: 22,
    borderWidth: 0.5,
    borderColor: 'rgba(13,13,14,0.12)',
  },

  // Header row
  headerRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(13,13,14,0.04)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(13,13,14,0.15)',
  },

  // Header cells
  headerCell: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    gap: 4,
  },
  headerLabel: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 700,
    letterSpacing: 2, textTransform: 'uppercase',
  },
  // Small visual indicator lines in column headers
  headerIndicatorSolid: {
    height: 1.5,
    width: 20,
    backgroundColor: C.crimson,
  },
  headerIndicatorDashed: {
    flexDirection: 'row', gap: 3,
  },
  headerDash: {
    height: 1.5, width: 4,
    backgroundColor: STAR_SLATE,
  },

  // Column flex proportions
  colQuestion:  { flex: 3, borderRightWidth: 0.5, borderRightColor: 'rgba(13,13,14,0.1)', borderRightStyle: 'solid' },
  colTropical:  { flex: 2.2, borderRightWidth: 0.5, borderRightColor: 'rgba(13,13,14,0.1)', borderRightStyle: 'solid' },
  colSidereal:  { flex: 2.2, borderRightWidth: 0.5, borderRightColor: 'rgba(13,13,14,0.1)', borderRightStyle: 'solid' },
  colT3D:       { flex: 2 },

  // Data rows
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(13,13,14,0.08)',
  },
  dataRowLast: {
    flexDirection: 'row',
  },
  dataRowAlt: {
    backgroundColor: 'rgba(13,13,14,0.015)',
  },

  // Data cells
  dataCell: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  questionText: {
    fontFamily: F.display, fontSize: 8.5, fontWeight: 400,
    fontStyle: 'italic', color: C.base, lineHeight: 1.5, opacity: 0.88,
  },
  tropicalText: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 300,
    color: C.base, lineHeight: 1.55, opacity: 0.85,
  },
  siderealText: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 300,
    color: C.base, lineHeight: 1.55, opacity: 0.85,
  },
  t3dText: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500,
    color: C.base, lineHeight: 1.55, opacity: 0.85,
  },

  // ── Three-step protocol ───────────────────────────────────────────────────
  protocolContainer: {
    marginBottom: 20,
    gap: 0,
  },
  protocolLabel: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase',
    color: C.parchmentFaint, marginBottom: 10,
  },
  protocolRow: {
    flexDirection: 'row',
    gap: 12,
  },
  protocolStep: {
    flex: 1,
    padding: 12,
    borderTopWidth: 2,
    borderTopStyle: 'solid',
    gap: 4,
  },
  stepNum: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 500,
    letterSpacing: 1.5, textTransform: 'uppercase',
    color: C.parchmentFaint, marginBottom: 2,
  },
  stepLabel: {
    fontFamily: F.sans, fontSize: 9, fontWeight: 700,
    letterSpacing: 2.5, textTransform: 'uppercase',
    marginBottom: 4,
  },
  stepBody: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 300,
    color: C.base, lineHeight: 1.55, opacity: 0.85,
  },

  // ── Closing statement ─────────────────────────────────────────────────────
  closingRule: {
    width: PAGE.contentWidth, height: 0.5,
    backgroundColor: C.base, opacity: 0.1, marginBottom: 14,
  },
  closingStatement: {
    fontFamily: F.display, fontSize: 13, fontWeight: 400,
    fontStyle: 'italic', color: C.base,
    lineHeight: 1.5, opacity: 0.8,
    textAlign: 'center',
    maxWidth: PAGE.contentWidth,
  },

  // Footer
  footer: {
    paddingHorizontal: PAGE.marginH, paddingBottom: 22,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: {
    fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2,
    color: C.parchmentFaint, textTransform: 'uppercase',
  },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

export default function Page29DualLensProtocol() {
  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.triBar}>
        <View style={S.barA} /><View style={S.barE} /><View style={S.barC} />
      </View>

      <View style={S.content}>
        <Text style={S.eyebrow}>Stoplight · Both Lenses</Text>
        <Text style={S.heading}>The Dual Lens Protocol</Text>
        <Text style={S.sub}>
          When do I use each — and what if they differ?
        </Text>
        <View style={S.pageRule} />

        {/* ── Comparison matrix ─────────────────────────────────────── */}
        <View style={S.matrix}>

          {/* Header row */}
          <View style={S.headerRow}>
            <View style={[S.headerCell, S.colQuestion]}>
              <Text style={[S.headerLabel, { color: C.parchmentFaint }]}>
                Reader Question
              </Text>
            </View>

            <View style={[S.headerCell, S.colTropical]}>
              <Text style={[S.headerLabel, { color: C.crimson }]}>
                Tropical Lens
              </Text>
              {/* Solid crimson indicator */}
              <View style={S.headerIndicatorSolid} />
            </View>

            <View style={[S.headerCell, S.colSidereal]}>
              <Text style={[S.headerLabel, { color: STAR_SLATE }]}>
                Sidereal Lens
              </Text>
              {/* Dashed slate indicator */}
              <View style={S.headerIndicatorDashed}>
                {[0,1,2,3].map(i => <View key={i} style={S.headerDash} />)}
              </View>
            </View>

            <View style={[S.headerCell, S.colT3D]}>
              <Text style={[S.headerLabel, { color: C.base, opacity: 0.6 }]}>
                T3D Use
              </Text>
            </View>
          </View>

          {/* Data rows */}
          {MATRIX_ROWS.map((row, i) => {
            const isLast = i === MATRIX_ROWS.length - 1;
            const isAlt  = i % 2 === 1;
            return (
              <View
                key={i}
                style={[
                  isLast ? S.dataRowLast : S.dataRow,
                  isAlt  ? S.dataRowAlt  : {},
                ]}
              >
                <View style={[S.dataCell, S.colQuestion]}>
                  <Text style={S.questionText}>{row.question}</Text>
                </View>
                <View style={[S.dataCell, S.colTropical]}>
                  <Text style={S.tropicalText}>{row.tropical}</Text>
                </View>
                <View style={[S.dataCell, S.colSidereal]}>
                  <Text style={S.siderealText}>{row.sidereal}</Text>
                </View>
                <View style={[S.dataCell, S.colT3D]}>
                  <Text style={S.t3dText}>{row.t3dUse}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* ── Three-step protocol ───────────────────────────────────── */}
        <View style={S.protocolContainer}>
          <Text style={S.protocolLabel}>Three-Step Protocol</Text>
          <View style={S.protocolRow}>
            {PROTOCOL_STEPS.map(step => (
              <View
                key={step.label}
                style={[S.protocolStep, { borderTopColor: step.color }]}
              >
                <Text style={S.stepNum}>{step.num} of 3</Text>
                <Text style={[S.stepLabel, { color: step.color }]}>
                  {step.label}
                </Text>
                <Text style={S.stepBody}>{step.body}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Closing statement ────────────────────────────────────────── */}
        <View style={S.closingRule} />
        <Text style={S.closingStatement}>
          "The Stoplight helps you notice conditions.{'\n'}It does not take the wheel."
        </Text>
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNum}>29</Text>
      </View>
    </Page>
  );
}
