/**
 * Page 2 — A Note to [First Name]
 *
 * Reader need: "How Should I Receive This?"
 *
 * Four objectives (≤ 250 words):
 *   1. Welcome the reader by name
 *   2. Name the purpose: orientation, not prediction
 *   3. Give the reading contract: test in lived experience, retain what is useful
 *   4. Give a low-pressure first instruction: read pages 5–9 first
 *
 * Voice: direct, warm, honest — no grand promises, no mystical inflation.
 * The report becomes more trustworthy when it promises a usable lens, not certainty.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../shared/PageComponents';
import { C, F, PAGE } from '../tokens';
import type { ReportData } from '../tokens';

const S = StyleSheet.create({
  page: {
    backgroundColor: '#F5F5F3',
    padding: 0,
    fontFamily: F.sans,
  },

  // ── Top rule — single amber hairline ────────────────────────────────────
  topRule: {
    width: PAGE.width,
    height: 1.5,
    backgroundColor: C.amber,
  },

  // ── Content area ─────────────────────────────────────────────────────────
  content: {
    flex: 1,
    paddingHorizontal: PAGE.marginH,
    paddingTop: 52,
    paddingBottom: PAGE.marginV,
  },

  // ── Section tag ───────────────────────────────────────────────────────────
  sectionTag: {
    fontFamily: F.sans,
    fontSize: 8.5,
    fontWeight: 500,
    letterSpacing: 2.5,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
    marginBottom: 28,
  },

  // ── Heading: "A Note to" ─────────────────────────────────────────────────
  headingSmall: {
    fontFamily: F.sans,
    fontSize: 10.5,
    fontWeight: 400,
    letterSpacing: 1.8,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
    marginBottom: 6,
  },

  // ── Name in Playfair Display italic ──────────────────────────────────────
  headingName: {
    fontFamily: F.display,
    fontSize: 34,
    fontWeight: 400,
    fontStyle: 'italic',
    color: C.base,
    lineHeight: 1.1,
    marginBottom: 24,
  },

  // ── Thin rule under heading ───────────────────────────────────────────────
  headingRule: {
    width: PAGE.contentWidth,
    height: 0.5,
    backgroundColor: C.base,
    opacity: 0.15,
    marginBottom: 28,
  },

  // ── Body text ─────────────────────────────────────────────────────────────
  body: {
    fontFamily: F.sans,
    fontSize: 10.5,
    fontWeight: 300,
    color: C.base,
    lineHeight: 1.5,
    marginBottom: 14,
    opacity: 0.85,
  },

  // ── Pull quote — the single most important sentence ───────────────────────
  pullQuote: {
    fontFamily: F.display,
    fontSize: 13,
    fontWeight: 400,
    fontStyle: 'italic',
    color: C.base,
    lineHeight: 1.4,
    marginVertical: 18,
    paddingLeft: 16,
    borderLeftWidth: 1.5,
    borderLeftColor: C.amber,
    borderLeftStyle: 'solid',
  },

  // ── First instruction block ───────────────────────────────────────────────
  instructionBlock: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F0EEE9',
    borderLeftWidth: 2,
    borderLeftColor: C.amber,
    borderLeftStyle: 'solid',
  },
  instructionLabel: {
    fontFamily: F.sans,
    fontSize: 8.5,
    fontWeight: 500,
    letterSpacing: 2,
    color: C.amberDim,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  instructionText: {
    fontFamily: F.sans,
    fontSize: 10.5,
    fontWeight: 400,
    color: C.base,
    lineHeight: 1.5,
  },

  // ── Signature block ───────────────────────────────────────────────────────
  signatureBlock: {
    marginTop: 28,
    gap: 3,
  },
  signatureDash: {
    fontFamily: F.sans,
    fontSize: 10.5,
    fontWeight: 300,
    color: C.parchmentFaint,
    marginBottom: 2,
  },
  signatureName: {
    fontFamily: F.display,
    fontSize: 13,
    fontWeight: 400,
    fontStyle: 'italic',
    color: C.base,
  },
  signatureTitle: {
    fontFamily: F.sans,
    fontSize: 8,
    fontWeight: 400,
    letterSpacing: 1.2,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
    marginTop: 2,
  },

  // ── Bottom page number ────────────────────────────────────────────────────
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
  data: Pick<ReportData, 'firstName'>;
}

export default function Page2Note({ data }: Props) {
  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />


      {/* Amber hairline at top */}
      <View style={S.topRule} />

      <View style={S.content}>

        {/* Section tag */}
        <Text style={S.sectionTag}>Section 1 — Arrival</Text>

        {/* Heading */}
        <Text style={S.headingSmall}>A Note to</Text>
        <Text style={S.headingName}>{data.firstName}</Text>

        {/* Rule */}
        <View style={S.headingRule} />

        {/* Letter body — paragraph 1 */}
        <Text style={S.body}>
          This report was built from the coordinates of your birth — the date, time, and place you arrived. What it reflects back is not a prescription. It is an orientation.
        </Text>

        {/* Letter body — paragraph 2 */}
        <Text style={S.body}>
          The three systems inside — Human Design, Numerology, and Astrology — each describe the same person from a different angle. Your energy architecture. Your numeric blueprint. The sky{"'"}s conditions at the moment you appeared. Together they form a single lens for understanding how you are built and where you are in your life right now.
        </Text>

        {/* Pull quote */}
        <Text style={S.pullQuote}>
          A lens is not a verdict.
        </Text>

        {/* Letter body — paragraph 3 (the reading contract) */}
        <Text style={S.body}>
          Read what follows as an experiment. When something feels precisely, uncomfortably true — make a note. When something doesn{"'"}t land, set it aside without deciding it{"'"}s wrong. The most useful reports are the ones you return to six months later and understand differently.
        </Text>

        {/* Letter body — paragraph 4 */}
        <Text style={S.body}>
          You are the authority on your own experience. This report does not outrank that authority. It is a tool, not a conclusion.
        </Text>

        {/* First instruction block */}
        <View style={S.instructionBlock}>
          <Text style={S.instructionLabel}>Your First Instruction</Text>
          <Text style={S.instructionText}>
            Before going any further into the data, read pages 5 through 9. Those pages establish how the three systems work together. Everything else in this report will mean more once you have that foundation.
          </Text>
        </View>

        {/* Signature */}
        <View style={S.signatureBlock}>
          <Text style={S.signatureDash}>—</Text>
          <Text style={S.signatureName}>Tyler Henry</Text>
          <Text style={S.signatureTitle}>T3D Studio</Text>
        </View>

      </View>

      {/* Footer */}
      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNumber}>2</Text>
      </View>

    </Page>
  );
}
