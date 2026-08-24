/**
 * Page 33 — The Two Sky Field Practice
 *
 * Reader question: "How do I test these lenses without getting lost in them?"
 *
 * A seven-day practice page, not a reading assignment.
 * Instruction is limited to three steps, stated once at the top.
 * The daily log below is compact — one short line per prompt per day.
 * The goal is observation, not astrological data tracking.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { C, F, PAGE } from '../tokens';
import { TechnicalLines } from '../shared/PageComponents';

const STAR_SLATE = '#6D7797';

// ── The three steps (exact spec language) ─────────────────────────────────────
const STEPS = [
  {
    num:    '1',
    label:  'Tropical Notice',
    color:  C.crimson,
    prompt: 'What familiar, in-the-moment pattern did I recognize today?',
  },
  {
    num:    '2',
    label:  'Sidereal Notice',
    color:  STAR_SLATE,
    prompt: 'What second perspective became available when I stepped back?',
  },
  {
    num:    '3',
    label:  'Authority Return',
    color:  C.amber,
    prompt: 'What did my actual decision process ask of me?',
  },
] as const;

const DAYS = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

// ── Styles ─────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page:   { backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  triBar: { flexDirection: 'row', width: PAGE.width },
  barA:   { flex: 1, height: 1.5, backgroundColor: C.amber },
  barE:   { flex: 1, height: 1.5, backgroundColor: C.emerald },
  barC:   { flex: 1, height: 1.5, backgroundColor: C.crimson },

  content: {
    flex: 1, paddingHorizontal: PAGE.marginH,
    paddingTop: 36, paddingBottom: PAGE.marginV,
  },
  eyebrow: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 500,
    letterSpacing: 2.5, color: C.parchmentFaint,
    textTransform: 'uppercase', marginBottom: 6,
  },
  heading: {
    fontFamily: F.display, fontSize: 20, fontWeight: 400,
    color: C.base, lineHeight: 1.1, marginBottom: 4,
  },
  sub: {
    fontFamily: F.sans, fontSize: 9, fontWeight: 300,
    color: C.parchmentFaint, lineHeight: 1.5, marginBottom: 16, maxWidth: 440,
  },
  pageRule: {
    width: PAGE.contentWidth, height: 0.5,
    backgroundColor: C.base, opacity: 0.1, marginBottom: 16,
  },

  // ── Three-step instruction (stated once) ─────────────────────────────────
  stepsLabel: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase',
    color: C.parchmentFaint, marginBottom: 8,
  },
  stepsRow: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  stepCard: {
    flex: 1, padding: 10, gap: 4,
    borderTopWidth: 2, borderTopStyle: 'solid',
    backgroundColor: 'rgba(13,13,14,0.025)',
  },
  stepNum: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 400,
    color: C.parchmentFaint, letterSpacing: 1,
  },
  stepLabel: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 700,
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 3,
  },
  stepPrompt: {
    fontFamily: F.display, fontSize: 8.5, fontWeight: 400,
    fontStyle: 'italic', color: C.base, lineHeight: 1.45, opacity: 0.82,
  },

  // ── Daily log table ───────────────────────────────────────────────────────
  logLabel: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase',
    color: C.parchmentFaint, marginBottom: 8,
  },

  logTable: {
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.12)',
  },

  // Header row of log
  logHeaderRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(13,13,14,0.04)',
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(13,13,14,0.15)',
  },
  logHeaderCell: {
    paddingVertical: 6, paddingHorizontal: 8,
  },
  logHeaderText: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 700,
    letterSpacing: 1, textTransform: 'uppercase',
  },

  // Column widths — Day label narrow, three prompt columns equal
  colDay:  { width: 42, borderRightWidth: 0.5, borderRightColor: 'rgba(13,13,14,0.1)', borderRightStyle: 'solid' },
  colTrop: { flex: 1, borderRightWidth: 0.5, borderRightColor: 'rgba(13,13,14,0.1)', borderRightStyle: 'solid' },
  colSid:  { flex: 1, borderRightWidth: 0.5, borderRightColor: 'rgba(13,13,14,0.1)', borderRightStyle: 'solid' },
  colAuth: { flex: 1 },

  // Data rows
  logRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(13,13,14,0.08)',
    minHeight: 34,
  },
  logRowLast: {
    flexDirection: 'row',
    minHeight: 34,
  },
  logRowAlt: { backgroundColor: 'rgba(13,13,14,0.015)' },

  dayCell: {
    width: 42, justifyContent: 'center',
    paddingHorizontal: 8,
    borderRightWidth: 0.5, borderRightColor: 'rgba(13,13,14,0.1)', borderRightStyle: 'solid',
  },
  dayText: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 500,
    color: C.parchmentFaint,
  },
  writeCell: {
    flex: 1, justifyContent: 'center',
    paddingHorizontal: 8,
    borderRightWidth: 0.5, borderRightColor: 'rgba(13,13,14,0.1)', borderRightStyle: 'solid',
  },
  writeCellLast: {
    flex: 1, justifyContent: 'center', paddingHorizontal: 8,
  },
  writeLine: {
    height: 0.5, width: '100%',
    backgroundColor: C.base, opacity: 0.15,
  },

  // ── Closing note ──────────────────────────────────────────────────────────
  closingBlock: {
    marginTop: 16, paddingTop: 12,
    borderTopWidth: 0.5, borderTopColor: 'rgba(13,13,14,0.1)',
  },
  closingText: {
    fontFamily: F.display, fontSize: 9.5, fontWeight: 400,
    fontStyle: 'italic', color: C.base, lineHeight: 1.5, opacity: 0.75,
    textAlign: 'center',
  },

  footer: {
    paddingHorizontal: PAGE.marginH, paddingBottom: 22,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: {
    fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2,
    color: C.parchmentFaint, textTransform: 'uppercase',
  },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

export default function Page33TwoSkyFieldPractice() {
  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />
      <View style={S.triBar}>
        <View style={S.barA} /><View style={S.barE} /><View style={S.barC} />
      </View>

      <View style={S.content}>
        <Text style={S.eyebrow}>Stoplight · Field Practice</Text>
        <Text style={S.heading}>The Two Sky Field Practice</Text>
        <Text style={S.sub}>
          How do I test these lenses without getting lost in them?
        </Text>
        <View style={S.pageRule} />

        {/* Three-step instruction — stated once */}
        <Text style={S.stepsLabel}>Three Prompts — Once Daily, Seven Days</Text>
        <View style={S.stepsRow}>
          {STEPS.map(step => (
            <View key={step.label} style={[S.stepCard, { borderTopColor: step.color }]}>
              <Text style={S.stepNum}>{step.num} of 3</Text>
              <Text style={[S.stepLabel, { color: step.color }]}>{step.label}</Text>
              <Text style={S.stepPrompt}>"{step.prompt}"</Text>
            </View>
          ))}
        </View>

        {/* Seven-day log */}
        <Text style={S.logLabel}>Seven-Day Log — One Word Or Short Phrase Per Box</Text>
        <View style={S.logTable}>

          {/* Header row */}
          <View style={S.logHeaderRow}>
            <View style={[S.logHeaderCell, S.colDay]}>
              <Text style={[S.logHeaderText, { color: C.parchmentFaint }]}>Day</Text>
            </View>
            <View style={[S.logHeaderCell, S.colTrop]}>
              <Text style={[S.logHeaderText, { color: C.crimson }]}>Tropical Notice</Text>
            </View>
            <View style={[S.logHeaderCell, S.colSid]}>
              <Text style={[S.logHeaderText, { color: STAR_SLATE }]}>Sidereal Notice</Text>
            </View>
            <View style={[S.logHeaderCell, S.colAuth]}>
              <Text style={[S.logHeaderText, { color: C.amber }]}>Authority Return</Text>
            </View>
          </View>

          {/* Seven day rows */}
          {DAYS.map((day, i) => {
            const isLast = i === DAYS.length - 1;
            const isAlt  = i % 2 === 1;
            return (
              <View
                key={day}
                style={[
                  isLast ? S.logRowLast : S.logRow,
                  isAlt  ? S.logRowAlt  : {},
                ]}
              >
                <View style={S.dayCell}>
                  <Text style={S.dayText}>{day}</Text>
                </View>
                <View style={S.writeCell}>
                  <View style={S.writeLine} />
                </View>
                <View style={S.writeCell}>
                  <View style={S.writeLine} />
                </View>
                <View style={S.writeCellLast}>
                  <View style={S.writeLine} />
                </View>
              </View>
            );
          })}
        </View>

        {/* Closing note */}
        <View style={S.closingBlock}>
          <Text style={S.closingText}>
            The goal is not to master two zodiac systems.{'\n'}
            It is to notice more — and to keep returning to what you already know how to do.
          </Text>
        </View>
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNum}>33</Text>
      </View>
    </Page>
  );
}
