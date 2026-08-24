/**
 * Page 20 — Your Birthday & Attitude
 * Birthday number (birth day) and Attitude number (month + day).
 * Concise language. Both shown in compound/reduced form where applicable.
 * Reader need: "What is my first impression / daily stance?"
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../shared/PageComponents';
import { C, F, PAGE } from '../tokens';
import { ATTITUDE_DESCRIPTIONS, BIRTHDAY_DESCRIPTIONS } from './road-content';
import type { ReportData } from '../tokens';

const S = StyleSheet.create({
  page: { backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  emeraldLine: { width: PAGE.width, height: 1.5, backgroundColor: C.emerald },
  content: {
    flex: 1, paddingHorizontal: PAGE.marginH,
    paddingTop: 40, paddingBottom: PAGE.marginV,
  },
  sectionTag: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 2.5, color: C.parchmentFaint,
    textTransform: 'uppercase', marginBottom: 8,
  },
  heading: {
    fontFamily: F.display, fontSize: 22, fontWeight: 400,
    color: C.base, lineHeight: 1.15, marginBottom: 8,
  },
  subheading: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300,
    color: C.parchmentFaint, lineHeight: 1.5, marginBottom: 20, maxWidth: 420,
  },
  headingRule: {
    width: PAGE.contentWidth, height: 0.5,
    backgroundColor: C.base, opacity: 0.1, marginBottom: 24,
  },

  // ── Two number blocks side by side ────────────────────────────────────────
  twoCol: { flexDirection: 'row', gap: 20, marginBottom: 28 },

  numberBlock: {
    flex: 1, padding: 20,
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.12)',
    backgroundColor: '#F5F3EE', gap: 8,
  },

  numberBlockLabel: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase', color: C.parchmentFaint,
  },

  // Compound display (e.g., "30/3")
  compoundDisplay: {
    flexDirection: 'row', alignItems: 'baseline', gap: 4,
  },
  compoundMain: {
    fontFamily: F.display, fontSize: 40, fontWeight: 700,
    color: C.emerald, lineHeight: 1.0,
  },
  compoundSep: {
    fontFamily: F.sans, fontSize: 18, fontWeight: 300,
    color: C.parchmentDim,
  },
  compoundReduced: {
    fontFamily: F.display, fontSize: 22, fontWeight: 400,
    color: C.emeraldDim,
  },

  numberName: {
    fontFamily: F.display, fontSize: 13, fontWeight: 400,
    fontStyle: 'italic', color: C.base, lineHeight: 1.2,
  },

  // ── Description blocks ────────────────────────────────────────────────────
  descBlock: {
    marginBottom: 20, gap: 8,
    borderLeftWidth: 2, borderLeftColor: C.emerald, borderLeftStyle: 'solid',
    paddingLeft: 14,
  },
  descLabel: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase', color: C.emerald,
  },
  descText: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300,
    color: C.base, lineHeight: 1.5, opacity: 0.85,
  },

  // ── Calculation note ──────────────────────────────────────────────────────
  calcNote: {
    padding: 12, backgroundColor: '#EEF5EE',
    borderWidth: 0.5, borderColor: C.emerald, borderStyle: 'solid',
  },
  calcNoteLabel: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase', color: C.emeraldDim, marginBottom: 5,
  },
  calcNoteText: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 300,
    color: C.base, lineHeight: 1.5, opacity: 0.8,
  },

  footer: {
    paddingHorizontal: PAGE.marginH, paddingBottom: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: {
    fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2,
    color: C.parchmentFaint, textTransform: 'uppercase',
  },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

// Get description for birthday (day of birth, 1–31)
function getBirthdayDesc(birthdayNumber: number, rawDay: number): string {
  // Use raw day if in table, else use root number
  return BIRTHDAY_DESCRIPTIONS[rawDay]
    ?? BIRTHDAY_DESCRIPTIONS[birthdayNumber]
    ?? `Birth day ${rawDay} carries the foundational energy of the ${birthdayNumber}.`;
}

interface Props {
  data: Pick<ReportData,
    'birthdayNumber' | 'birthdayDisplay' |
    'attitudeNumber' | 'attitudeDisplay' |
    'birthDate'
  >;
}

export default function Page20BirthdayAttitude({ data }: Props) {
  // Extract raw day from birthDate for description lookup
  const rawDay = data.birthDate
    ? parseInt(data.birthDate.split('-')[2] ?? '1', 10)
    : data.birthdayNumber;

  const birthdayDesc = getBirthdayDesc(data.birthdayNumber, rawDay);
  const attitudeDesc = ATTITUDE_DESCRIPTIONS[data.attitudeNumber]
    ?? `Your Attitude Number ${data.attitudeNumber} shapes the energy you lead with in new encounters.`;

  // Parse compound display — e.g., "30/3" → compound="30", reduced="3"
  const bdParts = data.birthdayDisplay.includes('/')
    ? data.birthdayDisplay.split('/')
    : [data.birthdayDisplay, data.birthdayDisplay];
  const atParts = data.attitudeDisplay.includes('/')
    ? data.attitudeDisplay.split('/')
    : [data.attitudeDisplay, data.attitudeDisplay];

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.emeraldLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Section 4 — The Road</Text>
        <Text style={S.heading}>Your Birthday & Attitude</Text>
        <Text style={S.subheading}>
          Two secondary Road numbers that shape daily stance and first impression.
        </Text>
        <View style={S.headingRule} />

        {/* Two number blocks */}
        <View style={S.twoCol}>
          {/* Birthday number */}
          <View style={S.numberBlock}>
            <Text style={S.numberBlockLabel}>Birthday Number</Text>
            <View style={S.compoundDisplay}>
              {bdParts[0] !== bdParts[1] ? (
                <>
                  <Text style={S.compoundMain}>{bdParts[0]}</Text>
                  <Text style={S.compoundSep}>/</Text>
                  <Text style={S.compoundReduced}>{bdParts[1]}</Text>
                </>
              ) : (
                <Text style={S.compoundMain}>{bdParts[0]}</Text>
              )}
            </View>
            <Text style={S.numberName}>Day of birth · daily stance</Text>
          </View>

          {/* Attitude number */}
          <View style={S.numberBlock}>
            <Text style={S.numberBlockLabel}>Attitude Number</Text>
            <View style={S.compoundDisplay}>
              {atParts[0] !== atParts[1] ? (
                <>
                  <Text style={S.compoundMain}>{atParts[0]}</Text>
                  <Text style={S.compoundSep}>/</Text>
                  <Text style={S.compoundReduced}>{atParts[1]}</Text>
                </>
              ) : (
                <Text style={S.compoundMain}>{atParts[0]}</Text>
              )}
            </View>
            <Text style={S.numberName}>Month + Day · first impression</Text>
          </View>
        </View>

        {/* Birthday description */}
        <View style={S.descBlock}>
          <Text style={S.descLabel}>Birthday Number {data.birthdayDisplay} — Daily Stance</Text>
          <Text style={S.descText}>{birthdayDesc}</Text>
        </View>

        {/* Attitude description */}
        <View style={S.descBlock}>
          <Text style={S.descLabel}>Attitude Number {data.attitudeDisplay} — First Impression</Text>
          <Text style={S.descText}>{attitudeDesc}</Text>
        </View>

        {/* Calculation transparency */}
        <View style={S.calcNote}>
          <Text style={S.calcNoteLabel}>How These Are Calculated</Text>
          <Text style={S.calcNoteText}>
            Birthday Number: the day of birth reduced to a single digit (master numbers preserved).{'\n'}
            Attitude Number: birth month digits + birth day digits, reduced. Both shown in compound/reduced form — the compound layer carries contextual texture; the reduced number is the operative energy.
          </Text>
        </View>
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNum}>20</Text>
      </View>
    </Page>
  );
}
