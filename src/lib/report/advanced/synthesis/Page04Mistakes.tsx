/**
 * Advanced Sovereign Report — Section IV — Four Ways This Goes Sideways
 *
 * Purely templated — same four cards for every reader. These map onto
 * four well-established failure patterns in how people misuse a
 * self-knowledge framework once they have "too much" of it: overriding
 * the body with the mind, treating hard conditions as a problem to fix
 * rather than weather to move through, forcing a sense of purpose
 * mentally instead of letting Strategy and Authority resolve it, and
 * over-intellectualizing while ignoring the physical Vehicle itself.
 * Written entirely in T3D's own voice — no external teacher, book, or
 * source is named anywhere in this copy.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../../shared/PageComponents';
import { C, F, PAGE } from '../../tokens';

const S = StyleSheet.create({
  page: { paddingTop: 0, paddingLeft: 0, paddingRight: 0, paddingBottom: PAGE.marginV, backgroundColor: '#F5F5F3', fontFamily: F.sans }, // QA fix: explicit edges, no padding shorthand (see Page05Transits.tsx)
  amberLine: { width: PAGE.width, height: 1.5, backgroundColor: C.crimson },
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
  headingRule: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 20 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: 240, padding: 14, backgroundColor: '#FFFFFF',
    borderLeftWidth: 3, borderLeftColor: C.crimson, borderLeftStyle: 'solid',
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.12)', borderStyle: 'solid',
  },
  cardNum: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 700, letterSpacing: 1.2,
    color: C.crimsonDim, textTransform: 'uppercase', marginBottom: 6,
  },
  cardTitle: {
    fontFamily: F.display, fontSize: 13, fontWeight: 400, color: C.base, marginBottom: 6,
  },
  cardText: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.85,
  },

  closer: {
    marginTop: 16, padding: 14, backgroundColor: '#F5F3EE',
    borderLeftWidth: 2, borderLeftColor: C.base, borderLeftStyle: 'solid',
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

export default function Page04Mistakes() {
  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.amberLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Advanced Sovereign Report · The Integration</Text>
        <Text style={S.heading}>Four Ways This Goes Sideways</Text>
        <Text style={S.subheading}>
          None of these are failures of the systems themselves. They&rsquo;re the four most common
          ways people quietly break the hierarchy from the last page without noticing.
        </Text>
        <View style={S.headingRule} />

        <View style={S.grid}>
          <View style={S.card}>
            <Text style={S.cardNum}>One</Text>
            <Text style={S.cardTitle}>Letting The Mind Drive</Text>
            <Text style={S.cardText}>
              Reasoning your way to a decision instead of waiting for it to come through your
              actual Authority. It feels like being responsible. It&rsquo;s actually the fastest
              way to override the one mechanism built to get this right.
            </Text>
          </View>

          <View style={S.card}>
            <Text style={S.cardNum}>Two</Text>
            <Text style={S.cardTitle}>Fighting The Weather</Text>
            <Text style={S.cardText}>
              Treating a hard transit or a heavy Challenge year as bad luck to resist rather than a
              condition to move through. A red light doesn&rsquo;t change by being fought — it
              changes by being waited out correctly.
            </Text>
          </View>

          <View style={S.card}>
            <Text style={S.cardNum}>Three</Text>
            <Text style={S.cardTitle}>Turning Purpose Into A To-Do List</Text>
            <Text style={S.cardText}>
              Trying to chase or force an Incarnation Cross or a Life Path into existence through
              sheer effort. It was never meant to be executed on — it resolves on its own, through
              correct Strategy and Authority, not through more hustle.
            </Text>
          </View>

          <View style={S.card}>
            <Text style={S.cardNum}>Four</Text>
            <Text style={S.cardTitle}>Skipping The Body</Text>
            <Text style={S.cardText}>
              Living entirely in analysis — reading the charts, understanding the concepts — while
              never actually feeling what Strategy and Authority produce in the body. The
              mechanism only works if it&rsquo;s run, not just understood.
            </Text>
          </View>
        </View>

        <View style={S.closer}>
          <Text style={S.closerText}>
            If any of these sound familiar, that&rsquo;s not a verdict — it&rsquo;s just the
            starting point. The closing page ties your actual configuration back to all of this,
            specifically.
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
