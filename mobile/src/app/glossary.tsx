import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TermPressable } from '@/components/Explain';
import { LENS_COLOR, LENS_LABEL, LENS_TEXT, LensIcon, type LensName } from '@/components/Lens';
import { GoldButton } from '@/components/GoldButton';
import { ChartRequestError, requestGlossary } from '@/lib/api';
import type { GlossaryGroup, GlossaryItem } from '@/lib/explainTypes';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, radius, space, TOUCH } from '@/theme/tokens';

const LENS_OF: Record<GlossaryGroup, LensName> = {
  'Human Design': 'vehicle', Numerology: 'road', Astrology: 'stoplight', Timing: 'stoplight',
};
const ORDER: LensName[] = ['vehicle', 'road', 'stoplight'];
const SUBJECT: Record<LensName, string> = { vehicle: 'Human Design', road: 'Numerology', stoplight: 'Astrology' };

/** Same wording the server now sends, so older servers read cleanly too. */
function cleanTitle(t: string): string {
  return t
    .replace(/\s*\(℞\)/, '')
    .replace(/\)\s+Center$/, ')')
    .replace(/^(No Inner Authority \(Mental\)) authority$/i, '$1')
    .replace(/ (center|circuitry|authority)$/, (_m, w: string) => ` ${w[0]!.toUpperCase()}${w.slice(1)}`)
    .replace(/^(Natal) chart$/, '$1 Chart').replace(/^Moon phase$/, 'Moon Phase')
    .replace(/^Whole-sign houses$/, 'Whole-Sign Houses')
    .replace(/^(Birthday|Attitude|Personality) number$/, '$1 Number');
}

type Row =
  | { kind: 'item'; item: GlossaryItem; title: string }
  | { kind: 'fold'; key: 'gates' | 'channels'; label: string; count: number; open: boolean };

interface Sec { lens: LensName; count: number; data: Row[] }

const foldOf = (id: string): 'gates' | 'channels' | null =>
  id.startsWith('hd:gate:') ? 'gates' : id.startsWith('hd:channel:') ? 'channels' : null;

let cached: { leadId: number; items: GlossaryItem[] } | null = null;

