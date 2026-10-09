import { Text, View, type ColorValue } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { useStoreHydrated, useT3DStore } from '@/store/useT3DStore';
import { colors, fonts } from '@/theme/tokens';

function TabGlyph({ glyph, color }: { glyph: string; color: ColorValue }) {
  return <Text style={{ color, fontSize: 20 }}>{glyph}</Text>;
}

export default function TabsLayout() {
  const hydrated = useStoreHydrated();
  const hasChart = useT3DStore((state) => state.chart !== null);

  if (!hydrated) return <View style={{ flex: 1, backgroundColor: colors.obsidian }} />;
  if (!hasChart) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.obsidian },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.parchmentMuted,
        tabBarStyle: { backgroundColor: colors.charcoal, borderTopColor: colors.hairline },
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 12 },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: ({ color }) => <TabGlyph glyph="◐" color={color} />,
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          title: 'Timeline',
          tabBarIcon: ({ color }) => <TabGlyph glyph="◷" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chart"
        options={{
          title: 'My Chart',
          tabBarIcon: ({ color }) => <TabGlyph glyph="◆" color={color} />,
        }}
      />
    </Tabs>
  );
}
