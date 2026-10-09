import { View } from 'react-native';
import { Redirect, type Href } from 'expo-router';
import { useStoreHydrated, useT3DStore } from '@/store/useT3DStore';
import { colors } from '@/theme/tokens';

/** Entry point: returning people go straight to their chart. */
export default function Index() {
  const hydrated = useStoreHydrated();
  const hasChart = useT3DStore((state) => state.chart !== null);

  if (!hydrated) return <View style={{ flex: 1, backgroundColor: colors.obsidian }} />;
  return <Redirect href={(hasChart ? '/today' : '/welcome') as Href} />;
}
