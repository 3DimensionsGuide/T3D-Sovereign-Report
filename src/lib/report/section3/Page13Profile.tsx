/**
 * Page 13 — Your Profile: The Role You Help Through
 * Natural role, social learning pattern, relationship to visibility.
 * Lines are not labels — they are descriptions of living patterns.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../shared/PageComponents';
import { C, F, PAGE } from '../tokens';
import { PROFILE_CONTENT } from './hd-content';
import type { ReportData } from '../tokens';

const S = StyleSheet.create({
  page: { backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  amberLine: { width: PAGE.width, height: 1.5, backgroundColor: C.amber },

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
  profileBadge: {
    fontFamily: F.display, fontSize: 22, fontWeight: 700,
    color: C.amber,
  },
  headingRule: {
    width: PAGE.contentWidth, height: 0.5,
    backgroundColor: C.base, opacity: 0.1, marginBottom: 20,
  },

  // Plain language block
  plainBlock: {
    padding: 16, backgroundColor: '#F5F3EE',
    borderLeftWidth: 2, borderLeftColor: C.amber, borderLeftStyle: 'solid',
    marginBottom: 20,
  },
  plainText: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300,
    color: C.base, lineHeight: 1.5, opacity: 0.9,
  },

  // Three characteristic blocks
  charBlocks: { flexDirection: 'column', gap: 0 },
  charBlock: {
    paddingVertical: 16, paddingHorizontal: 0,
    borderBottomWidth: 0.5, borderBottomColor: C.base,
    borderBottomStyle: 'solid', gap: 6,
  },
  charBlockLast: {
    paddingVertical: 16, paddingHorizontal: 0, gap: 6,
  },
  charRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  charBadge: {
    width: 56, flexShrink: 0, gap: 2,
  },
  charBadgeLabel: {
    fontFamily: F.sans, fontSize: 6, fontWeight: 500,
    letterSpacing: 1.5, textTransform: 'uppercase', color: C.parchmentFaint,
  },
  charBadgeName: {
    fontFamily: F.display, fontSize: 10.5, fontWeight: 400,
    fontStyle: 'italic', color: C.amber, lineHeight: 1.2,
  },
  charDivider: {
    width: 0.5, height: 48, backgroundColor: C.base, opacity: 0.12, flexShrink: 0,
  },
  charText: {
    flex: 1, fontFamily: F.sans, fontSize: 10.5, fontWeight: 300,
    color: C.base, lineHeight: 1.5, opacity: 0.85,
  },

  // Framing note
  framingNote: {
    marginTop: 16, paddingTop: 14,
    borderTopWidth: 0.5, borderTopColor: C.base, borderTopStyle: 'solid',
  },
  framingText: {
    fontFamily: F.display, fontSize: 10.5, fontWeight: 400,
    fontStyle: 'italic', color: C.base, lineHeight: 1.5, opacity: 0.65,
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
  data: Pick<ReportData, 'hdProfile'>;
}

export default function Page13Profile({ data }: Props) {
  const pc = PROFILE_CONTENT[data.hdProfile] ?? PROFILE_CONTENT['1/3']!;

  const characteristics = [
    { label: 'Natural', name: 'Role',           text: pc.role },
    { label: 'Social',  name: 'Learning',        text: pc.socialPattern },
    { label: 'Towards', name: 'Visibility',      text: pc.visibility },
  ];

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.amberLine} />

      <View style={S.content}>
        <Text style={S.sectionTag}>Section 3 — The Vehicle</Text>
        <View style={S.headingRow}>
          <Text style={S.heading}>Your Profile:</Text>
          <Text style={S.profileBadge}>{data.hdProfile}</Text>
        </View>
        <View style={S.headingRule} />

        {/* Plain language */}
        <View style={S.plainBlock}>
          <Text style={S.plainText}>{pc.plain}</Text>
        </View>

        {/* Three characteristic blocks */}
        <View style={S.charBlocks}>
          {characteristics.map((ch, i) => (
            <View key={ch.name} style={i === characteristics.length - 1 ? S.charBlockLast : S.charBlock}>
              <View style={S.charRow}>
                <View style={S.charBadge}>
                  <Text style={S.charBadgeLabel}>{ch.label}</Text>
                  <Text style={S.charBadgeName}>{ch.name}</Text>
                </View>
                <View style={S.charDivider} />
                <Text style={S.charText}>{ch.text}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Framing note */}
        <View style={S.framingNote}>
          <Text style={S.framingText}>
            Profile lines describe patterns of living — not fixed identities. Hold this as an orientation toward what tends to be true, not a ceiling on what is possible.
          </Text>
        </View>
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNum}>13</Text>
      </View>
    </Page>
  );
}
