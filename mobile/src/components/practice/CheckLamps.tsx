import { StyleSheet, Text, View } from 'react-native';
import { COLOR, SHAPE, WORD } from '@/components/SignalLamp';
import { LENS_COLOR, LENS_TEXT, LensIcon, SignalMarker } from '@/components/Lens';
import { lampForChoice, spokenChecks, type CheckKey } from '@/lib/practiceLamps';
import type { PracticeStep } from '@/lib/practiceTypes';
import { colors, fonts, radius } from '@/theme/tokens';

const NAME: Record<CheckKey, string> = { vehicle: 'Authority', road: 'Road', stoplight: 'Stoplight' };

/**
 * The three checks as three lamps in a row, in the order they are asked. Each one shows its lens shape,
 * its name, and either "Now", "Next" or the lamp the person's answer lit (shape and word).
 */
export function CheckLamps({
  steps,
  answers,
  current,
}: {
  steps: PracticeStep[];
  answers: Record<string, string>;
  /** Index of the check being asked, or -1 before the first and steps.length after the last. */
  current: number;
}) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`Three checks. ${spokenChecks(answers)}`}>
      {steps.map((s, i) => {
        const lamp = lampForChoice(s.key, answers[s.key]);
        const isNow = i === current;
        return (
          <View key={s.key} style={[styles.lamp, isNow && { borderColor: LENS_COLOR[s.key] }]}>
            <LensIcon lens={s.key} size={18} />
            <Text style={[styles.name, { color: LENS_TEXT[s.key] }]}>{NAME[s.key]}</Text>
            {lamp ? (
              <View style={styles.word}>
                <SignalMarker kind={SHAPE[lamp]} size={14} color={COLOR[lamp]} />
                <Text style={styles.wordText}>{WORD[lamp]}</Text>
              </View>
            ) : (
              <Text style={styles.wordText}>{isNow ? 'Now' : 'Next'}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  lamp: {
    flex: 1, minHeight: 78, alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: 8, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.hairline,
    backgroundColor: colors.obsidian,
  },
  name: { fontFamily: fonts.bodyBold, fontSize: 12 },
  word: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  wordText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.parchment },
});
