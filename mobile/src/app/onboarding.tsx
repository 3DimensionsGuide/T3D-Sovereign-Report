import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { FadeIn } from '@/components/FadeIn';
import { Field } from '@/components/Field';
import { GoldButton } from '@/components/GoldButton';
import { ChartRequestError, requestChart, type BirthProfile } from '@/lib/api';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, space } from '@/theme/tokens';

const pad = (n: number) => String(n).padStart(2, '0');
/** Local-time formatting (avoids the off-by-one-day bug of toISOString). */
const toDateString = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toTimeString = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

type FieldErrors = Partial<Record<'firstName' | 'lastName' | 'email' | 'city' | 'country', string>>;

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
  const onDateChange = (_event: unknown, value: Date) => setBirthDate(value);
  const onTimeChange = (_event: unknown, value: Date) => setBirthTime(value);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!firstName.trim()) next.firstName = 'Please enter your first name.';
    if (!lastName.trim()) next.lastName = 'Please enter your last name.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Please enter a valid email address.';
    if (!city.trim()) next.city = 'Please enter your birth city.';
    if (!country.trim()) next.country = 'Please enter your birth country.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit() {
    setSubmitError(null);
    if (!validate()) return;

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

  return (
    <Screen>
      <FadeIn>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>THE 3 DIMENSIONS</Text>
          <Text accessibilityRole="header" style={styles.title}>
            Your vehicle,{'\n'}your road,{'\n'}your timing.
          </Text>
          <Text style={styles.lede}>
            Enter your birth details once. We calculate Human Design, Numerology and Astrology
            from your exact data and keep it on this phone.
          </Text>
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
          <GoldButton label="CALCULATE MY CHART" onPress={onSubmit} loading={loading} />
        </View>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: space.md, paddingTop: space.lg },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 3, color: colors.gold },
  title: { fontFamily: fonts.display, fontSize: 38, lineHeight: 46, color: colors.parchment },
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
});
