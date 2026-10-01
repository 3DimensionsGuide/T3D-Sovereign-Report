/**
 * Advanced Sovereign Report — Road Section — Your Karmic Lessons
 *
 * Deepens the base report's brief Karmic Lessons treatment into a full page:
 * the calculation mechanism (KARMIC_LESSONS_MECHANISM), then a card per
 * missing digit found in the reader's full birth name, each with its own
 * theme and a concrete ongoing practice (KARMIC_LESSON_CONTENT in
 * road-content.ts).
 *
 * Karmic Lessons is array-valued (karmicLessons: number[]) rather than a
 * single number — a person can have zero, one, or several missing digits —
 * so this page has three states: no full name on file, zero lessons (every
 * digit 1–9 present in the name — a real and worth-naming result, not a
 * placeholder), and one-or-more lesson cards stacked vertically.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../../shared/PageComponents';
import { C, F, PAGE } from '../../tokens';
import { KARMIC_LESSONS_MECHANISM, KARMIC_LESSON_CONTENT } from './road-content';
import type { ReportData } from '../../tokens';

const S = StyleSheet.create({
  page: { paddingTop: 0, paddingLeft: 0, paddingRight: 0, paddingBottom: PAGE.marginV, backgroundColor: '#F5F5F3', fontFamily: F.sans }, // QA fix: explicit edges, no padding shorthand (see Page05Transits.tsx)
  emeraldLine: { width: PAGE.width, height: 1.5, backgroundColor: C.emerald },
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
    lineHeight: 1.5, marginBottom: 20, maxWidth: 440,
  },
  headingRule: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 24 },

  mechanismBlock: { marginBottom: 22, gap: 6 },
  mechanismLabel: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: 2,
    textTransform: 'uppercase', color: C.emerald,
  },
  mechanismText: {
    fontFamily: F.sans, fontSize: 10, fontWeight: 300, color: C.base, lineHeight: 1.55, opacity: 0.85,
  },

  lessonsStack: { gap: 12 },
  lessonCard: {
    flexDirection: 'row', gap: 14,
    padding: 15, backgroundColor: '#FFFFFF',
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.12)', borderStyle: 'solid',
  },
  lessonNumberWrap: { width: 34, alignItems: 'center' },
  lessonNumber: { fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.emerald, lineHeight: 1.0 },
  lessonBody: { flex: 1, gap: 6 },
  lessonTheme: { fontFamily: F.sans, fontSize: 9.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.88 },
  practiceRow: { flexDirection: 'row', gap: 6, paddingTop: 6, borderTopWidth: 0.5, borderTopColor: 'rgba(13,13,14,0.08)' },
  practiceLabel: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 500, letterSpacing: 1.4,
    textTransform: 'uppercase', color: C.emeraldDim, width: 62,
  },
  practiceText: { flex: 1, fontFamily: F.sans, fontSize: 9, fontWeight: 300, color: C.base, lineHeight: 1.45, opacity: 0.8 },

  // Zero-lessons state
  clearBlock: {
    padding: 20, backgroundColor: '#EFF5EF',
    borderLeftWidth: 2, borderLeftColor: C.emerald, borderLeftStyle: 'solid', gap: 8,
  },
  clearTitle: { fontFamily: F.display, fontSize: 15, fontWeight: 400, color: C.base, lineHeight: 1.2 },
  clearText: { fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.base, lineHeight: 1.55, opacity: 0.85 },

  sourceCard: {
    padding: 14, marginTop: 20, backgroundColor: '#FFFFFF',
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.12)', borderStyle: 'solid',
  },
  sourceLabel: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 500, letterSpacing: 1.8,
    textTransform: 'uppercase', color: C.emeraldDim, marginBottom: 4,
  },
  sourceText: { fontFamily: F.sans, fontSize: 9.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.8 },

  missingBlock: {
    padding: 20, backgroundColor: '#F5F3EE',
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.1)', gap: 8,
  },
  missingTitle: { fontFamily: F.display, fontSize: 16, fontWeight: 400, color: C.base, lineHeight: 1.2 },
  missingText: { fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.82 },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: PAGE.marginH, paddingBottom: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: { fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2, color: C.parchmentFaint, textTransform: 'uppercase' },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

interface Props {
  data: Pick<ReportData, 'karmicLessons' | 'hasFullName' | 'firstName'>;
}

export default function Page05KarmicLessons({ data }: Props) {
  const lessons = data.karmicLessons ?? [];

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.emeraldLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Advanced Sovereign Report · The Road</Text>
        <Text style={S.heading}>Your Karmic Lessons</Text>
        <Text style={S.subheading}>
          Not every energy is handed to you at birth. What&rsquo;s missing from your name is its
          own kind of information — the specific ground you&rsquo;re here to build on purpose.
        </Text>
        <View style={S.headingRule} />

        <View style={S.mechanismBlock}>
          <Text style={S.mechanismLabel}>How These Are Found</Text>
          <Text style={S.mechanismText}>{KARMIC_LESSONS_MECHANISM}</Text>
        </View>

        {!data.hasFullName ? (
          <View style={S.missingBlock}>
            <Text style={S.missingTitle}>This Layer Requires Your Full Birth Name</Text>
            <Text style={S.missingText}>
              Your Karmic Lessons are found by checking every letter of your full birth name, as
              it appears on your birth certificate, for which digits 1–9 never appear. Add it at
              3dimensions.guide to unlock this page.
            </Text>
          </View>
        ) : lessons.length === 0 ? (
          <View style={S.clearBlock}>
            <Text style={S.clearTitle}>No Missing Digits</Text>
            <Text style={S.clearText}>
              Every digit from 1 through 9 appears somewhere in your full birth name. You weren&rsquo;t
              handed a specific gap to build on purpose here — the lessons this life asks of you
              are running through other layers of your chart instead.
            </Text>
          </View>
        ) : (
          <View style={S.lessonsStack}>
            {lessons.map((n) => {
              const c = KARMIC_LESSON_CONTENT[n];
              if (!c) return null;
              return (
                <View style={S.lessonCard} key={n}>
                  <View style={S.lessonNumberWrap}>
                    <Text style={S.lessonNumber}>{n}</Text>
                  </View>
                  <View style={S.lessonBody}>
                    <Text style={S.lessonTheme}>{c.theme}</Text>
                    <View style={S.practiceRow}>
                      <Text style={S.practiceLabel}>Practice</Text>
                      <Text style={S.practiceText}>{c.practice}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {data.hasFullName && (
          <View style={S.sourceCard}>
            <Text style={S.sourceLabel}>Where This Comes From</Text>
            <Text style={S.sourceText}>
              Every letter of your full birth name converts to a Pythagorean digit 1–9. A Karmic
              Lesson is any digit that never once appears — an energy your name doesn&rsquo;t supply
              automatically, and one you can still fully develop through deliberate practice.
            </Text>
          </View>
        )}
      </View>

      <View style={S.footer} fixed>
        <Text style={S.footerText}>T3D Advanced Sovereign Report</Text>
        <Text style={S.pageNum} render={({ pageNumber }) => pageNumber} />
      </View>
    </Page>
  );
}
