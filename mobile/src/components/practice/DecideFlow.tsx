import { toast } from '@/lib/toast';
import { useState } from 'react';
import { select } from '@/lib/haptics';
import { StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/components/Pressable';
import { Field } from '@/components/Field';
import { GoldButton } from '@/components/GoldButton';
import { LENS_COLOR, LensLabel, SignalMarker } from '@/components/Lens';
import { BreathRing } from '@/components/practice/BreathRing';
import { CheckLamps } from '@/components/practice/CheckLamps';
import { ResultLamp } from '@/components/practice/ResultLamp';
import { COLOR, SHAPE, WORD } from '@/components/SignalLamp';
import { lampForChoice, VERDICT_LAMP, verdictFor } from '@/lib/practiceLamps';
import type { PracticeData } from '@/lib/practiceTypes';
import { localDateString } from '@/lib/useTimeline';
import { addDays, usePracticeStore } from '@/store/usePracticeStore';
import { colors, fonts, radius, space, themes } from '@/theme/tokens';

const T = themes.practice;

const ORDER = ['vehicle', 'road', 'stoplight'] as const;

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
        <Text style={styles.eyebrow}>Three checks, in this order</Text>
        <CheckLamps steps={steps} answers={{}} current={-1} />
        <Field
          label="The decision"
          value={text}
          onChangeText={setText}
          placeholder="e.g. Take the new client"
          maxLength={140}
          returnKeyType="done"
        />
        <GoldButton label="Start the checks" disabled={text.trim().length < 3} onPress={() => setStepIndex(0)} />
        {text.trim().length < 3 ? <Text style={styles.hint}>Write your decision above to begin.</Text> : null}
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
        <CheckLamps steps={steps} answers={answers} current={steps.length} />
        {steps.map((s) => (
          <View key={s.key} style={[styles.recap, { borderLeftColor: LENS_COLOR[s.key] }]}>
            <LensLabel lens={s.key}>{s.system}</LensLabel>
            <Text style={styles.body}>{s.choices.find((c) => c.id === answers[s.key])?.label ?? ''}</Text>
          </View>
        ))}
        <ResultLamp
          state={VERDICT_LAMP[verdict]}
          title={v.title}
          text={v.text}
          extra={revisit ? `Suggested time to look again: ${revisit}.` : null}
        />
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
            toast.success('Saved to your log');
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
      <CheckLamps steps={steps} answers={answers} current={stepIndex} />
      <Text style={styles.progress}>{`Check ${stepIndex + 1} of ${steps.length}`}</Text>
      <LensLabel lens={step.key}>{step.system}</LensLabel>
      <Text accessibilityRole="header" style={styles.title}>{step.title}</Text>
      <Text style={styles.decisionText}>{text.trim()}</Text>
      <Text style={styles.prompt}>{step.prompt}</Text>
      <Text style={styles.body}>{step.instruction}</Text>
      {step.key === 'vehicle' && /sacral/i.test(data.authority ?? '') ? <BreathRing /> : null}
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
              onPress={() => {
                select();
                setAnswers((a) => ({ ...a, [step.key]: c.id }));
              }}
              style={[styles.choice, selected && { borderColor: colors.gold, backgroundColor: T.raised }]}
            >
              <Text style={styles.choiceMark}>{selected ? '●' : '○'}</Text>
              <Text style={styles.choiceText}>{c.label}</Text>
              {lampForChoice(step.key, c.id) ? (
                <View style={styles.choiceLamp}>
                  <SignalMarker kind={SHAPE[lampForChoice(step.key, c.id)!]} size={16} color={COLOR[lampForChoice(step.key, c.id)!]} />
                  <Text style={styles.choiceLampText}>{WORD[lampForChoice(step.key, c.id)!]}</Text>
                </View>
              ) : null}
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
  card: { backgroundColor: T.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: T.edge, padding: space.lg, gap: 14 },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.parchmentMuted },
  progress: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.parchmentMuted },
  title: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 24, lineHeight: 31, color: colors.parchment },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.parchment },
  pace: { fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 22, color: colors.parchmentMuted },
  decisionText: { fontFamily: fonts.bodyMedium, fontSize: 16, lineHeight: 24, color: colors.parchment, padding: space.md, borderRadius: radius.md, backgroundColor: T.raised },
  prompt: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 19, lineHeight: 27, color: colors.parchment },
  hint: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.parchmentMuted, textAlign: 'center', marginTop: -6 },
  signal: { fontFamily: fonts.body, fontSize: 14, lineHeight: 22, color: colors.parchmentMuted },
  choices: { gap: 8 },
  choice: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.md, borderWidth: 1, borderColor: T.edge },
  choiceMark: { fontSize: 16, color: colors.gold },
  choiceLamp: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  choiceLampText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.parchmentMuted },
  choiceText: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 15, lineHeight: 22, color: colors.parchment },
  recap: { gap: 4, paddingLeft: space.md, borderLeftWidth: 4 },
  recapLabel: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 1.8 },
});
