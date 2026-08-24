/**
 * Page 9 — Start Here: Your Seven-Day Experiment
 *
 * Reader need: "What Should I Do First?"
 *
 * One experiment based on the reader's highest-leverage configuration.
 * Three daily check-ins at most.
 * Worksheet style with notes area.
 * Personalized to HD Type.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../shared/PageComponents';
import { C, F, PAGE, TYPE_EXPERIMENT } from '../tokens';
import type { ReportData } from '../tokens';

const S = StyleSheet.create({
  page: {
    backgroundColor: '#F5F5F3',
    padding: 0,
    fontFamily: F.sans,
  },
  topRule: {
    width: PAGE.width,
    height: 2.5,
    backgroundColor: C.base,
  },

  content: {
    flex: 1,
    paddingHorizontal: PAGE.marginH,
    paddingTop: 40,
    paddingBottom: PAGE.marginV,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  sectionTag: {
    fontFamily: F.sans,
    fontSize: 8.5,
    fontWeight: 500,
    letterSpacing: 2.5,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 6,
  },
  headingPrefix: {
    fontFamily: F.sans,
    fontSize: 10.5,
    fontWeight: 400,
    color: C.parchmentFaint,
    letterSpacing: 0.5,
  },
  heading: {
    fontFamily: F.display,
    fontSize: 22,
    fontWeight: 400,
    color: C.base,
    lineHeight: 1.15,
  },
  subheading: {
    fontFamily: F.sans,
    fontSize: 10.5,
    fontWeight: 300,
    color: C.parchmentFaint,
    marginBottom: 20,
  },
  headingRule: {
    width: PAGE.contentWidth,
    height: 0.5,
    backgroundColor: C.base,
    opacity: 0.1,
    marginBottom: 20,
  },

  // ── Experiment banner ──────────────────────────────────────────────────────
  experimentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: C.base,
    marginBottom: 16,
  },
  experimentBannerLabel: {
    fontFamily: F.sans,
    fontSize: 8,
    fontWeight: 500,
    letterSpacing: 2,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
  },
  experimentBannerTitle: {
    fontFamily: F.display,
    fontSize: 14,
    fontWeight: 400,
    color: C.parchment,
    letterSpacing: 0.3,
  },

  // ── Premise ────────────────────────────────────────────────────────────────
  premise: {
    fontFamily: F.sans,
    fontSize: 10.5,
    fontWeight: 300,
    color: C.base,
    lineHeight: 1.5,
    opacity: 0.85,
    marginBottom: 20,
  },

  // ── Daily check-ins ────────────────────────────────────────────────────────
  checkinsLabel: {
    fontFamily: F.sans,
    fontSize: 8.5,
    fontWeight: 500,
    letterSpacing: 2.2,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  checkinsContainer: {
    gap: 0,
    marginBottom: 20,
  },
  checkinRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: C.base,
    borderBottomStyle: 'solid',
    alignItems: 'flex-start',
  },
  checkinRowLast: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  checkinBadge: {
    width: 18,
    height: 18,
    borderWidth: 0.5,
    borderColor: C.base,
    borderStyle: 'solid',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    opacity: 0.4,
    marginTop: 1,
  },
  checkinBadgeText: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 500,
    color: C.base,
  },
  checkinText: {
    flex: 1,
    fontFamily: F.sans,
    fontSize: 10.5,
    fontWeight: 300,
    color: C.base,
    lineHeight: 1.5,
    opacity: 0.85,
  },

  // ── Notes area ─────────────────────────────────────────────────────────────
  notesLabel: {
    fontFamily: F.sans,
    fontSize: 8.5,
    fontWeight: 500,
    letterSpacing: 2.2,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  notesArea: {
    gap: 10,
  },
  notesLine: {
    width: PAGE.contentWidth,
    height: 0.5,
    backgroundColor: C.base,
    opacity: 0.15,
  },

  // ── Footer note ────────────────────────────────────────────────────────────
  footerNote: {
    paddingHorizontal: PAGE.marginH,
    paddingBottom: 20,
  },
  footerNoteText: {
    fontFamily: F.sans,
    fontSize: 8.5,
    fontWeight: 300,
    fontStyle: 'italic',
    color: C.parchmentFaint,
    lineHeight: 1.5,
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: PAGE.marginH,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 400,
    letterSpacing: 1.2,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
  },
  pageNumber: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 400,
    color: C.parchmentFaint,
  },
});

// Time of day labels for check-ins
const TIMES = ['Morning', 'Midday', 'Evening'];

interface Props {
  data: Pick<ReportData, 'hdType' | 'firstName'>;
}

export default function Page9SevenDay({ data }: Props) {
  // Get experiment based on HD Type, fall back to Generator
  const experimentKey = Object.keys(TYPE_EXPERIMENT).find(k =>
    k.toLowerCase() === data.hdType.toLowerCase()
  ) ?? 'Generator';

  const experiment = TYPE_EXPERIMENT[experimentKey] ?? TYPE_EXPERIMENT['Generator']!;

  // 4 notes lines
  const noteLines = [0, 1, 2, 3];

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />


      {/* Dark top rule */}
      <View style={[S.topRule]} />

      <View style={S.content}>
        <Text style={S.sectionTag}>Section 2 — Your Coordinates</Text>

        <View style={S.headingRow}>
          <Text style={S.headingPrefix}>Start Here</Text>
          <Text style={[S.headingPrefix, { color: C.base, opacity: 0.3 }]}>·</Text>
          <Text style={S.heading}>Your Seven-Day Experiment</Text>
        </View>

        <Text style={S.subheading}>
          One experiment. Three daily check-ins. A notes area to capture what you notice.
        </Text>
        <View style={S.headingRule} />

        {/* Experiment title banner */}
        <View style={S.experimentBanner}>
          <View>
            <Text style={S.experimentBannerLabel}>Experiment for {data.hdType}</Text>
            <Text style={S.experimentBannerTitle}>{experiment.title}</Text>
          </View>
        </View>

        {/* Experiment premise */}
        <Text style={S.premise}>{experiment.premise}</Text>

        {/* Daily check-ins */}
        <Text style={S.checkinsLabel}>Daily Check-Ins — Three Questions</Text>
        <View style={S.checkinsContainer}>
          {experiment.checkins.map((checkin, i) => (
            <View
              key={i}
              style={i === experiment.checkins.length - 1 ? S.checkinRowLast : S.checkinRow}
            >
              <View style={S.checkinBadge}>
                <Text style={S.checkinBadgeText}>{i + 1}</Text>
              </View>
              <Text style={S.checkinText}>
                <Text style={{ fontWeight: 500 }}>{TIMES[i]}: </Text>
                {checkin.replace(/^(Morning|Midday|Evening): /, '')}
              </Text>
            </View>
          ))}
        </View>

        {/* Notes area */}
        <Text style={S.notesLabel}>What I Noticed — Notes</Text>
        <View style={S.notesArea}>
          {noteLines.map(i => (
            <View key={i} style={S.notesLine} />
          ))}
        </View>
      </View>

      {/* Footer note */}
      <View style={S.footerNote}>
        <Text style={S.footerNoteText}>
          After seven days, return to page 5. Notice what shifted. That is more useful data than any insight written in this report.
        </Text>
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNumber}>9</Text>
      </View>
    </Page>
  );
}
