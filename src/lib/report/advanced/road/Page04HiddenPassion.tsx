/**
 * Advanced Sovereign Report — Road Section — Your Hidden Passion
 *
 * Deepens the base report's brief Hidden Passion treatment into a full page:
 * the calculation mechanism (HIDDEN_PASSION_MECHANISM), then the reader's
 * specific Hidden Passion Number with its full theme, integrated gift, and
 * shadow pattern (HIDDEN_PASSION_CONTENT in road-content.ts).
 *
 * Unlike Destiny/Soul Urge/Personality, Hidden Passion always reduces to a
 * single digit 1–9 — Master Numbers are never in scope for this
 * calculation, so there's no 11/22/33 branch to account for here.
 *
 * CONDITIONAL: only renders meaningfully when hasFullName is true, same as
 * the rest of the Inner Drivers family — callers should gate on that (or
 * this page shows the "not on file" state, matching the base report's
 * Version B pattern).
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../../shared/PageComponents';
import { C, F, PAGE } from '../../tokens';
import { HIDDEN_PASSION_MECHANISM, HIDDEN_PASSION_CONTENT } from './road-content';
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

  // Mechanism block
  mechanismBlock: { marginBottom: 24, gap: 6 },
  mechanismLabel: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: 2,
    textTransform: 'uppercase', color: C.emerald,
  },
  mechanismText: {
    fontFamily: F.sans, fontSize: 10, fontWeight: 300, color: C.base, lineHeight: 1.55, opacity: 0.85,
  },

  // Identity block
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

  // Gift / Shadow cards
  cardsRow: { flexDirection: 'row', gap: 14, marginBottom: 20 },
  card: { flex: 1, padding: 16, backgroundColor: '#FFFFFF', borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.12)', borderStyle: 'solid', gap: 8 },
  cardLabel: { fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: 1.8, textTransform: 'uppercase' },
  giftLabel: { color: C.emeraldDim },
  shadowLabel: { color: C.parchmentFaint },
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
  data: Pick<ReportData, 'hiddenPassion' | 'hasFullName' | 'firstName'>;
}

export default function Page04HiddenPassion({ data }: Props) {
  const content = HIDDEN_PASSION_CONTENT[data.hiddenPassion];

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.emeraldLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Advanced Sovereign Report · The Road</Text>
        <Text style={S.heading}>Your Hidden Passion</Text>
        <Text style={S.subheading}>
          One more layer from your full birth name — the recurring drive that&rsquo;s been running
          underneath your personality since birth, whether or not you&rsquo;ve ever named it.
        </Text>
        <View style={S.headingRule} />

        <View style={S.mechanismBlock}>
          <Text style={S.mechanismLabel}>How This Number Is Found</Text>
          <Text style={S.mechanismText}>{HIDDEN_PASSION_MECHANISM}</Text>
        </View>

        {data.hasFullName && content ? (
          <>
            <View style={S.identityBlock}>
              <Text style={S.identityLabel}>Hidden Passion</Text>
              <Text style={S.identityNumber}>{data.hiddenPassion}</Text>
            </View>
            <View style={S.themeBlock}>
              <Text style={S.themeText}>{content.theme}</Text>
            </View>

            <View style={S.cardsRow}>
              <View style={S.card}>
                <Text style={[S.cardLabel, S.giftLabel]}>The Integrated Gift</Text>
                <Text style={S.cardText}>{content.gift}</Text>
              </View>
              <View style={S.card}>
                <Text style={[S.cardLabel, S.shadowLabel]}>The Shadow Pattern</Text>
                <Text style={S.cardText}>{content.shadow}</Text>
              </View>
            </View>

            <View style={S.sourceCard}>
              <Text style={S.sourceLabel}>Where This Comes From</Text>
              <Text style={S.sourceText}>
                Your Hidden Passion is the Pythagorean value that recurs most often across every
                letter of your full birth name. Unlike Destiny, Soul Urge, or Personality, it
                always resolves to a single digit 1–9 — this is the one name-based number that
                Master Numbers never apply to.
              </Text>
            </View>
          </>
        ) : (
          <View style={S.missingBlock}>
            <Text style={S.missingTitle}>This Layer Requires Your Full Birth Name</Text>
            <Text style={S.missingText}>
              Your Hidden Passion Number is calculated from every letter of your full birth name
              as it appears on your birth certificate. Add it at 3dimensions.guide to unlock this
              page.
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
