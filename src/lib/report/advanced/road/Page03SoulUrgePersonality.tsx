/**
 * Advanced Sovereign Report — Road Section — The Craving and the Mask
 *
 * Companion to Page02InnerDrivers.tsx: deepens the base report's
 * one-sentence Soul Urge and Personality treatment into full readings,
 * side by side — Soul Urge (the private craving, read from the vowels of
 * the full birth name) and Personality (the outer mask, read from the
 * consonants). Content from SOUL_URGE_CONTENT / PERSONALITY_CONTENT in
 * road-content.ts.
 *
 * Kept to one page for both numbers (unlike Destiny, which got its own
 * page) — each card is theme + a condensed single-line balance note,
 * rather than the full two-card over/under spread Destiny got, so both
 * fit comfortably side by side.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../../shared/PageComponents';
import { C, F, PAGE } from '../../tokens';
import { SOUL_URGE_CONTENT, PERSONALITY_CONTENT } from './road-content';
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

  cardsRow: { flexDirection: 'row', gap: 16, marginBottom: 24, alignItems: 'stretch' },
  card: {
    flex: 1, padding: 18,
    backgroundColor: '#FFFFFF', borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.12)', borderStyle: 'solid',
    gap: 10,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  cardLabel: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: 1.6,
    textTransform: 'uppercase', color: C.parchmentFaint,
  },
  cardNumber: { fontFamily: F.display, fontSize: 26, fontWeight: 700, color: C.emerald, lineHeight: 1.0 },
  cardSubLabel: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 500, letterSpacing: 1.4,
    textTransform: 'uppercase', color: C.emeraldDim, marginTop: 2,
  },
  cardTheme: { fontFamily: F.sans, fontSize: 10, fontWeight: 300, color: C.base, lineHeight: 1.55, opacity: 0.9 },

  balanceRow: { paddingTop: 8, borderTopWidth: 0.5, borderTopColor: 'rgba(13,13,14,0.08)', gap: 6 },
  balanceLine: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  balanceGlyph: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 500, letterSpacing: 0.8,
    textTransform: 'uppercase', width: 34, paddingTop: 1,
  },
  balanceGlyphOver: { color: C.emeraldDim },
  balanceGlyphUnder: { color: C.parchmentFaint },
  balanceText: { flex: 1, fontFamily: F.sans, fontSize: 8.5, fontWeight: 300, color: C.base, lineHeight: 1.45, opacity: 0.75 },

  // Synthesis footer note
  synthesisNote: {
    padding: 16, backgroundColor: '#EFF5EF',
    borderLeftWidth: 2, borderLeftColor: C.emerald, borderLeftStyle: 'solid',
  },
  synthesisText: { fontFamily: F.sans, fontSize: 10, fontWeight: 300, color: C.base, lineHeight: 1.6, fontStyle: 'italic' },

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
  data: Pick<ReportData, 'soulUrge' | 'personality' | 'hasFullName' | 'firstName'>;
}

export default function Page03SoulUrgePersonality({ data }: Props) {
  const soulUrgeContent = SOUL_URGE_CONTENT[data.soulUrge];
  const personalityContent = PERSONALITY_CONTENT[data.personality];

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.emeraldLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Advanced Sovereign Report · The Road</Text>
        <Text style={S.heading}>The Craving and the Mask</Text>
        <Text style={S.subheading}>
          Two more layers from the same name — what actually satisfies you once the noise
          clears, and what people register about you before they know anything real.
        </Text>
        <View style={S.headingRule} />

        {data.hasFullName && soulUrgeContent && personalityContent ? (
          <>
            <View style={S.cardsRow}>
              <View style={S.card}>
                <View style={S.cardHeader}>
                  <Text style={S.cardLabel}>Soul Urge</Text>
                  <Text style={S.cardNumber}>{data.soulUrge}</Text>
                </View>
                <Text style={S.cardSubLabel}>From the vowels of your name</Text>
                <Text style={S.cardTheme}>{soulUrgeContent.theme}</Text>
                <View style={S.balanceRow}>
                  <View style={S.balanceLine}>
                    <Text style={[S.balanceGlyph, S.balanceGlyphOver]}>Over</Text>
                    <Text style={S.balanceText}>{soulUrgeContent.overexpressed}</Text>
                  </View>
                  <View style={S.balanceLine}>
                    <Text style={[S.balanceGlyph, S.balanceGlyphUnder]}>Under</Text>
                    <Text style={S.balanceText}>{soulUrgeContent.underexpressed}</Text>
                  </View>
                </View>
              </View>

              <View style={S.card}>
                <View style={S.cardHeader}>
                  <Text style={S.cardLabel}>Personality</Text>
                  <Text style={S.cardNumber}>{data.personality}</Text>
                </View>
                <Text style={S.cardSubLabel}>From the consonants of your name</Text>
                <Text style={S.cardTheme}>{personalityContent.theme}</Text>
                <View style={S.balanceRow}>
                  <View style={S.balanceLine}>
                    <Text style={[S.balanceGlyph, S.balanceGlyphOver]}>Over</Text>
                    <Text style={S.balanceText}>{personalityContent.overexpressed}</Text>
                  </View>
                  <View style={S.balanceLine}>
                    <Text style={[S.balanceGlyph, S.balanceGlyphUnder]}>Under</Text>
                    <Text style={S.balanceText}>{personalityContent.underexpressed}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={S.synthesisNote}>
              <Text style={S.synthesisText}>
                The gap between these two numbers is worth noticing on its own: when Soul Urge
                and Personality point in different directions, what you crave privately and
                what people read from you at first glance are two different signals — neither
                one is the "real" you more than the other.
              </Text>
            </View>
          </>
        ) : (
          <View style={S.missingBlock}>
            <Text style={S.missingTitle}>This Layer Requires Your Full Birth Name</Text>
            <Text style={S.missingText}>
              Soul Urge and Personality are calculated from the vowels and consonants of your
              full birth name, respectively. Add it at 3dimensions.guide to unlock this page.
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
