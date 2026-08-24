/**
 * Page 34 — The Sovereign Operating System
 * Section divider. Reintroduces all three dimensions as a coordinated instrument set.
 * Design: three equal colored bars, all three system labels, unified framing.
 */
import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../shared/PageComponents';
import { C, F, PAGE } from '../tokens';
import type { ReportData } from '../tokens';

const S = StyleSheet.create({
  page: { backgroundColor: C.base, padding: 0, fontFamily: F.sans },
  triBar: { flexDirection: 'row', width: PAGE.width },
  barAmber:   { flex: 1, height: 3, backgroundColor: C.amber },
  barEmerald: { flex: 1, height: 3, backgroundColor: C.emerald },
  barCrimson: { flex: 1, height: 3, backgroundColor: C.crimson },
  content: { flex: 1, paddingHorizontal: PAGE.marginH, justifyContent: 'center' },
  sectionNum: { fontFamily: F.sans, fontSize: 8.5, fontWeight: 500, letterSpacing: 3, color: C.parchmentFaint, textTransform: 'uppercase', marginBottom: 20, opacity: 0.5 },
  title: { fontFamily: F.display, fontSize: 13, fontWeight: 400, fontStyle: 'italic', color: C.parchmentDim, letterSpacing: 0.3, marginBottom: 10 },
  mainTitle: { fontFamily: F.display, fontSize: 32, fontWeight: 700, color: C.parchment, lineHeight: 1.05, letterSpacing: -0.3, marginBottom: 40 },
  rule: { width: 280, height: 0.5, backgroundColor: C.parchment, opacity: 0.15, marginBottom: 32 },

  // Three system labels in a row
  systemRow: { flexDirection: 'row', gap: 0, marginBottom: 40 },
  systemBlock: { flexDirection: 'row', alignItems: 'center', gap: 7, marginRight: 24 },
  systemDot: { width: 5, height: 5 },
  systemLabel: { fontFamily: F.sans, fontSize: 8.5, fontWeight: 400, letterSpacing: 1.2, textTransform: 'uppercase' },
  systemSep: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint, opacity: 0.3, marginRight: 24 },

  // The framing statement
  statement: { fontFamily: F.display, fontSize: 16, fontWeight: 400, fontStyle: 'italic', color: C.parchment, lineHeight: 1.5, maxWidth: 380, opacity: 0.85 },
  pagesNote: { fontFamily: F.sans, fontSize: 7, fontWeight: 400, letterSpacing: 1.8, color: C.parchmentFaint, textTransform: 'uppercase', marginTop: 36, opacity: 0.5 },

  bottom: { paddingHorizontal: PAGE.marginH, paddingBottom: 36, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  footerLeft: { fontFamily: F.sans, fontSize: 8.5, fontWeight: 500, letterSpacing: 2, color: C.parchmentFaint, textTransform: 'uppercase', opacity: 0.45 },
  pageNum: { fontFamily: F.sans, fontSize: 8.5, color: C.parchmentFaint, opacity: 0.45 },
});

interface Props {
  data: Pick<ReportData, 'firstName' | 'hdType' | 'lifePath' | 'sunSign'>;
}

export default function Page34SOSDivider({ data }: Props) {
  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines variant="dark" />

      <View style={S.triBar}>
        <View style={S.barAmber} />
        <View style={S.barEmerald} />
        <View style={S.barCrimson} />
      </View>

      <View style={S.content}>
        <Text style={S.sectionNum}>Section VI · Pages 34–39</Text>
        <Text style={S.title}>The</Text>
        <Text style={S.mainTitle}>Sovereign{'\n'}Operating{'\n'}System</Text>
        <View style={S.rule} />

        {/* Three system labels */}
        <View style={S.systemRow}>
          <View style={S.systemBlock}>
            <View style={[S.systemDot, { backgroundColor: C.amber }]} />
            <Text style={[S.systemLabel, { color: C.amber }]}>The Vehicle</Text>
          </View>
          <Text style={S.systemSep}>×</Text>
          <View style={S.systemBlock}>
            <View style={[S.systemDot, { backgroundColor: C.emerald }]} />
            <Text style={[S.systemLabel, { color: C.emerald }]}>The Road</Text>
          </View>
          <Text style={S.systemSep}>×</Text>
          <View style={S.systemBlock}>
            <View style={[S.systemDot, { backgroundColor: C.crimson }]} />
            <Text style={[S.systemLabel, { color: C.crimson }]}>The Stoplight</Text>
          </View>
        </View>

        <Text style={S.statement}>
          Three instruments. One navigation.{'\n'}
          Each answers a different question.{'\n'}
          None replaces the others.
        </Text>
        <Text style={S.pagesNote}>
          {data.hdType} · Life Path {data.lifePath} · {data.sunSign} Sun
        </Text>
      </View>

      <View style={S.bottom}>
        <Text style={S.footerLeft}>T3D Sovereign Report</Text>
        <Text style={S.pageNum}>34</Text>
      </View>
    </Page>
  );
}
