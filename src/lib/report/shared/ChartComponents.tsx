/**
 * T3D Report — Chart & Diagram Components
 *
 * Standards (per spec):
 *   — Charts appear only if clean, high-res, correctly calculated, and captioned.
 *   — Every chart is accompanied by a sentence explaining why it is present.
 *   — No decorative visuals: no stock space imagery, chakra infographics,
 *     unrelated sacred geometry, or generic AI mystical portraits.
 *   — If a chart cannot meet the quality bar, use a Field Library callout instead.
 *
 * Components in this file:
 *
 *   T3DSystemDiagram     — Visual #4. Three-column system overview.
 *                          Use on Pages 4, 6, 35, 40.
 *
 *   FieldLibraryCallout  — Standard reference for charts requiring accurate
 *                          external calculation (BodyGraph, Natal Chart).
 *                          Use on Vehicle reference pages, Stoplight reference pages.
 *
 *   ChartCaption         — Standard one-sentence caption for any included chart.
 *                          Every visual must have one.
 *
 *   NumerologyRoadCaption — Visual #2 caption. Use on Page 22 (Pinnacles).
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { C, F, PAGE } from '../tokens';

// ─── Shared type styles ───────────────────────────────────────────────────────
const T = StyleSheet.create({
  eyebrow: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase', marginBottom: 3,
  },
  system: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 300,
    letterSpacing: 1.2, textTransform: 'uppercase',
    color: C.parchmentFaint, marginBottom: 10,
  },
  job: {
    fontFamily: F.sans, fontSize: 9.5, fontWeight: 300,
    color: C.base, lineHeight: 1.5, opacity: 0.85, marginBottom: 10,
  },
  rule: {
    height: 0.5, backgroundColor: C.base, opacity: 0.12, marginBottom: 8,
  },
  role: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 700,
    letterSpacing: 2.5, textTransform: 'uppercase',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Visual #4 — T3D System Diagram
// ─────────────────────────────────────────────────────────────────────────────
/**
 * T3DSystemDiagram
 *
 * Three-panel horizontal layout explaining the distinct job of each dimension.
 * Use on: Pages 4, 6 (simplified), 35, 40.
 *
 * This is a functional visual — it explains the navigation system.
 * It is not decorative.
 */

interface T3DSystemDiagramProps {
  /** 'full' = all three labels + job descriptions; 'compact' = labels + roles only */
  variant?: 'full' | 'compact';
}

