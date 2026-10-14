import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import type { SkyPosition } from '@/lib/api';
import { Pressable } from '@/components/Pressable';
import { buildSkyRing, type RingMark } from '@/lib/skyRing';
import { SIGN_GLYPH } from '@/lib/signGlyphs';
import { colors, fonts, space } from '@/theme/tokens';

const SIZE = 280;

/**
 * Where the Sun, Moon and planets are right now, on the zodiac. The glyphs are only the picture: every body is
 * also written out in the list underneath, with its sign and whether it is retrograde.
 */
export function SkyRing({ positions, onPick }: { positions: readonly SkyPosition[]; onPick?: (mark: RingMark) => void }) {
  const ring = useMemo(() => buildSkyRing(positions, SIZE), [positions]);
  if (!positions.length) return null;
  return (
    <View style={styles.wrap}>
      <View style={styles.figure}>
        <Svg width={ring.size} height={ring.size} accessibilityRole="image" accessibilityLabel={ring.spoken}>
          <Circle cx={ring.c} cy={ring.c} r={ring.ringR} fill="none" stroke={colors.parchmentMuted} strokeWidth={1.2} />
          {ring.ticks.map((t, i) => (
            <Line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={colors.parchmentMuted} strokeWidth={1.2} />
          ))}
          {ring.signs.map((s) => (
            <SvgText key={s.sign} x={s.x} y={s.y + 5} fontSize={14} fill={colors.parchmentMuted} textAnchor="middle">
              {SIGN_GLYPH[s.sign] ?? ''}
            </SvgText>
          ))}
          {ring.marks.map((m) => {
            const lead = m.body === 'sun' || m.body === 'moon';
            return (
              <Circle
                key={`d-${m.body}`} cx={m.x} cy={m.y} r={lead ? 14 : 11}
                fill={colors.charcoal} stroke={m.body === 'sun' ? colors.gold : colors.hairline} strokeWidth={lead ? 1.6 : 1}
              />
            );
          })}
          {ring.marks.map((m) => (
            <SvgText
              key={`g-${m.body}`} x={m.x} y={m.y + 5} fontSize={m.body === 'sun' || m.body === 'moon' ? 16 : 13}
              fill={m.body === 'sun' ? colors.gold : colors.parchment} textAnchor="middle"
            >
              {m.glyph}
            </SvgText>
          ))}
          {onPick ? ring.marks.map((m) => (
            <Circle key={`h-${m.body}`} cx={m.x} cy={m.y} r={13} fill="transparent" onPress={() => onPick(m)} />
          )) : null}
        </Svg>
      </View>
      <Text style={styles.hint}>Tap a planet to read more about it.</Text>
      <View style={styles.list}>
        {ring.marks.map((m) => (
          <Pressable
            key={m.body}
            accessibilityRole="button"
            accessibilityLabel={`${m.name} in ${m.sign}, ${m.degree} degrees${m.retrograde ? ', retrograde' : ''}. Opens more about it.`}
            onPress={() => onPick?.(m)}
            style={({ pressed }) => [styles.rowBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.row}>
              <Text style={styles.glyph}>{m.glyph}  </Text>
              <Text style={styles.strong}>{m.name}</Text>
              {` in ${m.sign}, ${m.degree}°${m.retrograde ? ' · retrograde ℞' : ''}`}
            </Text>
            <Text style={styles.chev}>›</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md },
  figure: { alignItems: 'center' },
  list: { gap: 2 },
  hint: { fontFamily: fonts.body, fontSize: 13, color: colors.parchmentMuted, textAlign: 'center' },
  rowBtn: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  chev: { fontFamily: fonts.bodyBold, fontSize: 22, color: colors.gold },
  row: { flex: 1, fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  glyph: { fontFamily: fonts.bodyBold, color: colors.parchment },
  strong: { fontFamily: fonts.bodyBold, color: colors.parchment },
});
