/**
 * Page 17 — Vehicle Field Practice
 * Seven-day Authority or Strategy experiment.
 * One daily observation question. Amber footer.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../shared/PageComponents';
import { C, F, PAGE } from '../tokens';
import { TYPE_CONTENT, AUTHORITY_CONTENT } from './hd-content';
import type { ReportData } from '../tokens';

const S = StyleSheet.create({
  page: { backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  amberLine: { width: PAGE.width, height: 2, backgroundColor: C.amber },
  content: { flex: 1, paddingHorizontal: PAGE.marginH, paddingTop: 40, paddingBottom: 20 },

  sectionTag: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 2.5, color: C.parchmentFaint, textTransform: 'uppercase', marginBottom: 8,
  },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  headingPrefix: { fontFamily: F.sans, fontSize: 10.5, fontWeight: 400, color: C.parchmentFaint },
  heading: { fontFamily: F.display, fontSize: 20, fontWeight: 400, color: C.base, lineHeight: 1.15 },
  subheading: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.parchmentFaint,
    lineHeight: 1.5, marginBottom: 20,
  },
  headingRule: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 20 },

  // Experiment banner
  banner: { padding: 16, backgroundColor: C.base, marginBottom: 16, gap: 4 },
  bannerLabel: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase', color: C.amber, opacity: 0.75,
  },
  bannerTitle: {
    fontFamily: F.display, fontSize: 16, fontWeight: 400, color: C.parchment, lineHeight: 1.2,
  },

  // Premise
  premise: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.base,
    lineHeight: 1.5, opacity: 0.85, marginBottom: 20,
  },

  // Daily observation question
  observeLabel: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 2.2, textTransform: 'uppercase', color: C.parchmentFaint, marginBottom: 8,
  },
  observeBlock: {
    padding: 14, backgroundColor: '#F5F3EE',
    borderTopWidth: 2, borderTopColor: C.amber, borderTopStyle: 'solid', marginBottom: 20,
  },
  observeText: {
    fontFamily: F.display, fontSize: 12, fontWeight: 400, fontStyle: 'italic',
    color: C.base, lineHeight: 1.5,
  },

  // Seven-day tracker
  trackerLabel: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 2.2, textTransform: 'uppercase', color: C.parchmentFaint, marginBottom: 10,
  },
  trackerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  trackerDay: {
    width: 60, paddingVertical: 10, paddingHorizontal: 8,
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.15)',
    alignItems: 'center', gap: 4,
  },
  trackerDayNum: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500, color: C.parchmentFaint, letterSpacing: 1,
  },
  trackerDayLine: { width: 36, height: 0.5, backgroundColor: C.base, opacity: 0.2 },
  trackerDayLine2: { width: 36, height: 0.5, backgroundColor: C.base, opacity: 0.2, marginTop: 8 },

  // Amber footer band
  amberFooterBand: {
    backgroundColor: C.amber, paddingVertical: 14, paddingHorizontal: PAGE.marginH,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  amberFooterLeft: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500,
    letterSpacing: 1.5, textTransform: 'uppercase', color: C.base, opacity: 0.7,
  },
  amberFooterRight: {
    fontFamily: F.display, fontSize: 10.5, fontWeight: 400, fontStyle: 'italic', color: C.base,
  },
  amberPageNum: {
    paddingHorizontal: PAGE.marginH, paddingBottom: 12,
    flexDirection: 'row', justifyContent: 'flex-end',
    backgroundColor: C.amber,
  },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.baseSoft, opacity: 0.5 },
});

const DAYS = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

interface Props {
  data: Pick<ReportData, 'hdType' | 'hdAuthority' | 'firstName'>;
}

export default function Page17VehiclePractice({ data }: Props) {
  const tc = TYPE_CONTENT[data.hdType] ?? TYPE_CONTENT['Generator']!;

  const authorityKey = Object.keys(AUTHORITY_CONTENT).find(k =>
    data.hdAuthority.toLowerCase().includes(k.toLowerCase())
  ) ?? 'Sacral';
  const ac = AUTHORITY_CONTENT[authorityKey] ?? AUTHORITY_CONTENT['Sacral']!;

  // Determine if experiment focuses on Authority or Strategy
  // Strip leading 'The ' from title to prevent 'The The Yes/No Reset'
  const resetTitle = ac.reset.title.replace(/^The /, '');
  const experimentTitle = `The ${resetTitle} — Seven Days`;
  const premise = ac.reset.instruction + ' Repeat this practice once daily for seven days. Notice what changes.';

  // Daily observation question (from strategy practice)
  const dailyQuestion = `At the end of each day: did I act from ${data.hdAuthority} Authority — or from what I thought I should do?`;

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.amberLine} />

      <View style={S.content}>
        <Text style={S.sectionTag}>Section 3 — The Vehicle</Text>
        <View style={S.headingRow}>
          <Text style={S.headingPrefix}>Vehicle</Text>
          <Text style={[S.headingPrefix, { opacity: 0.3 }]}>·</Text>
          <Text style={S.heading}>Field Practice</Text>
        </View>
        <Text style={S.subheading}>
          One experiment. One question. Seven days. The field teaches what pages cannot.
        </Text>
        <View style={S.headingRule} />

        {/* Experiment banner */}
        <View style={S.banner}>
          <Text style={S.bannerLabel}>{data.hdType} · {data.hdAuthority} Authority</Text>
          <Text style={S.bannerTitle}>{experimentTitle}</Text>
        </View>

        {/* Premise */}
        <Text style={S.premise}>{premise}</Text>

        {/* Daily observation question */}
        <Text style={S.observeLabel}>Daily Observation Question</Text>
        <View style={S.observeBlock}>
          <Text style={S.observeText}>{dailyQuestion}</Text>
        </View>

        {/* Seven-day tracker */}
        <Text style={S.trackerLabel}>Seven-Day Tracker — Note One Word Per Day</Text>
        <View style={S.trackerGrid}>
          {DAYS.map((day) => (
            <View key={day} style={S.trackerDay}>
              <Text style={S.trackerDayNum}>{day}</Text>
              <View style={S.trackerDayLine} />
              <View style={S.trackerDayLine2} />
            </View>
          ))}
        </View>
      </View>

      {/* Amber footer band */}
      <View style={S.amberFooterBand}>
        <Text style={S.amberFooterLeft}>The Vehicle · Section 3 Complete</Text>
        <Text style={S.amberFooterRight}>
          Continue to The Road — page 18
        </Text>
      </View>
      <View style={S.amberPageNum}>
        <Text style={S.pageNum}>17</Text>
      </View>
    </Page>
  );
}
