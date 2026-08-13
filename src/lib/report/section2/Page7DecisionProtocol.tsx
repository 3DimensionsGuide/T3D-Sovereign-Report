/**
 * Page 7 — Your Sovereign Decision Protocol
 *
 * Reader need: "What Do I Do When I Must Choose?"
 *
 * The report's most practically valuable page.
 * Decision flow: Vehicle/Authority → Road pattern check → Stoplight timing check
 * Personalized to the reader's actual HD Authority.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { C, F, PAGE, AUTHORITY_PROTOCOL } from '../tokens';
import type { ReportData } from '../tokens';

const S = StyleSheet.create({
  page: {
    backgroundColor: '#FAFAF9',
    padding: 0,
    fontFamily: F.sans,
  },
  topRule: {
    width: PAGE.width,
    height: 2,
    backgroundColor: C.base,
  },

  content: {
    flex: 1,
    paddingHorizontal: PAGE.marginH,
    paddingTop: 44,
    paddingBottom: PAGE.marginV,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  sectionTag: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 500,
    letterSpacing: 2.5,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heading: {
    fontFamily: F.display,
    fontSize: 22,
    fontWeight: 400,
    color: C.base,
    lineHeight: 1.15,
    marginBottom: 6,
  },
  subheading: {
    fontFamily: F.sans,
    fontSize: 9,
    fontWeight: 300,
    color: C.parchmentFaint,
    lineHeight: 1.6,
    marginBottom: 24,
    maxWidth: 380,
  },
  headingRule: {
    width: PAGE.contentWidth,
    height: 0.5,
    backgroundColor: C.base,
    opacity: 0.1,
    marginBottom: 24,
  },

  // ── Decision flow steps ────────────────────────────────────────────────────
  stepsContainer: {
    flexDirection: 'column',
    gap: 0,
  },

  step: {
    flexDirection: 'row',
    gap: 0,
    marginBottom: 0,
  },

  // Left column — step number + connector
  stepLeft: {
    width: 40,
    flexShrink: 0,
    alignItems: 'center',
    gap: 0,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
  },
  stepNumber: {
    fontFamily: F.sans,
    fontSize: 9,
    fontWeight: 500,
    color: C.parchment,
  },
  stepConnector: {
    width: 1,
    flex: 1,
    minHeight: 20,
    backgroundColor: C.base,
    opacity: 0.15,
    marginVertical: 4,
  },

  // Right column — step content
  stepRight: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 20,
  },
  stepSystem: {
    fontFamily: F.sans,
    fontSize: 6.5,
    fontWeight: 500,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  stepTitle: {
    fontFamily: F.display,
    fontSize: 15,
    fontWeight: 400,
    color: C.base,
    lineHeight: 1.15,
    marginBottom: 6,
  },

  // The primary question
  stepPrompt: {
    fontFamily: F.display,
    fontSize: 11,
    fontWeight: 400,
    fontStyle: 'italic',
    color: C.base,
    lineHeight: 1.4,
    marginBottom: 8,
    paddingLeft: 10,
    borderLeftWidth: 1.5,
    borderLeftStyle: 'solid',
  },

  stepInstruction: {
    fontFamily: F.sans,
    fontSize: 9.5,
    fontWeight: 300,
    color: C.base,
    lineHeight: 1.65,
    opacity: 0.82,
    marginBottom: 6,
  },
  stepSignal: {
    fontFamily: F.sans,
    fontSize: 8,
    fontWeight: 500,
    letterSpacing: 0.4,
    color: C.parchmentFaint,
  },

  // ── Key principle at bottom ───────────────────────────────────────────────
  principle: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: C.base,
    borderTopStyle: 'solid',
  },
  principleText: {
    fontFamily: F.display,
    fontSize: 10.5,
    fontWeight: 400,
    fontStyle: 'italic',
    color: C.base,
    lineHeight: 1.55,
    opacity: 0.75,
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: PAGE.marginH,
    paddingBottom: 28,
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

interface Props {
  data: Pick<ReportData, 'hdAuthority' | 'hdStrategy' | 'hdType' | 'lifePath' | 'personalYear' | 'sunSign'>;
}

export default function Page7DecisionProtocol({ data }: Props) {
  // Get the authority-specific protocol
  const authorityKey = Object.keys(AUTHORITY_PROTOCOL).find(k =>
    data.hdAuthority.toLowerCase().includes(k.toLowerCase())
  ) ?? 'Sacral';

  const protocol = AUTHORITY_PROTOCOL[authorityKey] ?? AUTHORITY_PROTOCOL['Sacral']!;

  const steps = [
    {
      num:    '1',
      system: 'The Vehicle — Human Design',
      title:  'Check Your Authority',
      color:  C.amber,
      prompt:      protocol.prompt,
      instruction: protocol.instruction,
      signal:      protocol.signal,
    },
    {
      num:    '2',
      system: 'The Road — Numerology',
      title:  'Run The Pattern Check',
      color:  C.emerald,
      prompt:      'Does this choice align with where your numbers are pointing?',
      instruction: `Your Life Path ${data.lifePath} has a direction — a kind of question your life keeps asking. Does this decision move toward that question or away from it? In a Personal Year ${data.personalYear}, what is this year's energy asking for?`,
      signal:      'Alignment feels like a deepening. Misalignment often arrives as a quiet sense of going against the grain.',
    },
    {
      num:    '3',
      system: 'The Stoplight — Astrology',
      title:  'Read The Current Signal',
      color:  C.crimson,
      prompt:      'What are the current conditions signaling?',
      instruction: `Your ${data.sunSign} Sun shapes how you meet decisions by nature. The current season — your Personal Year ${data.personalYear} — sets the broader timing context. Green means conditions support movement. Yellow means proceed with awareness. Red means wait for the signal to change.`,
      signal:      'Timing is not an excuse to avoid. It is information about when effort will meet the least resistance.',
    },
  ];

  return (
    <Page size="LETTER" style={S.page}>

      {/* Dark top rule */}
      <View style={[S.topRule, { opacity: 0.85 }]} />

      <View style={S.content}>
        <Text style={S.sectionTag}>Section 2 — Your Coordinates</Text>
        <Text style={S.heading}>Your Sovereign Decision Protocol</Text>
        <Text style={S.subheading}>
          When you must choose and you're not sure — move through these three checks in order.
          Authority first. Pattern second. Timing third.
        </Text>
        <View style={S.headingRule} />

        {/* Three steps */}
        <View style={S.stepsContainer}>
          {steps.map((step, i) => (
            <View key={step.num} style={S.step}>
              {/* Step number + connector */}
              <View style={S.stepLeft}>
                <View style={[S.stepCircle, {
                  backgroundColor: step.color,
                  borderColor: step.color,
                }]}>
                  <Text style={S.stepNumber}>{step.num}</Text>
                </View>
                {i < steps.length - 1 && <View style={S.stepConnector} />}
              </View>

              {/* Step content */}
              <View style={S.stepRight}>
                <Text style={[S.stepSystem, { color: step.color }]}>{step.system}</Text>
                <Text style={S.stepTitle}>{step.title}</Text>
                <Text style={[S.stepPrompt, { borderLeftColor: step.color }]}>
                  {step.prompt}
                </Text>
                <Text style={S.stepInstruction}>{step.instruction}</Text>
                <Text style={S.stepSignal}>{step.signal}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Key principle */}
        <View style={S.principle}>
          <Text style={S.principleText}>
            The protocol does not make the decision for you. It surfaces the information that was always available — and helps you hear it before you override it.
          </Text>
        </View>
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNumber}>7</Text>
      </View>
    </Page>
  );
}
