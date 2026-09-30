/**
 * Advanced Sovereign Report — Section IV — Which One Actually Decides?
 *
 * The single most important page in this section. The Stack (previous
 * page) established that all three systems are legitimate and none
 * replaces the others — this page establishes the one rule that makes
 * them usable together: awareness and authority move in opposite
 * directions.
 *
 * Awareness flows Stoplight → Road → Vehicle (notice today's specific
 * signal, place it inside the current season, then bring it to the
 * Vehicle). Authority only ever flows one way, and stops at the Vehicle:
 * no transit and no numerology cycle is ever allowed to make the actual
 * call. This is purely templated doctrine copy — every reader sees the
 * same structure — with one personalization line naming the reader's own
 * Authority in the non-negotiable-rule callout, since that's the specific
 * mechanism the rule is asking them to trust.
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
  headingRule: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 22 },

  flowRow: { flexDirection: 'row', gap: 10, marginBottom: 22, alignItems: 'stretch' },
  flowStep: {
    flex: 1, padding: 14, backgroundColor: '#FFFFFF',
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.12)', borderStyle: 'solid',
  },
  flowNum: {
    fontFamily: F.display, fontSize: 20, fontWeight: 400, color: C.amberDim, marginBottom: 6,
  },
  flowTitle: {
    fontFamily: F.sans, fontSize: 9.5, fontWeight: 700, color: C.base, marginBottom: 5,
  },
  flowText: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.85,
  },
  flowArrow: {
    width: 16, alignItems: 'center', justifyContent: 'center',
  },
  flowArrowText: { fontFamily: F.sans, fontSize: 14, color: C.parchmentFaint },

  ruleBlock: {
    padding: 18,
    backgroundColor: C.amberLight,
    borderWidth: 1, borderColor: C.amber, borderStyle: 'solid',
    marginBottom: 16,
  },
  ruleLabel: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 700, letterSpacing: 1.6,
    textTransform: 'uppercase', color: C.amberDim, marginBottom: 8,
  },
  ruleText: {
    fontFamily: F.display, fontSize: 13, fontWeight: 400, fontStyle: 'italic', color: C.base,
    lineHeight: 1.45,
  },

  noteText: {
    fontFamily: F.sans, fontSize: 9.5, fontWeight: 300, color: C.base, lineHeight: 1.55, opacity: 0.88,
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
  data: { hdAuthority: string };
}

export default function Page03Hierarchy({ data }: Props) {
  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.amberLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Advanced Sovereign Report · The Integration</Text>
        <Text style={S.heading}>Which One Actually Decides?</Text>
        <Text style={S.subheading}>
          All three systems are real. Only one of them is allowed to make a decision. This is the
          rule that keeps the other two from quietly taking over.
        </Text>
        <View style={S.headingRule} />

        <View style={S.flowRow}>
          <View style={S.flowStep}>
            <Text style={S.flowNum}>1</Text>
            <Text style={S.flowTitle}>Notice The Stoplight</Text>
            <Text style={S.flowText}>
              What&rsquo;s actually active right now. This is information about today, nothing
              more — it doesn&rsquo;t vote.
            </Text>
          </View>
          <View style={S.flowArrow}><Text style={S.flowArrowText}>→</Text></View>
          <View style={S.flowStep}>
            <Text style={S.flowNum}>2</Text>
            <Text style={S.flowTitle}>Place It On The Road</Text>
            <Text style={S.flowText}>
              Which chapter this falls inside. Context for what today&rsquo;s signal actually
              means — still not a vote.
            </Text>
          </View>
          <View style={S.flowArrow}><Text style={S.flowArrowText}>→</Text></View>
          <View style={S.flowStep}>
            <Text style={S.flowNum}>3</Text>
            <Text style={S.flowTitle}>Decide Through The Vehicle</Text>
            <Text style={S.flowText}>
              The only step with an actual vote. Everything before this is context for your
              Authority — not a substitute for it.
            </Text>
          </View>
        </View>

        <View style={S.ruleBlock}>
          <Text style={S.ruleLabel}>The Non-Negotiable Rule</Text>
          <Text style={S.ruleText}>
            {`“Awareness can come from anywhere. The decision only ever comes from ${data.hdAuthority} Authority — never from how urgent a transit feels, and never from which chapter of the Road you’re standing in.”`}
          </Text>
        </View>

        <Text style={S.noteText}>
          {`This is the one place people override their own design without noticing they’ve done it. A hard transit or a heavy Challenge year can make a decision feel urgent enough that the mind steps in and answers for the body — quietly skipping straight to step three without ever actually running it through ${data.hdAuthority} Authority. The next page names the specific ways this tends to happen.`}
        </Text>
      </View>

      <View style={S.footer} fixed>
        <Text style={S.footerText}>T3D Advanced Sovereign Report</Text>
        <Text style={S.pageNum} render={({ pageNumber }) => pageNumber} />
      </View>
    </Page>
  );
}
