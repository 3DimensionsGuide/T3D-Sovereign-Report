/**
 * Page 11 — Your Type & Strategy
 * Type, Strategy, Signature, Not-Self — plain language + daily recognition cues.
 * Copy frame: plain (45–70w) / recognize × 3 / watch for / try this
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../shared/PageComponents';
import { C, F, PAGE } from '../tokens';
import { TYPE_CONTENT } from './hd-content';
import type { ReportData } from '../tokens';

const S = StyleSheet.create({
  page: {
    backgroundColor: '#F5F5F3',
    padding: 0,
    fontFamily: F.sans,
  },
  amberLine: { width: PAGE.width, height: 1.5, backgroundColor: C.amber },

  content: {
    flex: 1,
    paddingHorizontal: PAGE.marginH,
    paddingTop: 40,
    paddingBottom: PAGE.marginV,
  },

  sectionTag: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 2.5, color: C.parchmentFaint,
    textTransform: 'uppercase', marginBottom: 8,
  },
  heading: {
    fontFamily: F.display, fontSize: 22, fontWeight: 400,
    color: C.base, lineHeight: 1.15, marginBottom: 20,
  },
  headingRule: {
    width: PAGE.contentWidth, height: 0.5,
    backgroundColor: C.base, opacity: 0.1, marginBottom: 20,
  },

  // ── Type/Strategy header row ──────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row', gap: 32, marginBottom: 20, alignItems: 'flex-start',
  },
  headerBlock: { flex: 1, gap: 4 },
  headerLabel: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase', color: C.parchmentFaint,
  },
  headerValue: {
    fontFamily: F.display, fontSize: 16, fontWeight: 400,
    color: C.amber, lineHeight: 1.15,
  },
  headerValueSmall: {
    fontFamily: F.sans, fontSize: 11, fontWeight: 400,
    color: C.base, lineHeight: 1.3,
  },

  // Signature / Not-Self row
  signatureRow: {
    flexDirection: 'row', gap: 16, marginBottom: 20,
  },
  sigBlock: {
    flex: 1, padding: 12, gap: 4,
  },
  sigBlockGreen: {
    flex: 1, padding: 12, gap: 4,
    backgroundColor: C.emeraldLight,
    borderLeftWidth: 2, borderLeftColor: C.emerald, borderLeftStyle: 'solid',
  },
  sigBlockRed: {
    flex: 1, padding: 12, gap: 4,
    backgroundColor: C.crimsonLight,
    borderLeftWidth: 2, borderLeftColor: C.crimson, borderLeftStyle: 'solid',
  },
  sigLabel: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500,
    letterSpacing: 1.8, textTransform: 'uppercase', color: C.parchmentFaint,
  },
  sigValue: {
    fontFamily: F.display, fontSize: 13, fontWeight: 400, color: C.base,
  },

  // ── Plain language block ──────────────────────────────────────────────────
  plainBlock: { marginBottom: 16 },
  plainText: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300,
    color: C.base, lineHeight: 1.5, opacity: 0.85,
  },

  // ── Recognition list ──────────────────────────────────────────────────────
  recognizeLabel: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase', color: C.parchmentFaint,
    marginBottom: 8,
  },
  recognizeList: { gap: 6, marginBottom: 16 },
  recognizeItem: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  recognizeDot: {
    width: 3, height: 3, borderRadius: 1.5,
    backgroundColor: C.amber, marginTop: 5, flexShrink: 0,
  },
  recognizeText: {
    flex: 1, fontFamily: F.sans, fontSize: 10.5, fontWeight: 300,
    color: C.base, lineHeight: 1.5, opacity: 0.85,
  },

  // ── Watch for / Try this ──────────────────────────────────────────────────
  promptRow: { flexDirection: 'row', gap: 12, marginBottom: 0 },
  promptBlock: {
    flex: 1, padding: 14, gap: 5,
    backgroundColor: '#F0EEE9',
    borderTopWidth: 1.5, borderTopStyle: 'solid',
  },
  promptLabel: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase',
  },
  promptText: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300,
    color: C.base, lineHeight: 1.5, opacity: 0.85,
  },

  footer: {
    paddingHorizontal: PAGE.marginH, paddingBottom: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: {
    fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2,
    color: C.parchmentFaint, textTransform: 'uppercase',
  },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

interface Props {
  data: Pick<ReportData, 'hdType' | 'hdStrategy' | 'hdNotSelf'>;
}

export default function Page11TypeStrategy({ data }: Props) {
  // Look up content — fall back to Generator if type not found
  const tc = TYPE_CONTENT[data.hdType] ?? TYPE_CONTENT['Generator']!;

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.amberLine} />

      <View style={S.content}>
        <Text style={S.sectionTag}>Section 3 — The Vehicle</Text>
        <Text style={S.heading}>Your Type & Strategy</Text>
        <View style={S.headingRule} />

        {/* Type + Strategy header */}
        <View style={S.headerRow}>
          <View style={S.headerBlock}>
            <Text style={S.headerLabel}>Type</Text>
            <Text style={S.headerValue}>{data.hdType}</Text>
          </View>
          <View style={S.headerBlock}>
            <Text style={S.headerLabel}>Strategy</Text>
            <Text style={S.headerValueSmall}>{data.hdStrategy}</Text>
          </View>
        </View>

        {/* Signature / Not-Self */}
        <View style={S.signatureRow}>
          <View style={S.sigBlockGreen}>
            <Text style={S.sigLabel}>Signature (when aligned)</Text>
            <Text style={S.sigValue}>{tc.signature}</Text>
          </View>
          <View style={S.sigBlockRed}>
            <Text style={S.sigLabel}>Not-Self (when misaligned)</Text>
            <Text style={S.sigValue}>{data.hdNotSelf || tc.notSelf}</Text>
          </View>
        </View>

        {/* Plain language */}
        <View style={S.plainBlock}>
          <Text style={S.plainText}>{tc.plain}</Text>
        </View>

        {/* Recognition cues */}
        <Text style={S.recognizeLabel}>You may recognize this when…</Text>
        <View style={S.recognizeList}>
          {tc.recognize.map((item, i) => (
            <View key={i} style={S.recognizeItem}>
              <View style={S.recognizeDot} />
              <Text style={S.recognizeText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Watch for / Try this */}
        <View style={S.promptRow}>
          <View style={[S.promptBlock, { borderTopColor: C.crimson }]}>
            <Text style={[S.promptLabel, { color: C.crimson }]}>Watch for</Text>
            <Text style={S.promptText}>{tc.watchFor}</Text>
          </View>
          <View style={[S.promptBlock, { borderTopColor: C.emerald }]}>
            <Text style={[S.promptLabel, { color: C.emerald }]}>Try this</Text>
            <Text style={S.promptText}>{tc.tryThis}</Text>
          </View>
        </View>
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNum}>11</Text>
      </View>
    </Page>
  );
}
