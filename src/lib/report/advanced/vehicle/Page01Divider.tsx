/**
 * Advanced Sovereign Report — Vehicle Section — Divider
 *
 * You already know what you are (base report). This section is about why
 * you're built that way, and how to actually run the machine day to day.
 * Same divider grammar as the base report's Page10VehicleDivider — dark,
 * amber signal line, one question, no dense copy — but reframed as a
 * continuation/deepening, not a restart.
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

  amberLine: {
    width: PAGE.width,
    height: 2,
    backgroundColor: C.amber,
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
    color: C.amber,
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
    color: C.amber,
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
  data: Pick<ReportData, 'hdType'>;
}

export default function Page01VehicleDivider({ data }: Props) {
  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines variant="dark" />

      <View style={S.amberLine} />

      <View style={S.content}>
        <Text style={S.sectionNum}>Section I · The Vehicle, Deepened</Text>
        <Text style={S.sectionTitle}>Beneath the</Text>
        <Text style={S.sectionSubtitle}>Surface</Text>
        <View style={S.rule} />
        <Text style={S.question}>
          "You already know what you are.{'\n'}Now: why are you wired this way — and{'\n'}how do you actually run the machine?"
        </Text>
        <Text style={S.pagesNote}>Human Design · {data.hdType} · Advanced Depth</Text>
      </View>

      <View style={S.bottom} fixed>
        <Text style={S.typeLabel}>T3D Advanced Sovereign Report</Text>
        <Text style={S.pageNum} render={({ pageNumber }) => pageNumber} />
      </View>
    </Page>
  );
}
