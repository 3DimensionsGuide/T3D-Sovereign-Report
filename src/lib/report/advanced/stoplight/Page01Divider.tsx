/**
 * Advanced Sovereign Report — Stoplight Section — Divider
 *
 * You already know your Sun, Moon, and Rising (base report). This section
 * goes past the Big Three into the rest of the chart — the eight remaining
 * planets, and eventually the live sky itself. Same divider grammar as the
 * Vehicle and Road section dividers — dark, signal line in the section's
 * own color, one question, no dense copy — but in Crimson, the T3D
 * Stoplight color (timing, critical gates).
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

  crimsonLine: {
    width: PAGE.width,
    height: 2,
    backgroundColor: C.crimson,
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
    color: C.crimson,
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
    color: C.crimson,
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
  data: Pick<ReportData, 'sunSign'>;
}

export default function Page01StoplightDivider({ data }: Props) {
  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines variant="dark" />

      <View style={S.crimsonLine} />

      <View style={S.content}>
        <Text style={S.sectionNum}>Section III · The Stoplight, Deepened</Text>
        <Text style={S.sectionTitle}>Beneath the</Text>
        <Text style={S.sectionSubtitle}>Sky</Text>
        <View style={S.rule} />
        <Text style={S.question}>
          &ldquo;You already know your Sun, Moon, and Rising.{'\n'}Now: what do the other eight planets reveal — and{'\n'}when does the sky itself signal you to move?&rdquo;
        </Text>
        <Text style={S.pagesNote}>Astrology · Sun in {data.sunSign} · Advanced Depth</Text>
      </View>

      <View style={S.bottom} fixed>
        <Text style={S.typeLabel}>T3D Advanced Sovereign Report</Text>
        <Text style={S.pageNum} render={({ pageNumber }) => pageNumber} />
      </View>
    </Page>
  );
}
