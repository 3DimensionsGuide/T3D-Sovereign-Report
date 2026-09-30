/**
 * Advanced Sovereign Report — Vehicle Section — What Is A Gate?
 *
 * A foundational primer, not chart-specific — same content for every
 * reader, no props needed. Sits between Page02Definition and
 * Page02Bodygraph: Definition introduces the 9 Centers and how they group,
 * this page explains the 64 Gates that actually make up a Channel, and the
 * Bodygraph page right after puts real gate numbers on the diagram — this
 * is the page that makes those numbers legible rather than decorative.
 *
 * Kept as its own page rather than a mechanism block bolted onto
 * Page02Bodygraph — tried that first and it pushed the diagram + legend
 * into react-pdf's automatic reflow, splitting badly across two pages.
 * Same reasoning Page03Bridges' docblock already gives for why it isn't
 * folded into Page02Definition.
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
  headingRule: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 24 },

  stack: { gap: 16 },
  block: {
    padding: 16, backgroundColor: '#FFFFFF',
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.12)', borderStyle: 'solid',
  },
  blockLabel: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 700, letterSpacing: 1.4,
    color: C.amberDim, textTransform: 'uppercase', marginBottom: 7,
  },
  blockText: {
    fontFamily: F.sans, fontSize: 9.5, fontWeight: 300, color: C.base, lineHeight: 1.55, opacity: 0.88,
  },

  closer: {
    marginTop: 4, padding: 16, backgroundColor: '#F5F3EE',
    borderLeftWidth: 2, borderLeftColor: C.amber, borderLeftStyle: 'solid',
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

export default function Page02Gates() {
  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.amberLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Advanced Sovereign Report · The Vehicle</Text>
        <Text style={S.heading}>What Is A Gate?</Text>
        <Text style={S.subheading}>
          Everything else in this section — Definition, your Bodygraph, Bridges — is built from
          this one unit. Worth understanding it properly before the numbers start showing up.
        </Text>
        <View style={S.headingRule} />

        <View style={S.stack}>
          <View style={S.block}>
            <Text style={S.blockLabel}>The 64 Gates</Text>
            <Text style={S.blockText}>
              Underneath the 9 Centers sits a finer structure: 64 Gates, one for each hexagram of
              the I Ching, each carrying its own specific theme — a way of thinking, feeling, or
              engaging with the world that&rsquo;s distinct from everything else living on its
              Center. Every Gate belongs to exactly one Center. An active Gate isn&rsquo;t a vague
              inclination — it&rsquo;s a specific, fixed piece of your circuitry.
            </Text>
          </View>

          <View style={S.block}>
            <Text style={S.blockLabel}>Two Charts, Not One</Text>
            <Text style={S.blockText}>
              Every planet in your chart activates a Gate by where it fell in the sky at two
              separate moments: your Personality (the exact moment you were born — your
              conscious side) and your Design (roughly three months earlier, when the Sun reached
              the degree it would return to at your birth — your unconscious side, running
              whether you&rsquo;re aware of it or not). Both layers are real, and both are yours.
            </Text>
          </View>

          <View style={S.block}>
            <Text style={S.blockLabel}>Gates Come In Pairs</Text>
            <Text style={S.blockText}>
              Every Gate has exactly one partner — on a different Center — that completes it into
              a Channel. When both Gates in the pair are active, the Channel closes and both
              Centers it touches are Defined: a circuit that runs consistently, on its own,
              whether anyone&rsquo;s watching or not.
            </Text>
          </View>

          <View style={S.block}>
            <Text style={S.blockLabel}>When Only One Side Is Active</Text>
            <Text style={S.blockText}>
              Sometimes only your side of a pair is active — a hanging Gate. It&rsquo;s live, but
              it&rsquo;s waiting on someone or somewhere else to complete the circuit from outside
              you. That&rsquo;s not a flaw; it&rsquo;s the exact mechanism behind &ldquo;Where You
              Need a Bridge,&rdquo; a few pages ahead.
            </Text>
          </View>
        </View>

        <View style={S.closer}>
          <Text style={S.closerText}>
            Keep this page in mind as you go: your Bodygraph, your Definition, your Incarnation
            Cross, even your Godhead — all of it reduces to this same mechanism, just read at a
            different zoom level.
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
