import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Field } from '@/components/Field';
import { GoldButton } from '@/components/GoldButton';
import { LENS_COLOR, LensLabel } from '@/components/Lens';
import type { PracticeData, VerdictKey } from '@/lib/practiceTypes';
import { localDateString } from '@/lib/useTimeline';
import { addDays, usePracticeStore } from '@/store/usePracticeStore';
import { colors, fonts, radius, space } from '@/theme/tokens';

const ORDER = ['vehicle', 'road', 'stoplight'] as const;

/** Simple, visible rule: the Authority leads; the Road and the Stoplight add context. */
function verdictFor(vehicle: string, road: string, light: string): VerdictKey {
  if (vehicle === 'no') return 'decline';
  if (vehicle === 'unclear') return 'wait';
  if (light === 'red') return 'wait';
  if (road === 'away') return 'reconsider';
  return 'proceed';
}

export function DecideFlow({ data, onSaved }: { data: PracticeData; onSaved: () => void }) {
  const addDecision = usePracticeStore((s) => s.addDecision);
  const [text, setText] = useState('');
  const [stepIndex, setStepIndex] = useState(-1); // -1 = describe the decision
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const steps = [...data.decide.steps].sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key));
  const done = stepIndex >= steps.length;

  const reset = () => {
    setText('');
    setStepIndex(-1);
    setAnswers({});
  };

  if (stepIndex === -1) {
    return (
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.title}>What are you deciding?</Text>
        <Text style={styles.body}>{data.decide.intro}</Text>
        <Text style={styles.pace}>{data.decide.pace}</Text>
        <Field
          label="The decision"
          value={text}
          onChangeText={setText}
          placeholder="e.g. Take the new client"
          maxLength={140}
          returnKeyType="done"
        />
        <GoldButton label="Start the checks" disabled={text.trim().length < 3} onPress={() => setStepIndex(0)} />
      </View>
    );
  }

  if (done) {
    const verdict = verdictFor(answers.vehicle ?? '', answers.road ?? '', answers.stoplight ?? '');
    const v = data.decide.verdicts[verdict];
    const hold = verdict === 'wait' || verdict === 'reconsider';
    const revisit = hold && data.decide.revisitDays > 0 ? addDays(localDateString(), data.decide.revisitDays) : null;
    return (
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Your three checks</Text>
        <Text style={styles.decisionText}>{text.trim()}</Text>
        {steps.map((s) => (
          <View key={s.key} style={[styles.recap, { borderLeftColor: LENS_COLOR[s.key] }]}>
            <LensLabel lens={s.key}>{s.system}</LensLabel>
            <Text style={styles.body}>{s.choices.find((c) => c.id === answers[s.key])?.label ?? ''}</Text>
          </View>
        ))}
        <View style={styles.verdict} accessibilityLiveRegion="polite">
          <Text accessibilityRole="header" style={styles.verdictTitle}>{v.title}</Text>
          <Text style={styles.body}>{v.text}</Text>
          {revisit ? <Text style={styles.pace}>Suggested time to look again: {revisit}.</Text> : null}
        </View>
        <GoldButton
          label="Save to my log"
          onPress={() => {
            addDecision({
              text: text.trim(),
              vehicle: answers.vehicle ?? '',
              road: answers.road ?? '',
              light: answers.stoplight ?? '',
              verdict,
              revisitOn: revisit,
            });
            reset();
            onSaved();
          }}
        />
        <GoldButton label="Start over" variant="ghost" onPress={reset} />
      </View>
    );
  }

  const step = steps[stepIndex];
  const accent = LENS_COLOR[step.key];
  return (
    <View style={[styles.card, { borderColor: accent }]}>
      <View style={styles.bars} accessibilityLabel={`Check ${stepIndex + 1} of ${steps.length}`}>
        {steps.map((st, i) => (
          <View key={st.key} style={[styles.bar, i <= stepIndex && { backgroundColor: LENS_COLOR[st.key] }]} />
        ))}
      </View>
      <Text style={styles.progress}>{`Check ${stepIndex + 1} of ${steps.length}`}</Text>
      <LensLabel lens={step.key}>{step.system}</LensLabel>
      <Text accessibilityRole="header" style={styles.title}>{step.title}</Text>
      <Text style={styles.decisionText}>{text.trim()}</Text>
      <Text style={styles.prompt}>{step.prompt}</Text>
      <Text style={styles.body}>{step.instruction}</Text>
      <Text style={styles.signal}>{step.signal}</Text>
      <View style={styles.choices}>
        {step.choices.map((c) => {
          const selected = answers[step.key] === c.id;
          return (
            <Pressable
              key={c.id}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={c.label}
              onPress={() => setAnswers((a) => ({ ...a, [step.key]: c.id }))}
              style={[styles.choice, selected && { borderColor: colors.gold, backgroundColor: colors.amethyst }]}
            >
              <Text style={styles.choiceMark}>{selected ? '●' : '○'}</Text>
              <Text style={styles.choiceText}>{c.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <GoldButton
        label={stepIndex === steps.length - 1 ? 'See my result' : 'Next check'}
        disabled={!answers[step.key]}
        onPress={() => setStepIndex(stepIndex + 1)}
      />
      <GoldButton label={stepIndex === 0 ? 'Back' : 'Previous check'} variant="ghost" onPress={() => setStepIndex(stepIndex - 1)} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.charcoal, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline, padding: space.lg, gap: 14 },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.gold },
  progress: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.parchmentMuted },
  bars: { flexDirection: 'row', gap: 6 },
  bar: { flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.hairline },
  title: { fontFamily: fonts.display, fontSize: 24, lineHeight: 31, color: colors.parchment },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.parchment },
  pace: { fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 22, color: colors.parchmentMuted },
  decisionText: { fontFamily: fonts.bodyMedium, fontSize: 16, lineHeight: 24, color: colors.parchment, padding: space.md, borderRadius: radius.md, backgroundColor: colors.amethyst },
  prompt: { fontFamily: fonts.display, fontSize: 19, lineHeight: 27, color: colors.parchment },
  signal: { fontFamily: fonts.body, fontSize: 14, lineHeight: 22, color: colors.parchmentMuted },
  choices: { gap: 8 },
  choice: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.md, borderWidth: 1, borderColor: colors.hairline },
  choiceMark: { fontSize: 16, color: colors.gold },
  choiceText: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 15, lineHeight: 22, color: colors.parchment },
  recap: { gap: 4, paddingLeft: space.md, borderLeftWidth: 4 },
  recapLabel: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.8 },
  verdict: { gap: 8, padding: space.md, borderRadius: radius.md, backgroundColor: colors.amethyst, borderWidth: 1, borderColor: colors.gold },
  verdictTitle: { fontFamily: fonts.display, fontSize: 20, lineHeight: 27, color: colors.parchment },
});
