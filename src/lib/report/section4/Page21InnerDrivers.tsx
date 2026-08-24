/**
 * Page 21 — Your Inner Drivers
 *
 * CONDITIONAL PAGE — two versions:
 *
 * Version A (hasFullName = true):
 *   Expression/Destiny, Soul Urge, Personality, Hidden Passion, Karmic Lessons
 *   Shown only when verified name data exists.
 *
 * Version B (hasFullName = false):
 *   "Road in Daily Choice" exercise — a practical alternative.
 *   Plain statement: "This part of the Road becomes available when your
 *   full birth name is added." No invented interpretations.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../shared/PageComponents';
import { C, F, PAGE } from '../tokens';
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
    color: C.parchmentFaint, lineHeight: 1.5, marginBottom: 20, maxWidth: 440,
  },
  headingRule: {
    width: PAGE.contentWidth, height: 0.5,
    backgroundColor: C.base, opacity: 0.1, marginBottom: 20,
  },

  // ── VERSION A: Name-based numbers ────────────────────────────────────────
  driversList: { flexDirection: 'column', gap: 0 },
  driverRow: {
    paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: C.base,
    borderBottomStyle: 'solid', flexDirection: 'row', gap: 16, alignItems: 'flex-start',
  },
  driverRowLast: {
    paddingVertical: 14, flexDirection: 'row', gap: 16, alignItems: 'flex-start',
  },
  driverLeft: { width: 100, flexShrink: 0, gap: 3 },
  driverLabel: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500,
    letterSpacing: 1.8, textTransform: 'uppercase', color: C.parchmentFaint,
  },
  driverValue: {
    fontFamily: F.display, fontSize: 22, fontWeight: 400, color: C.emerald, lineHeight: 1.0,
  },
  driverDivider: {
    width: 0.5, height: 48, backgroundColor: C.base, opacity: 0.12, flexShrink: 0,
  },
  driverBody: { flex: 1, gap: 3 },
  driverName: {
    fontFamily: F.display, fontSize: 13, fontWeight: 400, color: C.base,
  },
  driverDesc: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300,
    color: C.base, lineHeight: 1.5, opacity: 0.82,
  },

  // Karmic lessons row (different format)
  karmicBlock: {
    marginTop: 16, padding: 14,
    backgroundColor: '#F0EEE9',
    borderLeftWidth: 2, borderLeftColor: C.emeraldDim, borderLeftStyle: 'solid',
    gap: 5,
  },
  karmicLabel: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase', color: C.emeraldDim,
  },
  karmicNumbers: {
    fontFamily: F.display, fontSize: 18, fontWeight: 400, color: C.base, lineHeight: 1.2,
  },
  karmicDesc: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.8,
  },

  // ── VERSION B: Road in Daily Choice ──────────────────────────────────────
  missingBlock: {
    padding: 20, backgroundColor: '#F5F3EE',
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.1)',
    marginBottom: 24, gap: 8,
  },
  missingIcon: {
    width: 32, height: 32,
    borderWidth: 1, borderColor: C.emeraldDim, borderStyle: 'solid',
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  missingIconText: { fontFamily: F.display, fontSize: 16, fontWeight: 400, color: C.emeraldDim },
  missingLabel: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase', color: C.parchmentFaint, marginBottom: 4,
  },
  missingTitle: { fontFamily: F.display, fontSize: 16, fontWeight: 400, color: C.base, lineHeight: 1.2 },
  missingText: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.82,
  },
  missingCTA: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 0.5, color: C.emerald, marginTop: 6,
  },

  // Road in Daily Choice exercise (Version B alternative content)
  exerciseLabel: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 2.2, textTransform: 'uppercase', color: C.parchmentFaint, marginBottom: 10,
  },
  exerciseBanner: {
    backgroundColor: C.base, padding: 14, marginBottom: 16, gap: 4,
  },
  exerciseBannerLabel: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase', color: C.emerald, opacity: 0.75,
  },
  exerciseBannerTitle: {
    fontFamily: F.display, fontSize: 15, fontWeight: 400, color: C.parchment, lineHeight: 1.2,
  },
  exercisePromise: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.85, marginBottom: 16,
  },
  exerciseQuestions: { flexDirection: 'column', gap: 0 },
  exerciseQ: {
    paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: C.base,
    borderBottomStyle: 'solid', flexDirection: 'row', gap: 12, alignItems: 'flex-start',
  },
  exerciseQLast: {
    paddingVertical: 12, flexDirection: 'row', gap: 12, alignItems: 'flex-start',
  },
  exerciseQBadge: {
    width: 18, height: 18,
    borderWidth: 0.5, borderColor: C.emerald, borderStyle: 'solid',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 1,
  },
  exerciseQNum: { fontFamily: F.sans, fontSize: 7, fontWeight: 500, color: C.emerald },
  exerciseQText: {
    flex: 1, fontFamily: F.sans, fontSize: 10.5, fontWeight: 300,
    color: C.base, lineHeight: 1.5, opacity: 0.85,
  },

  footer: {
    paddingHorizontal: PAGE.marginH, paddingBottom: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: { fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2, color: C.parchmentFaint, textTransform: 'uppercase' },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

// One-sentence interpretations for name-based numbers
function destinyDesc(n: number): string {
  const map: Record<number, string> = {
    1: 'You are here to lead, initiate, and define your own direction.',
    2: 'You are here to cooperate, mediate, and deepen through relationship.',
    3: 'You are here to express, create, and connect through authentic voice.',
    4: 'You are here to build, organize, and create enduring foundations.',
    5: 'You are here to explore, adapt, and model freedom through change.',
    6: 'You are here to nurture, create beauty, and take responsibility with care.',
    7: 'You are here to investigate, understand, and offer depth as a gift.',
    8: 'You are here to lead, manifest, and master the material world with integrity.',
    9: 'You are here to serve, complete, and carry wisdom for others.',
    11: 'You are here to illuminate, inspire, and translate what others sense but cannot name.',
    22: 'You are here to build at scale — systems and structures that outlast your personal timeline.',
    33: 'You are here to serve through compassion, creative mastery, and living example.',
  };
  return map[n] ?? `Your Expression Number ${n} describes the purpose toward which your name points.`;
}

function soulUrgeDesc(n: number): string {
  const map: Record<number, string> = {
    1: 'At the deepest level, you crave independence and the freedom to define yourself.',
    2: 'At the deepest level, you crave harmony, partnership, and genuine belonging.',
    3: 'At the deepest level, you crave authentic creative expression and joyful connection.',
    4: 'At the deepest level, you crave stability, order, and the satisfaction of something built well.',
    5: 'At the deepest level, you crave freedom, variety, and the aliveness of genuine experience.',
    6: 'At the deepest level, you crave to love and be loved — in a context of beauty and responsibility.',
    7: 'At the deepest level, you crave understanding, solitude, and the space to go deep.',
    8: 'At the deepest level, you crave real power — influence and material capacity used well.',
    9: 'At the deepest level, you crave to contribute to something larger than yourself.',
    11: 'At the deepest level, you crave spiritual alignment and the ability to inspire.',
    22: 'At the deepest level, you crave to build something that genuinely matters and lasts.',
  };
  return map[n] ?? `Your Soul Urge Number ${n} reflects what drives you from the inside.`;
}

function personalityDesc(n: number): string {
  const map: Record<number, string> = {
    1: 'Others encounter you as confident, decisive, and directional.',
    2: 'Others encounter you as receptive, thoughtful, and diplomatic.',
    3: 'Others encounter you as warm, expressive, and socially engaged.',
    4: 'Others encounter you as reliable, thorough, and grounded.',
    5: 'Others encounter you as energetic, curious, and adaptable.',
    6: 'Others encounter you as caring, responsible, and aesthetically aware.',
    7: 'Others encounter you as private, observant, and discerning.',
    8: 'Others encounter you as authoritative, focused, and capable.',
    9: 'Others encounter you as compassionate, wise, and generous.',
    11: 'Others encounter you as sensitive, intuitive, and quietly intense.',
    22: 'Others encounter you as capable of something unusually large.',
  };
  return map[n] ?? `Your Personality Number ${n} shapes how others experience you in initial encounters.`;
}

interface Props {
  data: Pick<ReportData,
    'hasFullName' | 'destiny' | 'soulUrge' | 'personality' |
    'hiddenPassion' | 'karmicLessons' | 'firstName'
  >;
}

export default function Page21InnerDrivers({ data }: Props) {
  const drivers = [
    { label: 'Expression / Destiny', value: String(data.destiny), name: 'Life Purpose', desc: destinyDesc(data.destiny) },
    { label: 'Soul Urge',            value: String(data.soulUrge), name: 'Inner Motivation', desc: soulUrgeDesc(data.soulUrge) },
    { label: 'Personality',          value: String(data.personality), name: 'Outer Impression', desc: personalityDesc(data.personality) },
  ];

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.emeraldLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Section 4 — The Road</Text>
        <Text style={S.heading}>Your Inner Drivers</Text>
        <Text style={S.subheading}>
          {data.hasFullName
            ? 'Name-based numbers derived from your full birth name — the layer of the Road that your name encodes.'
            : 'The name-based layer of the Road — available when your full birth name is on file.'}
        </Text>
        <View style={S.headingRule} />

        {data.hasFullName ? (
          <>
            {/* Version A — Name data available */}
            <View style={S.driversList}>
              {drivers.map((d, i) => (
                <View key={d.label} style={i === drivers.length - 1 ? S.driverRowLast : S.driverRow}>
                  <View style={S.driverLeft}>
                    <Text style={S.driverLabel}>{d.label}</Text>
                    <Text style={S.driverValue}>{d.value}</Text>
                  </View>
                  <View style={S.driverDivider} />
                  <View style={S.driverBody}>
                    <Text style={S.driverName}>{d.name}</Text>
                    <Text style={S.driverDesc}>{d.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Hidden Passion */}
            {data.hiddenPassion > 0 && (
              <View style={S.karmicBlock}>
                <Text style={S.karmicLabel}>Hidden Passion — {data.hiddenPassion}</Text>
                <Text style={S.karmicDesc}>
                  The most frequently occurring letter value in your name. This number describes a recurring intensity — a talent or theme that surfaces with unusual frequency across your life.
                </Text>
              </View>
            )}

            {/* Karmic Lessons */}
            {data.karmicLessons.length > 0 && (
              <View style={[S.karmicBlock, { marginTop: 10 }]}>
                <Text style={S.karmicLabel}>Karmic Lessons — Missing from Name</Text>
                <Text style={S.karmicNumbers}>{data.karmicLessons.join('  ·  ')}</Text>
                <Text style={S.karmicDesc}>
                  Numbers absent from your birth name. These are recurring terrains — areas where skill and awareness must be developed through direct experience rather than natural inclination.
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Version B — No name data */}
            <View style={S.missingBlock}>
              <View style={S.missingIcon}>
                <Text style={S.missingIconText}>+</Text>
              </View>
              <Text style={S.missingLabel}>Name Data Not On File</Text>
              <Text style={S.missingTitle}>
                This part of the Road becomes available{'\n'}when your full birth name is added.
              </Text>
              <Text style={S.missingText}>
                Expression, Soul Urge, Personality, Hidden Passion, and Karmic Lessons are all derived from the letters of your full birth name as it appears on your birth certificate. These numbers form the name layer of your Road — and require that input to be calculated accurately.
              </Text>
              <Text style={S.missingCTA}>
                Update your profile at 3dimensions.guide to add your full birth name and unlock this section.
              </Text>
            </View>

            {/* Road in Daily Choice exercise */}
            <Text style={S.exerciseLabel}>In Place of Inner Drivers — Road in Daily Choice</Text>
            <View style={S.exerciseBanner}>
              <Text style={S.exerciseBannerLabel}>Weekly Practice · Life Path {data.karmicLessons.length > 0 ? '—' : ''}</Text>
              <Text style={S.exerciseBannerTitle}>The Road in Daily Choice</Text>
            </View>
            <Text style={S.exercisePromise}>
              Until the name layer is added, this exercise surfaces the same information through direct reflection. At the end of each day this week, answer these three questions.
            </Text>
            <View style={S.exerciseQuestions}>
              {[
                'What did I choose today that felt genuinely mine — not inherited, not obligatory?',
                'What did I do today that felt like someone else\'s version of my life?',
                'If I were walking my Road rather than someone else\'s, what would tomorrow look like differently?',
              ].map((q, i, arr) => (
                <View key={i} style={i === arr.length - 1 ? S.exerciseQLast : S.exerciseQ}>
                  <View style={S.exerciseQBadge}>
                    <Text style={S.exerciseQNum}>{i + 1}</Text>
                  </View>
                  <Text style={S.exerciseQText}>{q}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNum}>21</Text>
      </View>
    </Page>
  );
}