export function T3DSystemDiagram({ variant = 'full' }: T3DSystemDiagramProps) {
  const panels = [
    {
      color:  C.amber,
      label:  'The Vehicle',
      system: 'Human Design',
      job:    'Your energy type and the mechanism through which you make decisions. Use first — always.',
      role:   'DECIDES',
    },
    {
      color:  C.emerald,
      label:  'The Road',
      system: 'Numerology',
      job:    'Your developmental arc — the pattern of growth your life keeps returning to across time.',
      role:   'CONTEXTUALIZES',
    },
    {
      color:  C.crimson,
      label:  'The Stoplight',
      system: 'Astrology',
      job:    'Environmental conditions — timing, mood, season, and context surrounding every decision.',
      role:   'INFORMS TIMING',
    },
  ];

  return (
    <View style={{
      flexDirection: 'row',
      borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.1)',
    }}>
      {panels.map((p, i) => (
        <View
          key={p.label}
          style={{
            flex: 1,
            borderRightWidth: i < panels.length - 1 ? 0.5 : 0,
            borderRightColor: 'rgba(13,13,14,0.1)',
          }}
        >
          {/* Color bar */}
          <View style={{ height: 3, backgroundColor: p.color }} />

          {/* Content */}
          <View style={{ padding: 14 }}>
            <Text style={[T.eyebrow, { color: p.color }]}>{p.label}</Text>
            <Text style={T.system}>{p.system}</Text>
            {variant === 'full' && (
              <Text style={T.job}>{p.job}</Text>
            )}
            <View style={T.rule} />
            <Text style={[T.role, { color: p.color }]}>{p.role}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Field Library Callout
// ─────────────────────────────────────────────────────────────────────────────
/**
 * FieldLibraryCallout
 *
 * Standard reference for charts that require accurate external calculation.
 * Use when a chart cannot be rendered at the required quality within the PDF.
 *
 * Visual #1 (BodyGraph):  Vehicle reference pages
 * Visual #3 (Natal Chart): Stoplight reference pages
 *
 * The callout makes the absence transparent and directs the reader
 * to the correct resource — rather than omitting the chart without explanation.
 */

interface FieldLibraryCalloutProps {
  chartType:   string;   // e.g., "Human Design BodyGraph"
  caption:     string;   // the one-sentence "why it is present" explanation
  link?:       string;   // optional URL
  accentColor?: string;  // optional left border color
}

const FLC = StyleSheet.create({
  outer: {
    flexDirection: 'row',
    borderWidth: 0.5, borderStyle: 'solid',    backgroundColor: 'rgba(13,13,14,0.03)',
    marginVertical: 8,
  },
  accentBar: {
    width: 2, flexShrink: 0,
  },
  inner: {
    flex: 1, padding: 14, gap: 5,
  },
  libraryLabel: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 700,
    letterSpacing: 2.5, textTransform: 'uppercase', color: C.parchmentFaint,
  },
  chartName: {
    fontFamily: F.display, fontSize: 12, fontWeight: 400,
    color: C.base, lineHeight: 1.2,
  },
  captionText: {
    fontFamily: F.display, fontSize: 10, fontWeight: 400,
    fontStyle: 'italic', color: C.base, lineHeight: 1.5, opacity: 0.75,
  },
  linkText: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 400,
    letterSpacing: 0.5, color: C.emerald,
  },
  noteText: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 300,
    color: C.parchmentFaint, lineHeight: 1.5,
  },
});

export function FieldLibraryCallout({
  chartType,
  caption,
  link = '3dimensions.guide/library',
  accentColor = C.parchmentDim,
}: FieldLibraryCalloutProps) {
  return (
    <View style={[FLC.outer, { borderColor: accentColor }]}>
      <View style={[FLC.accentBar, { backgroundColor: accentColor }]} />
      <View style={FLC.inner}>
        <Text style={FLC.libraryLabel}>Field Library</Text>
        <Text style={FLC.chartName}>{chartType}</Text>
        <Text style={FLC.captionText}>"{caption}"</Text>
        <Text style={FLC.noteText}>
          This chart requires accurate birth data and time to render correctly.
          The full chart is available at:
        </Text>
        <Text style={FLC.linkText}>{link}</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Chart Caption — standard one-sentence caption
// ─────────────────────────────────────────────────────────────────────────────
/**
 * ChartCaption
 *
 * Every visual must be accompanied by this caption.
 * The caption explains why the chart is present — not what it shows.
 * The reader can see what it shows; they need to know why to trust it.
 */

interface ChartCaptionProps {
  text: string;
  align?: 'left' | 'center';
}

export function ChartCaption({ text, align = 'left' }: ChartCaptionProps) {
  return (
    <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 0.5, borderTopColor: 'rgba(13,13,14,0.1)',}}>
      <Text style={{
        fontFamily: F.sans, fontSize: 8, fontWeight: 300,
        color: C.parchmentFaint, lineHeight: 1.5, fontStyle: 'italic',
        textAlign: align,
      }}>
        {text}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Numerology Road Caption — Visual #2 standard caption
// ─────────────────────────────────────────────────────────────────────────────
/**
 * NumerologyRoadCaption
 *
 * Standard caption for the Pinnacles/Challenges road map (Page 22).
 * Reframes the developmental sequence as a lens, not a prediction.
 */

export function NumerologyRoadCaption() {
  return (
    <ChartCaption
      text="This sequence shows developmental terrain; it is a lens for reflection, not a prediction calendar."
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Standard chart captions (Visual #1, #3, #4 per spec)
// ─────────────────────────────────────────────────────────────────────────────

export const CHART_CAPTIONS = {
  /** Visual #1 — Human Design BodyGraph */
  bodyGraph:
    'This is your energy map. Pages 11–17 translate the parts most relevant to daily use.',

  /** Visual #3 — Astrology Natal Chart */
  natalChart:
    'This chart shows the placements used for the selected interpretation pages.',

  /** Visual #4 — T3D System Diagram */
  systemDiagram:
    'Each dimension answers a distinct question. Vehicle decides. Road contextualizes. Stoplight informs timing.',

  /** Visual #2 — Numerology Road Map */
  numerologyRoad:
    'This sequence shows developmental terrain; it is a lens for reflection, not a prediction calendar.',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Chart Inclusion Rule (reference — not rendered)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * CHART INCLUSION CHECKLIST
 *
 * Before including any chart or diagram, verify:
 *
 *  □ Is it clean and high-resolution?
 *  □ Is it correctly calculated from the reader's actual data?
 *  □ Is it accompanied by a ChartCaption explaining why it is present?
 *  □ Does it explain, orient, or pace — or is it decorative?
 *  □ Is it free of stock space imagery, chakra infographics,
 *    unrelated sacred geometry, and AI mystical portraits?
 *
 * If any answer is NO → use FieldLibraryCallout instead.
 * If the visual is decorative only → omit it entirely.
 */
