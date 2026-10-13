import { StyleSheet, Text, View } from 'react-native';
import { LENS_COLOR, SIGNAL_COLOR, SIGNAL_LABEL, SignalMarker, type SignalKind } from '@/components/Lens';
import { cycleBar, monthTicks, progressWords, seasonBar } from '@/lib/timelineSpine';
import { colors, fonts, radius, themes } from '@/theme/tokens';

const T = themes.timeline;

const pct = (n: number) => `${n * 100}%` as `${number}%`;

/** The axis for the spine: today at the left, month starts along it, the last day at the right. */
export function SpineAxis({ from, to, fromLabel, toLabel }: { from: string; to: string; fromLabel: string; toLabel: string }) {
  // A month label too close to the last-day label would print on top of it, so it is left out.
  const ticks = monthTicks(from, to).filter((t) => t.x < 0.76);
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.axis}>
      <View style={styles.axisLine} />
      <View style={[styles.today, { left: 0 }]} />
      {ticks.map((t) => (
        <View key={t.label + t.x} style={[styles.tick, { left: pct(t.x) }]}>
          <Text maxFontSizeMultiplier={1.3} style={styles.tickLabel}>{t.label}</Text>
        </View>
      ))}
      <Text maxFontSizeMultiplier={1.3} style={[styles.endLabel, { left: 0 }]}>{fromLabel}</Text>
      <Text maxFontSizeMultiplier={1.3} style={[styles.endLabel, { right: 0 }]}>{toLabel}</Text>
    </View>
  );
}

/** One line under the axis that says what the marks on the bars mean. */
export function SpineKey() {
  return (
    <View accessible accessibilityLabel="Key. A left arrow means the transit began earlier. A right arrow means it continues later. A dark mark is the exact day." style={styles.key}>
      <Text maxFontSizeMultiplier={1.3} style={styles.keyText}>{'‹ began earlier   › continues later   ▮ exact day'}</Text>
    </View>
  );
}

export interface SpineSeason {
  key: string;
  title: string;
  nature: SignalKind;
  windowStart: string;
  windowEnd: string;
  exactAt: string[];
  lord: boolean;
  meta: string;
}

/** One season: its title, then a bar placed on the axis, then when it is in effect. */
export function SpineRow({ s, from, to }: { s: SpineSeason; from: string; to: string }) {
  const bar = seasonBar({ ...s, nature: s.nature === 'friction' ? 'friction' : s.nature === 'flow' ? 'flow' : 'neutral' }, from, to);
  const color = SIGNAL_COLOR[s.nature];
  return (
    <View accessible accessibilityLabel={`${s.title}. ${SIGNAL_LABEL[s.nature]}. ${s.meta}`} style={styles.row}>
      <View style={styles.rowHead}>
        <SignalMarker kind={s.nature} size={15} />
        <Text maxFontSizeMultiplier={1.3} style={styles.rowTitle}>{s.title}{s.lord ? '  ★' : ''}</Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.bar,
            { left: pct(bar.x), width: pct(bar.width), backgroundColor: color },
            bar.cutLeft && styles.cutLeft,
            bar.cutRight && styles.cutRight,
          ]}
        />
        {bar.cutLeft ? <Text maxFontSizeMultiplier={1.3} style={[styles.cut, { left: bar.exact.some((f) => f < 0.05) ? 12 : 4 }]}>{'‹'}</Text> : null}
        {bar.cutRight ? <Text maxFontSizeMultiplier={1.3} style={[styles.cut, { right: bar.exact.some((f) => f > 0.95) ? 12 : 4 }]}>{'›'}</Text> : null}
        {bar.exact.map((f, i) => (
          <View key={i} style={[styles.exact, { left: pct(f) }]} />
        ))}
      </View>
      <Text maxFontSizeMultiplier={1.3} style={styles.meta}>{SIGNAL_LABEL[s.nature]}. {s.meta}</Text>
    </View>
  );
}

export interface CycleInput {
  number: number;
  startsOn: string;
  endsOn: string | null;
}

/** The current cycle and the next as two bars end to end, with a line for today. */
export function CycleBar({ name, current, next, today }: { name: string; current: CycleInput; next: CycleInput | null; today: string }) {
  const m = cycleBar(current, next, today);
  const label = (n: number) => (n === 11 ? '11/2' : n === 22 ? '22/4' : n === 33 ? '33/6' : String(n));
  return (
    <View
      accessible
      accessibilityLabel={`${name} ${label(current.number)}. ${progressWords(m.progress)}.${next ? ` Next comes ${label(next.number)}.` : ''}`}
      style={styles.cycle}
    >
      <View style={styles.cycleTrack}>
        {m.segments.map((seg) => (
          <View
            key={seg.which}
            style={[styles.segment, { width: pct(seg.width) }, seg.which === 'now' ? styles.segNow : styles.segNext]}
          >
            <Text maxFontSizeMultiplier={1.3} style={[styles.segText, seg.which === 'now' && styles.segTextNow]} numberOfLines={1}>
              {seg.which === 'now' ? `Now ${label(seg.number)}` : `Next ${label(seg.number)}`}
            </Text>
          </View>
        ))}
        <View style={[styles.cycleToday, { left: pct(m.todayX) }]} />
      </View>
      <Text maxFontSizeMultiplier={1.3} style={styles.meta}>{progressWords(m.progress)}.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  axis: { height: 34, marginTop: 4 },
  axisLine: { position: 'absolute', top: 8, left: 0, right: 0, height: 1, backgroundColor: colors.hairline },
  today: { position: 'absolute', top: 0, width: 2, height: 17, backgroundColor: colors.gold },
  tick: { position: 'absolute', top: 4, width: 1, height: 9, backgroundColor: colors.parchmentMuted },
  tickLabel: { position: 'absolute', top: 11, left: -12, width: 26, textAlign: 'center', fontFamily: fonts.body, fontSize: 11, color: colors.parchmentMuted },
  endLabel: { position: 'absolute', top: 19, fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.parchment },
  key: { paddingBottom: 4 },
  keyText: { fontFamily: fonts.body, fontSize: 13, color: colors.parchmentMuted },
  row: { gap: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.hairline },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowTitle: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 15, lineHeight: 21, color: colors.parchment },
  track: { height: 14, borderRadius: 7, backgroundColor: colors.obsidian, overflow: 'hidden' },
  bar: { position: 'absolute', top: 0, bottom: 0, borderRadius: 7 },
  cutLeft: { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
  cutRight: { borderTopRightRadius: 0, borderBottomRightRadius: 0 },
  cut: { position: 'absolute', top: -3, fontFamily: fonts.bodyBold, fontSize: 18, lineHeight: 20, color: colors.obsidian },
  exact: { position: 'absolute', top: 2, bottom: 2, width: 3, marginLeft: -1, borderRadius: 1, backgroundColor: colors.obsidian },
  meta: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.parchmentMuted },
  cycle: { gap: 6 },
  cycleTrack: { flexDirection: 'row', height: 34, borderRadius: radius.sm, overflow: 'hidden', backgroundColor: colors.obsidian },
  segment: { justifyContent: 'center', paddingHorizontal: 8 },
  segNow: { backgroundColor: LENS_COLOR.road },
  segNext: { backgroundColor: T.surface, borderLeftWidth: 1, borderLeftColor: colors.hairline },
  segText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.parchmentMuted },
  segTextNow: { color: colors.parchment },
  cycleToday: { position: 'absolute', top: 0, bottom: 0, width: 3, marginLeft: -1, backgroundColor: colors.gold },
});
