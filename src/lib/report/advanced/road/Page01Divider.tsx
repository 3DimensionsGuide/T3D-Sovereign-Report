/**
 * Advanced Sovereign Report — Road Section — Divider
 *
 * You already know your Life Path (base report). This section is about the
 * layers underneath it: the name-encoded numbers (Hidden Passion, Karmic
 * Lessons) and the timing terrain (Pinnacles, Challenges) that shape how
 * that Life Path actually gets walked, decade by decade. Same divider
 * grammar as the Vehicle section's Page01Divider — dark, signal line in
 * the section's own color, one question, no dense copy.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../../shared/PageComponents';
import { C, F, PAGE } from '../../tokens';
import type { ReportData } from '../../tokens';

const S = StyleSheet.create({
  page: {
    backgroundColor: C.base,
    padding: 0,
    fontFamily: F.sans,
  },

  emeraldLine: {
    width: PAGE.width,
    height: 2,
    backgroundColor: C.emerald,
  },

  content: {
    flex: 1,
    paddingHorizontal: PAGE.marginH,
    justifyContent: 'center',
    gap: 0,
  },

  sectionNum: {
    fontFamily: F.sans,
    fontSize: 8.5,
    fontWeight: 500,
    letterSpacing: 3,
    color: C.emerald,
    textTransform: 'uppercase',
    marginBottom: 20,
    opacity: 0.7,
  },

  sectionTitle: {
    fontFamily: F.display,
    fontSize: 32,
    fontWeight: 700,
    color: C.parchment,
    lineHeight: 1.0,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontFamily: F.display,
    fontSize: 28,
    fontWeight: 400,
    fontStyle: 'italic',
    color: C.emerald,
    lineHeight: 1.1,
    marginBottom: 48,
  },

  rule: {
    width: 280,
    height: 0.5,
    backgroundColor: C.parchment,
    opacity: 0.15,
    marginBottom: 48,
  },

  question: {
    fontFamily: F.display,
    fontSize: 18,
    fontWeight: 400,
    fontStyle: 'italic',
    color: C.parchment,
    lineHeight: 1.5,
    maxWidth: 400,
    opacity: 0.85,
  },

  pagesNote: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 400,
    letterSpacing: 1.8,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
    marginTop: 36,
    opacity: 0.5,
  },

  bottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: PAGE.marginH,
    paddingBottom: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  typeLabel: {
    fontFamily: F.sans,
    fontSize: 8.5,
    fontWeight: 500,
    letterSpacing: 2,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
    opacity: 0.45,
  },
  pageNum: {
    fontFamily: F.sans,
    fontSize: 8.5,
    color: C.parchmentFaint,
    opacity: 0.45,
  },
});

interface Props {
  data: Pick<ReportData, 'lifePath'>;
}

export default function Page01RoadDivider({ data }: Props) {
  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines variant="dark" />

      <View style={S.emeraldLine} />

      <View style={S.content}>
        <Text style={S.sectionNum}>Section II · The Road, Deepened</Text>
        <Text style={S.sectionTitle}>Beneath the</Text>
        <Text style={S.sectionSubtitle}>Terrain</Text>
        <View style={S.rule} />
        <Text style={S.question}>
          &ldquo;You already know your Life Path.{'\n'}Now: what does your name already encode — and{'\n'}when does the ground actually shift beneath you?&rdquo;
        </Text>
        <Text style={S.pagesNote}>Numerology · Life Path {data.lifePath} · Advanced Depth</Text>
      </View>

      <View style={S.bottom} fixed>
        <Text style={S.typeLabel}>T3D Advanced Sovereign Report</Text>
        <Text style={S.pageNum} render={({ pageNumber }) => pageNumber} />
      </View>
    </Page>
  );
}
