import { StyleSheet, Text, View } from 'react-native';
import type { TriadToday } from '@/lib/triadTypes';
import { colors, fonts, radius, space } from '@/theme/tokens';

function Lens({ glyph, accent, label, title, lines }: {
  glyph: string; accent: string; label: string; title: string; lines: (string | null)[];
}) {
  return (
    <View style={[styles.lens, { borderLeftColor: accent }]}>
      <Text style={[styles.lensLabel, { color: accent }]}>{glyph}  {label}</Text>
      <Text style={styles.lensTitle}>{title}</Text>
      {lines.filter((l): l is string => !!l).map((l) => (
        <Text key={l} style={styles.body}>{l}</Text>
      ))}
    </View>
  );
}

export function TriadTodayCard({ data, isToday = true }: { data: TriadToday; isToday?: boolean }) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>{isToday ? "TODAY'S TRIAD" : "THIS DAY'S TRIAD"}</Text>
      <Text accessibilityRole="header" style={styles.title}>{isToday ? 'One frame for today' : 'One frame for this day'}</Text>
      <Text style={styles.frame}>{data.frame}</Text>

      <Lens
        glyph="◆" accent={colors.vehicle} label="THE VEHICLE" title={data.vehicle.heading}
        lines={[data.vehicle.strategy, data.vehicle.authority, data.vehicle.cue]}
      />
      <Lens
        glyph="▲" accent={colors.road} label="THE ROAD"
        title={`Personal Day ${data.road.numberText}: ${data.road.label}`}
        lines={[data.road.theme, `Lean in: ${data.road.leanIn}`, `Watch for: ${data.road.watchFor}`]}
      />
      <Lens
        glyph="●" accent={colors.stoplight} label="THE STOPLIGHT"
        title={data.stoplight.lead ? data.stoplight.lead.title : 'A quiet sky'}
        lines={[
          data.stoplight.lead ? data.stoplight.lead.natureLine : data.stoplight.quiet,
          data.stoplight.moon,
          data.stoplight.lead ? data.stoplight.lead.invitation : null,
        ]}
      />

      <View style={styles.steps}>
        <Text style={styles.stepsLabel}>YOUR FOUR CHECKS</Text>
        {data.steps.map((s, i) => (
          <View key={s} style={styles.stepRow}>
            <Text style={styles.stepNum}>{i + 1}</Text>
            <Text style={[styles.body, styles.stepText]}>{s}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.closing}>{data.closing}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.charcoal, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.gold, padding: space.lg, gap: 14,
  },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2.4, color: colors.gold },
  title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 33, color: colors.parchment },
  frame: { fontFamily: fonts.bodyMedium, fontSize: 16, lineHeight: 25, color: colors.parchment },
  lens: { gap: 6, paddingLeft: space.md, borderLeftWidth: 4 },
  lensLabel: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.8 },
  lensTitle: { fontFamily: fonts.display, fontSize: 20, lineHeight: 27, color: colors.parchment },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.parchment },
  steps: { gap: 10, padding: space.md, borderRadius: radius.md, backgroundColor: colors.amethyst },
  stepsLabel: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.8, color: colors.gold },
  stepRow: { flexDirection: 'row', gap: 10 },
  stepNum: { fontFamily: fonts.bodyBold, fontSize: 15, lineHeight: 23, color: colors.gold, width: 16 },
  stepText: { flex: 1 },
  closing: { fontFamily: fonts.body, fontSize: 14, lineHeight: 22, color: colors.parchmentMuted },
});
