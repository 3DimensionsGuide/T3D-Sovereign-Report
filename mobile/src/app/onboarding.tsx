import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Screen } from '@/components/Screen';
import { FadeIn } from '@/components/FadeIn';
import { Field } from '@/components/Field';
import { GoldButton } from '@/components/GoldButton';
import {
  ChartRequestError, requestChart, requestPlaceCheck, type BirthProfile, type PlaceCandidate,
} from '@/lib/api';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, space } from '@/theme/tokens';

const pad = (n: number) => String(n).padStart(2, '0');
/** Local-time formatting (avoids the off-by-one-day bug of toISOString). */
const toDateString = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toTimeString = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

type FieldErrors = Partial<Record<'firstName' | 'lastName' | 'email' | 'city' | 'country' | 'birthDate', string>>;

export default function Onboarding() {
  const [today] = useState(() => new Date());
  const saved = useT3DStore((state) => state.profile);
  const setChart = useT3DStore((state) => state.setChart);

  const [firstName, setFirstName] = useState(saved?.firstName ?? '');
  const [middleName, setMiddleName] = useState(saved?.middleName ?? '');
  const [lastName, setLastName] = useState(saved?.lastName ?? '');
  const [email, setEmail] = useState(saved?.email ?? '');
  const [city, setCity] = useState(saved?.city ?? '');
  const [country, setCountry] = useState(saved?.country ?? '');
  const [birthDate, setBirthDate] = useState<Date>(
    saved ? new Date(`${saved.birthDate}T12:00:00`) : new Date(1990, 0, 1, 12, 0),
  );
  const [birthTime, setBirthTime] = useState<Date>(
    saved ? new Date(`2000-01-01T${saved.birthTime}:00`) : new Date(2000, 0, 1, 12, 0),
  );
  const [timeKnown, setTimeKnown] = useState(saved?.birthTimeKnown ?? true);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<PlaceCandidate[] | null>(null);
  const [chosen, setChosen] = useState(0);
  const onDateChange = (_event: unknown, value: Date) => setBirthDate(value);
  const onTimeChange = (_event: unknown, value: Date) => setBirthTime(value);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!firstName.trim()) next.firstName = 'Please enter your first name.';
    if (!lastName.trim()) next.lastName = 'Please enter your last name.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Please enter a valid email address.';
    if (!city.trim()) next.city = 'Please enter your birth city.';
    if (!country.trim()) next.country = 'Please enter your birth country.';
    const cutoff = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    if (birthDate > cutoff) {
      next.birthDate = 'T3D is for people 13 and older. We can\u2019t create a profile for this birth date.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  /** Step 1: look the place up and show it back before anything is calculated. */
  async function onCheckPlace() {
    setSubmitError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const found = await requestPlaceCheck(city.trim(), country.trim(), toDateString(birthDate));
      setCandidates(found);
      setChosen(0);
    } catch (error) {
      setSubmitError(
        error instanceof ChartRequestError ? error.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  /** Step 2: calculate using exactly the place the person confirmed. */
  async function onSubmit() {
    setSubmitError(null);
    const place = candidates?.[chosen];
    if (!place) return;

    const profile: BirthProfile = {
      firstName: firstName.trim(),
      middleName: middleName.trim() || undefined,
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      birthDate: toDateString(birthDate),
      birthTime: timeKnown ? toTimeString(birthTime) : '12:00',
      birthTimeKnown: timeKnown,
      city: city.trim(),
      country: country.trim(),
      placeLabel: place.label,
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: place.timezone,
    };

    setLoading(true);
    try {
      const chart = await requestChart(profile);
      setChart(profile, chart);
      router.replace('/today');
    } catch (error) {
      setSubmitError(
        error instanceof ChartRequestError ? error.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  if (candidates) {
    const dateText = birthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeText = timeKnown
      ? birthTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      : '12:00 PM (assumed, no birth time entered)';
    return (
      <Screen>
        <FadeIn>
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>CONFIRM YOUR BIRTH DETAILS</Text>
            <Text accessibilityRole="header" style={styles.title}>Is this right?</Text>
            <Text style={styles.lede}>
              Your chart is only as accurate as these details. Check the place especially, since a wrong match
              changes your Rising sign and Human Design.
            </Text>
          </View>
        </FadeIn>
        <View style={styles.form}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmLine}>Born {dateText}</Text>
            <Text style={styles.confirmLine}>at {timeText}</Text>
          </View>
          <Text style={styles.pickerLabel}>Which place is yours?</Text>
          {candidates.map((c, i) => (
            <Pressable
              key={`${c.label}-${c.latitude}`}
              accessibilityRole="radio"
              accessibilityState={{ selected: i === chosen }}
              accessibilityLabel={`${c.label}, time zone ${c.timezone}`}
              onPress={() => setChosen(i)}
              style={[styles.placeRow, i === chosen && styles.placeRowOn]}
            >
              <Text style={styles.placeMark}>{i === chosen ? '◉' : '○'}</Text>
              <View style={styles.placeText}>
                <Text style={styles.placeLabel}>{c.label}</Text>
                <Text style={styles.hint}>
                  {Math.abs(c.latitude).toFixed(2)}° {c.latitude >= 0 ? 'N' : 'S'},{' '}
                  {Math.abs(c.longitude).toFixed(2)}° {c.longitude >= 0 ? 'E' : 'W'} · {c.timezone}
                  {c.utcOffset ? ` (${c.utcOffset} on your birth date)` : ''}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
        <View style={styles.actions}>
          {submitError ? (
            <Text accessibilityLiveRegion="polite" style={styles.submitError}>
              {'⚠  '}
              {submitError}
            </Text>
          ) : null}
          <GoldButton label="CONFIRM AND CALCULATE" onPress={onSubmit} loading={loading} />
          <GoldButton label="CHANGE MY DETAILS" variant="ghost" onPress={() => setCandidates(null)} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <FadeIn>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>THE 3 DIMENSIONS</Text>
          <Text accessibilityRole="header" style={styles.title}>
            Your vehicle,{'\n'}your road,{'\n'}your timing.
          </Text>
          <Text style={styles.lede}>
            Enter your birth details once. We use them to calculate your Human Design, Numerology
            and Astrology. They are saved on this phone and on our server so your readings load
            every time. You can ask us to delete them at any time.
          </Text>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Read our privacy policy"
            onPress={() => { void WebBrowser.openBrowserAsync('https://www.3dimensions.guide/privacy'); }}
            style={styles.linkRow}
          >
            <Text style={styles.link}>Read our privacy policy</Text>
          </Pressable>
        </View>
      </FadeIn>

      <FadeIn delay={120}>
        <View style={styles.form}>
          <Field label="First name" value={firstName} onChangeText={setFirstName} error={errors.firstName}
            autoCapitalize="words" autoComplete="given-name" textContentType="givenName" returnKeyType="next" />
          <Field label="Middle name (optional)" value={middleName} onChangeText={setMiddleName}
            autoCapitalize="words" autoComplete="additional-name" textContentType="middleName" returnKeyType="next"
            placeholder="As written on your birth certificate" />
          <Field label="Last name" value={lastName} onChangeText={setLastName} error={errors.lastName}
            autoCapitalize="words" autoComplete="family-name" textContentType="familyName" returnKeyType="next" />
          <Field label="Email" value={email} onChangeText={setEmail} error={errors.email}
            autoCapitalize="none" autoCorrect={false} keyboardType="email-address"
            autoComplete="email" textContentType="emailAddress" />

          <View style={styles.pickerRow}>
            <Text style={styles.pickerLabel}>Birth date</Text>
            <DateTimePicker value={birthDate} mode="date" display="compact" themeVariant="dark"
              maximumDate={today} onValueChange={onDateChange} accessibilityLabel="Birth date" />
          </View>
          {errors.birthDate ? (
            <Text accessibilityLiveRegion="polite" style={styles.submitError}>{errors.birthDate}</Text>
          ) : null}

          <View style={styles.pickerRow}>
            <Text style={styles.pickerLabel}>Birth time</Text>
            {timeKnown ? (
              <DateTimePicker value={birthTime} mode="time" display="compact" themeVariant="dark"
                onValueChange={onTimeChange} accessibilityLabel="Birth time" />
            ) : (
              <Text style={styles.unknownTime}>Using 12:00 noon</Text>
            )}
          </View>

          <View style={styles.pickerRow}>
            <Text style={styles.pickerLabel}>I know my birth time</Text>
            <Switch value={timeKnown} onValueChange={setTimeKnown}
              trackColor={{ false: colors.hairline, true: colors.gold }}
              accessibilityLabel="I know my birth time" />
          </View>
          {!timeKnown && (
            <Text style={styles.hint}>
              Without a birth time, your Rising sign and some Human Design details can be off.
              Check your birth certificate when you can for the most accurate chart.
            </Text>
          )}

          <Field label="Birth city" value={city} onChangeText={setCity} error={errors.city}
            autoCapitalize="words" placeholder="e.g. Harbor City, California" />
          <Field label="Birth country" value={country} onChangeText={setCountry} error={errors.country}
            autoCapitalize="words" placeholder="e.g. United States" />
        </View>
      </FadeIn>

      <FadeIn delay={240}>
        <View style={styles.actions}>
          {submitError ? (
            <Text accessibilityLiveRegion="polite" style={styles.submitError}>
              {'⚠  '}
              {submitError}
            </Text>
          ) : null}
          <GoldButton label="CHECK MY BIRTH PLACE" onPress={onCheckPlace} loading={loading} />
        </View>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: space.md, paddingTop: space.lg },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 3, color: colors.gold },
  title: { fontFamily: fonts.display, fontSize: 38, lineHeight: 46, color: colors.parchment },
  linkRow: { minHeight: 48, justifyContent: 'center' },
  link: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.gold, textDecorationLine: 'underline' },
  lede: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.parchmentMuted },
  form: { gap: space.md, marginTop: space.md },
  pickerRow: {
    minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    gap: space.md,
  },
  pickerLabel: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.parchment, flexShrink: 1 },
  unknownTime: { fontFamily: fonts.body, fontSize: 16, color: colors.parchmentMuted },
  hint: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.parchmentMuted },
  actions: { gap: space.md, marginTop: space.md },
  submitError: { fontFamily: fonts.body, fontSize: 15, color: colors.danger },
  confirmCard: {
    gap: 4, padding: space.md, borderRadius: 12, borderWidth: 1, borderColor: colors.hairline,
    backgroundColor: colors.charcoal,
  },
  confirmLine: { fontFamily: fonts.bodyMedium, fontSize: 17, color: colors.parchment },
  placeRow: {
    minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md,
    borderRadius: 12, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.charcoal,
  },
  placeRowOn: { borderColor: colors.gold },
  placeMark: { fontSize: 20, color: colors.gold },
  placeText: { flex: 1, gap: 2 },
  placeLabel: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.parchment },
});
