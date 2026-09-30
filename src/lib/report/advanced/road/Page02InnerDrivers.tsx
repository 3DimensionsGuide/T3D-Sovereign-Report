/**
 * Advanced Sovereign Report — Road Section — Your Expression, Deepened
 *
 * Deepens the base report's one-sentence Destiny/Expression treatment
 * (section4/Page21InnerDrivers.tsx) into a full page: the three-name-layer
 * mechanism (Destiny/Soul Urge/Personality, via INNER_DRIVERS_MECHANISM),
 * then the reader's specific Destiny Number with its full theme plus the
 * two directions it can go out of balance (DESTINY_CONTENT in
 * road-content.ts).
 *
 * Destiny/Expression gets its own page (rather than sharing one with Soul
 * Urge and Personality) because Felicia Bender's framing — Life Path is
 * the Sun Sign, Destiny is the Rising Sign — makes it the "master" of the
 * three name-based numbers; Soul Urge and Personality get their own
 * companion page (Page03SoulUrgePersonality.tsx).
 *
 * CONDITIONAL: only renders meaningfully when hasFullName is true, same
 * as the base report's Page21InnerDrivers — callers should gate on that
 * (or this page shows the "not on file" state, matching the base report's
 * Version B pattern).
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../../shared/PageComponents';
import { C, F, PAGE } from '../../tokens';
import { INNER_DRIVERS_MECHANISM, DESTINY_CONTENT } from './road-content';
import type { ReportData } from '../../tokens';

const S = StyleSheet.create({
  page: { paddingBottom: PAGE.marginV, backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
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

  // Mechanism block
  mechanismBlock: { marginBottom: 24, gap: 6 },
  mechanismLabel: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: 2,
    textTransform: 'uppercase', color: C.emerald,
  },
  mechanismText: {
    fontFamily: F.sans, fontSize: 10, fontWeight: 300, color: C.base, lineHeight: 1.55, opacity: 0.85,
  },

  // Destiny identity block
  identityBlock: { flexDirection: 'row', alignItems: 'baseline', gap: 14, marginBottom: 4 },
  identityLabel: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500, letterSpacing: 1.8,
    color: C.parchmentFaint, textTransform: 'uppercase',
  },
  identityNumber: {
    fontFamily: F.display, fontSize: 34, fontWeight: 700, color: C.emerald, lineHeight: 1.0,
  },
  themeBlock: {
    padding: 16, marginTop: 12, marginBottom: 20,
    backgroundColor: '#EFF5EF',
    borderLeftWidth: 2, borderLeftColor: C.emerald, borderLeftStyle: 'solid',
  },
  themeText: {
    fontFamily: F.sans, fontSize: 11, fontWeight: 300, color: C.base, lineHeight: 1.6,
  },

  // Balance cards
  cardsRow: { flexDirection: 'row', gap: 14, marginBottom: 20 },
  card: { flex: 1, padding: 16, backgroundColor: '#FFFFFF', borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.12)', borderStyle: 'solid', gap: 8 },
  cardLabel: { fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: 1.8, textTransform: 'uppercase' },
  overLabel: { color: C.emeraldDim },
  underLabel: { color: C.parchmentFaint },
  cardText: { fontFamily: F.sans, fontSize: 9.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.85 },

  // Source card
  sourceCard: {
    padding: 14, backgroundColor: '#FFFFFF', borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.12)', borderStyle: 'solid',
  },
  sourceLabel: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 500, letterSpacing: 1.8,
    textTransform: 'uppercase', color: C.emeraldDim, marginBottom: 4,
  },
  sourceText: { fontFamily: F.sans, fontSize: 9.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.8 },

  // Missing-name state
  missingBlock: {
    padding: 20, backgroundColor: '#F5F3EE',
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.1)', gap: 8,
  },
  missingTitle: { fontFamily: F.display, fontSize: 16, fontWeight: 400, color: C.base, lineHeight: 1.2 },
  missingText: { fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.82 },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: PAGE.marginH, paddingBottom: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: { fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2, color: C.parchmentFaint, textTransform: 'uppercase' },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

interface Props {
  data: Pick<ReportData, 'destiny' | 'hasFullName' | 'firstName'>;
}

export default function Page02InnerDrivers({ data }: Props) {
  const content = DESTINY_CONTENT[data.destiny];

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.emeraldLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Advanced Sovereign Report · The Road</Text>
        <Text style={S.heading}>Your Expression, Deepened</Text>
        <Text style={S.subheading}>
          Your full birth name encodes three more layers underneath your Life Path — starting
          with what you&rsquo;re actually built to output.
        </Text>
        <View style={S.headingRule} />

        <View style={S.mechanismBlock}>
          <Text style={S.mechanismLabel}>How Your Name Adds a Layer</Text>
          <Text style={S.mechanismText}>{INNER_DRIVERS_MECHANISM}</Text>
        </View>

        {data.hasFullName && content ? (
          <>
            <View style={S.identityBlock}>
              <Text style={S.identityLabel}>Destiny / Expression</Text>
              <Text style={S.identityNumber}>{data.destiny}</Text>
            </View>
            <View style={S.themeBlock}>
              <Text style={S.themeText}>{content.theme}</Text>
            </View>

            <View style={S.cardsRow}>
              <View style={S.card}>
                <Text style={[S.cardLabel, S.overLabel]}>When Overexpressed</Text>
                <Text style={S.cardText}>{content.overexpressed}</Text>
              </View>
              <View style={S.card}>
                <Text style={[S.cardLabel, S.underLabel]}>When Underexpressed</Text>
                <Text style={S.cardText}>{content.underexpressed}</Text>
              </View>
            </View>

            <View style={S.sourceCard}>
              <Text style={S.sourceLabel}>Where This Comes From</Text>
              <Text style={S.sourceText}>
                Your Destiny Number sums the Pythagorean value of every letter in your full
                birth name — first, middle, and last. Unlike your Life Path, which is fixed at
                birth by date alone, this number is encoded in the name you were given.
              </Text>
            </View>
          </>
        ) : (
          <View style={S.missingBlock}>
            <Text style={S.missingTitle}>This Layer Requires Your Full Birth Name</Text>
            <Text style={S.missingText}>
              Your Destiny/Expression Number is calculated from every letter of your full birth
              name as it appears on your birth certificate. Add it at 3dimensions.guide to
              unlock this page.
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
