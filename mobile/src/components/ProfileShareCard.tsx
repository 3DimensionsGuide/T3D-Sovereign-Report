import { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatLongitude, type ChartResult } from '@/lib/api';
import { Glow } from '@/components/Glow';
import { LENS_TEXT, LensIcon, lensFromGlyph } from '@/components/Lens';
import { colors, fonts } from '@/theme/tokens';

/** Logical size of the card. It is saved as a 1080 x 1350 image (4:5). */
export const CARD_WIDTH = 340;
export const CARD_HEIGHT = 425;

interface Props {
  chart: ChartResult;
  /** Shown only when the person chooses to add it. */
  firstName?: string | null;
  /** Moon and Rising are only shown when the birth time is known. */
  birthTimeKnown: boolean;
}

const signOf = (longitude: number) => formatLongitude(longitude).split(' ').pop() ?? '';

function Row({ glyph, accent, label, main, sub }: { glyph: string; accent: string; label: string; main: string; sub: string | null }) {
  return (
    <View style={[styles.row, { borderLeftColor: accent }]}>
      <View style={styles.labelRow}>
        {lensFromGlyph(glyph) ? <LensIcon lens={lensFromGlyph(glyph)!} size={11} color={accent} /> : null}
        <Text style={[styles.rowLabel, { color: lensFromGlyph(glyph) ? LENS_TEXT[lensFromGlyph(glyph)!] : accent }]}>{label}</Text>
      </View>
      <Text style={styles.rowMain}>{main}</Text>
      {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
    </View>
  );
}

/**
 * The shareable T3D profile card: Type, Life Path and Sun sign.
 * It never shows birth date, time, place or last name.
 */
export const ProfileShareCard = forwardRef<View, Props>(function ProfileShareCard({ chart, firstName, birthTimeKnown }, ref) {
  const { humanDesign: hd, numerology: num, astrology: astro } = chart;
  const profileLines = hd.profile.match(/\d\/\d/)?.[0] ?? hd.profile;
  const sky = birthTimeKnown
    ? `Moon in ${astro.tropicalMoon.sign} · Rising ${signOf(astro.tropicalAscendant)}`
    : null;

  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <Glow color={colors.purple} opacity={0.75} style={styles.glow} />
      <Text style={styles.brand}>THE 3 DIMENSIONS</Text>
      <View style={styles.rule} />
      <Text style={styles.title}>{firstName ? `${firstName}'s T3D Triad` : 'My T3D Triad'}</Text>

      <View style={styles.rows}>
        <Row glyph="◆" accent={colors.vehicle} label="THE VEHICLE · HUMAN DESIGN" main={hd.type} sub={`Profile ${profileLines} · ${hd.authority} Authority`} />
        <Row glyph="▲" accent={colors.road} label="THE ROAD · NUMEROLOGY" main={`Life Path ${num.lifePath}`} sub={null} />
        <Row glyph="●" accent={colors.stoplight} label="THE STOPLIGHT · ASTROLOGY" main={`Sun in ${astro.tropicalSun.sign}`} sub={sky} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerSmall}>VEHICLE · ROAD · STOPLIGHT</Text>
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
  title: { fontFamily: fonts.display, fontSize: 28, lineHeight: 35, color: colors.parchment, marginTop: 14 },
  rows: { gap: 16, marginTop: 14 },
  row: { borderLeftWidth: 4, paddingLeft: 12, gap: 3 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  rowLabel: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 1.6 },
  rowMain: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28, color: colors.parchment },
  rowSub: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.parchmentMuted },
  footer: { gap: 3, marginTop: 18 },
  footerSmall: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 2, color: colors.parchmentMuted },
  footerUrl: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.gold },
});
