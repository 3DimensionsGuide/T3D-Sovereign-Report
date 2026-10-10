import { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatLongitude, type ChartResult } from '@/lib/api';
import { Glow } from '@/components/Glow';
import { TriadPortrait } from '@/components/TriadPortrait';
import { TriadSeal } from '@/components/TriadSeal';
import { colors, fonts } from '@/theme/tokens';

/** Logical size of the tall card. It is saved as a 1080 x 1920 image (9:16), the shape Stories use. */
export const STORY_WIDTH = 340;
export const STORY_HEIGHT = 604;

interface Props {
  chart: ChartResult;
  firstName?: string | null;
  birthTimeKnown: boolean;
}

const signOf = (longitude: number) => formatLongitude(longitude).split(' ').pop() ?? '';

/**
 * The Stories version of the T3D profile card: the Triad portrait on a tall canvas.
 * Like the square card it never shows birth date, time, place or last name.
 * Space is left clear at the very top and bottom so Stories buttons do not cover it.
 */
export const StoryShareCard = forwardRef<View, Props>(function StoryShareCard({ chart, firstName, birthTimeKnown }, ref) {
  const { humanDesign: hd, astrology: astro } = chart;
  const profileLines = hd.profile.match(/\d\/\d/)?.[0] ?? hd.profile;
  const sky = birthTimeKnown ? `Rising ${signOf(astro.tropicalAscendant)}` : null;
  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <Glow color={colors.purple} opacity={0.8} style={styles.glow} />
      <View style={styles.top}>
        <TriadSeal size={44} />
        <Text style={styles.brand}>THE 3 DIMENSIONS</Text>
      </View>
      <View style={styles.middle}>
        <Text style={styles.title}>{firstName ? `${firstName}'s T3D Triad` : 'My T3D Triad'}</Text>
        <TriadPortrait chart={chart} />
        <Text style={styles.line}>{`${hd.type} · Profile ${profileLines} · ${hd.authority} Authority`}</Text>
        {sky ? <Text style={styles.line}>{sky}</Text> : null}
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
    width: STORY_WIDTH, height: STORY_HEIGHT, backgroundColor: colors.obsidian, borderWidth: 1, borderColor: colors.gold,
    borderRadius: 18, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 64, overflow: 'hidden', justifyContent: 'space-between',
  },
  glow: { height: 420 },
  top: { alignItems: 'center', gap: 10 },
  brand: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 3.2, color: colors.gold },
  middle: { gap: 14 },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 37, color: colors.parchment, textAlign: 'center' },
  line: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.parchment, textAlign: 'center' },
  footer: { alignItems: 'center', gap: 3 },
  footerSmall: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 2, color: colors.parchmentMuted },
  footerUrl: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.gold },
});
