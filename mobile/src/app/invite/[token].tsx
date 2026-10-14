import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable } from '@/components/Pressable';
import { Screen } from '@/components/Screen';
import { FadeIn } from '@/components/FadeIn';
import { Field } from '@/components/Field';
import { GoldButton } from '@/components/GoldButton';
import { AccentView } from '@/components/AccentView';
import { TriadLoader } from '@/components/TriadLoader';
import { TriadSeal } from '@/components/TriadSeal';
import { LENS_TEXT, LensLabel } from '@/components/Lens';
import { TogetherReading } from '@/components/practice/Together';
import {
  ChartRequestError, requestInviteTogether, requestInvitePreview, requestPlaceCheck,
  type InvitePreview, type InviteViewer, type PlaceCandidate,
} from '@/lib/api';
import type { DecideTogether } from '@/lib/togetherTypes';
import { localDateString } from '@/lib/useTimeline';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, radius, space } from '@/theme/tokens';

const pad = (n: number) => String(n).padStart(2, '0');
const dateString = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const timeString = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/**
 * Where an invite link lands. Someone with a chart sees the reading at once. Someone without one adds their birth
 * date, place and time (the time can be marked unknown, as when making a chart) and then sees the reading. What they
 * type is sent once to build their view and is never saved, here or on the server.
 */
