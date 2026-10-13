import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Stop } from 'react-native-svg';
import type { RoomArt as ArtKind } from '@/theme/rooms';

const HEIGHT = 460;

/** A fixed set of star positions, so the sky looks the same every time you open the tab. */
const STARS = (() => {
  let seed = 7;
  const next = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: 34 }, () => ({ x: next() * 100, y: next() * 330, r: 0.5 + next() * 0.9, o: 0.12 + next() * 0.33 }));
})();

/**
 * One piece of faint line art behind a room's content. Decorative only: hidden from screen readers,
 * ignores touches, and never moves.
 */
export function RoomArtLayer({ kind, color, width }: { kind: ArtKind; color: string; width: number }) {
  const fade = `fade${useId().replace(/\W/g, '')}`;
  if (kind === 'none') return null;
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.fill}>
      <Svg width="100%" height={HEIGHT}>
        <Defs>
          <LinearGradient id={fade} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={HEIGHT}>
            <Stop offset="0" stopColor={color} stopOpacity={0.3} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        {kind === 'stars'
          ? STARS.map((s, i) => (
              <Circle key={i} cx={`${s.x}%`} cy={s.y + 40} r={s.r} fill={color} opacity={s.o} />
            ))
          : null}
        {kind === 'road'
          ? [-0.55, -0.28, 0, 0.28, 0.55].map((spread) => (
              <Line
                key={spread}
                x1={width / 2}
                y1={60}
                x2={width / 2 + spread * width * 1.6}
                y2={HEIGHT}
                stroke={`url(#${fade})`}
                strokeWidth={1}
              />
            ))
          : null}
        {kind === 'rings'
          ? [46, 78, 112, 150, 196].map((r, i) => (
              <Circle
                key={r}
                cx={width * 0.86}
                cy={74}
                r={r}
                fill="none"
                stroke={color}
                strokeWidth={0.8}
                strokeDasharray={i % 2 === 1 ? '2 5' : undefined}
                opacity={0.16 - i * 0.02}
              />
            ))
          : null}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({ fill: { position: 'absolute', top: 0, left: 0, right: 0, height: HEIGHT } });
