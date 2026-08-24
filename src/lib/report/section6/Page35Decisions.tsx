/**
 * Page 35 — How You Make Decisions
 *
 * Three-step decision tree. Simple enough to use under pressure.
 * CRITICAL HIERARCHY: Vehicle decides. Road contextualizes. Stoplight informs timing.
 * Road and Stoplight do NOT overrule Vehicle Authority.
 *
 * Flow: A choice appears
 *   → VEHICLE — What is my correct decision process?
 *   → ROAD — Does this move honor my deeper pattern and current phase?
 *   → STOPLIGHT — What conditions, timing, or environment need acknowledging?
 *   → ACT / WAIT / DECLINE / GATHER MORE INFORMATION
 */
import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../shared/PageComponents';
import { C, F, PAGE } from '../tokens';
import { AUTHORITY_PROTOCOL } from '../tokens';
import type { ReportData } from '../tokens';

const S = StyleSheet.create({
  page: { backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  triBar: { flexDirection: 'row', width: PAGE.width },
  barAmber:   { flex: 1, height: 2, backgroundColor: C.amber },
  barEmerald: { flex: 1, height: 2, backgroundColor: C.emerald },
  barCrimson: { flex: 1, height: 2, backgroundColor: C.crimson },
  content: { flex: 1, paddingHorizontal: PAGE.marginH, paddingTop: 36, paddingBottom: PAGE.marginV },
  sectionTag: { fontFamily: F.sans, fontSize: 8.5, fontWeight: 500, letterSpacing: 2.5, color: C.parchmentFaint, textTransform: 'uppercase', marginBottom: 8 },
  heading: { fontFamily: F.display, fontSize: 22, fontWeight: 400, color: C.base, lineHeight: 1.15, marginBottom: 6 },
  subheading: { fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.parchmentFaint, lineHeight: 1.5, marginBottom: 20, maxWidth: 440 },
  rule: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 20 },

  // ── Entry node ────────────────────────────────────────────────────────────
  entryNode: {
    padding: '10 16', backgroundColor: C.base, marginBottom: 0,
    alignSelf: 'flex-start',
  },
  entryText: { fontFamily: F.sans, fontSize: 10.5, fontWeight: 500, letterSpacing: 1.5, textTransform: 'uppercase', color: C.parchment },

  // ── Arrow connector ───────────────────────────────────────────────────────
  arrowContainer: { paddingLeft: 24, paddingVertical: 4 },
  arrowLine: { width: 0.5, height: 16, backgroundColor: C.base, opacity: 0.2, marginLeft: 10 },
  arrowHead: { fontFamily: F.sans, fontSize: 10.5, color: C.parchmentFaint, marginLeft: 6 },

  // ── Step block ────────────────────────────────────────────────────────────
  stepBlock: {
    flexDirection: 'row', gap: 0, marginBottom: 0,
  },
  stepLeft: {
    width: 4, flexShrink: 0, borderRadius: 2,
  },
  stepRight: { flex: 1, paddingLeft: 14, paddingVertical: 12, paddingRight: 0, gap: 4 },
  stepSystem: { fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase' },
  stepTitle: { fontFamily: F.display, fontSize: 14, fontWeight: 400, color: C.base, lineHeight: 1.15 },
  stepQuestion: { fontFamily: F.display, fontSize: 10.5, fontWeight: 400, fontStyle: 'italic', color: C.base, lineHeight: 1.4, opacity: 0.8 },
  stepAnswer: { fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.8 },
  stepBorder: { width: PAGE.contentWidth - 18, height: 0.5, backgroundColor: C.base, opacity: 0.08, marginTop: 4 },

  // ── Hierarchy note ────────────────────────────────────────────────────────
  hierarchyNote: {
    marginTop: 4, padding: '8 12',
    backgroundColor: '#F5F3EE',
    borderLeftWidth: 1.5, borderLeftColor: C.amber, borderLeftStyle: 'solid',
  },
  hierarchyText: {
    fontFamily: F.display, fontSize: 10.5, fontWeight: 400, fontStyle: 'italic',
    color: C.base, lineHeight: 1.5, opacity: 0.75,
  },

  // ── Outcome row ───────────────────────────────────────────────────────────
  outcomeRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  outcomeBlock: { flex: 1, padding: '9 10', borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.15)', alignItems: 'center' },
  outcomeText: { fontFamily: F.sans, fontSize: 8.5, fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase', color: C.base, textAlign: 'center' },

  footer: { paddingHorizontal: PAGE.marginH, paddingBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2, color: C.parchmentFaint, textTransform: 'uppercase' },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

function getAuthorityPrompt(authority: string): string {
  const key = Object.keys(AUTHORITY_PROTOCOL).find(k =>
    authority.toLowerCase().includes(k.toLowerCase())
  ) ?? 'Sacral';
  return AUTHORITY_PROTOCOL[key]?.prompt ?? 'What does your correct decision mechanism say?';
}

interface Props {
  data: Pick<ReportData, 'hdType' | 'hdAuthority' | 'hdStrategy' | 'lifePath' | 'personalYear' | 'sunSign'>;
}

export default function Page35Decisions({ data }: Props) {
  const authorityPrompt = getAuthorityPrompt(data.hdAuthority);

  const steps = [
    {
      color:    C.amber,
      system:   'VEHICLE — Human Design',
      title:    'What is my correct decision process?',
      question: authorityPrompt,
      answer:   `${data.hdType}: ${data.hdStrategy}. Your Authority (${data.hdAuthority}) is the mechanism — use it before Road or Stoplight.`,
      isFirst:  true,
    },
    {
      color:    C.emerald,
      system:   'ROAD — Numerology',
      title:    'Does this move honor my deeper pattern?',
      question: `Does this choice align with Life Path ${data.lifePath} and what a Personal Year ${data.personalYear} is asking for?`,
      answer:   'The Road contextualizes meaning and developmental timing. It does not overrule the Vehicle\'s answer.',
      isFirst:  false,
    },
    {
      color:    C.crimson,
      system:   'STOPLIGHT — Astrology',
      title:    'What conditions need acknowledging?',
      question: `What is the ${data.sunSign} Sun's relationship to this timing? What seasonal or environmental factors are active?`,
      answer:   'The Stoplight informs timing and conditions. It does not overrule the Vehicle or the Road.',
      isFirst:  false,
    },
  ];

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.triBar}>
        <View style={S.barAmber} />
        <View style={S.barEmerald} />
        <View style={S.barCrimson} />
      </View>
      <View style={S.content}>
        <Text style={S.sectionTag}>Section 6 — The Sovereign Operating System</Text>
        <Text style={S.heading}>How You Make Decisions</Text>
        <Text style={S.subheading}>
          A three-step sequence designed to be simple enough to use under real pressure. Run the steps in order. Don't skip the Vehicle.
        </Text>
        <View style={S.rule} />

        {/* Entry node */}
        <View style={S.entryNode}>
          <Text style={S.entryText}>A choice appears</Text>
        </View>

        {steps.map((step, i) => (
          <React.Fragment key={step.system}>
            {/* Arrow */}
            <View style={S.arrowContainer}>
              <View style={S.arrowLine} />
              <Text style={S.arrowHead}>↓</Text>
            </View>

            {/* Step block */}
            <View style={S.stepBlock}>
              <View style={[S.stepLeft, { backgroundColor: step.color, height: 72 }]} />
              <View style={S.stepRight}>
                <Text style={[S.stepSystem, { color: step.color }]}>{step.system}</Text>
                <Text style={S.stepTitle}>{step.title}</Text>
                <Text style={S.stepQuestion}>{step.question}</Text>
                <Text style={S.stepAnswer}>{step.answer}</Text>
                {i < steps.length - 1 && <View style={S.stepBorder} />}
              </View>
            </View>
          </React.Fragment>
        ))}

        {/* Hierarchy note */}
        <View style={S.hierarchyNote}>
          <Text style={S.hierarchyText}>
            The Vehicle is the immediate decision mechanism. The Road and Stoplight add meaning and timing — they do not overrule what the Authority already said.
          </Text>
        </View>

        {/* Arrow to outcomes */}
        <View style={S.arrowContainer}>
          <View style={S.arrowLine} />
          <Text style={S.arrowHead}>↓</Text>
        </View>

        {/* Four outcomes */}
        <View style={S.outcomeRow}>
          {['ACT', 'WAIT', 'DECLINE', 'GATHER MORE'].map(o => (
            <View key={o} style={S.outcomeBlock}>
              <Text style={S.outcomeText}>{o}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNum}>35</Text>
      </View>
    </Page>
  );
}
