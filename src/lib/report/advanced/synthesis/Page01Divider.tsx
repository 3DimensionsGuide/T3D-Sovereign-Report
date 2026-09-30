/**
 * Advanced Sovereign Report — Section IV — The Integration — Divider
 *
 * Closing section of the Advanced Report. The reader has now been through
 * three fully deepened systems (Vehicle, Road, Stoplight), each ending in
 * its own synthesis. This section doesn't add a fourth system — it answers
 * the question the first three leave open: now that you have all of this,
 * how do you actually run it as one instrument instead of three separate
 * readings pulling in three directions?
 *
 * Same divider grammar as the other three section dividers (dark page,
 * signal line, one question, no dense copy), but the signal line is split
 * three ways — amber / emerald / crimson — rather than one section color,
 * since this page belongs to all three systems at once, not one of them.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../../shared/PageComponents';
import { C, F, PAGE } from '../../tokens';

const S = StyleSheet.create({
  page: {
    backgroundColor: C.base,
    padding: 0,
    fontFamily: F.sans,
  },

  triLine: {
    width: PAGE.width,
    height: 2,
    flexDirection: 'row',
  },
  triLineSeg: { flex: 1, height: 2 },

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
    maxWidth: 420,
    opacity: 0.85,
  },

  triadRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 36,
  },
  triadItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  triadDot: { width: 6, height: 6, borderRadius: 3 },
  triadLabel: {
    fontFamily: F.sans,
    fontSize: 7.5,
    fontWeight: 500,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: C.parchmentFaint,
  },

  pagesNote: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 400,
    letterSpacing: 1.8,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
    marginTop: 20,
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

export default function Page01IntegrationDivider() {
  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines variant="dark" />

      <View style={S.triLine}>
        <View style={[S.triLineSeg, { backgroundColor: C.amber }]} />
        <View style={[S.triLineSeg, { backgroundColor: C.emerald }]} />
        <View style={[S.triLineSeg, { backgroundColor: C.crimson }]} />
      </View>

      <View style={S.content}>
        <Text style={S.sectionNum}>Section IV · The Integration</Text>
        <Text style={S.sectionTitle}>Now,</Text>
        <Text style={S.sectionSubtitle}>Drive</Text>
        <View style={S.rule} />
        <Text style={S.question}>
          &ldquo;You now have the mechanics, the season, and{'\n'}the weather. The last question isn&rsquo;t what{'\n'}each one says — it&rsquo;s which one gets the final say.&rdquo;
        </Text>

        <View style={S.triadRow}>
          <View style={S.triadItem}>
            <View style={[S.triadDot, { backgroundColor: C.amber }]} />
            <Text style={S.triadLabel}>Vehicle · How</Text>
          </View>
          <View style={S.triadItem}>
            <View style={[S.triadDot, { backgroundColor: C.emerald }]} />
            <Text style={S.triadLabel}>Road · Why</Text>
          </View>
          <View style={S.triadItem}>
            <View style={[S.triadDot, { backgroundColor: C.crimson }]} />
            <Text style={S.triadLabel}>Stoplight · When</Text>
          </View>
        </View>

        <Text style={S.pagesNote}>Vehicle + Road + Stoplight · Integration</Text>
      </View>

      <View style={S.bottom} fixed>
        <Text style={S.typeLabel}>T3D Advanced Sovereign Report</Text>
        <Text style={S.pageNum} render={({ pageNumber }) => pageNumber} />
      </View>
    </Page>
  );
}
