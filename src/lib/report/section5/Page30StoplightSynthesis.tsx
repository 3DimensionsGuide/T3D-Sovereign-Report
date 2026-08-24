/**
 * Page 30 — Your Stoplight Synthesis
 *
 * Reader question: "What does the conversation between my two skies reveal?"
 *
 * A single, composed interpretation page. Synthesizes all six placements
 * without listing them. Generated via Claude API; falls back to template.
 *
 * Structure:
 *   — Headline thesis in Playfair Display (one sentence)
 *   — 220–280 word personalized body
 *   — Named Harmony (theme consistent across both systems)
 *   — Named Productive Tension (useful difference)
 *   — Sovereign Reminder (return to Authority)
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { C, F, PAGE } from '../tokens';
import { TechnicalLines } from '../shared/PageComponents';
import type { ReportData } from '../tokens';
import type { StoplightSynthesis } from '../schema/stoplightSynthesis';

const STAR_SLATE = '#6D7797';

const S = StyleSheet.create({
  page:   { backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  triBar: { flexDirection: 'row', width: PAGE.width },
  barA:   { flex: 1, height: 1.5, backgroundColor: C.amber },
  barE:   { flex: 1, height: 1.5, backgroundColor: C.emerald },
  barC:   { flex: 1, height: 1.5, backgroundColor: C.crimson },

  content: {
    flex: 1,
    paddingHorizontal: PAGE.marginH,
    paddingTop: 36,
    paddingBottom: PAGE.marginV,
  },

  eyebrow: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 500,
    letterSpacing: 2.5, color: C.parchmentFaint,
    textTransform: 'uppercase', marginBottom: 6,
  },
  heading: {
    fontFamily: F.display, fontSize: 20, fontWeight: 400,
    color: C.base, lineHeight: 1.1, marginBottom: 4,
  },
  sub: {
    fontFamily: F.sans, fontSize: 9, fontWeight: 300,
    color: C.parchmentFaint, lineHeight: 1.5,
    marginBottom: 16, maxWidth: 440,
  },
  pageRule: {
    width: PAGE.contentWidth, height: 0.5,
    backgroundColor: C.base, opacity: 0.1, marginBottom: 16,
  },

  // ── Headline thesis ───────────────────────────────────────────────────────
  thesisBlock: { marginBottom: 14 },
  thesis: {
    fontFamily: F.display,
    fontSize: 14,
    fontWeight: 400,
    fontStyle: 'italic',
    color: C.base,
    lineHeight: 1.5,
    maxWidth: PAGE.contentWidth,
  },
  thesisRule: {
    width: 40, height: 1.5,
    backgroundColor: C.crimson, marginTop: 10,
  },

  // ── Body text ─────────────────────────────────────────────────────────────
  body: {
    fontFamily: F.sans,
    fontSize: 10.5,
    fontWeight: 300,
    color: C.base,
    lineHeight: 1.6,
    opacity: 0.88,
    marginBottom: 18,
    maxWidth: PAGE.contentWidth,
  },

  // ── Harmony + Tension side by side ───────────────────────────────────────
  calloutRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  callout: {
    flex: 1,
    padding: 12,
    gap: 5,
    backgroundColor: 'rgba(13,13,14,0.025)',
    borderTopWidth: 2,
    borderTopStyle: 'solid',
  },
  calloutLabel: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase',
    marginBottom: 2,
  },
  calloutName: {
    fontFamily: F.display, fontSize: 11, fontWeight: 400,
    color: C.base, lineHeight: 1.2, marginBottom: 4,
  },
  calloutDesc: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 300,
    color: C.base, lineHeight: 1.55, opacity: 0.85,
  },

  // ── Sovereign Reminder ────────────────────────────────────────────────────
  reminderBlock: {
    paddingTop: 14,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(13,13,14,0.12)',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  reminderBadge: {
    paddingHorizontal: 6, paddingVertical: 3,
    backgroundColor: C.base,
    flexShrink: 0, marginTop: 1,
  },
  reminderBadgeText: {
    fontFamily: F.sans, fontSize: 5.5, fontWeight: 700,
    letterSpacing: 1.8, textTransform: 'uppercase',
    color: '#F5F5F3',
  },
  reminderText: {
    flex: 1,
    fontFamily: F.display, fontSize: 10.5, fontWeight: 400,
    fontStyle: 'italic', color: C.base, lineHeight: 1.5, opacity: 0.8,
  },

  // Footer
  footer: {
    paddingHorizontal: PAGE.marginH, paddingBottom: 22,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: {
    fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2,
    color: C.parchmentFaint, textTransform: 'uppercase',
  },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

// ─── Placement summary bar ────────────────────────────────────────────────────
interface PlacementBarProps {
  data: ReportData & { siderealMoon?: string };
}

function PlacementBar({ data }: PlacementBarProps) {
  const extractSign = (formatted: string) => {
    if (!formatted || formatted === '—') return '—';
    return formatted.trim().split(' ').pop() ?? '—';
  };

  const items = [
    { label: 'Tropical Sun',    val: data.sunSign,                    color: C.crimson },
    { label: 'Tropical Moon',   val: data.moonSign,                   color: C.crimson },
    { label: 'Sidereal Sun',    val: extractSign(data.siderealSun),   color: STAR_SLATE },
    { label: 'Sidereal Moon',   val: extractSign(data.siderealMoon ?? '—'), color: STAR_SLATE },
  ];

  return (
    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
      {items.map(item => (
        <View key={item.label} style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
          <Text style={{ fontFamily: F.sans, fontSize: 6.5, fontWeight: 500,
            letterSpacing: 1.5, textTransform: 'uppercase', color: C.parchmentFaint }}>
            {item.label}
          </Text>
          <Text style={{ fontFamily: F.sans, fontSize: 7.5, fontWeight: 500,
            color: item.color }}>
            {item.val}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────
interface Props {
  data: ReportData & {
    siderealMoon?: string;
    stoplightSynthesis?: StoplightSynthesis;
  };
}

export default function Page30StoplightSynthesis({ data }: Props) {
  const synthesis = data.stoplightSynthesis;

  // Fallback display if synthesis not yet generated
  const thesis   = synthesis?.thesis   ?? 'Your two reference systems describe the same person from different angles.';
  const body     = synthesis?.body     ?? 'Synthesis not yet generated — ensure stoplightSynthesis is called in route.ts before rendering.';
  const harmony  = synthesis?.harmony  ?? { name: 'Shared Solar Orientation', description: 'Both reference systems describe a consistent solar quality across the two lenses.' };
  const tension  = synthesis?.tension  ?? { name: 'Moon in Contrast', description: 'The Moon signs across the two systems offer a productive range of emotional orientations.' };
  const reminder = synthesis?.reminder ?? `The Stoplight describes conditions and tendencies. Your ${data.hdAuthority} Authority is the mechanism you use to navigate them.`;

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.triBar}>
        <View style={S.barA} /><View style={S.barE} /><View style={S.barC} />
      </View>

      <View style={S.content}>
        <Text style={S.eyebrow}>Stoplight · Both Lenses · Synthesis</Text>
        <Text style={S.heading}>Your Stoplight Synthesis</Text>
        <Text style={S.sub}>
          What does the conversation between my two skies reveal?
        </Text>
        <View style={S.pageRule} />

        {/* Placement summary */}
        <PlacementBar data={data} />

        {/* Headline thesis */}
        <View style={S.thesisBlock}>
          <Text style={S.thesis}>{thesis}</Text>
          <View style={S.thesisRule} />
        </View>

        {/* Body */}
        <Text style={S.body}>{body}</Text>

        {/* Harmony + Productive Tension */}
        <View style={S.calloutRow}>
          {/* Harmony */}
          <View style={[S.callout, { borderTopColor: C.emerald }]}>
            <Text style={[S.calloutLabel, { color: C.emerald }]}>
              Harmony
            </Text>
            <Text style={S.calloutName}>{harmony.name}</Text>
            <Text style={S.calloutDesc}>{harmony.description}</Text>
          </View>

          {/* Productive Tension */}
          <View style={[S.callout, { borderTopColor: STAR_SLATE }]}>
            <Text style={[S.calloutLabel, { color: STAR_SLATE }]}>
              Productive Tension
            </Text>
            <Text style={S.calloutName}>{tension.name}</Text>
            <Text style={S.calloutDesc}>{tension.description}</Text>
          </View>
        </View>

        {/* Sovereign Reminder */}
        <View style={S.reminderBlock}>
          <View style={S.reminderBadge}>
            <Text style={S.reminderBadgeText}>Sovereign Reminder</Text>
          </View>
          <Text style={S.reminderText}>{reminder}</Text>
        </View>
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNum}>30</Text>
      </View>
    </Page>
  );
}
