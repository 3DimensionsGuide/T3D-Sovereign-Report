/**
 * Page 23 — Your Challenges
 * Four challenges paired with Pinnacles.
 * Reframed as recurring terrain requiring skill — not punishment.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../shared/PageComponents';
import { C, F, PAGE } from '../tokens';
import { CHALLENGE_THEMES } from './road-content';
import type { ReportData } from '../tokens';

const S23 = StyleSheet.create({
  page: { backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  emeraldLine: { width: PAGE.width, height: 1.5, backgroundColor: C.emerald },
  content: { flex: 1, paddingHorizontal: PAGE.marginH, paddingTop: 40, paddingBottom: PAGE.marginV },
  sectionTag: { fontFamily: F.sans, fontSize: 8.5, fontWeight: 500, letterSpacing: 2.5, color: C.parchmentFaint, textTransform: 'uppercase', marginBottom: 8 },
  heading: { fontFamily: F.display, fontSize: 22, fontWeight: 400, color: C.base, lineHeight: 1.15, marginBottom: 8 },
  subheading: { fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.parchmentFaint, lineHeight: 1.5, marginBottom: 20, maxWidth: 440 },
  headingRule: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 20 },

  challengeList: { flexDirection: 'column', gap: 0 },
  challengeRow: {
    paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: C.base,
    borderBottomStyle: 'solid', flexDirection: 'row', gap: 14, alignItems: 'flex-start',
  },
  challengeRowLast: { paddingVertical: 14, flexDirection: 'row', gap: 14, alignItems: 'flex-start' },

  challengeLeft: { width: 56, flexShrink: 0, alignItems: 'center', gap: 4 },
  challengeNumber: {
    width: 40, height: 40,
    borderWidth: 1, borderColor: 'rgba(13,13,14,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  challengeNumText: { fontFamily: F.display, fontSize: 20, fontWeight: 400, color: C.base },
  challengePhaseLabel: { fontFamily: F.sans, fontSize: 6, fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase', color: C.parchmentFaint, textAlign: 'center' },

  challengeBody: { flex: 1, gap: 5 },
  challengeTerrain: { fontFamily: F.display, fontSize: 12, fontWeight: 400, fontStyle: 'italic', color: C.base, lineHeight: 1.3 },
  challengeSkillLabel: { fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: 1.8, textTransform: 'uppercase', color: C.emerald },
  challengeSkillText: { fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.85 },
  challengeReframe: { fontFamily: F.display, fontSize: 10.5, fontWeight: 400, fontStyle: 'italic', color: C.base, lineHeight: 1.5, opacity: 0.65 },

  note: { marginTop: 16, paddingTop: 14, borderTopWidth: 0.5, borderTopColor: C.base, borderTopStyle: 'solid' },
  noteText: { fontFamily: F.display, fontSize: 10.5, fontWeight: 400, fontStyle: 'italic', color: C.base, lineHeight: 1.5, opacity: 0.65 },

  footer: { paddingHorizontal: PAGE.marginH, paddingBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2, color: C.parchmentFaint, textTransform: 'uppercase' },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

const PHASE_LABELS = ['Early Life', 'Middle Phase', 'Later Phase', 'Lifelong'];

interface Page23Props {
  data: Pick<ReportData, 'challenges' | 'currentPinnacleIndex'>;
}

export function Page23Challenges({ data }: Page23Props) {
  const challenges = data.challenges ?? [0, 0, 0, 0];
  const currentIdx = data.currentPinnacleIndex ?? 1;

  return (
    <Page size="LETTER" style={S23.page}>
      <TechnicalLines />

      <View style={S23.emeraldLine} />
      <View style={S23.content}>
        <Text style={S23.sectionTag}>Section 4 — The Road</Text>
        <Text style={S23.heading}>Your Challenges</Text>
        <Text style={S23.subheading}>
          Four recurring terrains — each paired with a Pinnacle phase. These are not obstacles. They are the specific friction your Road is designed to develop skill through.
        </Text>
        <View style={S23.headingRule} />

        <View style={S23.challengeList}>
          {challenges.map((num, i) => {
            const theme = CHALLENGE_THEMES[num] ?? CHALLENGE_THEMES[0]!;
            const isCurrent = i === currentIdx || (i === 3);
            return (
              <View key={i} style={i === challenges.length - 1 ? S23.challengeRowLast : S23.challengeRow}>
                <View style={S23.challengeLeft}>
                  <View style={isCurrent ? [S23.challengeNumber, { borderColor: 'rgba(31,138,77,1)',}] : S23.challengeNumber}>
                    <Text style={isCurrent ? [S23.challengeNumText, { color: C.emerald }] : S23.challengeNumText}>{num}</Text>
                  </View>
                  <Text style={S23.challengePhaseLabel}>{PHASE_LABELS[i]}</Text>
                </View>
                <View style={S23.challengeBody}>
                  <Text style={S23.challengeTerrain}>{theme.terrain}</Text>
                  <Text style={S23.challengeSkillLabel}>Skill Being Developed</Text>
                  <Text style={S23.challengeSkillText}>{theme.skill}</Text>
                  <Text style={S23.challengeReframe}>{theme.reframe}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={S23.note}>
          <Text style={S23.noteText}>
            The word "challenge" in numerology names recurring terrain — not a verdict. The skill developed here becomes genuine authority. The difficulty is the curriculum.
          </Text>
        </View>
      </View>
      <View style={S23.footer}>
        <Text style={S23.footerText}>The Sovereign Report</Text>
        <Text style={S23.pageNum}>23</Text>
      </View>
    </Page>
  );
}

/**
 * Page 24 — Road Friction & Recalibration
 * How the Life Path can overreach, underexpress, or run on borrowed expectations.
 * One reorientation practice.
 */

