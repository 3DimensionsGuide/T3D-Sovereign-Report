import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { select } from '@/lib/haptics';
import { Term } from '@/components/Explain';
import { LensIcon, lensFromGlyph } from '@/components/Lens';
import { colors, fonts, radius, space } from '@/theme/tokens';

import { AccentView } from '@/components/AccentView';
export interface TriadRow {
  label: string;
  value: string;
  /** Glossary id for the label (tap to learn what it means). */
  labelId?: string;
  /** Glossary id for the value. */
  valueId?: string;
}

interface Props {
  /** The accent color for this system (amber / emerald / crimson). */
  accent: string;
  /** Shape glyph — a second signal beyond color. */
  glyph: string;
  metaphor: 'THE VEHICLE' | 'THE ROAD' | 'THE STOPLIGHT';
  system: string;
  rows: TriadRow[];
  /** Further rows kept behind a tap, so the card stays short. */
  moreRows?: TriadRow[];
  moreLabel?: string;
  /** A small drawing at the right of the header. */
  drawing?: ReactNode;
  /** Opens the full reading for this lens. */
  onOpen?: () => void;
  openLabel?: string;
}

export function TriadCard({ accent, glyph, metaphor, system, rows, moreRows, moreLabel = 'More', drawing, onOpen, openLabel }: Props) {
  const [more, setMore] = useState(false);
  const shown = more && moreRows ? [...rows, ...moreRows] : rows;
  return (
    <AccentView
      style={[styles.card, { borderLeftColor: accent }]}
    >
      <View style={styles.header}>
        {lensFromGlyph(glyph) ? <LensIcon lens={lensFromGlyph(glyph)!} size={26} color={accent} /> : <Text style={[styles.glyph, { color: accent }]}>{glyph}</Text>}
        <View style={styles.flex}>
          <Text style={styles.metaphor}>{metaphor}</Text>
          <Text style={styles.system}>{system}</Text>
        </View>
        {drawing}
      </View>
      <View style={styles.rows}>
        {shown.map((row) => (
          <View key={row.label} style={styles.row}>
            <Text style={styles.rowLabel}>
              {row.labelId ? <Term id={row.labelId}>{row.label}</Term> : row.label}
            </Text>
            <Text style={styles.rowValue}>
              {row.valueId ? <Term id={row.valueId}>{row.value}</Term> : row.value}
            </Text>
          </View>
        ))}
      </View>
      {moreRows?.length ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: more }}
          accessibilityLabel={`${moreLabel}. ${more ? 'Expanded.' : 'Double tap to show.'}`}
          onPress={() => {
            select();
            setMore((v) => !v);
          }}
          style={({ pressed }) => [styles.link, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.linkText}>{more ? 'Show fewer' : moreLabel}</Text>
        </Pressable>
      ) : null}
      {onOpen ? (
        <Pressable accessibilityRole="button" accessibilityLabel={openLabel} onPress={onOpen} style={({ pressed }) => [styles.link, pressed && { opacity: 0.7 }]}>
          <Text style={styles.linkText}>{openLabel} ›</Text>
        </Pressable>
      ) : null}
    </AccentView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.charcoal,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderLeftWidth: 4,
    padding: space.lg,
    gap: space.md,
  },
  flex: { flex: 1 },
  link: { minHeight: 48, justifyContent: 'center' },
  linkText: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.gold },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  glyph: { fontSize: 26 },
  metaphor: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2, color: colors.parchmentMuted },
  system: { fontFamily: fonts.display, fontSize: 22, color: colors.parchment },
  rows: { gap: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: space.md },
  rowLabel: { fontFamily: fonts.body, fontSize: 15, color: colors.parchmentMuted, flexShrink: 0 },
  rowValue: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.parchment, textAlign: 'right', flexShrink: 1 },
});
