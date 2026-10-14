import { useState } from 'react';
import { Share, StyleSheet, Switch, Text, View } from 'react-native';
import { GoldButton } from '@/components/GoldButton';
import { ChartRequestError, requestInviteCreate } from '@/lib/api';
import { inviteMessage } from '@/lib/invite';
import { success } from '@/lib/haptics';
import { trackAction } from '@/lib/track';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, radius, space } from '@/theme/tokens';

/**
 * Invite someone to compare charts. The link carries no birth details; the friend adds their own birth date and
 * sees how the two of you fit together. Free for everyone, on both sides.
 */
export function InviteCard() {
  const chart = useT3DStore((s) => s.chart);
  const profile = useT3DStore((s) => s.profile);
  const [showName, setShowName] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!chart || !profile) return null;
  const first = profile.firstName.trim();

  async function onInvite() {
    if (!chart || !profile) return;
    setError(null);
    setBusy(true);
    try {
      const { url } = await requestInviteCreate(chart.leadId, profile.email.trim(), showName, profile.birthTimeKnown !== false);
      const result = await Share.share({ message: inviteMessage(showName ? first : null, url) });
      if (result.action === Share.sharedAction) { success(); trackAction('invite_sent'); }
    } catch (e) {
      setError(e instanceof ChartRequestError ? e.message : 'We could not make the invite. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>INVITE SOMEONE</Text>
      <Text accessibilityRole="header" style={styles.title}>See how your charts fit together</Text>
      <Text style={styles.body}>
        Send a link. Your friend adds their birth date and sees how the two of you decide, connect and move through time.
        They see how your charts relate, never your birth date, time or place. The link works for 30 days.
      </Text>
      <View style={styles.row}>
        <Text style={styles.label}>{first ? `Show my first name (${first})` : 'Show my first name'}</Text>
        <Switch
          value={showName}
          onValueChange={setShowName}
          trackColor={{ false: colors.switchOff, true: colors.gold }} ios_backgroundColor="#6B6B73"
          accessibilityLabel="Show my first name on the invite"
        />
      </View>
      {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{'⚠  '}{error}</Text> : null}
      <GoldButton label="Send an invite" onPress={() => void onInvite()} loading={busy} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.charcoal, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.goldEdge, padding: space.lg, gap: space.md,
  },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2, color: colors.parchmentMuted },
  title: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 22, lineHeight: 29, color: colors.parchment },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md, minHeight: 52 },
  label: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 17, color: colors.parchment },
  error: { fontFamily: fonts.body, fontSize: 15, color: colors.danger },
});
