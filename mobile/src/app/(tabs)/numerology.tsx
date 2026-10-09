import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { FadeIn } from '@/components/FadeIn';
import { GoldButton } from '@/components/GoldButton';
import type {
  ChallengeCard, HiddenPassionContent, LifePathContent, NameNumberContent, PinnacleCard,
} from '@/lib/numerologyTypes';
import { useNumerology } from '@/lib/useNumerology';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, radius, space } from '@/theme/tokens';

// ─── building blocks ────────────────────────────────────────────────────────

function shortDate(isoDay: string): string {
  const [y, m, d] = isoDay.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function Block({ label, text }: { label: string; text: string | null | undefined }) {
  if (!text) return null;
  return (
    <View style={styles.block}>
      <Text style={styles.blockLabel}>{label}</Text>
      <Text style={styles.body}>{text}</Text>
    </View>
  );
}

function Bullets({ label, items }: { label: string; items: readonly string[] }) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockLabel}>{label}</Text>
      {items.map((t) => (
        <View key={t} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={[styles.body, styles.bulletText]}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

function Chips({ label, items }: { label: string; items: readonly string[] }) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockLabel}>{label}</Text>
      <View style={styles.chipWrap}>
        {items.map((t) => (
          <View key={t} style={styles.chip}>
            <Text style={styles.chipText}>{t}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function SectionTitle({ eyebrow, title, note }: { eyebrow: string; title: string; note?: string }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>
      {note ? <Text style={styles.sub}>{note}</Text> : null}
    </View>
  );
}

/** A card that opens to reveal the full interpretation. */
function Accordion({
  badge, title, subtitle, defaultOpen = false, now = false, children,
}: {
  badge: string;
  title: string;
  subtitle?: string | null;
  defaultOpen?: boolean;
  now?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={[styles.card, now && styles.cardNow]}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${title}. ${subtitle ?? ''}${now ? ' Active now.' : ''} ${open ? 'Expanded.' : 'Double tap to read.'}`}
        style={({ pressed }) => [styles.cardHead, pressed && styles.pressed]}
      >
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
        <View style={styles.headText}>
          {now ? <Text style={styles.nowTag}>ACTIVE NOW</Text> : null}
          <Text style={styles.cardTitle}>{title}</Text>
          {subtitle ? <Text style={styles.cardSub} numberOfLines={open ? undefined : 2}>{subtitle}</Text> : null}
        </View>
        <Text style={styles.chevron}>{open ? '–' : '+'}</Text>
      </Pressable>
      {open ? <View style={styles.cardBody}>{children}</View> : null}
    </View>
  );
}

// ─── content renderers ──────────────────────────────────────────────────────

function LifePathBody({ c }: { c: LifePathContent }) {
  return (
    <>
      <Block label="IN PLAIN LANGUAGE" text={c.plain} />
      <Bullets label="YOU MAY RECOGNIZE THIS WHEN…" items={c.recognize} />
      <Block label="WATCH FOR" text={c.watchFor} />
      <Block label="TRY THIS" text={c.tryThis} />
      <Chips label="YOUR GIFTS" items={c.gifts} />
      <Block label="WHEN IT'S OVERDONE" text={c.overreach} />
      <Block label="WHEN IT'S HELD BACK" text={c.underexpression} />
      <Block label="THE SHADOW" text={c.shadow} />
      <Block label="BORROWED EXPECTATIONS" text={c.borrowed} />
      <Block label={`RESET: ${c.reset.title.toUpperCase()}`} text={c.reset.instruction} />
    </>
  );
}

function NameBody({ c }: { c: NameNumberContent }) {
  return (
    <>
      <Block label="THE CORE THEME" text={c.theme} />
      <Block label="WHEN IT'S OVEREXPRESSED" text={c.overexpressed} />
      <Block label="WHEN IT'S UNDEREXPRESSED" text={c.underexpressed} />
    </>
  );
}

function PassionBody({ c }: { c: HiddenPassionContent }) {
  return (
    <>
      <Block label="THE FREQUENCY" text={c.theme} />
      <Block label="THE GIFT" text={c.gift} />
      <Block label="THE SHADOW" text={c.shadow} />
    </>
  );
}

function datesLine(c: { startAge: number; endAge: number | null; startsOn: string; endsOn: string | null }): string {
  return c.endAge == null || !c.endsOn
    ? `From age ${c.startAge} (${shortDate(c.startsOn)}) onward`
    : `Ages ${c.startAge}–${c.endAge} · ${shortDate(c.startsOn)} to ${shortDate(c.endsOn)}`;
}

function PinnacleBlock({ p }: { p: PinnacleCard }) {
  return (
    <Accordion
      badge={String(p.number)}
      title={`${p.label}${p.theme ? `: ${p.theme}` : ''}`}
      subtitle={datesLine(p)}
      now={p.current}
      defaultOpen={p.current}
    >
      <Block label="THE TERRAIN" text={p.terrain} />
      <Block label="THE CORE MANDATE" text={p.coreMandate} />
      <Block label="HOW THIS PHASE TENDS TO LIVE" text={p.phase} />
    </Accordion>
  );
}

function ChallengeBlock({ c }: { c: ChallengeCard }) {
  return (
    <Accordion
      badge={String(c.number)}
      title={c.label}
      subtitle={datesLine(c)}
      now={c.current}
      defaultOpen={c.current}
    >
      <Block label="THE TERRAIN" text={c.terrain} />
      <Block label="THE RECURRING TEST" text={c.test} />
      <Block label="THE KEY" text={c.key} />
      <Block label="THE SKILL TO BUILD" text={c.skill} />
      <Block label="A KINDER READ" text={c.reframe} />
    </Accordion>
  );
}

// ─── screen ─────────────────────────────────────────────────────────────────

export default function Numerology() {
  const profile = useT3DStore((s) => s.profile);
  const chart = useT3DStore((s) => s.chart);
  const { data, error, loading, retry } = useNumerology(chart?.leadId, profile?.email.trim());

  return (
    <Screen>
      <FadeIn>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>THE ROAD</Text>
          <Text accessibilityRole="header" style={styles.title}>Numerology</Text>
          <Text style={styles.sub}>What your numbers mean, and how they work together.</Text>
        </View>
      </FadeIn>

      {loading && !data ? (
        <View style={styles.center} accessibilityLiveRegion="polite">
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.sub}>Reading your numbers…</Text>
        </View>
      ) : error && !data ? (
        <View style={styles.center}>
          <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
          <GoldButton label="TRY AGAIN" variant="ghost" onPress={retry} />
        </View>
      ) : data ? (
        <>
          <SectionTitle eyebrow="YOUR MISSION" title="Life Path" note="From your birth date. The direction your whole life leans toward." />
          {data.lifePath.content ? (
            <Accordion
              badge={data.lifePath.display}
              title={`${data.lifePath.content.name}`}
              subtitle={data.lifePath.content.direction}
              defaultOpen
            >
              <LifePathBody c={data.lifePath.content} />
            </Accordion>
          ) : null}

          <SectionTitle eyebrow="YOUR STANCE" title="How you show up" note="Also from your birth date: your daily stance and your first impression." />
          <Accordion badge={data.birthday.display} title="Birthday Number" subtitle={data.birthday.description}>
            <Block label="WHAT IT MEANS" text={data.birthday.description} />
          </Accordion>
          <Accordion badge={data.attitude.display} title="Attitude Number" subtitle={data.attitude.description}>
            <Block label="WHAT IT MEANS" text={data.attitude.description} />
          </Accordion>

          <SectionTitle eyebrow="YOUR NAME" title="Inner drivers" note={data.innerDrivers.mechanism} />
          {data.innerDrivers.destiny.content ? (
            <Accordion badge={String(data.innerDrivers.destiny.number)} title="Destiny (Expression)" subtitle={data.innerDrivers.destiny.content.theme}>
              <NameBody c={data.innerDrivers.destiny.content} />
            </Accordion>
          ) : null}
          {data.innerDrivers.soulUrge.content ? (
            <Accordion badge={String(data.innerDrivers.soulUrge.number)} title="Soul Urge" subtitle={data.innerDrivers.soulUrge.content.theme}>
              <NameBody c={data.innerDrivers.soulUrge.content} />
            </Accordion>
          ) : null}
          {data.innerDrivers.personality.content ? (
            <Accordion badge={String(data.innerDrivers.personality.number)} title="Personality" subtitle={data.innerDrivers.personality.content.theme}>
              <NameBody c={data.innerDrivers.personality.content} />
            </Accordion>
          ) : null}
          <Text style={styles.footnote}>{data.nameNote}</Text>

          <SectionTitle eyebrow="UNDER THE SURFACE" title="Hidden Passion" note={data.hiddenPassion.mechanism} />
          {data.hiddenPassion.content ? (
            <Accordion badge={String(data.hiddenPassion.number)} title={`Hidden Passion ${data.hiddenPassion.number}`} subtitle={data.hiddenPassion.content.theme}>
              <PassionBody c={data.hiddenPassion.content} />
            </Accordion>
          ) : null}

          <SectionTitle eyebrow="WHAT TO BUILD" title="Karmic Lessons" note={data.karmicLessons.mechanism} />
          {data.karmicLessons.items.length === 0 ? (
            <View style={styles.card}>
              <View style={styles.cardBody}>
                <Text style={styles.body}>
                  Every number from 1 to 9 appears in your name, so you have no missing-number lessons. Nothing is absent that has to be built from scratch.
                </Text>
              </View>
            </View>
          ) : (
            data.karmicLessons.items.map((k) => (
              <Accordion key={k.number} badge={String(k.number)} title={`Missing ${k.number}`} subtitle={k.theme}>
                <Block label="WHAT IT MEANS" text={k.theme} />
                <Block label="THE PRACTICE" text={k.practice} />
              </Accordion>
            ))
          )}

          <SectionTitle eyebrow="YOUR LIFE PHASES" title="Pinnacles" note="Four long chapters of your life. The one marked active is the one you are in." />
          {data.pinnacles.map((p) => <PinnacleBlock key={p.label} p={p} />)}

          <SectionTitle eyebrow="YOUR LIFE PHASES" title="Challenges" note="The recurring lesson that travels with each Pinnacle." />
          {data.challenges.map((c) => <ChallengeBlock key={c.label} c={c} />)}

          <SectionTitle eyebrow="RIGHT NOW" title="Pinnacle and Challenge together" />
          <View style={styles.card}>
            <View style={styles.cardBody}>
              <Text style={styles.body}>{data.interplay}</Text>
            </View>
          </View>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6, paddingTop: space.lg, paddingBottom: space.sm },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 3, color: colors.gold },
  title: { fontFamily: fonts.display, fontSize: 34, lineHeight: 42, color: colors.parchment },
  sub: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.parchmentMuted },
  center: { alignItems: 'center', gap: space.md, paddingVertical: space.xxl },
  error: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.danger, textAlign: 'center' },
  sectionHead: { gap: 6, marginTop: space.lg },
  sectionTitle: { fontFamily: fonts.display, fontSize: 24, lineHeight: 30, color: colors.parchment },
  footnote: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.parchmentMuted },
  card: {
    borderRadius: radius.lg,
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.hairline,
    overflow: 'hidden',
  },
  cardNow: { borderColor: colors.road, borderWidth: 2 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, minHeight: 64 },
  pressed: { backgroundColor: colors.amethyst },
  badge: {
    minWidth: 48,
    height: 48,
    paddingHorizontal: 8,
    borderRadius: 24,
    backgroundColor: colors.road,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 17, color: '#FFFFFF' },
  headText: { flex: 1, gap: 2 },
  nowTag: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.6, color: colors.gold },
  cardTitle: { fontFamily: fonts.bodyBold, fontSize: 17, lineHeight: 23, color: colors.parchment },
  cardSub: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.parchmentMuted },
  chevron: { fontFamily: fonts.bodyBold, fontSize: 22, color: colors.parchmentMuted, width: 24, textAlign: 'center' },
  cardBody: { gap: space.md, paddingHorizontal: space.md, paddingBottom: space.md },
  block: { gap: 4 },
  blockLabel: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.8, color: colors.gold },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 25, color: colors.parchment },
  bulletRow: { flexDirection: 'row', gap: 8 },
  bulletDot: { fontFamily: fonts.body, fontSize: 16, lineHeight: 25, color: colors.gold },
  bulletText: { flex: 1 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.amethyst,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.parchment },
});
