/**
 * Page 19 — Your Life Path
 * Primary Road page. Compound number displayed (e.g., 34/7).
 * Core direction, gifts, shadow pattern. Copy frame applied.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../shared/PageComponents';
import { C, F, PAGE } from '../tokens';
import { LIFE_PATH_CONTENT } from './road-content';
import type { ReportData } from '../tokens';

const S = StyleSheet.create({
  page: { backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  emeraldLine: { width: PAGE.width, height: 2, backgroundColor: C.emerald },

  content: {
    flex: 1, paddingHorizontal: PAGE.marginH,
    paddingTop: 40, paddingBottom: PAGE.marginV,
  },

  sectionTag: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 2.5, color: C.parchmentFaint,
    textTransform: 'uppercase', marginBottom: 8,
  },
  heading: {
    fontFamily: F.display, fontSize: 22, fontWeight: 400,
    color: C.base, lineHeight: 1.15, marginBottom: 16,
  },
  headingRule: {
    width: PAGE.contentWidth, height: 0.5,
    backgroundColor: C.base, opacity: 0.1, marginBottom: 16,
  },

  // Compound number hero
  numberHeroRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    gap: 14, marginBottom: 20,
  },
  compoundNumber: {
    fontFamily: F.display, fontSize: 64, fontWeight: 700,
    color: C.emerald, lineHeight: 0.92, letterSpacing: -2,
  },
  numberMeta: { flexDirection: 'column', gap: 4, paddingBottom: 8 },
  numberName: {
    fontFamily: F.display, fontSize: 18, fontWeight: 400,
    fontStyle: 'italic', color: C.base,
  },
  numberNote: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 300,
    color: C.parchmentFaint, lineHeight: 1.5, maxWidth: 220,
  },

  // Direction line
  direction: {
    fontFamily: F.display, fontSize: 11, fontWeight: 400,
    fontStyle: 'italic', color: C.base, lineHeight: 1.5,
    marginBottom: 16, opacity: 0.8,
  },

  // Plain language
  plainText: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300,
    color: C.base, lineHeight: 1.5, opacity: 0.85, marginBottom: 14,
  },

  // Gifts row
  giftsRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14,
  },
  giftTag: {
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: C.emeraldLight,
    borderWidth: 0.5, borderColor: C.emerald, borderStyle: 'solid',
  },
  giftText: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 400, color: C.emeraldDim,
  },

  // Recognition
  recognizeLabel: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase', color: C.parchmentFaint,
    marginBottom: 8,
  },
  recognizeList: { gap: 5, marginBottom: 14 },
  recognizeItem: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  recognizeDot: {
    width: 3, height: 3, borderRadius: 1.5,
    backgroundColor: C.emerald, marginTop: 5, flexShrink: 0,
  },
  recognizeText: {
    flex: 1, fontFamily: F.sans, fontSize: 10.5, fontWeight: 300,
    color: C.base, lineHeight: 1.5, opacity: 0.85,
  },

  // Watch for / Try this
  promptRow: { flexDirection: 'row', gap: 12 },
  promptBlock: {
    flex: 1, padding: 12, gap: 4, backgroundColor: '#F0EEE9',
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
  data: Pick<ReportData, 'lifePath' | 'lifePathDisplay' | 'lifePathCompound'>;
}

export default function Page19LifePath({ data }: Props) {
  const lp = LIFE_PATH_CONTENT[data.lifePath] ?? LIFE_PATH_CONTENT[7]!;

  // Explain compound once if compound differs from reduced
  const hasCompound = data.lifePathCompound !== data.lifePath;
  const compoundNote = hasCompound
    ? `${data.lifePathCompound} reduces to ${data.lifePath}. The ${data.lifePathCompound} layer describes the specific route; the ${data.lifePath} describes the destination. Both are active.`
    : `Life Path ${data.lifePath} — no compound reduction.`;

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.emeraldLine} />

      <View style={S.content}>
        <Text style={S.sectionTag}>Section 4 — The Road</Text>
        <Text style={S.heading}>Your Life Path</Text>
        <View style={S.headingRule} />

        {/* Compound number hero */}
        <View style={S.numberHeroRow}>
          <Text style={S.compoundNumber}>{data.lifePathDisplay}</Text>
          <View style={S.numberMeta}>
            <Text style={S.numberName}>{lp.name}</Text>
            <Text style={S.numberNote}>{compoundNote}</Text>
          </View>
        </View>

        {/* Direction */}
        <Text style={S.direction}>{lp.direction}</Text>

        {/* Plain language */}
        <Text style={S.plainText}>{lp.plain}</Text>

        {/* Gifts */}
        <View style={S.giftsRow}>
          {lp.gifts.map(g => (
            <View key={g} style={S.giftTag}><Text style={S.giftText}>{g}</Text></View>
          ))}
        </View>

        {/* Recognition cues */}
        <Text style={S.recognizeLabel}>You may recognize this when…</Text>
        <View style={S.recognizeList}>
          {lp.recognize.map((item, i) => (
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
            <Text style={S.promptText}>{lp.watchFor}</Text>
          </View>
          <View style={[S.promptBlock, { borderTopColor: C.emerald }]}>
            <Text style={[S.promptLabel, { color: C.emerald }]}>Try this</Text>
            <Text style={S.promptText}>{lp.tryThis}</Text>
          </View>
        </View>
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNum}>19</Text>
      </View>
    </Page>
  );
}
