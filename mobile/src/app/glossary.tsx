import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GROUP_ACCENT, TermPressable } from '@/components/Explain';
import { GoldButton } from '@/components/GoldButton';
import { ChartRequestError, requestGlossary } from '@/lib/api';
import type { GlossaryGroup, GlossaryItem } from '@/lib/explainTypes';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, radius, space, TOUCH } from '@/theme/tokens';

const FILTERS: { value: GlossaryGroup | 'All'; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'Human Design', label: 'Human Design' },
  { value: 'Astrology', label: 'Astrology' },
  { value: 'Numerology', label: 'Numerology' },
];

let cached: { leadId: number; items: GlossaryItem[] } | null = null;

export default function Glossary() {
  const profile = useT3DStore((s) => s.profile);
  const chart = useT3DStore((s) => s.chart);
  const [items, setItems] = useState<GlossaryItem[]>(cached && cached.leadId === chart?.leadId ? cached.items : []);
  const [loading, setLoading] = useState(items.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<GlossaryGroup | 'All'>('All');

  const load = async () => {
    if (!chart || !profile) return;
    setLoading(true);
    setError(null);
    try {
      const list = await requestGlossary(chart.leadId, profile.email.trim());
      cached = { leadId: chart.leadId, items: list };
      setItems(list);
    } catch (err) {
      setError(err instanceof ChartRequestError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (items.length === 0) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((i) => filter === 'All' || i.group === filter)
      .filter((i) => !q || i.title.toLowerCase().includes(q) || i.summary.toLowerCase().includes(q))
      .sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));
  }, [items, query, filter]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <FlatList
          data={shown}
          keyExtractor={(i) => i.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.header}>
              <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
                <Text style={styles.backText}>← BACK</Text>
              </Pressable>
              <Text style={styles.eyebrow}>GLOSSARY</Text>
              <Text accessibilityRole="header" style={styles.title}>Every term, explained</Text>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search terms"
                placeholderTextColor={colors.parchmentMuted}
                accessibilityLabel="Search terms"
                autoCorrect={false}
                autoCapitalize="none"
                clearButtonMode="while-editing"
                style={styles.search}
              />
              <View style={styles.filters}>
                {FILTERS.map((f) => {
                  const selected = f.value === filter;
                  return (
                    <Pressable
                      key={f.value}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => setFilter(f.value)}
                      style={[styles.filter, selected && styles.filterOn]}
                    >
                      <Text style={[styles.filterText, selected && styles.filterTextOn]}>{f.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          }
          ListEmptyComponent={
            loading ? (
              <View style={styles.center} accessibilityLiveRegion="polite">
                <ActivityIndicator color={colors.gold} />
              </View>
            ) : error ? (
              <View style={styles.center}>
                <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
                <GoldButton label="TRY AGAIN" variant="ghost" onPress={load} />
              </View>
            ) : (
              <Text style={styles.empty}>No terms match that search.</Text>
            )
          }
          renderItem={({ item }) => (
            <TermPressable id={item.id} label={`${item.title}. ${item.summary}`} style={styles.row}>
              <View style={[styles.bar, { backgroundColor: GROUP_ACCENT[item.group] }]} />
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowSummary} numberOfLines={2}>{item.summary}</Text>
              </View>
            </TermPressable>
          )}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.obsidian },
  safe: { flex: 1 },
  list: { padding: space.lg, paddingBottom: space.xxl, gap: 10 },
  header: { gap: space.sm, paddingBottom: space.sm },
  back: { minHeight: TOUCH - 4, justifyContent: 'center', alignSelf: 'flex-start' },
  backText: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 1.6, color: colors.parchmentMuted },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 3, color: colors.gold },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 38, color: colors.parchment },
  search: {
    minHeight: TOUCH,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.charcoal,
    color: colors.parchment,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: space.md,
    marginTop: space.sm,
  },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filter: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  filterOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  filterText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.parchment },
  filterTextOn: { color: colors.obsidian },
  center: { alignItems: 'center', gap: space.md, paddingVertical: space.xl },
  error: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.danger, textAlign: 'center' },
  empty: { fontFamily: fonts.body, fontSize: 15, color: colors.parchmentMuted, paddingVertical: space.lg },
  row: {
    flexDirection: 'row',
    gap: space.md,
    minHeight: TOUCH + 8,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  bar: { width: 4, borderRadius: 2 },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.parchment },
  rowSummary: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.parchmentMuted },
});
