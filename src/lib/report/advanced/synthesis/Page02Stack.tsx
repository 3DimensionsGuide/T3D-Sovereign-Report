/**
 * Advanced Sovereign Report — Section IV — The Three-System Stack
 *
 * First content page of the Integration section. Purely templated — no
 * AI call — because the conceptual stack itself never changes reader to
 * reader; what's personalized is only the small "Yours:" line under each
 * system, pulling directly from data already calculated in Sections I–III.
 *
 * Three colored rows, one per system, in the same order the report already
 * taught them: Vehicle (amber) answers HOW you're built to operate, Road
 * (emerald) answers WHY — the macro trajectory and which season you're in
 * right now — and Stoplight (crimson) answers WHEN — the live, moving
 * conditions layered on top of the other two. None of the three replaces
 * either of the others; the next page (The Hierarchy) covers how they
 * actually work together.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../../shared/PageComponents';
import { C, F, PAGE } from '../../tokens';

const S = StyleSheet.create({
  page: { paddingBottom: PAGE.marginV, backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  amberLine: { width: PAGE.width, height: 1.5, backgroundColor: C.amber },
  content: { flex: 1, paddingHorizontal: PAGE.marginH, paddingTop: 40 },

  sectionTag: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 2.5, color: C.parchmentFaint, textTransform: 'uppercase', marginBottom: 8,
  },
  heading: {
    fontFamily: F.display, fontSize: 22, fontWeight: 400, color: C.base, lineHeight: 1.15, marginBottom: 8,
  },
  subheading: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.parchmentFaint,
    lineHeight: 1.5, marginBottom: 20, maxWidth: 460,
  },
  headingRule: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 20 },

  stack: { gap: 14 },
  card: {
    padding: 16, backgroundColor: '#FFFFFF',
    borderLeftWidth: 3, borderLeftStyle: 'solid',
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.12)', borderStyle: 'solid',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardName: {
    fontFamily: F.display, fontSize: 14.5, fontWeight: 400, color: C.base,
  },
  cardAnswers: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 700, letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  cardText: {
    fontFamily: F.sans, fontSize: 9.5, fontWeight: 300, color: C.base, lineHeight: 1.55, opacity: 0.88,
    marginBottom: 10,
  },
  yoursRow: {
    paddingTop: 9, borderTopWidth: 0.5, borderTopColor: 'rgba(13,13,14,0.1)', borderTopStyle: 'solid',
    flexDirection: 'row', gap: 6, alignItems: 'baseline',
  },
  yoursLabel: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 700, letterSpacing: 1.2,
    textTransform: 'uppercase', color: C.parchmentFaint,
  },
  yoursText: {
    fontFamily: F.sans, fontSize: 9.5, fontWeight: 400, color: C.base, flex: 1,
  },

  closer: {
    marginTop: 14, padding: 14, backgroundColor: '#F5F3EE',
    borderLeftWidth: 2, borderLeftColor: C.base, borderLeftStyle: 'solid',
  },
  closerText: {
    fontFamily: F.sans, fontSize: 9.5, fontWeight: 300, fontStyle: 'italic', color: C.base,
    lineHeight: 1.55, opacity: 0.85,
  },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: PAGE.marginH, paddingBottom: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: { fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2, color: C.parchmentFaint, textTransform: 'uppercase' },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

export interface Page02StackData {
  hdType: string;
  hdStrategy: string;
  hdAuthority: string;
  lifePathDisplay: string;
  currentPinnacleLabel: string;
  sunSign: string;
  tropicalAsc: string;
}

interface Props {
  data: Page02StackData;
}

export default function Page02Stack({ data }: Props) {
  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.amberLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Advanced Sovereign Report · The Integration</Text>
        <Text style={S.heading}>The Three-System Stack</Text>
        <Text style={S.subheading}>
          Three different questions, answered by three different systems. Each one is complete
          on its own terms — none of them replaces either of the other two.
        </Text>
        <View style={S.headingRule} />

        <View style={S.stack}>
          <View style={[S.card, { borderLeftColor: C.amber }]}>
            <View style={S.cardTop}>
              <Text style={S.cardName}>The Vehicle</Text>
              <Text style={[S.cardAnswers, { color: C.amberDim }]}>Answers: How</Text>
            </View>
            <Text style={S.cardText}>
              Human Design describes the operating mechanics — how you&rsquo;re actually built to
              take in information, process it, and act on it correctly. It is the only one of the
              three systems that ever makes a decision.
            </Text>
            <View style={S.yoursRow}>
              <Text style={S.yoursLabel}>Yours</Text>
              <Text style={S.yoursText}>
                {`${data.hdType} · ${data.hdStrategy} · ${data.hdAuthority} Authority`}
              </Text>
            </View>
          </View>

          <View style={[S.card, { borderLeftColor: C.emerald }]}>
            <View style={S.cardTop}>
              <Text style={S.cardName}>The Road</Text>
              <Text style={[S.cardAnswers, { color: C.emeraldDim }]}>Answers: Why</Text>
            </View>
            <Text style={S.cardText}>
              Numerology describes the macro trajectory — the long arc your Life Path traces, and
              which multi-year chapter of that arc you&rsquo;re currently moving through. It gives
              your life a why, not a what-to-do-today.
            </Text>
            <View style={S.yoursRow}>
              <Text style={S.yoursLabel}>Yours</Text>
              <Text style={S.yoursText}>
                {`Life Path ${data.lifePathDisplay} · currently in ${data.currentPinnacleLabel}`}
              </Text>
            </View>
          </View>

          <View style={[S.card, { borderLeftColor: C.crimson }]}>
            <View style={S.cardTop}>
              <Text style={S.cardName}>The Stoplight</Text>
              <Text style={[S.cardAnswers, { color: C.crimsonDim }]}>Answers: When</Text>
            </View>
            <Text style={S.cardText}>
              Astrology describes today&rsquo;s actual weather — the moving sky against your fixed
              chart, right now. A red light and a green light are both just conditions. Neither one
              changes by being resisted.
            </Text>
            <View style={S.yoursRow}>
              <Text style={S.yoursLabel}>Yours</Text>
              <Text style={S.yoursText}>
                {`${data.sunSign} Sun · ${data.tropicalAsc} Rising`}
              </Text>
            </View>
          </View>
        </View>

        <View style={S.closer}>
          <Text style={S.closerText}>
            Read in that order — Vehicle, Road, Stoplight — these aren&rsquo;t three separate
            readings of you. They&rsquo;re one system, described at three different zoom levels.
            The next page covers exactly how they work together.
          </Text>
        </View>
      </View>

      <View style={S.footer} fixed>
        <Text style={S.footerText}>T3D Advanced Sovereign Report</Text>
        <Text style={S.pageNum} render={({ pageNumber }) => pageNumber} />
      </View>
    </Page>
  );
}
