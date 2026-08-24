/**
 * Pages 41–42 — Reflection Writing Pages
 *
 * Grid type: #5 Reflection — 5 columns prompt (left) + 7 columns writing (right).
 *
 * The key structural insight: the prompt stays visible while writing.
 * Putting the question left and the writing lines right means the reader
 * never has to scroll or flip back to reread the prompt mid-answer.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { C, F, PAGE } from '../tokens';
import { TechnicalLines } from '../shared/PageComponents';
import { GRID } from '../shared/grid';
import type { ReportData } from '../tokens';

const S = StyleSheet.create({
  page:     { backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  triBar:   { flexDirection: 'row', width: PAGE.width },
  barA:     { flex: 1, height: 1.5, backgroundColor: C.amber },
  barE:     { flex: 1, height: 1.5, backgroundColor: C.emerald },
  barC:     { flex: 1, height: 1.5, backgroundColor: C.crimson },
  content:  { flex: 1, paddingHorizontal: PAGE.marginH, paddingTop: 44, paddingBottom: PAGE.marginV },

  sectionTag: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 2.5, color: C.parchmentFaint, textTransform: 'uppercase', marginBottom: 8,
  },
  headingSmall: {
    fontFamily: F.sans, fontSize: 9, fontWeight: 300, color: C.parchmentFaint, marginBottom: 3,
  },
  heading: {
    fontFamily: F.display, fontSize: 22, fontWeight: 400,
    color: C.base, lineHeight: 1.1, marginBottom: 6,
  },
  sub: {
    fontFamily: F.sans, fontSize: 9.5, fontWeight: 300,
    color: C.parchmentFaint, lineHeight: 1.5, marginBottom: 20, maxWidth: 440,
  },
  rule: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 20 },

  // ── 5+7 Reflection grid ───────────────────────────────────────────────────
  reflectionRow: {
    flexDirection: 'row',
    gap: GRID.gap,
    marginBottom: 20,
  },

  // Left — 5 cols (prompt zone)
  promptCol: {
    flex: GRID.reflection.prompt,  // flex: 5
    gap: 0,
    justifyContent: 'flex-start',
  },
  promptNum: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8,
  },
  promptText: {
    fontFamily: F.display, fontSize: 12, fontWeight: 400,
    fontStyle: 'italic', color: C.base, lineHeight: 1.45,
  },

  // Right — 7 cols (writing space)
  writingCol: {
    flex: GRID.reflection.writing,  // flex: 7
    justifyContent: 'flex-end',
    gap: 0,
  },
  writingLineGroup: {
    flexDirection: 'column', gap: 16,
  },
  writingLine: {
    width: '100%', height: 0.5,
    backgroundColor: C.base, opacity: 0.14,
  },

  // Column divider
  colDivider: { width: 0.5, backgroundColor: C.base, opacity: 0.1 },

  // Commitment frame (Page 42 only)
  commitFrame: {
    padding: '10 14', marginTop: 8,
    backgroundColor: 'rgba(31,138,77,0.06)',
    borderLeftWidth: 2, borderLeftColor: C.emerald, borderLeftStyle: 'solid',
  },
  commitText: {
    fontFamily: F.display, fontSize: 10, fontWeight: 400,
    fontStyle: 'italic', color: C.base, lineHeight: 1.5, opacity: 0.75,
  },

  footer: {
    paddingHorizontal: PAGE.marginH, paddingBottom: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: { fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2, color: C.parchmentFaint, textTransform: 'uppercase' },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

// Number of writing lines per prompt — more space = more lines
const LINES_PER_PROMPT = 5;

function WritingLines() {
  return (
    <View style={S.writingLineGroup}>
      {Array.from({ length: LINES_PER_PROMPT }).map((_, i) => (
        <View key={i} style={S.writingLine} />
      ))}
    </View>
  );
}

interface Props { data: Pick<ReportData, 'firstName'>; }

// ─── PAGE 41 — THE PATTERN I AM READY TO LEAVE ───────────────────────────────
export function Page41Leave({ data }: Props) {
  const prompts = [
    {
      num: '01',
      color: C.amber,
      text: 'What behavior, belief, or role have I been maintaining that no longer reflects who I actually am?',
    },
    {
      num: '02',
      color: C.emerald,
      text: 'What does staying in this pattern cost me — specifically, and in concrete terms?',
    },
    {
      num: '03',
      color: C.crimson,
      text: 'What would I need to believe in order to release this without regret?',
    },
  ];

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />
      <View style={S.triBar}><View style={S.barA} /><View style={S.barE} /><View style={S.barC} /></View>

      <View style={S.content}>
        <Text style={S.sectionTag}>Section 7 — Integration & Close · Reflection</Text>
        <Text style={S.headingSmall}>The Pattern</Text>
        <Text style={S.heading}>I Am Ready To Leave</Text>
        <Text style={S.sub}>
          Prompt on the left. Writing space on the right. Three questions. Write without editing.
        </Text>
        <View style={S.rule} />

        {prompts.map((p, i) => (
          <View key={p.num} style={[S.reflectionRow, i === prompts.length - 1 ? { marginBottom: 0 } : {}]}>
            {/* Left: 5-col prompt zone */}
            <View style={S.promptCol}>
              <Text style={[S.promptNum, { color: p.color }]}>{p.num}</Text>
              <Text style={S.promptText}>{p.text}</Text>
            </View>

            {/* Column divider */}
            <View style={S.colDivider} />

            {/* Right: 7-col writing space */}
            <View style={S.writingCol}>
              <WritingLines />
            </View>
          </View>
        ))}
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNum}>41</Text>
      </View>
    </Page>
  );
}

// ─── PAGE 42 — THE PATTERN I AM READY TO KEEP ────────────────────────────────
export function Page42Keep({ data }: Props) {
  const prompts = [
    {
      num: '01',
      color: C.amber,
      text: 'What do I know about myself that I want to stop arguing with or explaining away?',
    },
    {
      num: '02',
      color: C.emerald,
      text: 'Which single practice from this report do I want to test for the next seven days?',
    },
    {
      num: '03',
      color: C.crimson,
      text: 'What is the one thing I am committing to — and what does it look like in practice tomorrow morning?',
    },
  ];

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />
      <View style={S.triBar}><View style={S.barA} /><View style={S.barE} /><View style={S.barC} /></View>

      <View style={S.content}>
        <Text style={S.sectionTag}>Section 7 — Integration & Close · Reflection</Text>
        <Text style={S.headingSmall}>The Pattern</Text>
        <Text style={S.heading}>I Am Ready To Keep</Text>
        <Text style={S.sub}>
          One week. One practice. Not a transformation — an experiment. The result tells you more than the intention.
        </Text>
        <View style={S.rule} />

        {prompts.map((p, i) => (
          <View key={p.num} style={[S.reflectionRow, i === prompts.length - 1 ? { marginBottom: 8 } : {}]}>
            {/* Left: 5-col prompt zone */}
            <View style={S.promptCol}>
              <Text style={[S.promptNum, { color: p.color }]}>{p.num}</Text>
              <Text style={S.promptText}>{p.text}</Text>
            </View>

            {/* Column divider */}
            <View style={S.colDivider} />

            {/* Right: 7-col writing space */}
            <View style={S.writingCol}>
              <WritingLines />
            </View>
          </View>
        ))}

        {/* Commitment frame */}
        <View style={S.commitFrame}>
          <Text style={S.commitText}>
            One week. One practice. Not a transformation — a test. The experiment tells you more than the intention ever could.
          </Text>
        </View>
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNum}>42</Text>
      </View>
    </Page>
  );
}
