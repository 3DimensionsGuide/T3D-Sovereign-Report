import { useEffect } from 'react';
import { Stack, router, usePathname, type Href } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_600SemiBold,
} from '@expo-google-fonts/playfair-display';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { useReduceMotion } from '@/lib/motion';
import { colors } from '@/theme/tokens';
import { ExplainProvider } from '@/components/Explain';
import { ToastHost } from '@/components/ToastHost';
import { pruneCache } from '@/lib/persistentCache';
import { trackScreen } from '@/lib/track';
import { initCrashReporting, wrapRoot } from '@/lib/sentry';
import { configureNotifications, syncReminder } from '@/lib/reminder';
import { useReminderStore } from '@/store/useReminderStore';

initCrashReporting();
SplashScreen.preventAutoHideAsync();
configureNotifications();

function RootLayout() {
  const reduceMotion = useReduceMotion();
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_400Regular_Italic,
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
          // Screens you open slide in from the right and slide back out the same way, so you always know
          // where you came from. Swiping right from anywhere on the screen goes back. Reduce Motion: a quiet fade.
          animation: reduceMotion ? 'fade' : 'slide_from_right',
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="index" options={{ animation: 'fade', gestureEnabled: false }} />
      </Stack>
      </ExplainProvider>
      <ToastHost />
    </SafeAreaProvider>
  );
}

export default wrapRoot(RootLayout);
