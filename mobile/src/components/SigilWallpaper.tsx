import { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ChartResult } from '@/lib/api';
import { Glow } from '@/components/Glow';
import { Sigil } from '@/components/Sigil';
import { WALLPAPER, wallpaperLayout, type WallpaperVariant } from '@/lib/wallpaper';
import { colors } from '@/theme/tokens';

interface Props {
  chart: ChartResult;
  variant: WallpaperVariant;
  birthTimeKnown: boolean;
}

/**
 * The Sigil on its own, as a wallpaper: no text, no name, no link. Only the drawing, which is made from the chart
 * and shows no date, time or place.
 */
export const SigilWallpaper = forwardRef<View, Props>(function SigilWallpaper({ chart, variant, birthTimeKnown }, ref) {
  const layout = wallpaperLayout(variant);
  return (
    <View ref={ref} collapsable={false} style={[styles.card, WALLPAPER]}>
      <Glow color={colors.purple} opacity={0.7 * layout.opacity} style={[styles.glow, { top: layout.top - 120 }]} />
      <View style={[styles.art, { top: layout.top, opacity: layout.opacity }]}>
        <Sigil chart={chart} birthTimeKnown={birthTimeKnown} size={layout.sigilSize} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { backgroundColor: colors.obsidian, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: colors.hairline },
  glow: { height: 520 },
  art: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
});
