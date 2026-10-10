import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Screen } from '@/components/Screen';
import { FadeIn } from '@/components/FadeIn';
import { Field } from '@/components/Field';
import { GoldButton } from '@/components/GoldButton';
import { CalculatingView } from '@/components/CalculatingView';
import { TriadSeal } from '@/components/TriadSeal';
import {
  ChartRequestError, confirmOptInCode, requestChart, requestOptInCode, requestPlaceCheck, type BirthProfile, type PlaceCandidate,
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
  const { birthDate: startDate } = useLocalSearchParams<{ birthDate?: string }>();
  const setChart = useT3DStore((state) => state.setChart);

  const [firstName, setFirstName] = useState(saved?.firstName ?? '');
  const [middleName, setMiddleName] = useState(saved?.middleName ?? '');
  const [lastName, setLastName] = useState(saved?.lastName ?? '');
  const [email, setEmail] = useState(saved?.email ?? '');
  const [city, setCity] = useState(saved?.city ?? '');
  const [country, setCountry] = useState(saved?.country ?? '');
  const [birthDate, setBirthDate] = useState<Date>(
    saved
      ? new Date(`${saved.birthDate}T12:00:00`)
      : startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate)
        ? new Date(`${startDate}T12:00:00`)
        : new Date(1990, 0, 1, 12, 0),
  );
  const [birthTime, setBirthTime] = useState<Date>(
    saved ? new Date(`2000-01-01T${saved.birthTime}:00`) : new Date(2000, 0, 1, 12, 0),
  );
  const [timeKnown, setTimeKnown] = useState(saved?.birthTimeKnown ?? true);
  const [emailOptIn, setEmailOptIn] = useState(saved?.emailOptIn ?? false);
  /** 0 name, 1 email, 2 birth date and time, 3 birth place. */
  const [step, setStep] = useState(0);
  const [calculating, setCalculating] = useState(false);
  const [calcDone, setCalcDone] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  /** Set after the chart is built, when the person asked for emails and a code was sent. */
  const [codeStep, setCodeStep] = useState<{ leadId: number; email: string; notice: string | null } | null>(null);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeBusy, setCodeBusy] = useState(false);
  const [candidates, setCandidates] = useState<PlaceCandidate[] | null>(null);
  const [chosen, setChosen] = useState(0);
  const onDateChange = (_event: unknown, value: Date) => setBirthDate(value);
  const onTimeChange = (_event: unknown, value: Date) => setBirthTime(value);

  function validateStep(which: number): boolean {
    const next: FieldErrors = {};
    if (which === 0) {
      if (!firstName.trim()) next.firstName = 'Please enter your first name.';
      if (!lastName.trim()) next.lastName = 'Please enter your last name.';
    }
    if (which === 1 && !/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Please enter a valid email address.';
    if (which === 2) {
      const cutoff = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
      if (birthDate > cutoff) {
        next.birthDate = 'T3D is for people 13 and older. We can\u2019t create a profile for this birth date.';
      }
    }
    if (which === 3) {
      if (!city.trim()) next.city = 'Please enter your birth city.';
      if (!country.trim()) next.country = 'Please enter your birth country.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onContinue() {
    if (!validateStep(step)) return;
    setStep((n) => Math.min(n + 1, 3));
  }

  /** Step 1: look the place up and show it back before anything is calculated. */
  async function onCheckPlace() {
    setSubmitError(null);
    if (!validateStep(3)) return;
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
      emailOptIn,
      city: city.trim(),
      country: country.trim(),
      placeLabel: place.label,
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: place.timezone,
    };

    setLoading(true);
    setCalcDone(false);
    setCalculating(true);
    try {
      const { chart, optInCode } = await requestChart(profile);
      setChart(profile, chart);
      setCalcDone(true);
      await new Promise((resolve) => setTimeout(resolve, 900));
      if (profile.emailOptIn && (optInCode === 'sent' || optInCode === 'failed')) {
        setCodeStep({
          leadId: chart.leadId,
          email: profile.email,
          notice: optInCode === 'failed' ? 'We could not send the code just now. Tap "Send a new code" to try again.' : null,
        });
      } else {
        router.replace('/today');
      }
    } catch (error) {
      setCalculating(false);
      setSubmitError(
        error instanceof ChartRequestError ? error.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function onConfirmCode() {
    if (!codeStep) return;
    setCodeError(null);
    setCodeBusy(true);
    try {
      await confirmOptInCode(codeStep.leadId, codeStep.email, code.trim());
      router.replace('/today');
    } catch (error) {
      setCodeError(error instanceof ChartRequestError ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setCodeBusy(false);
    }
  }

  async function onResendCode() {
    if (!codeStep) return;
    setCodeError(null);
    setCodeBusy(true);
    try {
      await requestOptInCode(codeStep.leadId, codeStep.email);
      setCodeStep({ ...codeStep, notice: 'A new code is on its way. It can take a minute to arrive.' });
    } catch (error) {
      setCodeError(error instanceof ChartRequestError ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setCodeBusy(false);
    }
  }

  if (calculating && !codeStep) {
    return (
      <Screen>
        <CalculatingView done={calcDone} />
      </Screen>
    );
  }

  if (codeStep) {
    return (
      <Screen>
        <FadeIn>
          <View style={styles.hero}>
            <Text style={styles.stepNote}>One last step</Text>
            <Text accessibilityRole="header" style={styles.title}>Check your email</Text>
            <Text style={styles.lede}>
              We sent a 6-digit code to {codeStep.email}. Type it below to confirm you want occasional T3D insights.
              Your chart is already ready, so you can skip this and nothing is lost.
            </Text>
          </View>
        </FadeIn>
        <View style={styles.form}>
          <Field label="6-digit code" value={code} onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad" maxLength={6} autoComplete="one-time-code" textContentType="oneTimeCode"
            error={codeError ?? undefined} placeholder="123456"
            why={codeStep.notice ?? 'The code works for 15 minutes.'} />
        </View>
        <View style={styles.actions}>
          <GoldButton label="Confirm" onPress={onConfirmCode} loading={codeBusy} disabled={code.length !== 6} />
          <GoldButton label="Send a new code" variant="ghost" onPress={onResendCode} disabled={codeBusy} />
          <GoldButton label="Skip for now" variant="ghost" onPress={() => router.replace('/today')} disabled={codeBusy} />
        </View>
      </Screen>
    );
  }

  if (candidates) {
    const dateText = birthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeText = timeKnown
      ? birthTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      : '12:00 PM (we are assuming noon)';
    return (
      <Screen>
        <FadeIn>
          <View style={styles.hero}>
            <Text style={styles.stepNote}>Last check</Text>
            <Text accessibilityRole="header" style={styles.title}>Is this where you were born?</Text>
            <Text style={styles.lede}>
              The place sets your Rising sign and your Human Design, so it is worth a second look.
              {candidates.length > 1 ? ' We found more than one match. Tap the right one.' : ''}
            </Text>
          </View>
        </FadeIn>
        <View style={styles.form}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmLabel}>Your birth</Text>
            <Text style={styles.confirmLine}>{dateText}</Text>
            <Text style={styles.confirmLine}>{timeText}</Text>
          </View>
          {candidates.map((c, i) => (
            <Pressable
              key={`${c.label}-${c.latitude}`}
              accessibilityRole="radio"
              accessibilityState={{ selected: i === chosen }}
              accessibilityLabel={`${c.label}, time zone ${c.timezone}${i === chosen ? ', selected' : ''}`}
              onPress={() => setChosen(i)}
              style={[styles.placeRow, i === chosen && styles.placeRowOn]}
            >
              <View style={[styles.radio, i === chosen && styles.radioOn]}>
                {i === chosen ? <View style={styles.radioDot} /> : null}
              </View>
              <View style={styles.placeText}>
                <Text style={styles.placeLabel}>{c.label}</Text>
                <Text style={styles.hint}>
                  {c.timezone}{c.utcOffset ? ` · ${c.utcOffset} on your birth date` : ''}
                </Text>
                <Text style={styles.hintSmall}>
                  {Math.abs(c.latitude).toFixed(2)}° {c.latitude >= 0 ? 'N' : 'S'},{' '}
                  {Math.abs(c.longitude).toFixed(2)}° {c.longitude >= 0 ? 'E' : 'W'}
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
          <GoldButton label="Calculate my chart" onPress={onSubmit} loading={loading} />
          <GoldButton label="Change my details" variant="ghost" onPress={() => setCandidates(null)} />
        </View>
      </Screen>
    );
  }

  const TITLES = ['What is your name?', 'Where can we reach you?', 'When were you born?', 'Where were you born?'];
  const LEDES = [
    'Numerology reads your full birth name, letter by letter, so use the name on your birth certificate if you can.',
    'Only used to find your chart again and to send your report if you buy one. We never sell it.',
    'Your birth date and time set your Life Path, Sun sign, Rising sign and Human Design.',
    'The place gives us the coordinates and time zone for the exact moment you were born.',
  ];

  return (
    <Screen>
      <FadeIn>
        <View style={styles.hero}>
          {step === 0 ? <TriadSeal size={64} /> : null}
          <View
            accessible
            accessibilityLabel={`Step ${step + 1} of 4`}
            style={styles.progress}
          >
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.progressBar, i <= step && styles.progressBarOn]} />
            ))}
          </View>
          <Text style={styles.stepNote}>Step {step + 1} of 4</Text>
          <Text accessibilityRole="header" style={styles.title}>{TITLES[step]}</Text>
          <Text style={styles.lede}>{LEDES[step]}</Text>
        </View>
      </FadeIn>

      <View style={styles.form}>
        {step === 0 ? (
          <>
            <Field label="First name" value={firstName} onChangeText={setFirstName} error={errors.firstName}
              autoCapitalize="words" autoComplete="given-name" textContentType="givenName" returnKeyType="next" />
            <Field label="Middle name (optional)" value={middleName} onChangeText={setMiddleName}
              autoCapitalize="words" autoComplete="additional-name" textContentType="middleName" returnKeyType="next"
              placeholder="As written on your birth certificate" />
            <Field label="Last name" value={lastName} onChangeText={setLastName} error={errors.lastName}
              autoCapitalize="words" autoComplete="family-name" textContentType="familyName" returnKeyType="done" />
          </>
        ) : null}

        {step === 1 ? (
          <>
            <Field label="Email" value={email} onChangeText={setEmail} error={errors.email}
              autoCapitalize="none" autoCorrect={false} keyboardType="email-address"
              autoComplete="email" textContentType="emailAddress" />
            <View style={styles.pickerRow}>
              <Text style={styles.pickerLabel}>Email me occasional T3D insights (optional)</Text>
              <Switch value={emailOptIn} onValueChange={setEmailOptIn}
                trackColor={{ false: '#6B6B73', true: colors.gold }} ios_backgroundColor="#6B6B73"
                accessibilityLabel="Email me occasional T3D insights" />
            </View>
            {emailOptIn ? <Text style={styles.hint}>We will email a 6-digit code at the end to confirm it is really you.</Text> : null}
          </>
        ) : null}

        {step === 2 ? (
          <>
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
                trackColor={{ false: '#6B6B73', true: colors.gold }} ios_backgroundColor="#6B6B73"
                accessibilityLabel="I know my birth time" />
            </View>
            <Text style={styles.hint}>
              {timeKnown
                ? 'Your birth time is on most birth certificates.'
                : 'Without a birth time, your Rising sign and some Human Design details can be off. Check your birth certificate when you can.'}
            </Text>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <Field label="Birth city" value={city} onChangeText={setCity} error={errors.city}
              autoCapitalize="words" placeholder="e.g. Harbor City, California" />
            <Field label="Birth country" value={country} onChangeText={setCountry} error={errors.country}
              autoCapitalize="words" placeholder="e.g. United States"
              why="Time zones and daylight saving rules differ by country and by year." />
          </>
        ) : null}
      </View>

      <View style={styles.actions}>
        {submitError ? (
          <Text accessibilityLiveRegion="polite" style={styles.submitError}>
            {'⚠  '}
            {submitError}
          </Text>
        ) : null}
        {step < 3 ? (
          <GoldButton label="Continue" onPress={onContinue} />
        ) : (
          <GoldButton label="Check my birth place" onPress={onCheckPlace} loading={loading} />
        )}
        {step > 0 ? <GoldButton label="BACK" variant="ghost" onPress={() => setStep((n) => n - 1)} /> : null}
      </View>

      {step === 0 ? (
        <View style={styles.fineWrap}>
          <Text style={styles.fine}>
            We save your details on this phone and on our server so your readings load every time. You can delete
            them at any time from the My Chart tab. T3D is a reflection tool for self-understanding and
            entertainment. It does not predict events and is not medical, legal or financial advice. T3D is for
            people 13 and older.
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
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: space.md, paddingTop: space.lg },
  stepNote: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.parchmentMuted },
  progress: { flexDirection: 'row', gap: 6 },
  progressBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.hairline },
  progressBarOn: { backgroundColor: colors.gold },
  fineWrap: { gap: space.xs, marginBottom: space.lg },
  fine: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.parchmentMuted },
  hintSmall: { fontFamily: fonts.body, fontSize: 12, color: colors.parchmentMuted },
  confirmLabel: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.parchmentMuted },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.parchmentMuted, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.gold },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.gold },
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
  placeText: { flex: 1, gap: 2 },
  placeLabel: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.parchment },
});