export default function Glossary() {
  const profile = useT3DStore((s) => s.profile);
  const chart = useT3DStore((s) => s.chart);
  const [items, setItems] = useState<GlossaryItem[]>(cached && cached.leadId === chart?.leadId ? cached.items : []);
  const [loading, setLoading] = useState(items.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<LensName | 'all'>('all');
  const [folds, setFolds] = useState<Record<string, boolean>>({});
  const listRef = useRef<SectionList<Row, Sec>>(null);

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

  const searching = query.trim().length > 0;
  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const byTitle = (a: { title: string }, b: { title: string }) => a.title.localeCompare(b.title, undefined, { numeric: true });
    const clean = items
      .map((item) => ({ item, title: cleanTitle(item.title) }))
      .filter((r) => !q || r.title.toLowerCase().includes(q) || r.item.summary.toLowerCase().includes(q));
    return ORDER.filter((l) => filter === 'all' || filter === l).map((lens) => {
      const mine = clean.filter((r) => LENS_OF[r.item.group] === lens);
      const plain = mine.filter((r) => !foldOf(r.item.id)).sort(byTitle);
      const data: Row[] = plain.map((r) => ({ kind: 'item', item: r.item, title: r.title }));
      for (const key of ['gates', 'channels'] as const) {
        const group = mine.filter((r) => foldOf(r.item.id) === key);
        if (group.length === 0) continue;
        const sortKey = (r: { item: GlossaryItem }) => r.item.id.replace(/\D+/g, ' ').trim().split(' ').map((n) => n.padStart(3, '0')).join('-');
        group.sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
        const open = searching || !!folds[key];
        data.push({ kind: 'fold', key, label: key === 'gates' ? 'Gates' : 'Channels', count: group.length, open });
        if (open) group.forEach((r) => data.push({ kind: 'item', item: r.item, title: r.title }));
      }
      return { lens, count: mine.length, data } as Sec;
    }).filter((sec) => sec.data.length > 0);
  }, [items, query, filter, folds, searching]);

  const letters = useMemo(() => {
    if (filter === 'all' || searching) return [];
    const sec = sections[0];
    if (!sec) return [];
    const seen: Record<string, number> = {};
    sec.data.forEach((r, i) => {
      if (r.kind !== 'item' || foldOf(r.item.id)) return;
      const L = r.title.charAt(0).toUpperCase();
      if (/[A-Z]/.test(L) && seen[L] === undefined) seen[L] = i;
    });
    return Object.entries(seen).sort(([a], [b]) => a.localeCompare(b));
  }, [sections, filter, searching]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <SectionList<Row, Sec>
          ref={listRef}
          sections={sections}
          stickySectionHeadersEnabled={false}
          onScrollToIndexFailed={() => undefined}
          keyExtractor={(r) => (r.kind === 'item' ? r.item.id : `fold-${r.key}`)}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.header}>
              <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
                <Text style={styles.backText}>← Back</Text>
              </Pressable>
                            <Text accessibilityRole="header" style={styles.title}>Glossary</Text>
              <Text style={styles.sub}>Every term, explained in plain language.</Text>
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
                {(['all', ...ORDER] as const).map((f) => {
                  const selected = f === filter;
                  return (
                    <Pressable
                      key={f}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => setFilter(f)}
                      style={[styles.filter, selected && styles.filterOn]}
                    >
                      {f !== 'all' ? <LensIcon lens={f} size={13} color={selected ? colors.obsidian : LENS_COLOR[f]} /> : null}
                      <Text style={[styles.filterText, selected && styles.filterTextOn]}>{f === 'all' ? 'All' : LENS_LABEL[f]}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {letters.length > 1 ? (
                <View style={styles.letters} accessibilityLabel="Jump to letter">
                  {letters.map(([L, idx]) => (
                    <Pressable
                      key={L}
                      accessibilityRole="button"
                      accessibilityLabel={`Jump to ${L}`}
                      onPress={() => listRef.current?.scrollToLocation({ sectionIndex: 0, itemIndex: idx, viewOffset: 0, animated: true })}
                      style={styles.letter}
                    >
                      <Text style={styles.letterText}>{L}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
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
          renderSectionHeader={({ section }) => (
            <View style={styles.secHead} accessibilityRole="header">
              <LensIcon lens={section.lens} size={14} />
              <Text style={[styles.secTitle, { color: LENS_TEXT[section.lens] }]}>
                {`${LENS_LABEL[section.lens]} · ${SUBJECT[section.lens]}`}
              </Text>
              <Text style={styles.secCount}>{`${section.count} terms`}</Text>
            </View>
          )}
          renderItem={({ item: row }) =>
            row.kind === 'fold' ? (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: row.open }}
                accessibilityLabel={`${row.label}, ${row.count} terms`}
                onPress={() => setFolds((f) => ({ ...f, [row.key]: !f[row.key] }))}
                style={styles.fold}
              >
                <Text style={styles.foldText}>{`${row.open ? 'Hide' : 'Show'} all ${row.count} ${row.label.toLowerCase()}`}</Text>
                <Text style={styles.foldText}>{row.open ? '–' : '+'}</Text>
              </Pressable>
            ) : (
              <TermPressable id={row.item.id} label={`${row.title}. ${row.item.summary}`} style={styles.row}>
                <View style={[styles.bar, { backgroundColor: LENS_COLOR[LENS_OF[row.item.group]] }]} />
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{row.title}</Text>
                  <Text style={styles.rowSummary} numberOfLines={3}>{row.item.summary}</Text>
                </View>
              </TermPressable>
            )
          }
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
  backText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.parchmentMuted },
  sub: { fontFamily: fonts.body, fontSize: 15, color: colors.parchmentMuted },
  secHead: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: space.lg, paddingBottom: 4 },
  secTitle: { fontFamily: fonts.bodyBold, fontSize: 14, flex: 1 },
  secCount: { fontFamily: fonts.body, fontSize: 13, color: colors.parchmentMuted },
  letters: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  letter: { width: 36, height: 44, alignItems: 'center', justifyContent: 'center' },
  letterText: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.gold },
  fold: { minHeight: TOUCH, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.md, borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.hairline },
  foldText: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.parchment },
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
