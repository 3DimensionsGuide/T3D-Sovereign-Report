import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Field } from '@/components/Field';
import { GoldButton } from '@/components/GoldButton';
import type { PracticeData, VerdictKey } from '@/lib/practiceTypes';
import { localDateString } from '@/lib/useTimeline';
import { usePracticeStore, type Decision, type Followed, type Outcome } from '@/store/usePracticeStore';
import { colors, fonts, radius, space } from '@/theme/tokens';

const OUTCOMES: Array<{ id: Outcome; label: string }> = [
  { id: 'good', label: 'Feels right' },
  { id: 'mixed', label: 'Mixed' },
  { id: 'regret', label: 'Feels wrong' },
];

const FOLLOWED: Array<{ id: Followed; label: string }> = [
  { id: 'followed', label: 'I followed my checks' },
  { id: 'other', label: 'I went another way' },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function Pick<T extends string>({ options, value, onChange }: {
  options: Array<{ id: T; label: string }>; value: T | null; onChange: (v: T) => void;
}) {
  return (
    <View style={styles.pickRow}>
      {options.map((o) => {
        const selected = value === o.id;
        return (
          <Pressable
            key={o.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={o.label}
            onPress={() => onChange(o.id)}
            style={[styles.pick, selected && { borderColor: colors.gold, backgroundColor: colors.amethyst }]}
          >
            <Text style={styles.pickText}>{selected ? '● ' : '○ '}{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Closer({ decision }: { decision: Decision }) {
  const closeDecision = usePracticeStore((s) => s.closeDecision);
  const [followed, setFollowed] = useState<Followed | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [note, setNote] = useState('');
  return (
    <View style={styles.closer}>
      <Text style={styles.closerLabel}>WHAT HAPPENED?</Text>
      <Pick options={FOLLOWED} value={followed} onChange={setFollowed} />
      <Text style={styles.closerLabel}>HOW DOES IT FEEL NOW?</Text>
      <Pick options={OUTCOMES} value={outcome} onChange={setOutcome} />
      <Field label="A note (optional)" value={note} onChangeText={setNote} maxLength={200} returnKeyType="done" />
      <GoldButton
        label="Close this decision"
        disabled={!followed || !outcome}
        onPress={() => followed && outcome && closeDecision(decision.id, followed, outcome, note.trim())}
      />
    </View>
  );
}

function DecisionCard({ decision, verdicts }: { decision: Decision; verdicts: PracticeData['decide']['verdicts'] }) {
  const removeDecision = usePracticeStore((s) => s.removeDecision);
  const [closing, setClosing] = useState(false);
  const today = localDateString();
  const due = !decision.closed && decision.revisitOn !== null && decision.revisitOn <= today;
  const verdict = verdicts[decision.verdict as VerdictKey];

  return (
    <View style={[styles.card, due && { borderColor: colors.gold }]}>
      <View style={styles.cardTop}>
        <Text style={styles.date}>{formatDate(decision.createdAt)}</Text>
        <Text style={styles.status}>{decision.closed ? 'CLOSED' : due ? 'TIME TO LOOK AGAIN' : 'OPEN'}</Text>
      </View>
      <Text style={styles.decisionText}>{decision.text}</Text>
      <Text style={styles.small}>{verdict?.title}</Text>
      {!decision.closed && decision.revisitOn ? (
        <Text style={styles.small}>Look again on {decision.revisitOn}</Text>
      ) : null}
      {decision.closed ? (
        <Text style={styles.small}>
          {FOLLOWED.find((f) => f.id === decision.followed)?.label} · {OUTCOMES.find((o) => o.id === decision.outcome)?.label}
          {decision.note ? `\n${decision.note}` : ''}
        </Text>
      ) : closing ? (
        <Closer decision={decision} />
      ) : (
        <GoldButton label="How did it go?" variant="ghost" onPress={() => setClosing(true)} />
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Delete this decision"
        onPress={() =>
          Alert.alert('Delete this decision?', 'It will be removed from your log on this phone.', [
            { text: 'Keep it', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => removeDecision(decision.id) },
          ])
        }
        style={styles.delete}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </Pressable>
    </View>
  );
}

function Pattern({ decisions }: { decisions: Decision[] }) {
  const closed = decisions.filter((d) => d.closed && d.followed && d.outcome);
  if (closed.length < 3) return null;
  const rate = (f: Followed): string | null => {
    const set = closed.filter((d) => d.followed === f);
    if (set.length === 0) return null;
    return `${set.filter((d) => d.outcome === 'good').length} of ${set.length} felt right`;
  };
  const followedRate = rate('followed');
  const otherRate = rate('other');
  return (
    <View style={styles.pattern}>
      <Text style={styles.closerLabel}>YOUR PATTERN SO FAR</Text>
      {followedRate ? <Text style={styles.body}>When you followed your checks: {followedRate}.</Text> : null}
      {otherRate ? <Text style={styles.body}>When you went another way: {otherRate}.</Text> : null}
      <Text style={styles.small}>Counts only, from your own entries. A small sample says little, so keep logging.</Text>
    </View>
  );
}

export function DecisionLog({ data, onDecide }: { data: PracticeData; onDecide: () => void }) {
  const decisions = usePracticeStore((s) => s.decisions);
  if (decisions.length === 0) {
    return (
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.title}>No decisions yet</Text>
        <Text style={styles.body}>
          Run a decision through your {data.authorityLabel}, then come back later and note how it went. Over time the log shows
          how often your own signal served you.
        </Text>
        <GoldButton label="Make a decision" onPress={onDecide} />
      </View>
    );
  }
  return (
    <View style={{ gap: space.md }}>
      <Pattern decisions={decisions} />
      {decisions.map((d) => <DecisionCard key={d.id} decision={d} verdicts={data.decide.verdicts} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.charcoal, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline, padding: space.lg, gap: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  date: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.parchmentMuted },
  status: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.6, color: colors.gold },
  title: { fontFamily: fonts.display, fontSize: 22, lineHeight: 29, color: colors.parchment },
  decisionText: { fontFamily: fonts.bodyMedium, fontSize: 17, lineHeight: 25, color: colors.parchment },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.parchment },
  small: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.parchmentMuted },
  closer: { gap: 12 },
  closerLabel: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.8, color: colors.gold },
  pickRow: { gap: 8 },
  pick: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.hairline },
  pickText: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.parchment },
  delete: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  deleteText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.parchmentMuted, textDecorationLine: 'underline' },
  pattern: { gap: 8, padding: space.lg, borderRadius: radius.lg, backgroundColor: colors.amethyst, borderWidth: 1, borderColor: colors.gold },
});
