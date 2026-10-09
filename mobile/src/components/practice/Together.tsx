import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Field } from '@/components/Field';
import { GoldButton } from '@/components/GoldButton';
import {
  ChartRequestError, requestDecideTogether, requestPlaceCheck, type PlaceCandidate,
} from '@/lib/api';
import type { DecideTogether, PartnerProfile, TogetherPerson } from '@/lib/togetherTypes';
import { localDateString } from '@/lib/useTimeline';
import { usePartnerStore } from '@/store/usePartnerStore';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, radius, space } from '@/theme/tokens';

const pad = (n: number) => String(n).padStart(2, '0');
const dateString = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const timeString = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

function PartnerForm({ onDone, onCancel }: { onDone: () => void; onCancel?: () => void }) {
  const saved = usePartnerStore((s) => s.partner);
  const setPartner = usePartnerStore((s) => s.setPartner);
  const [today] = useState(() => new Date());
  const [label, setLabel] = useState(saved?.label ?? '');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [birthDate, setBirthDate] = useState<Date>(saved ? new Date(`${saved.birthDate}T12:00:00`) : new Date(1990, 0, 1, 12, 0));
  const [birthTime, setBirthTime] = useState<Date>(saved?.birthTime ? new Date(`2000-01-01T${saved.birthTime}:00`) : new Date(2000, 0, 1, 12, 0));
  const [timeKnown, setTimeKnown] = useState(saved ? saved.birthTime !== null : true);
  const [candidates, setCandidates] = useState<PlaceCandidate[] | null>(null);
  const [chosen, setChosen] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onCheck() {
    setError(null);
    if (label.trim().length < 1) return setError('Please enter a name or nickname.');
    if (!city.trim() || !country.trim()) return setError('Please enter their birth city and country.');
    setLoading(true);
    try {
      setCandidates(await requestPlaceCheck(city.trim(), country.trim(), dateString(birthDate)));
      setChosen(0);
    } catch (e) {
      setError(e instanceof ChartRequestError ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function onSave() {
    const place = candidates?.[chosen];
    if (!place) return;
    setPartner({
      label: label.trim().slice(0, 24),
      birthDate: dateString(birthDate),
      birthTime: timeKnown ? timeString(birthTime) : null,
      placeLabel: place.label,
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: place.timezone,
    });
    onDone();
  }

  if (candidates) {
    return (
      <View style={styles.card}>
        <Text style={styles.eyebrow}>CONFIRM THEIR DETAILS</Text>
        <Text accessibilityRole="header" style={styles.title}>Is this right?</Text>
        <Text style={styles.body}>
          {label.trim()}, born {birthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          {timeKnown ? ` at ${birthTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : ', birth time not known'}.
        </Text>
        <Text style={styles.small}>Check the place especially. A wrong match changes their Human Design.</Text>
        {candidates.map((c, i) => (
          <Pressable
            key={`${c.label}-${c.latitude}`}
            accessibilityRole="radio"
            accessibilityState={{ selected: i === chosen }}
            accessibilityLabel={`${c.label}, time zone ${c.timezone}`}
            onPress={() => setChosen(i)}
            style={[styles.placeRow, i === chosen && { borderColor: colors.gold }]}
          >
            <Text style={styles.mark}>{i === chosen ? '◉' : '○'}</Text>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.placeLabel}>{c.label}</Text>
              <Text style={styles.small}>{c.timezone}{c.utcOffset ? ` (${c.utcOffset} on that date)` : ''}</Text>
            </View>
          </Pressable>
        ))}
        <GoldButton label="Save on this phone" onPress={onSave} />
        <GoldButton label="Change details" variant="ghost" onPress={() => setCandidates(null)} />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>DECIDE TOGETHER</Text>
      <Text accessibilityRole="header" style={styles.title}>Who are you deciding with?</Text>
      <Text style={styles.body}>
        Add one other person. Their details are used to work out their Type and Authority and are kept on this phone only. They
        are not saved on our server.
      </Text>
      <Field label="Name or nickname" value={label} onChangeText={setLabel} maxLength={24} autoCapitalize="words" returnKeyType="next" />
      <View style={styles.pickerRow}>
        <Text style={styles.pickerLabel}>Their birth date</Text>
        <DateTimePicker value={birthDate} mode="date" display="compact" themeVariant="dark" maximumDate={today}
          minimumDate={new Date(1900, 0, 1)} onValueChange={(_e: unknown, v: Date) => setBirthDate(v)} accessibilityLabel="Their birth date" />
      </View>
      <View style={styles.pickerRow}>
        <Text style={styles.pickerLabel}>Their birth time</Text>
        {timeKnown ? (
          <DateTimePicker value={birthTime} mode="time" display="compact" themeVariant="dark"
            onValueChange={(_e: unknown, v: Date) => setBirthTime(v)} accessibilityLabel="Their birth time" />
        ) : (
          <Text style={styles.small}>Not known</Text>
        )}
      </View>
      <View style={styles.pickerRow}>
        <Text style={styles.pickerLabel}>I know their birth time</Text>
        <Switch value={timeKnown} onValueChange={setTimeKnown} trackColor={{ false: colors.hairline, true: colors.gold }}
          accessibilityLabel="I know their birth time" />
      </View>
      {!timeKnown ? (
        <Text style={styles.small}>
          We check every hour of that day. If their Type or Authority is the same all day, the reading is exact. If not, we tell you.
        </Text>
      ) : null}
      <Field label="Birth city" value={city} onChangeText={setCity} autoCapitalize="words" placeholder="e.g. Austin, Texas" />
      <Field label="Birth country" value={country} onChangeText={setCountry} autoCapitalize="words" placeholder="e.g. United States" />
      {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{'⚠  '}{error}</Text> : null}
      <GoldButton label="Check their birth place" onPress={onCheck} loading={loading} />
      {onCancel ? <GoldButton label="Cancel" variant="ghost" onPress={onCancel} /> : null}
    </View>
  );
}

function PersonCard({ p }: { p: TogetherPerson }) {
  return (
    <View style={[styles.person, { borderLeftColor: colors.vehicle }]}>
      <Text style={[styles.eyebrow, { color: colors.vehicle }]}>◆  {p.label.toUpperCase()}</Text>
      {p.certainty === 'sure' ? (
        <>
          <Text style={styles.personTitle}>{p.type ?? 'Type unknown'} · {p.authority ?? 'Authority unknown'}</Text>
          {p.strategy ? <Text style={styles.small}>Strategy: {p.strategy}</Text> : null}
          {p.paceText ? <Text style={styles.small}>{p.paceText}.</Text> : null}
          {p.prompt ? <Text style={styles.body}>First check: {p.prompt}</Text> : null}
        </>
      ) : (
        <>
          <Text style={styles.personTitle}>Depends on the birth time</Text>
          <Text style={styles.small}>Across that day the result could be:</Text>
          {p.possibilities.map((x) => <Text key={x} style={styles.body}>•  {x}</Text>)}
        </>
      )}
    </View>
  );
}

function Reading({ partner, onChange }: { partner: PartnerProfile; onChange: () => void }) {
  const profile = useT3DStore((s) => s.profile);
  const chart = useT3DStore((s) => s.chart);
  const clearPartner = usePartnerStore((s) => s.clearPartner);
  const [data, setData] = useState<DecideTogether | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile || !chart) return;
    setError(null);
    setLoading(true);
    try {
      setData(await requestDecideTogether(chart.leadId, profile.email.trim(), localDateString(), profile.birthTimeKnown !== false, partner));
    } catch (e) {
      setError(e instanceof ChartRequestError ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [profile, chart, partner]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !data) {
    return (
      <View style={styles.center} accessibilityLiveRegion="polite">
        <ActivityIndicator color={colors.gold} />
        <Text style={styles.small}>Reading the two of you…</Text>
      </View>
    );
  }
  if (error || !data) {
    return (
      <View style={styles.card}>
        <Text accessibilityLiveRegion="polite" style={styles.error}>{'⚠  '}{error ?? 'Something went wrong.'}</Text>
        <GoldButton label="TRY AGAIN" variant="ghost" onPress={load} />
      </View>
    );
  }

  return (
    <View style={{ gap: space.md }}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>DECIDE TOGETHER</Text>
        <Text accessibilityRole="header" style={styles.title}>You and {partner.label}</Text>
        <Text style={styles.small}>
          Each of you decides through your own Strategy and Authority. This is a frame for doing that side by side.
        </Text>
      </View>

      {data.people.map((p) => <PersonCard key={p.label} p={p} />)}
      {data.note ? <View style={styles.noteBox}><Text style={styles.body}>{data.note}</Text></View> : null}

      {data.tempo ? (
        <View style={[styles.person, { borderLeftColor: colors.road }]}>
          <Text style={[styles.eyebrow, { color: colors.road }]}>▲  YOUR TEMPO</Text>
          <Text style={styles.personTitle}>{data.tempo.title}</Text>
          <Text style={styles.body}>{data.tempo.text}</Text>
        </View>
      ) : null}

      {data.approach ? (
        <View style={styles.card}>
          <Text style={styles.eyebrow}>BRINGING A DECISION TO EACH OTHER</Text>
          {data.approach.map((a) => (
            <View key={a.forLabel} style={{ gap: 6 }}>
              <Text style={styles.personTitle}>For {a.forLabel === 'You' ? 'you' : a.forLabel}</Text>
              <Text style={styles.body}>{a.howToAsk}</Text>
              {a.theirPart ? <Text style={styles.small}>{a.forLabel === 'You' ? 'Your part' : 'Their part'}: {a.theirPart}</Text> : null}
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.eyebrow}>YOUR STEPS</Text>
        {data.steps.map((s, i) => (
          <View key={s} style={styles.stepRow}>
            <Text style={styles.stepNum}>{i + 1}</Text>
            <Text style={[styles.body, { flex: 1 }]}>{s}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.small}>{data.closing}</Text>

      <GoldButton label="Change person" variant="ghost" onPress={onChange} />
      <GoldButton
        label="Remove from this phone"
        variant="ghost"
        onPress={() =>
          Alert.alert(`Remove ${partner.label}?`, 'Their birth details will be deleted from this phone.', [
            { text: 'Keep', style: 'cancel' },
            { text: 'Remove', style: 'destructive', onPress: clearPartner },
          ])
        }
      />
    </View>
  );
}

export function Together() {
  const partner = usePartnerStore((s) => s.partner);
  const [editing, setEditing] = useState(false);
  if (!partner || editing) {
    return <PartnerForm onDone={() => setEditing(false)} onCancel={partner ? () => setEditing(false) : undefined} />;
  }
  return <Reading partner={partner} onChange={() => setEditing(true)} />;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.charcoal, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline, padding: space.lg, gap: 12 },
  person: { backgroundColor: colors.charcoal, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline, borderLeftWidth: 4, padding: space.lg, gap: 8 },
  noteBox: { padding: space.md, borderRadius: radius.md, backgroundColor: colors.amethyst, borderWidth: 1, borderColor: colors.gold },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2.2, color: colors.gold },
  title: { fontFamily: fonts.display, fontSize: 24, lineHeight: 31, color: colors.parchment },
  personTitle: { fontFamily: fonts.display, fontSize: 19, lineHeight: 26, color: colors.parchment },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.parchment },
  small: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.parchmentMuted },
  error: { fontFamily: fonts.body, fontSize: 15, color: colors.danger },
  center: { alignItems: 'center', gap: space.sm, paddingVertical: space.xl },
  pickerRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  pickerLabel: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.parchment, flexShrink: 1 },
  placeRow: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.hairline },
  mark: { fontSize: 20, color: colors.gold },
  placeLabel: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.parchment },
  stepRow: { flexDirection: 'row', gap: 10 },
  stepNum: { fontFamily: fonts.bodyBold, fontSize: 15, lineHeight: 23, color: colors.gold, width: 16 },
});
