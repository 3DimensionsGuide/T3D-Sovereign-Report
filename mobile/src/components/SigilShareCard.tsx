import { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ChartResult } from '@/lib/api';
import { Glow } from '@/components/Glow';
import { Sigil } from '@/components/Sigil';
import { TriadSeal } from '@/components/TriadSeal';
import { colors, fonts } from '@/theme/tokens';

/** Logical sizes. The post is saved as 1080 x 1350 (4:5) and the Story as 1080 x 1920 (9:16). */
export const SIGIL_POST = { width: 340, height: 425 } as const;
export const SIGIL_STORY = { width: 340, height: 604 } as const;

interface Props {
  chart: ChartResult;
  tall: boolean;
  firstName?: string | null;
  birthTimeKnown: boolean;
}

/**
 * The shareable Sigil card: the drawing, a title, and the same three facts the other cards show.
 * It never shows birth date, time, place or last name.
 */
export const SigilShareCard = forwardRef<View, Props>(function SigilShareCard({ chart, tall, firstName, birthTimeKnown }, ref) {
  const { humanDesign: hd, numerology: num, astrology: astro } = chart;
  const dims = tall ? SIGIL_STORY : SIGIL_POST;
  return (
    <View
      ref={ref}
      collapsable={false}
      style={[styles.card, dims, tall ? styles.tallPad : styles.postPad]}
    >
      <Glow color={colors.purple} opacity={0.8} style={styles.glow} />
      <View style={styles.top}>
        <TriadSeal size={tall ? 44 : 20} />
        <Text style={styles.brand}>THE 3 DIMENSIONS</Text>
      </View>
      <View style={styles.middle}>
        <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65}>
          {firstName ? `${firstName}'s T3D Sigil` : 'My T3D Sigil'}
        </Text>
        <View style={styles.art}>
          <Sigil chart={chart} birthTimeKnown={birthTimeKnown} size={tall ? 292 : 192} />
        </View>
        <Text style={styles.line} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
          {`${hd.type} · Life Path ${num.lifePath} · Sun in ${astro.tropicalSun.sign}`}
        </Text>
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
    backgroundColor: colors.obsidian, borderWidth: 1, borderColor: colors.gold, borderRadius: 18, overflow: 'hidden',
    justifyContent: 'space-between',
  },
  postPad: { paddingHorizontal: 20, paddingVertical: 16 },
  tallPad: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 56 },
  glow: { height: 420 },
  top: { alignItems: 'center', gap: 8 },
  brand: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 3.2, color: colors.gold },
  middle: { alignItems: 'center', gap: 8 },
  title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32, color: colors.parchment, textAlign: 'center', alignSelf: 'stretch' },
  art: { alignItems: 'center' },
  line: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.parchment, textAlign: 'center' },
  footer: { alignItems: 'center', gap: 3 },
  footerSmall: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 2, color: colors.parchmentMuted },
  footerUrl: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.gold },
});
