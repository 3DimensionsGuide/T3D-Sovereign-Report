/**
 * Page 12 — Your Authority: The Way You Know
 * The most important Vehicle page.
 * Decision-making mechanism, false urgency pattern, do/do not table, reset practice.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../shared/PageComponents';
import { C, F, PAGE } from '../tokens';
import { AUTHORITY_CONTENT } from './hd-content';
import type { ReportData } from '../tokens';

const S = StyleSheet.create({
  page: { backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  amberLine: { width: PAGE.width, height: 2, backgroundColor: C.amber },

  content: {
    flex: 1, paddingHorizontal: PAGE.marginH,
    paddingTop: 40, paddingBottom: PAGE.marginV,
  },

  sectionTag: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 2.5, color: C.parchmentFaint,
    textTransform: 'uppercase', marginBottom: 8,
  },
  headingRow: { flexDirection: 'row', alignItems: 'baseline', gap: 12, marginBottom: 6 },
  heading: {
    fontFamily: F.display, fontSize: 22, fontWeight: 400, color: C.base, lineHeight: 1.15,
  },
  authorityBadge: {
    fontFamily: F.display, fontSize: 14, fontWeight: 400, fontStyle: 'italic',
    color: C.amber,
  },
  headingRule: {
    width: PAGE.contentWidth, height: 0.5,
    backgroundColor: C.base, opacity: 0.1, marginBottom: 18,
  },

  // ── Most important label ────────────────────────────────────────────────
  importantBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 16, opacity: 0.7,
  },
  importantLine: { width: 24, height: 0.5, backgroundColor: C.amberDim },
  importantText: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase', color: C.amberDim,
  },

  // ── Mechanism block ───────────────────────────────────────────────────────
  blockLabel: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase', color: C.parchmentFaint,
    marginBottom: 6,
  },
  bodyText: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300,
    color: C.base, lineHeight: 1.5, opacity: 0.85, marginBottom: 14,
  },

  // ── False urgency block ───────────────────────────────────────────────────
  urgencyBlock: {
    padding: 14, marginBottom: 16,
    backgroundColor: '#FDF5E8',
    borderLeftWidth: 2, borderLeftColor: C.amberDim, borderLeftStyle: 'solid',
  },
  urgencyLabel: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase', color: C.amberDim, marginBottom: 5,
  },
  urgencyText: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300,
    color: C.base, lineHeight: 1.5, opacity: 0.9,
  },

  // ── Do / Do Not table ─────────────────────────────────────────────────────
  tableRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  tableCol: { flex: 1, gap: 0 },
  tableHeader: {
    padding: '8 12', marginBottom: 0,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  tableHeaderDo: { backgroundColor: C.emerald },
  tableHeaderDoNot: { backgroundColor: C.crimson },
  tableHeaderText: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 700,
    letterSpacing: 2, textTransform: 'uppercase', color: C.parchment,
  },
  tableItem: {
    flexDirection: 'row', gap: 8, padding: '7 12',
    alignItems: 'flex-start',
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(13,13,14,0.08)',
  },
  tableItemLast: {
    flexDirection: 'row', gap: 8, padding: '7 12', alignItems: 'flex-start',
  },
  tableBullet: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 500,
    marginTop: 1, flexShrink: 0,
  },
  tableText: {
    flex: 1, fontFamily: F.sans, fontSize: 10.5,
    fontWeight: 300, color: C.base, lineHeight: 1.55, opacity: 0.85,
  },

  // ── Reset practice ─────────────────────────────────────────────────────────
  resetBlock: {
    padding: 14, backgroundColor: C.base, gap: 6,
  },
  resetLabel: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase', color: C.amber, opacity: 0.8,
  },
  resetTitle: {
    fontFamily: F.display, fontSize: 12, fontWeight: 400, color: C.parchment,
  },
  resetText: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300,
    color: C.parchment, lineHeight: 1.5, opacity: 0.75,
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
  data: Pick<ReportData, 'hdAuthority'>;
}

export default function Page12Authority({ data }: Props) {
  // Match authority to content — look for partial match
  const authorityKey = Object.keys(AUTHORITY_CONTENT).find(k =>
    data.hdAuthority.toLowerCase().includes(k.toLowerCase())
  ) ?? 'Sacral';

  const ac = AUTHORITY_CONTENT[authorityKey] ?? AUTHORITY_CONTENT['Sacral']!;

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.amberLine} />

      <View style={S.content}>
        <Text style={S.sectionTag}>Section 3 — The Vehicle</Text>
        <View style={S.headingRow}>
          <Text style={S.heading}>Your Authority:</Text>
          <Text style={S.authorityBadge}>{data.hdAuthority}</Text>
        </View>
        <View style={S.headingRule} />

        {/* Most important label */}
        <View style={S.importantBanner}>
          <View style={S.importantLine} />
          <Text style={S.importantText}>The most important page in your Vehicle section</Text>
          <View style={S.importantLine} />
        </View>

        {/* Mechanism */}
        <Text style={S.blockLabel}>How It Works</Text>
        <Text style={S.bodyText}>{ac.mechanism}</Text>

        {/* False urgency */}
        <View style={S.urgencyBlock}>
          <Text style={S.urgencyLabel}>The Pattern That Overrides It</Text>
          <Text style={S.urgencyText}>{ac.falseUrgency}</Text>
        </View>

        {/* Do / Do Not table */}
        <View style={S.tableRow}>
          {/* DO column */}
          <View style={S.tableCol}>
            <View style={[S.tableHeader, S.tableHeaderDo]}>
              <Text style={S.tableHeaderText}>DO</Text>
            </View>
            {ac.doList.map((item, i) => (
              <View key={i} style={i === ac.doList.length - 1 ? S.tableItemLast : S.tableItem}>
                <Text style={[S.tableBullet, { color: C.emerald }]}>✓</Text>
                <Text style={S.tableText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* DO NOT column */}
          <View style={S.tableCol}>
            <View style={[S.tableHeader, S.tableHeaderDoNot]}>
              <Text style={S.tableHeaderText}>DO NOT</Text>
            </View>
            {ac.doNotList.map((item, i) => (
              <View key={i} style={i === ac.doNotList.length - 1 ? S.tableItemLast : S.tableItem}>
                <Text style={[S.tableBullet, { color: C.crimson }]}>✗</Text>
                <Text style={S.tableText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reset practice */}
        <View style={S.resetBlock}>
          <Text style={S.resetLabel}>Reset Practice</Text>
          <Text style={S.resetTitle}>{ac.reset.title}</Text>
          <Text style={S.resetText}>{ac.reset.instruction}</Text>
        </View>
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNum}>12</Text>
      </View>
    </Page>
  );
}
