import { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { TriadToday } from '@/lib/triadTypes';
import { Glow } from '@/components/Glow';
import { LENS_TEXT, LensIcon, lensFromGlyph } from '@/components/Lens';
import { colors, fonts } from '@/theme/tokens';
import { CARD_HEIGHT, CARD_WIDTH } from '@/components/ProfileShareCard';

interface Props {
  data: TriadToday;
  /** Shown only when the person chooses to add it. */
  firstName?: string | null;
}

function Row({ glyph, accent, label, main }: { glyph: string; accent: string; label: string; main: string }) {
  return (
    <View style={[styles.row, { borderLeftColor: accent }]}>
      <View style={styles.labelRow}>
        {lensFromGlyph(glyph) ? <LensIcon lens={lensFromGlyph(glyph)!} size={11} color={accent} /> : null}
        <Text style={[styles.rowLabel, { color: lensFromGlyph(glyph) ? LENS_TEXT[lensFromGlyph(glyph)!] : accent }]}>{label}</Text>
      </View>
      <Text style={styles.rowMain}>{main}</Text>
    </View>
  );
}

/**
 * The shareable "Today's frame" card: the date, the Type and Authority, the Personal Day and
 * the main sky contact. It never shows birth date, time, place or last name.
 */
export const TodayShareCard = forwardRef<View, Props>(function TodayShareCard({ data, firstName }, ref) {
  const date = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <Glow color={colors.purple} opacity={0.75} style={styles.glow} />
      <Text style={styles.brand}>THE 3 DIMENSIONS</Text>
      <View style={styles.rule} />
      <Text style={styles.title}>{firstName ? `${firstName}'s frame for today` : 'My frame for today'}</Text>
      <Text style={styles.date}>{date}</Text>

      <View style={styles.rows}>
        <Row glyph="◆" accent={colors.vehicle} label="THE VEHICLE" main={data.vehicle.heading} />
        <Row glyph="▲" accent={colors.road} label="THE ROAD" main={`Personal Day ${data.road.numberText}: ${data.road.label}`} />
        <Row glyph="●" accent={colors.stoplight} label="THE STOPLIGHT" main={data.stoplight.lead ? data.stoplight.lead.title : 'A quiet sky'} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerSmall}>CONDITIONS, NOT INSTRUCTIONS</Text>
        <Text style={styles.footerUrl}>3dimensions.guide</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH, height: CARD_HEIGHT, backgroundColor: colors.obsidian, borderWidth: 1, borderColor: colors.gold,
    borderRadius: 18, padding: 24, overflow: 'hidden', justifyContent: 'space-between',
  },
  glow: { height: 280 },
  brand: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 3.2, color: colors.gold },
  rule: { height: 1, backgroundColor: colors.gold, opacity: 0.6, marginTop: 8 },
  title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 33, color: colors.parchment, marginTop: 14 },
  date: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.parchmentMuted },
  rows: { gap: 16, marginTop: 14 },
  row: { borderLeftWidth: 4, paddingLeft: 12, gap: 3 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  rowLabel: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 1.6 },
  rowMain: { fontFamily: fonts.display, fontSize: 20, lineHeight: 26, color: colors.parchment },
  footer: { gap: 3, marginTop: 18 },
  footerSmall: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 2, color: colors.parchmentMuted },
  footerUrl: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.gold },
});
