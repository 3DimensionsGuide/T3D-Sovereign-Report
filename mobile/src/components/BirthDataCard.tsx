import { StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { GoldButton } from '@/components/GoldButton';
import type { BirthProfile } from '@/lib/api';
import { colors, fonts, radius, space } from '@/theme/tokens';

function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  if (h === undefined || m === undefined || Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function formatCoord(value: number, pos: string, neg: string): string {
  return `${Math.abs(value).toFixed(2)}° ${value >= 0 ? pos : neg}`;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

/** Shows exactly which birth details every number in the app was calculated from. */
export function BirthDataCard({ profile }: { profile: BirthProfile }) {
  const known = profile.birthTimeKnown !== false;
  const hasPlace = typeof profile.latitude === 'number' && typeof profile.longitude === 'number';
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>WHAT THIS CHART IS BUILT FROM</Text>
      <Row label="Born" value={formatDate(profile.birthDate)} />
      <Row label="Birth time" value={known ? formatTime(profile.birthTime) : '12:00 PM (assumed)'} />
      <Row label="Place" value={profile.placeLabel ?? `${profile.city}, ${profile.country}`} />
      {hasPlace ? (
        <>
          <Row
            label="Coordinates"
            value={`${formatCoord(profile.latitude as number, 'N', 'S')}, ${formatCoord(profile.longitude as number, 'E', 'W')}`}
          />
          {profile.timezone ? <Row label="Time zone" value={profile.timezone} /> : null}
        </>
      ) : (
        <Text style={styles.note}>
          This chart was made before places were confirmed. Edit your birth details to confirm the exact place used.
        </Text>
      )}
      <View style={[styles.badge, known ? styles.badgeOk : styles.badgeWarn]}>
        <Text style={styles.badgeText}>
          {known
            ? '●  Birth time entered · full accuracy'
            : '◇  Birth time not entered · Rising, houses and Human Design are approximate'}
        </Text>
      </View>
      <GoldButton label="How this is calculated" variant="ghost" onPress={() => router.push('/method' as Href)} />
      <GoldButton label="About & your data" variant="ghost" onPress={() => router.push('/your-data' as Href)} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.charcoal, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.hairline, padding: space.lg, gap: 10,
  },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2.4, color: colors.gold },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: space.md },
  rowLabel: { fontFamily: fonts.body, fontSize: 15, color: colors.parchmentMuted, flexShrink: 0 },
  rowValue: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.parchment, textAlign: 'right', flexShrink: 1 },
  note: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.parchmentMuted },
  badge: { padding: space.md, borderRadius: radius.md, borderWidth: 1 },
  badgeOk: { borderColor: colors.road },
  badgeWarn: { borderColor: colors.gold },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 0.2, lineHeight: 19, color: colors.parchment },
});
