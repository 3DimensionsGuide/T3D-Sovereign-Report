import { useEffect } from 'react';
import { Platform, View, type ColorValue } from 'react-native';
import { Redirect, Tabs, useSegments } from 'expo-router';
import { useStoreHydrated, useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, themes } from '@/theme/tokens';
import { TabIcon, type TabName } from '@/components/TabIcons';
import { select } from '@/lib/haptics';
import { AlertSync } from '@/components/AlertSync';
import { useJourneyStore } from '@/store/useJourneyStore';

const icon = (name: TabName) => ({ color, focused }: { color: ColorValue; focused: boolean }) => (
  <TabIcon name={name} color={color as string} focused={focused} />
);


const TAB_THEME = { today: themes.today, chart: themes.chart, readings: themes.readings, timeline: themes.timeline, practice: themes.practice } as const;

export default function TabsLayout() {
  const segments = useSegments() as string[];
  const current = segments[segments.length - 1];
  // The thin line above the tab bar takes the current room's edge colour; the selected icon stays gold.
  useEffect(() => { if (current) useJourneyStore.getState().markVisited(current); }, [current]);
  const topLine = (current in TAB_THEME ? TAB_THEME[current as keyof typeof TAB_THEME] : themes.today).edge;
  const hydrated = useStoreHydrated();
  const hasChart = useT3DStore((state) => state.chart !== null);

  if (!hydrated) return <View style={{ flex: 1, backgroundColor: colors.obsidian }} />;
  if (!hasChart) return <Redirect href="/onboarding" />;

  return (
    <>
    <Tabs
      screenListeners={{ tabPress: () => select() }}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.obsidian },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.parchmentMuted,
        tabBarStyle: {
          backgroundColor: colors.charcoal,
          borderTopColor: topLine,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 8,
        },
        tabBarAllowFontScaling: false,
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 12, marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: icon('today'),
        }}
      />
      <Tabs.Screen
        name="chart"
        options={{
          title: 'My Chart',
          tabBarIcon: icon('chart'),
        }}
      />
      <Tabs.Screen
        name="readings"
        options={{
          title: 'Readings',
          tabBarIcon: icon('readings'),
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          title: 'Timeline',
          tabBarIcon: icon('timeline'),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: icon('practice'),
        }}
      />
    </Tabs>
    <AlertSync />
    </>
  );
}
