/**
 * T3D Report — Shared Page Components
 *
 * Visual Design System — Layer 8: Technical Line System
 *
 * The TechnicalLines component renders a subtle horizontal rule grid
 * across the full page. This creates the "Spaceship Instruction Manual
 * meets Editorial Wabi-Sabi" tactility: precise enough to be trusted,
 * warm enough to be read, calm enough to let the reader's data matter.
 *
 * Technical spec:
 *   — Horizontal lines at 14pt intervals (≈5mm, standard ruled-paper pitch)
 *   — Line weight: 0.35pt (hairline — perceivable but not readable as lines)
 *   — Ink: #0D0D0E (Charcoal) at 4.5% opacity
 *   — Coverage: full page edge-to-edge (bleeds through margins)
 *   — Layer: positioned absolute at z=0, behind all content
 *
 * Usage:
 *   <Page size="LETTER" style={S.page}>
 *     <TechnicalLines />
 *     <View style={S.content}> ... </View>
 *   </Page>
 *
 * Dark page variant (for dividers, cover, closing letter):
 *   <TechnicalLines variant="dark" />
 *   Uses #F5F5F3 at 3% opacity — barely perceptible but adds depth.
 */

import React from 'react';
import { View } from '@react-pdf/renderer';

// ── Configuration ─────────────────────────────────────────────────────────────
const LINE_INTERVAL = 14;    // pt — matches standard ruled paper pitch
const LINE_HEIGHT   = 0.35;  // pt — hairline weight
const PAGE_HEIGHT   = 792;   // pt — US Letter

const LINE_COUNT = Math.ceil(PAGE_HEIGHT / LINE_INTERVAL) + 1; // 57 lines

// ── TechnicalLines ────────────────────────────────────────────────────────────
/**
 * @param variant
 *   'light' (default) — dark ink on parchment pages
 *   'dark'            — faint parchment on dark/charcoal pages
 */
interface TechnicalLinesProps {
  variant?: 'light' | 'dark';
}

export function TechnicalLines({ variant = 'light' }: TechnicalLinesProps) {
  const color   = variant === 'dark' ? '#F5F5F3' : '#0D0D0E';
  const opacity = variant === 'dark' ? 0.03      : 0.045;

  return (
    <View
      style={{
        position: 'absolute',
        top:   0,
        left:  0,
        right: 0,
        bottom: 0,
      }}
    >
      {Array.from({ length: LINE_COUNT }, (_, i) => (
        <View
          key={i}
          style={{
            position:        'absolute',
            left:            0,
            right:           0,
            top:             i * LINE_INTERVAL,
            height:          LINE_HEIGHT,
            backgroundColor: color,
            opacity,
          }}
        />
      ))}
    </View>
  );
}

/**
 * AccentRule — a single hairline accent below a heading or data label.
 * Thinner than a standard divider (0.4pt vs 0.5pt), used inside data blocks.
 */
interface AccentRuleProps {
  color?:   string;
  opacity?: number;
  width?:   number | string;
}

export function AccentRule({
  color   = '#0D0D0E',
  opacity = 0.12,
  width   = '100%',
}: AccentRuleProps) {
  return (
    <View
      style={{
        height:          0.4,
        backgroundColor: color,
        opacity,
        width,
      }}
    />
  );
}

/**
 * PageDivider — full-width 0.5pt divider between major content blocks.
 */
export function PageDivider({ opacity = 0.10 }: { opacity?: number }) {
  return (
    <View
      style={{
        height:          0.5,
        backgroundColor: '#0D0D0E',
        opacity,
        width:           '100%',
        marginVertical:  16,
      }}
    />
  );
}

// ─── CARD_MIN_PRESENCE_AHEAD ────────────────────────────────────────────────
/**
 * Shared pagination guard for any content block whose rendered height
 * varies with a reader's actual data (a card, a bordered callout, a
 * per-item block in a list) — pass it as `minPresenceAhead` alongside
 * `wrap={false}` on that block's outer View:
 *
 *   <View wrap={false} minPresenceAhead={CARD_MIN_PRESENCE_AHEAD}>...</View>
 *
 * Without this pairing, react-pdf's default wrap behavior can measure a
 * block as "technically fits" by only a couple of points, split it right
 * at the page boundary, and strand the fragment that didn't fit on a
 * follow-on page that otherwise has nothing on it but the fixed footer —
 * a near-blank orphan page. `wrap={false}` makes the block atomic (it
 * moves to the next page as a whole instead of splitting); the small
 * `minPresenceAhead` buffer is insurance against react-pdf's own
 * text-height rounding placing a block's start right at the edge of the
 * remaining space.
 *
 * First established and documented in Page05Transits.tsx (see that
 * file's docblock for the full debugging history — the `padding: 0`
 * shorthand pitfall that silently clobbers `paddingBottom`, and the
 * separate "two forced breaks in one react-pdf pagination pass produces
 * a blank page" issue, which needs a genuinely separate <Page> rather
 * than relying on auto-flow when it applies). Centralized here so every
 * report page template that stacks variable-height content — not just
 * Transits and Bridges, which independently reinvented the same value —
 * uses one shared, documented constant instead of a silent per-file
 * magic number.
 */
export const CARD_MIN_PRESENCE_AHEAD = 30;
