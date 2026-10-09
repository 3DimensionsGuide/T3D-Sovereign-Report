import { useEffect } from 'react';
import { Stack, router, usePathname, type Href } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PlayfairDisplay_400Regular, PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { colors } from '@/theme/tokens';
import { ExplainProvider } from '@/components/Explain';
import { pruneCache } from '@/lib/persistentCache';
import { trackScreen } from '@/lib/track';
import { configureNotifications, syncReminder } from '@/lib/reminder';
import { useReminderStore } from '@/store/useReminderStore';

SplashScreen.preventAutoHideAsync();
configureNotifications();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  useEffect(() => {
    void pruneCache();
  }, []);

  // Count which screens are opened (anonymous, no person attached).
  const pathname = usePathname();
  useEffect(() => {
    trackScreen(pathname);
  }, [pathname]);

  // Keep the saved reminder in step with the phone once its settings have been read.
  const reminderReady = useReminderStore((s) => s.hydrated);
  useEffect(() => {
    if (reminderReady) void syncReminder();
  }, [reminderReady]);

  // Tapping the reminder opens Today.
  const lastResponse = Notifications.useLastNotificationResponse();
  useEffect(() => {
    if (fontsLoaded && lastResponse) router.navigate('/today' as Href);
  }, [fontsLoaded, lastResponse]);

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <ExplainProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.obsidian },
          animation: 'fade',
        }}
      />
      </ExplainProvider>
    </SafeAreaProvider>
  );
}