const S24 = StyleSheet.create({
  page: { backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  emeraldLine: { width: PAGE.width, height: 1.5, backgroundColor: C.emerald },
  content: { flex: 1, paddingHorizontal: PAGE.marginH, paddingTop: 40, paddingBottom: PAGE.marginV },
  sectionTag: { fontFamily: F.sans, fontSize: 8.5, fontWeight: 500, letterSpacing: 2.5, color: C.parchmentFaint, textTransform: 'uppercase', marginBottom: 8 },
  heading: { fontFamily: F.display, fontSize: 22, fontWeight: 400, color: C.base, lineHeight: 1.15, marginBottom: 20 },
  headingRule: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 20 },

  frictionList: { flexDirection: 'column', gap: 0, marginBottom: 20 },
  frictionBlock: {
    paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: C.base,
    borderBottomStyle: 'solid', gap: 5,
  },
  frictionBlockLast: { paddingVertical: 14, gap: 5 },
  frictionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  frictionDot: { width: 6, height: 6, backgroundColor: C.emeraldDim },
  frictionLabel: { fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', color: C.parchmentFaint },
  frictionTitle: { fontFamily: F.display, fontSize: 13, fontWeight: 400, fontStyle: 'italic', color: C.base, lineHeight: 1.2 },
  frictionText: { fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.85 },

  resetBlock: { padding: 16, backgroundColor: C.base, gap: 6 },
  resetLabel: { fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', color: C.emerald, opacity: 0.8 },
  resetTitle: { fontFamily: F.display, fontSize: 13, fontWeight: 400, color: C.parchment },
  resetText: { fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.parchment, lineHeight: 1.5, opacity: 0.75 },

  footer: { paddingHorizontal: PAGE.marginH, paddingBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2, color: C.parchmentFaint, textTransform: 'uppercase' },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

import { LIFE_PATH_CONTENT } from './road-content';

interface Page24Props {
  data: Pick<ReportData, 'lifePath' | 'lifePathDisplay'>;
}

export function Page24RoadFriction({ data }: Page24Props) {
  const lp = LIFE_PATH_CONTENT[data.lifePath] ?? LIFE_PATH_CONTENT[1]!;

  const frictions = [
    { label: 'Overreach', title: 'When the Road goes too far', text: lp.overreach },
    { label: 'Underexpression', title: 'When the Road goes quiet', text: lp.underexpression },
    { label: 'Borrowed expectations', title: 'When it runs on someone else\'s map', text: lp.borrowed },
  ];

  return (
    <Page size="LETTER" style={S24.page}>
      <TechnicalLines />

      <View style={S24.emeraldLine} />
      <View style={S24.content}>
        <Text style={S24.sectionTag}>Section 4 — The Road</Text>
        <Text style={S24.heading}>Road Friction & Recalibration</Text>
        <View style={S24.headingRule} />

        <View style={S24.frictionList}>
          {frictions.map((f, i) => (
            <View key={f.label} style={i === frictions.length - 1 ? S24.frictionBlockLast : S24.frictionBlock}>
              <View style={S24.frictionHeader}>
                <View style={S24.frictionDot} />
                <Text style={S24.frictionLabel}>{f.label}</Text>
              </View>
              <Text style={S24.frictionTitle}>{f.title}</Text>
              <Text style={S24.frictionText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <View style={S24.resetBlock}>
          <Text style={S24.resetLabel}>Reorientation Practice — Life Path {data.lifePathDisplay}</Text>
          <Text style={S24.resetTitle}>{lp.reset.title}</Text>
          <Text style={S24.resetText}>{lp.reset.instruction}</Text>
        </View>
      </View>
      <View style={S24.footer}>
        <Text style={S24.footerText}>The Sovereign Report</Text>
        <Text style={S24.pageNum}>24</Text>
      </View>
    </Page>
  );
}

/**
 * Page 25 — Road Field Practice
 * Weekly alignment audit: what felt alive / compulsory / what road am I walking?
 */

const S25 = StyleSheet.create({
  page: { backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  emeraldLine: { width: PAGE.width, height: 2, backgroundColor: C.emerald },
  content: { flex: 1, paddingHorizontal: PAGE.marginH, paddingTop: 40, paddingBottom: 20 },
  sectionTag: { fontFamily: F.sans, fontSize: 8.5, fontWeight: 500, letterSpacing: 2.5, color: C.parchmentFaint, textTransform: 'uppercase', marginBottom: 8 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  headingPrefix: { fontFamily: F.sans, fontSize: 10.5, fontWeight: 400, color: C.parchmentFaint },
  heading: { fontFamily: F.display, fontSize: 20, fontWeight: 400, color: C.base, lineHeight: 1.15 },
  subheading: { fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.parchmentFaint, lineHeight: 1.5, marginBottom: 20 },
  headingRule: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 20 },

  banner: { padding: 16, backgroundColor: C.base, marginBottom: 16, gap: 4 },
  bannerLabel: { fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', color: C.emerald, opacity: 0.75 },
  bannerTitle: { fontFamily: F.display, fontSize: 16, fontWeight: 400, color: C.parchment, lineHeight: 1.2 },

  premise: { fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.85, marginBottom: 20 },

  questionsLabel: { fontFamily: F.sans, fontSize: 8.5, fontWeight: 500, letterSpacing: 2.2, textTransform: 'uppercase', color: C.parchmentFaint, marginBottom: 10 },
  questionsList: { flexDirection: 'column', gap: 0, marginBottom: 26 },
  questionRow: {
    paddingVertical: 18, borderBottomWidth: 0.5, borderBottomColor: C.base,
    borderBottomStyle: 'solid', flexDirection: 'row', gap: 16, alignItems: 'flex-start',
  },
  questionRowLast: { paddingVertical: 18, flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  questionBadge: {
    width: 22, height: 22,
    borderWidth: 0.5, borderColor: C.emerald, borderStyle: 'solid',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 1,
  },
  questionNum: { fontFamily: F.sans, fontSize: 8, fontWeight: 500, color: C.emerald },
  questionText: { flex: 1, fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.base, lineHeight: 1.55, opacity: 0.85 },

  noteLines: { flexDirection: 'column', gap: 12, marginBottom: 12 },
  noteLine: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.12 },

  emeraldFooter: {
    backgroundColor: C.emerald, paddingVertical: 14, paddingHorizontal: PAGE.marginH,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  emeraldFooterLeft: { fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: 1.5, textTransform: 'uppercase', color: C.base, opacity: 0.7 },
  emeraldFooterRight: { fontFamily: F.display, fontSize: 10.5, fontWeight: 400, fontStyle: 'italic', color: C.base },
  emeraldPageNum: { paddingHorizontal: PAGE.marginH, paddingBottom: 12, flexDirection: 'row', justifyContent: 'flex-end', backgroundColor: C.emerald },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.baseSoft, opacity: 0.5 },
});

const AUDIT_QUESTIONS = [
  { label: 'What felt alive', text: 'What did I do this week that felt genuinely mine — not obligatory, not performed, but actually chosen?' },
  { label: 'What felt compulsory', text: 'What did I do this week that felt like someone else\'s version of my life — something I\'m carrying without knowing why?' },
  { label: 'What road am I walking', text: 'If I look at the pattern of my choices this week honestly — whose Road am I actually on?' },
];

interface Page25Props {
  data: Pick<ReportData, 'lifePath' | 'lifePathDisplay'>;
}

export function Page25RoadPractice({ data }: Page25Props) {
  return (
    <Page size="LETTER" style={S25.page}>
      <TechnicalLines />

      <View style={S25.emeraldLine} />
      <View style={S25.content}>
        <Text style={S25.sectionTag}>Section 4 — The Road</Text>
        <View style={S25.headingRow}>
          <Text style={S25.headingPrefix}>Road</Text>
          <Text style={[S25.headingPrefix, { opacity: 0.3 }]}>·</Text>
          <Text style={S25.heading}>Field Practice</Text>
        </View>
        <Text style={S25.subheading}>
          A weekly alignment audit — three questions that surface what the Road is actually asking.
        </Text>
        <View style={S25.headingRule} />

        <View style={S25.banner}>
          <Text style={S25.bannerLabel}>Life Path {data.lifePathDisplay} · Weekly Practice</Text>
          <Text style={S25.bannerTitle}>The Alignment Audit</Text>
        </View>

        <Text style={S25.premise}>
          At the end of each week, set aside ten minutes and answer these three questions without editing. The pattern across multiple weeks is more instructive than any single answer.
        </Text>

        <Text style={S25.questionsLabel}>Three Questions — Answer Weekly</Text>
        <View style={S25.questionsList}>
          {AUDIT_QUESTIONS.map((q, i, arr) => (
            <View key={i} style={i === arr.length - 1 ? S25.questionRowLast : S25.questionRow}>
              <View style={S25.questionBadge}>
                <Text style={S25.questionNum}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[S25.questionText, { fontWeight: 500, fontSize: 7, letterSpacing: 1.5, textTransform: 'uppercase', color: C.parchmentFaint, marginBottom: 7 }]}>
                  {q.label}
                </Text>
                <Text style={S25.questionText}>{q.text}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={[S25.questionsLabel, { marginBottom: 10 }]}>Notes — This Week</Text>
        <View style={S25.noteLines}>
          {[0,1,2,3].map(i => <View key={i} style={S25.noteLine} />)}
        </View>
      </View>

      <View style={S25.emeraldFooter}>
        <Text style={S25.emeraldFooterLeft}>The Road · Section 4 Complete</Text>
        <Text style={S25.emeraldFooterRight}>Continue to The Stoplight — page 26</Text>
      </View>
      <View style={S25.emeraldPageNum}>
        <Text style={S25.pageNum}>25</Text>
      </View>
    </Page>
  );
}
