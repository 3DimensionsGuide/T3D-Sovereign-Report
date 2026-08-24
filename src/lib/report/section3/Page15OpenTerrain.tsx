/**
 * Page 15 — Your Open Terrain
 * Open centers as sensitivity, amplification, and wisdom — not defects.
 * Maximum 3 high-impact themes selected by priority.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../shared/PageComponents';
import { C, F, PAGE } from '../tokens';
import { ALL_CENTERS, OPEN_CENTER_THEMES } from './hd-content';
import type { ReportData } from '../tokens';

const S = StyleSheet.create({
  page: { backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  amberLine: { width: PAGE.width, height: 1.5, backgroundColor: C.amber },
  content: { flex: 1, paddingHorizontal: PAGE.marginH, paddingTop: 40, paddingBottom: PAGE.marginV },

  sectionTag: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 2.5, color: C.parchmentFaint, textTransform: 'uppercase', marginBottom: 8,
  },
  heading: { fontFamily: F.display, fontSize: 22, fontWeight: 400, color: C.base, lineHeight: 1.15, marginBottom: 8 },
  subheading: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.parchmentFaint,
    lineHeight: 1.5, marginBottom: 20, maxWidth: 400,
  },
  headingRule: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 20 },

  // Theme blocks
  themeList: { flexDirection: 'column', gap: 0 },
  themeBlock: {
    paddingVertical: 16, paddingHorizontal: 0,
    borderBottomWidth: 0.5, borderBottomColor: C.base, borderBottomStyle: 'solid',
    gap: 8,
  },
  themeBlockLast: { paddingVertical: 16, paddingHorizontal: 0, gap: 8 },

  themeHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  themeOpenBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 0.5, borderColor: C.base, borderStyle: 'solid',
    borderRadius: 1,
  },
  themeOpenText: {
    fontFamily: F.sans, fontSize: 6, fontWeight: 500,
    letterSpacing: 1.8, textTransform: 'uppercase', color: C.parchmentFaint,
  },
  themeTitle: { fontFamily: F.display, fontSize: 14, fontWeight: 400, color: C.base },

  // Three rows: sensitivity / wisdom / reframe
  themeRows: { flexDirection: 'column', gap: 7 },
  themeRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  themeRowLabel: {
    width: 70, flexShrink: 0,
    fontFamily: F.sans, fontSize: 8, fontWeight: 500,
    letterSpacing: 1.5, textTransform: 'uppercase', color: C.parchmentFaint, marginTop: 1,
  },
  themeRowText: {
    flex: 1, fontFamily: F.sans, fontSize: 10.5, fontWeight: 300,
    color: C.base, lineHeight: 1.5, opacity: 0.85,
  },
  themeNotDefect: {
    flex: 1, fontFamily: F.display, fontSize: 10.5, fontWeight: 400,
    fontStyle: 'italic', color: C.base, lineHeight: 1.55, opacity: 0.7,
  },

  // Closing note
  note: {
    marginTop: 20, paddingTop: 14,
    borderTopWidth: 0.5, borderTopColor: C.base, borderTopStyle: 'solid',
  },
  noteText: {
    fontFamily: F.display, fontSize: 10.5, fontWeight: 400, fontStyle: 'italic',
    color: C.base, lineHeight: 1.5, opacity: 0.65,
  },

  footer: {
    paddingHorizontal: PAGE.marginH, paddingBottom: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: { fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2, color: C.parchmentFaint, textTransform: 'uppercase' },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

interface Props {
  data: Pick<ReportData, 'hdDefinedCenters'>;
}

export default function Page15OpenTerrain({ data }: Props) {
  // Derive open centers
  const defined = new Set(data.hdDefinedCenters);
  const openCenters = ALL_CENTERS.filter(c => !defined.has(c));

  // Select top 3 by priority
  const themes = openCenters
    .map(center => ({ center, theme: OPEN_CENTER_THEMES[center] }))
    .filter(({ theme }) => !!theme)
    .sort((a, b) => (b.theme?.priority ?? 0) - (a.theme?.priority ?? 0))
    .slice(0, 3);

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.amberLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Section 3 — The Vehicle</Text>
        <Text style={S.heading}>Your Open Terrain</Text>
        <Text style={S.subheading}>
          Open centers are places of sensitivity and amplification — not weakness. Over time, they become sources of nuanced wisdom that defined centers rarely produce.
        </Text>
        <View style={S.headingRule} />

        <View style={S.themeList}>
          {themes.map(({ theme }, i) => (
            <View key={theme!.title} style={i === themes.length - 1 ? S.themeBlockLast : S.themeBlock}>
              <View style={S.themeHeaderRow}>
                <View style={S.themeOpenBadge}>
                  <Text style={S.themeOpenText}>Open</Text>
                </View>
                <Text style={S.themeTitle}>{theme!.title}</Text>
              </View>
              <View style={S.themeRows}>
                <View style={S.themeRow}>
                  <Text style={S.themeRowLabel}>Sensitivity</Text>
                  <Text style={S.themeRowText}>{theme!.sensitivity}</Text>
                </View>
                <View style={S.themeRow}>
                  <Text style={S.themeRowLabel}>Wisdom</Text>
                  <Text style={S.themeRowText}>{theme!.wisdom}</Text>
                </View>
                <View style={S.themeRow}>
                  <Text style={S.themeRowLabel}>Reframe</Text>
                  <Text style={S.themeNotDefect}>{theme!.notDefect}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={S.note}>
          <Text style={S.noteText}>
            Open terrain is where you learn about the world — by amplifying what moves through you. The wisdom is not in suppressing the sensitivity. It is in learning to recognize whose energy you are carrying.
          </Text>
        </View>
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNum}>15</Text>
      </View>
    </Page>
  );
}
