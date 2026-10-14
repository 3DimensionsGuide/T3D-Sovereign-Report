import { forwardRef, useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import type { ChartResult } from '@/lib/api';
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
 * and shows no date, time or place. The purple light is a radial pool centred on the Sigil that fades to nothing
 * well inside the card, so no edge of it can show as a line.
 */
export const SigilWallpaper = forwardRef<View, Props>(function SigilWallpaper({ chart, variant, birthTimeKnown }, ref) {
  const layout = wallpaperLayout(variant);
  const id = `wp${useId().replace(/\W/g, '')}`;
  const cy = layout.top + layout.sigilSize / 2;
  return (
    <View ref={ref} collapsable={false} style={[styles.card, WALLPAPER]}>
      <Svg width={WALLPAPER.width} height={WALLPAPER.height} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id={id} cx={WALLPAPER.width / 2} cy={cy} r={250} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={colors.purple} stopOpacity={0.55 * layout.opacity} />
            <Stop offset="0.5" stopColor={colors.purple} stopOpacity={0.2 * layout.opacity} />
            <Stop offset="1" stopColor={colors.purple} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={WALLPAPER.width / 2} cy={cy} r={250} fill={`url(#${id})`} />
      </Svg>
      <View style={[styles.art, { top: layout.top, opacity: layout.opacity }]}>
        <Sigil chart={chart} birthTimeKnown={birthTimeKnown} size={layout.sigilSize} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { backgroundColor: colors.obsidian, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: colors.hairline },
  art: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
});
