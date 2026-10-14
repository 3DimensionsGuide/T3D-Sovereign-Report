import { useState } from 'react';
import { Alert, Share, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccentView } from '@/components/AccentView';
import { Field } from '@/components/Field';
import { GoldButton } from '@/components/GoldButton';
import { success } from '@/lib/haptics';
import { BACKUP_KEYS, buildBackup, parseBackup } from '@/lib/backup';
import { trackAction } from '@/lib/track';
import { useDayLogStore } from '@/store/useDayLogStore';
import { useMeetTriadStore } from '@/store/useMeetTriadStore';
import { usePartnerStore } from '@/store/usePartnerStore';
import { usePracticeStore } from '@/store/usePracticeStore';
import { colors, fonts, space } from '@/theme/tokens';

/** Reload each saved store from what is now on disk, so the screens update without restarting the app. */
async function reloadStores(): Promise<void> {
  await Promise.all([
    useDayLogStore.persist.rehydrate(),
    usePracticeStore.persist.rehydrate(),
    usePartnerStore.persist.rehydrate(),
    useMeetTriadStore.persist.rehydrate(),
  ]);
}

/** Back up and restore the things kept only on this phone. The backup is text the person keeps; we never receive it. */
export function BackupCard() {
  const [restoring, setRestoring] = useState(false);
  const [text, setText] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onBackup() {
    setError(null);
    setMessage(null);
    try {
      const keys = Object.keys(BACKUP_KEYS);
      const values = await AsyncStorage.multiGet(keys);
      const raw: Record<string, string | null> = {};
      for (const [k, v] of values) raw[k] = v;
      const result = await Share.share({ title: 'My T3D backup', message: buildBackup(raw) });
      if (result.action === Share.sharedAction) {
        success();
        trackAction('backup_exported');
        setMessage('Backup shared. Keep it somewhere private, such as Notes or an email to yourself.');
      }
    } catch {
      setError('We could not make the backup. Please try again.');
    }
  }

  function onRestore() {
    setError(null);
    setMessage(null);
    const parsed = parseBackup(text);
    if (!parsed.ok) return setError(parsed.reason);
    const names = parsed.names.join(', ');
    Alert.alert(
      'Replace what is on this phone?',
      `This restores ${names} from the backup and replaces what is saved here for them now.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await AsyncStorage.multiSet(Object.entries(parsed.entries));
                await reloadStores();
                success();
                trackAction('backup_restored');
                setText('');
                setRestoring(false);
                setMessage(`Restored: ${names}.`);
              } catch {
                setError('We could not restore the backup. Nothing was changed. Please try again.');
              }
            })();
          },
        },
      ],
    );
  }

  return (
    <AccentView style={[styles.card, { borderLeftColor: colors.gold }]}>
      <Text accessibilityRole="header" style={styles.title}>Back up your data</Text>
      <Text style={styles.body}>
        Your check-ins, decisions and My Tribe live only on this phone. Make a backup to keep them if you change phones. It is a
        block of text that never comes to us. It includes the birth details of the people in My Tribe, so keep it private.
      </Text>
      <GoldButton label="Back up my data" onPress={() => void onBackup()} />
      {restoring ? (
        <View style={{ gap: space.md }}>
          <Field
            label="Paste your backup here"
            value={text}
            onChangeText={setText}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            why="Paste the whole block, starting with T3D-BACKUP-1."
          />
          <GoldButton label="Restore from this backup" onPress={onRestore} disabled={text.trim().length === 0} />
          <GoldButton label="Cancel" variant="ghost" onPress={() => { setRestoring(false); setText(''); setError(null); }} />
        </View>
      ) : (
        <GoldButton label="Restore from a backup" variant="ghost" onPress={() => { setRestoring(true); setMessage(null); }} />
      )}
      {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{'⚠  '}{error}</Text> : null}
      {message ? <Text accessibilityLiveRegion="polite" style={styles.body}>{message}</Text> : null}
    </AccentView>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.charcoal, borderRadius: 22, borderWidth: 1, borderColor: colors.goldEdge, padding: space.lg, gap: space.md },
  title: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 22, lineHeight: 29, color: colors.parchment },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  error: { fontFamily: fonts.body, fontSize: 15, color: colors.danger },
});
