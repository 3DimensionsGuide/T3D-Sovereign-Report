import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius, space, TOUCH } from '@/theme/tokens';

interface Section {
  glyph: string;
  accent: string;
  title: string;
  paragraphs: string[];
}

const SECTIONS: Section[] = [
  {
    glyph: '◷',
    accent: colors.gold,
    title: 'From your birth details to a chart',
    paragraphs: [
      'Everything starts with three facts: your birth date, your birth time and your birth place. Your place becomes map coordinates and a time zone.',
      'We then convert your local birth time to universal time using the time zone rules that applied on your birth date, including daylight saving as it was observed then. All three systems are calculated from that one moment.',
      'You can see the exact place, coordinates and time zone used on the My Chart tab.',
    ],
  },
  {
    glyph: '●',
    accent: colors.stoplight,
    title: 'The Stoplight: Astrology',
    paragraphs: [
      'Planet positions come from the Swiss Ephemeris, the astronomical data library used by professional astrology software.',
      'Tropical is the main zodiac, because it follows the seasons and is the Western standard. Sidereal, which follows the stars using the Lahiri standard, is shown as a second lens. It sits about 24° behind the tropical zodiac, so a sign can differ between the two.',
      'Houses are whole-sign: the sign of your Rising sign is your first house, the next sign is your second house, and so on. This is one of the oldest house systems and does not change within a sign.',
      'Aspects are the five major angles: conjunction, sextile, square, trine and opposition. A transit contact counts as active within 3° of exact and as peak within 1°.',
      'Today and Timeline compare the current sky with your birth chart. We treat transits as weather: they describe conditions, they do not decide anything for you.',
    ],
  },
  {
    glyph: '◆',
    accent: colors.vehicle,
    title: 'The Vehicle: Human Design',
    paragraphs: [
      'Human Design uses two moments. The Personality side is calculated for your birth moment. The Design side is calculated for the earlier moment when the Sun stood 88° before its birth position, which is about three months before you were born.',
      'At each moment, every planet falls on one of 64 gates and one of six lines around the zodiac wheel. Together these give your active gates, channels, defined Centers, Type, Authority, Profile and Incarnation Cross.',
      'Because lines can change within hours, an accurate birth time matters most for Human Design.',
    ],
  },
  {
    glyph: '▲',
    accent: colors.road,
    title: 'The Road: Numerology',
    paragraphs: [
      'T3D uses the Pythagorean system, where each letter has a value from 1 to 9. Your full birth name matters, including your middle name if you have one.',
      'Your Life Path comes from your birth date, with the month, day and year reduced separately. The master numbers 11, 22 and 33 are kept and not reduced.',
      'Destiny, Soul Urge and Personality come from your name. Karmic Lessons are the digits from 1 to 9 that do not appear in your name. Pinnacles and Challenges are the timing cycles of your life, worked out from your birth date.',
      'Your Personal Day comes from your birth date and the date you are viewing.',
    ],
  },
  {
    glyph: '◇',
    accent: colors.gold,
    title: 'What depends on your birth time',
    paragraphs: [
      'Depends on it: your Rising sign, your houses, your Time Lord and Lord of the Year, and all of Human Design.',
      'Mostly unaffected: your Sun sign, the slower planets, and all of your numerology. Your Moon sign is usually right but can change if the Moon moved into a new sign on your birth day.',
      'If you did not enter a time, we use 12:00 noon and mark the affected readings as approximate.',
    ],
  },
  {
    glyph: '✓',
    accent: colors.road,
    title: 'Double-check us',
    paragraphs: [
      'You are welcome to compare your chart with other software. Astro.com is a good reference for astrology and Jovian Archive for Human Design.',
      'If something differs, the usual causes are the birth time, the birth place, or a different choice of zodiac or house system. Tell us if a difference remains after checking those three.',
    ],
  },
  {
    glyph: '◌',
    accent: colors.parchmentMuted,
    title: 'What this is, and is not',
    paragraphs: [
      'Astrology, Human Design and numerology are interpretive traditions that many people use for reflection. They do not predict events, and they are not medical, legal or financial advice.',
      'Decisions belong with you. In T3D, that means your Human Design Strategy and Inner Authority come first, and everything else is information about conditions.',
    ],
  },
];

export default function Method() {
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← BACK</Text>
          </Pressable>
          <Text style={styles.eyebrow}>HOW THIS IS CALCULATED</Text>
          <Text accessibilityRole="header" style={styles.title}>Our method</Text>
          <Text style={styles.lede}>
            Accuracy is the point of this app. Here is what goes into your chart, in plain language.
          </Text>
          {SECTIONS.map((s) => (
            <View key={s.title} style={[styles.card, { borderLeftColor: s.accent }]}>
              <Text style={[styles.cardEyebrow, { color: s.accent }]}>{s.glyph}</Text>
              <Text accessibilityRole="header" style={styles.cardTitle}>{s.title}</Text>
              {s.paragraphs.map((p) => (
                <Text key={p} style={styles.body}>{p}</Text>
              ))}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.obsidian },
  safe: { flex: 1 },
  content: { paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.md },
  back: { minHeight: TOUCH - 4, justifyContent: 'center', alignSelf: 'flex-start' },
  backText: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 1.6, color: colors.parchmentMuted },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 3, color: colors.gold },
  title: { fontFamily: fonts.display, fontSize: 34, lineHeight: 42, color: colors.parchment },
  lede: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.parchmentMuted },
  card: {
    backgroundColor: colors.charcoal, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline,
    borderLeftWidth: 4, padding: space.lg, gap: 10,
  },
  cardEyebrow: { fontFamily: fonts.bodyBold, fontSize: 20 },
  cardTitle: { fontFamily: fonts.display, fontSize: 22, lineHeight: 29, color: colors.parchment },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.parchment },
});