export default function InviteScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const chart = useT3DStore((s) => s.chart);
  const profile = useT3DStore((s) => s.profile);
  const [today] = useState(() => new Date());

  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [gone, setGone] = useState<string | null>(null);
  const [data, setData] = useState<DecideTogether | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [birthDate, setBirthDate] = useState(new Date(1990, 0, 1, 12, 0));
  const [pickingDate, setPickingDate] = useState(false);
  const [timeKnown, setTimeKnown] = useState(true);
  const [birthTime, setBirthTime] = useState(new Date(2000, 0, 1, 12, 0));
  const [pickingTime, setPickingTime] = useState(false);
  const [placeText, setPlaceText] = useState('');
  const [candidates, setCandidates] = useState<PlaceCandidate[] | null>(null);
  const [chosen, setChosen] = useState(0);

  useEffect(() => {
    if (typeof token !== 'string') return;
    let alive = true;
    requestInvitePreview(token)
      .then((p) => { if (alive) setPreview(p); })
      .catch((e) => { if (alive) setGone(e instanceof ChartRequestError ? e.message : 'This invite is no longer available.'); });
    return () => { alive = false; };
  }, [token]);

  const run = useCallback(async (viewer: InviteViewer) => {
    if (typeof token !== 'string') return;
    setError(null);
    setBusy(true);
    try {
      setData(await requestInviteTogether(token, localDateString(), viewer, profile?.birthTimeKnown !== false));
    } catch (e) {
      setError(e instanceof ChartRequestError ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [token, profile]);

  const hasChart = !!chart && !!profile;
  const onShow = () => {
    if (hasChart) return void run({ leadId: chart.leadId, email: profile.email.trim() });
    // Someone without a chart: birth date, birth place and (unless unknown) birth time, all required.
    const c = candidates?.[chosen];
    if (!c) return void onCheckPlace();
    const viewer: InviteViewer = {
      birthDate: dateString(birthDate),
      birthTime: timeKnown ? timeString(birthTime) : null,
      place: { latitude: c.latitude, longitude: c.longitude, timezone: c.timezone },
    };
    void run(viewer);
  };

  async function onCheckPlace() {
    setError(null);
    const cut = placeText.lastIndexOf(',');
    const city = cut > 0 ? placeText.slice(0, cut).trim() : '';
    const country = cut > 0 ? placeText.slice(cut + 1).trim() : '';
    if (!city || !country) return setError('Please enter your birth place as city, then country. For example: Austin, United States.');
    setBusy(true);
    try {
      setCandidates(await requestPlaceCheck(city, country, dateString(birthDate)));
      setChosen(0);
    } catch (e) {
      setError(e instanceof ChartRequestError ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const who = preview?.firstName ?? 'A friend';

  if (gone) {
    return (
      <Screen>
        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.title}>This invite is no longer available</Text>
          <Text style={styles.body}>{gone}</Text>
          <GoldButton label="See your own free first look" onPress={() => router.replace('/')} />
        </View>
      </Screen>
    );
  }

  if (!preview) {
    return (
      <Screen>
        <View style={styles.center} accessibilityLiveRegion="polite">
          <TriadLoader />
          <Text style={styles.small}>Opening your invite…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {!data ? (
        <FadeIn>
          <View style={styles.head}>
            <TriadSeal size={64} />
            <Text accessibilityRole="header" style={styles.heading}>{who} invited you to see how your charts fit together</Text>
          </View>
          <View style={styles.card}>
            {preview.type ? <Teaser accent={colors.vehicle} lens="vehicle" label="The Vehicle" value={preview.type} /> : null}
            {preview.lifePath ? <Teaser accent={colors.road} lens="road" label="The Road" value={`Life Path ${preview.lifePath}`} /> : null}
            {preview.sunSign ? <Teaser accent={colors.stoplight} lens="stoplight" label="The Stoplight" value={`Sun in ${preview.sunSign}`} /> : null}
          </View>
        </FadeIn>
      ) : null}

      {!data && !hasChart ? (
        <View style={styles.card}>
          <Text style={styles.body}>
            To read the two of you accurately, add the date, time and place you were born. They are used once to build this view
            and are not saved.
          </Text>
          <View style={styles.pickerRow}>
            <Text style={styles.pickerLabel}>Your birth date</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Your birth date, ${dateString(birthDate)}. Change`}
              onPress={() => setPickingDate((v) => !v)}
              style={styles.chooseBtn}
            >
              <Text style={styles.chooseText}>
                {birthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </Text>
            </Pressable>
          </View>
          {pickingDate ? (
            <View style={{ gap: space.sm }}>
              <DateTimePicker value={birthDate} mode="date" display="spinner" themeVariant="dark" maximumDate={today}
                minimumDate={new Date(1900, 0, 1)} onValueChange={(_e: unknown, v: Date) => { setBirthDate(v); setCandidates(null); }} accessibilityLabel="Your birth date" />
              <GoldButton label="Use this date" onPress={() => setPickingDate(false)} />
            </View>
          ) : null}
          {timeKnown ? (
            <View style={styles.pickerRow}>
              <Text style={styles.pickerLabel}>Your birth time</Text>
              <Pressable accessibilityRole="button" accessibilityLabel={`Your birth time, ${timeString(birthTime)}. Change`}
                onPress={() => setPickingTime((v) => !v)} style={styles.chooseBtn}>
                <Text style={styles.chooseText}>{birthTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</Text>
              </Pressable>
            </View>
          ) : null}
          {timeKnown && pickingTime ? (
            <View style={{ gap: space.sm }}>
              <DateTimePicker value={birthTime} mode="time" display="spinner" themeVariant="dark"
                onValueChange={(_e: unknown, v: Date) => setBirthTime(v)} accessibilityLabel="Your birth time" />
              <GoldButton label="Use this time" onPress={() => setPickingTime(false)} />
            </View>
          ) : null}
          <View style={styles.pickerRow}>
            <Text style={styles.pickerLabel}>I do not know my birth time</Text>
            <Switch value={!timeKnown} onValueChange={(v) => setTimeKnown(!v)} trackColor={{ false: colors.switchOff, true: colors.gold }}
              ios_backgroundColor="#6B6B73" accessibilityLabel="I do not know my birth time" />
          </View>
          {!timeKnown ? (
            <Text style={styles.small}>Without a birth time your Moon, Rising sign and exact Human Design cannot be pinned down, so the reading will say where it depends.</Text>
          ) : null}
          <Field label="Birth place (city, country)" value={placeText} onChangeText={(t) => { setPlaceText(t); setCandidates(null); }}
            autoCapitalize="words" placeholder="e.g. Austin, United States" />
          {candidates ? (
            <>
              <Text style={styles.small}>Is this where you were born? A wrong match changes your Human Design.</Text>
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
                    <Text style={styles.small}>{c.timezone}</Text>
                  </View>
                </Pressable>
              ))}
            </>
          ) : null}
        </View>
      ) : null}

      {!data ? (
        <View style={styles.actions}>
          {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{'⚠  '}{error}</Text> : null}
          <GoldButton label={hasChart || candidates ? 'See us together' : 'Check my birth place'} onPress={onShow} loading={busy} />
          <GoldButton label="Not now" variant="ghost" onPress={() => router.replace(hasChart ? '/today' : '/')} />
        </View>
      ) : (
        <View style={{ gap: space.md }}>
          <TogetherReading data={data} partnerLabel={data.people[1].label} />

          {!hasChart ? (
            <View style={styles.card}>
              <Text style={styles.eyebrow}>YOUR OWN CHART</Text>
              <Text accessibilityRole="header" style={styles.title}>Get your full T3D chart</Text>
              <Text style={styles.body}>Your Vehicle, Road and Stoplight, read together, with a daily frame built from your own timing.</Text>
              <GoldButton label="Make my chart" onPress={() => router.push({ pathname: '/onboarding', params: { birthDate: dateString(birthDate) } })} />
            </View>
          ) : null}

          <GoldButton label="Done" variant="ghost" onPress={() => router.replace(hasChart ? '/today' : '/')} />
        </View>
      )}
    </Screen>
  );
}

function Teaser({ accent, lens, label, value }: { accent: string; lens: 'vehicle' | 'road' | 'stoplight'; label: string; value: string }) {
  return (
    <AccentView accent={accent} style={styles.teaser} accessible accessibilityLabel={`${label}. ${value}`}>
      <LensLabel lens={lens}>{label}</LensLabel>
      <Text style={[styles.teaserValue, { color: colors.parchment }]}>{value}</Text>
    </AccentView>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', gap: space.md, paddingTop: space.lg, paddingBottom: space.md },
  heading: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 28, lineHeight: 36, color: colors.parchment, textAlign: 'center' },
  card: { backgroundColor: colors.charcoal, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline, padding: space.lg, gap: space.md },
  teaser: { gap: 2, paddingVertical: 4 },
  teaserValue: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 24, lineHeight: 31 },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2, color: colors.gold },
  title: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 22, lineHeight: 29, color: colors.parchment },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.parchment },
  small: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.parchmentMuted },
  error: { fontFamily: fonts.body, fontSize: 15, color: colors.danger },
  center: { alignItems: 'center', gap: space.sm, paddingVertical: space.xl },
  actions: { gap: space.sm },
  pickerRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  pickerLabel: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.parchment, flexShrink: 1 },
  chooseBtn: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 16, borderRadius: radius.md, borderWidth: 1, borderColor: colors.gold, backgroundColor: colors.surfaceRaised },
  chooseText: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.parchment },
  placeRow: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.hairline },
  mark: { fontSize: 20, color: colors.gold },
  placeLabel: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.parchment },
});
