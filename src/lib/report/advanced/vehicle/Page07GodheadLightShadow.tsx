/**
 * Advanced Sovereign Report — Vehicle Section — The Light & The Shadow
 *
 * Companion to Page06Godhead.tsx — every one of the 16 Godheads has both an
 * integrated (light) expression and a distorted, not-self (shadow)
 * expression, sourced from the T3D PHILOSOPHER notebook. This page gives
 * that pairing the room it needs: a dedicated two-card spread for the
 * reader's specific Godhead, framed by what actually separates the two
 * (living from Strategy and Authority vs. living from the mind's grip on
 * the archetype), plus the source gate carried over from Page06 so this
 * page stands on its own if read in isolation.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../../shared/PageComponents';
import { C, F, PAGE, calculateGodhead } from '../../tokens';
import { GATE_KEYNOTES } from '../../section3/gate-content';
import type { ReportData } from '../../tokens';

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
    lineHeight: 1.5, marginBottom: 20, maxWidth: 440,
  },
  headingRule: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 24 },

  godheadRecap: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 22 },
  godheadRecapLabel: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500, letterSpacing: 1.6,
    color: C.parchmentFaint, textTransform: 'uppercase',
  },
  godheadRecapName: {
    fontFamily: F.display, fontSize: 18, fontWeight: 700, color: C.amber,
  },

  cardsRow: { flexDirection: 'row', gap: 14, marginBottom: 24 },
  card: {
    flex: 1, padding: 16, backgroundColor: '#FFFFFF',
    borderWidth: 0.75, borderColor: C.base, borderStyle: 'solid', borderRadius: 3,
    borderLeftWidth: 3, borderLeftStyle: 'solid',
  },
  lightCard: { borderLeftColor: '#1F8A4D' },
  shadowCard: { borderLeftColor: '#C83E3E' },
  cardLabel: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 700, letterSpacing: 1.2,
    textTransform: 'uppercase', marginBottom: 8,
  },
  lightLabel: { color: '#1F8A4D' },
  shadowLabel: { color: '#C83E3E' },
  cardText: {
    fontFamily: F.sans, fontSize: 9.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.9,
  },

  frameBlock: {
    padding: 18, backgroundColor: '#F5F3EE',
    borderLeftWidth: 2, borderLeftColor: C.amber, borderLeftStyle: 'solid',
    marginBottom: 24,
  },
  frameLabel: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 700, letterSpacing: 1.2,
    color: C.amberDim, textTransform: 'uppercase', marginBottom: 6,
  },
  frameText: {
    fontFamily: F.sans, fontSize: 10, fontWeight: 300, color: C.base, lineHeight: 1.55, opacity: 0.9,
  },

  gateGridLabel: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500, letterSpacing: 1.6,
    color: C.parchmentFaint, textTransform: 'uppercase', marginBottom: 10,
  },
  gateCard: {
    padding: 14, backgroundColor: '#FFFFFF',
    borderWidth: 0.75, borderColor: C.base, borderStyle: 'solid', borderRadius: 3,
  },
  gateCardRole: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 700, letterSpacing: 1, color: C.amberDim, textTransform: 'uppercase',
    marginBottom: 5,
  },
  gateCardName: {
    fontFamily: F.display, fontSize: 12.5, fontStyle: 'italic', color: C.base, marginBottom: 5,
  },
  gateCardMeaning: {
    fontFamily: F.sans, fontSize: 9, fontWeight: 400, color: C.base, lineHeight: 1.4,
    paddingTop: 6, borderTopWidth: 0.5, borderTopColor: C.base, borderTopStyle: 'solid',
  },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: PAGE.marginH, paddingBottom: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: { fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2, color: C.parchmentFaint, textTransform: 'uppercase' },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

interface Props {
  data: Pick<ReportData, 'hdActiveGates'>;
}

export default function Page07GodheadLightShadow({ data }: Props) {
  const result = calculateGodhead(data.hdActiveGates);
  const { godhead, personalitySunGate } = result;
  const sourceKeynote = personalitySunGate ? GATE_KEYNOTES[personalitySunGate] : undefined;

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.amberLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Advanced Sovereign Report · The Vehicle</Text>
        <Text style={S.heading}>The Light & The Shadow</Text>
        <Text style={S.subheading}>
          Every Godhead carries two faces: an integrated expression that shows up when you&rsquo;re
          living correctly through your Strategy and Authority, and a distorted one that surfaces
          when the mind takes over and tries to perform the archetype instead of simply carrying it.
        </Text>
        <View style={S.headingRule} />

        {godhead ? (
          <>
            <View style={S.godheadRecap}>
              <Text style={S.godheadRecapLabel}>Your Godhead</Text>
              <Text style={S.godheadRecapName}>{godhead.name}</Text>
            </View>

            <View style={S.cardsRow}>
              <View style={[S.card, S.lightCard]}>
                <Text style={[S.cardLabel, S.lightLabel]}>The Gift</Text>
                <Text style={S.cardText}>{godhead.light}</Text>
              </View>
              <View style={[S.card, S.shadowCard]}>
                <Text style={[S.cardLabel, S.shadowLabel]}>The Shadow</Text>
                <Text style={S.cardText}>{godhead.shadow}</Text>
              </View>
            </View>

            <View style={S.frameBlock}>
              <Text style={S.frameLabel}>What Actually Separates Them</Text>
              <Text style={S.frameText}>
                Neither side is a fixed personality trait to manage — it&rsquo;s a live signal for whether
                you&rsquo;re currently operating from your own mechanics or from borrowed, mental
                imitation of the archetype. The shadow isn&rsquo;t a flaw baked into your Godhead; it&rsquo;s
                what that same energy looks like when it&rsquo;s forced, rushed, or run by the mind
                instead of your body&rsquo;s own Strategy and Authority. Recognizing which one is active
                is usually enough, on its own, to loosen the mind&rsquo;s grip and let the gift show up
                again.
              </Text>
            </View>

            <Text style={S.gateGridLabel}>The Gate Behind This Reading</Text>
            <View style={S.gateCard}>
              <Text style={S.gateCardRole}>Personality Sun · Gate {personalitySunGate}</Text>
              {sourceKeynote && <Text style={S.gateCardName}>{sourceKeynote.ichingName}</Text>}
              {sourceKeynote && <Text style={S.gateCardMeaning}>{sourceKeynote.coreMeaning}</Text>}
            </View>
          </>
        ) : (
          <View style={S.frameBlock}>
            <Text style={S.frameText}>
              Your Personality Sun activation wasn&rsquo;t available to resolve a Godhead reading.
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
