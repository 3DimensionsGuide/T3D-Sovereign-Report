import { StyleSheet, Text, View } from 'react-native';
import { AccentView } from '@/components/AccentView';
import { Disclosure } from '@/components/Disclosure';
import { Term } from '@/components/Explain';
import { MoonIcon } from '@/components/MoonIcon';
import type { TodayResult } from '@/lib/api';
import { bodyName, contactSentence, houseTheme, ordinal, phaseMeaning } from '@/lib/skyText';
import { houseId, planetId } from '@/lib/termIds';
import { colors, fonts, space } from '@/theme/tokens';

/**
 * The Moon and the Sun in one card. The Moon leads (it is the day's timekeeper) with its phase and the
 * house it moves through; the Sun and any retrograde planets follow in a line each. The Moon's coming
 * and just-passed contacts sit behind a tap.
 */
export function SkyTodayCard({ today }: { today: TodayResult }) {
  const { moon, sun } = today;
  const hasMore = !!(moon.nextApplying || moon.lastSeparating);
  return (
    <AccentView style={styles.card} accent={colors.stoplight}>
      <View style={styles.moonHead}>
        <MoonIcon illuminationPercent={moon.illuminationPercent} waxing={moon.waxing} size={96} hero />
        <View style={styles.flex}>
          <Text accessibilityRole="header" style={styles.cardTitle}>The sky today</Text>
          <Text style={styles.moonLine}>
            Moon in {moon.formatted} · <Term id="astro:phase">{moon.phase}</Term> · {moon.illuminationPercent}% lit
          </Text>
        </View>
      </View>

      <Text style={styles.body}>{phaseMeaning(moon.waxing, moon.phase)}</Text>
      <Text style={styles.body}>
        The Moon moves through your <Term id={houseId(moon.house)} style={styles.strong}>{ordinal(moon.house)} house</Term>:{' '}
        {houseTheme(moon.house)}.
      </Text>

      <View style={styles.divider} />

      <Text style={styles.body}>
        <Text style={styles.strong}>Sun in {sun.formatted}, </Text>
        lighting up your <Term id={houseId(sun.house)} style={styles.strong}>{ordinal(sun.house)} house</Term>:{' '}
        {houseTheme(sun.house)}.
      </Text>

      {today.retrograde.length ? (
        <Text style={styles.body}>
          <Term id="astro:retrograde" style={styles.strong}>Retrograde now: </Term>
          {today.retrograde.map((b, i) => (
            <Text key={b}>
              {i > 0 ? ', ' : ''}
              <Term id={planetId(b)}>{`${bodyName(b)} ℞`}</Term>
            </Text>
          ))}
        </Text>
      ) : null}

      {hasMore ? (
        <Disclosure label="More about the Moon">
          {moon.nextApplying ? (
            <Text style={styles.body}>
              <Text style={styles.strong}>Next: </Text>
              {contactSentence(moon.nextApplying, 'ahead')}.
            </Text>
          ) : null}
          {moon.lastSeparating ? (
            <Text style={styles.body}>
              <Text style={styles.strong}>Just left: </Text>
              {contactSentence(moon.lastSeparating, 'behind')}.
            </Text>
          ) : null}
        </Disclosure>
      ) : null}
    </AccentView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    backgroundColor: colors.charcoal, borderRadius: 22, borderWidth: 1,
    borderColor: colors.hairline, borderLeftWidth: 4, padding: space.lg, gap: 10,
  },
  moonHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  cardTitle: { fontFamily: fonts.display, fontSize: 24, color: colors.parchment },
  moonLine: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  strong: { fontFamily: fonts.bodyBold, color: colors.parchment },
  divider: { height: 1, backgroundColor: colors.hairline },
});
