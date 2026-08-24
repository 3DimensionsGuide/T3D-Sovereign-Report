/**
 * Page 10 — The Vehicle: How You Move
 * Section divider page. Dark. Amber signal line. One question. No dense copy.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../shared/PageComponents';
import { C, F, PAGE } from '../tokens';
import type { ReportData } from '../tokens';

const S = StyleSheet.create({
  page: {
    backgroundColor: C.base,
    padding: 0,
    fontFamily: F.sans,
  },

  // Full-width amber signal line at top
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

  // Section number
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

  // Section title
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

  // Thin rule
  rule: {
    width: 280,
    height: 0.5,
    backgroundColor: C.parchment,
    opacity: 0.15,
    marginBottom: 48,
  },

  // The one question
  question: {
    fontFamily: F.display,
    fontSize: 18,
    fontWeight: 400,
    fontStyle: 'italic',
    color: C.parchment,
    lineHeight: 1.5,
    maxWidth: 380,
    opacity: 0.85,
  },

  // Pages range
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

  // Bottom — reader's type
  bottom: {
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

export default function Page10VehicleDivider({ data }: Props) {
  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines variant="dark" />


      {/* Amber signal line */}
      <View style={S.amberLine} />

      <View style={S.content}>
        <Text style={S.sectionNum}>Section III · Pages 10–17</Text>
        <Text style={S.sectionTitle}>The</Text>
        <Text style={S.sectionSubtitle}>Vehicle</Text>
        <View style={S.rule} />
        <Text style={S.question}>
          "How is your energy{'\n'}designed to enter life?"
        </Text>
        <Text style={S.pagesNote}>Human Design · {data.hdType}</Text>
      </View>

      <View style={S.bottom}>
        <Text style={S.typeLabel}>T3D Sovereign Report</Text>
        <Text style={S.pageNum}>10</Text>
      </View>
    </Page>
  );
}
