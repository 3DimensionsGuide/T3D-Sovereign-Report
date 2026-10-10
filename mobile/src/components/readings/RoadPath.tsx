import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import { LENS_COLOR, LENS_TEXT } from '@/components/Lens';
import type { ChallengeCard, PinnacleCard } from '@/lib/numerologyTypes';
import { colors, fonts, space } from '@/theme/tokens';

const W = 340;
const H = 176;
const ROAD_Y = 70;
const CHALLENGE_Y = 128;

const ages = (c: { startAge: number; endAge: number | null }) => (c.endAge == null ? `${c.startAge}+` : `${c.startAge}–${c.endAge}`);

/**
 * The life road: four Pinnacles as circles along the road, the four Challenges as squares below them,
 * and a marker over the chapter you are in now. Numbers and ages are written on the drawing.
 */
export function RoadPath({ pinnacles, challenges }: { pinnacles: PinnacleCard[]; challenges: ChallengeCard[] }) {
  if (pinnacles.length === 0) return null;
  const step = (W - 80) / Math.max(pinnacles.length - 1, 1);
  const x = (i: number) => 40 + i * step;
  const current = pinnacles.findIndex((p) => p.current);
  const label =
    `Your life road. ` +
    pinnacles.map((p, i) => `Pinnacle ${p.number}, ages ${ages(p)}${p.current ? ', active now' : ''}${challenges[i] ? `, Challenge ${challenges[i]!.number}` : ''}`).join('. ') + '.';

  return (
    <View style={styles.wrap}>
      <Svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ aspectRatio: W / H }} accessible accessibilityRole="image" accessibilityLabel={label}>
        <Line x1={16} y1={ROAD_Y} x2={W - 16} y2={ROAD_Y} stroke={LENS_COLOR.road} strokeWidth={3} strokeLinecap="round" opacity={0.55} />
        <Line x1={16} y1={ROAD_Y} x2={W - 16} y2={ROAD_Y} stroke={colors.parchment} strokeWidth={1} strokeDasharray="6 8" opacity={0.5} />
        {pinnacles.map((p, i) => (
          <Line key={`l${i}`} x1={x(i)} y1={ROAD_Y + 18} x2={x(i)} y2={CHALLENGE_Y - 16} stroke={colors.parchment} strokeWidth={1} strokeDasharray="2 4" opacity={0.25} />
        ))}
        {pinnacles.map((p, i) => (
          <Circle key={`c${i}`} cx={x(i)} cy={ROAD_Y} r={p.current ? 19 : 16} fill={p.current ? LENS_COLOR.road : colors.amethyst} stroke={p.current ? colors.gold : LENS_COLOR.road} strokeWidth={p.current ? 3 : 2} />
        ))}
        {pinnacles.map((p, i) => (
          <SvgText key={`t${i}`} x={x(i)} y={ROAD_Y + 6} fontSize={17} fontFamily={fonts.bodyBold} fill={colors.parchment} textAnchor="middle">{String(p.number)}</SvgText>
        ))}
        {pinnacles.map((p, i) => (
          <SvgText key={`a${i}`} x={x(i)} y={ROAD_Y + 38} fontSize={11.5} fontFamily={fonts.body} fill={colors.parchment} opacity={0.8} textAnchor="middle">{`Age ${ages(p)}`}</SvgText>
        ))}
        {current >= 0 ? (
          <>
            <Polygon points={`${x(current) - 7},${ROAD_Y - 38} ${x(current) + 7},${ROAD_Y - 38} ${x(current)},${ROAD_Y - 27}`} fill={colors.gold} />
            <SvgText x={x(current)} y={ROAD_Y - 44} fontSize={12} fontFamily={fonts.bodyBold} fill={colors.gold} textAnchor="middle">You are here</SvgText>
          </>
        ) : null}
        {challenges.map((c, i) => (
          <Rect key={`q${i}`} x={x(i) - 13} y={CHALLENGE_Y - 13} width={26} height={26} rx={5} fill={colors.charcoal} stroke={c.current ? colors.gold : '#F0836B'} strokeWidth={c.current ? 2.6 : 1.8} />
        ))}
        {challenges.map((c, i) => (
          <SvgText key={`qt${i}`} x={x(i)} y={CHALLENGE_Y + 5} fontSize={14} fontFamily={fonts.bodyBold} fill={colors.parchment} textAnchor="middle">{String(c.number)}</SvgText>
        ))}
        <SvgText x={16} y={H - 6} fontSize={11.5} fontFamily={fonts.body} fill={colors.parchment} opacity={0.8}>Circles are Pinnacles. Squares are Challenges.</SvgText>
      </Svg>
      <Text style={[styles.caption, { color: LENS_TEXT.road }]}>Your life road</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xs, padding: space.md, borderRadius: 22, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.charcoal },
  caption: { fontFamily: fonts.bodyBold, fontSize: 13 },
});
