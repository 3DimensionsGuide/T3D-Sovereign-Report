import { useEffect, type ComponentProps } from 'react';
import { View } from 'react-native';
import {
  Accordion as BaseAccordion, Block, Bullets, Chips, Footnote, NoteCard, ReadingStatus, SectionTitle,
} from '@/components/ReadingBlocks';
import type {
  ChallengeCard, HiddenPassionContent, LifePathContent, NameNumberContent, NumerologyDetail, PinnacleCard,
} from '@/lib/numerologyTypes';
import { RoadPath } from '@/components/readings/RoadPath';
import { useNumerology } from '@/lib/useNumerology';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, space } from '@/theme/tokens';

function shortDate(isoDay: string): string {
  const [y, m, d] = isoDay.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Accordion in the Road's emerald. */
function Accordion(props: Omit<ComponentProps<typeof BaseAccordion>, 'accent'>) {
  return <BaseAccordion accent={colors.road} {...props} />;
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

// ─── reading ────────────────────────────────────────────────────────────────

export function NumerologyReading({ onRefreshReady }: { onRefreshReady?: (r: { run: () => Promise<void> } | null) => void }) {
  const profile = useT3DStore((s) => s.profile);
  const chart = useT3DStore((s) => s.chart);
  const { data, error, loading, retry, offline, savedAt, refresh } = useNumerology(chart?.leadId, profile?.email.trim());

  useEffect(() => {
    onRefreshReady?.({ run: refresh });
    return () => onRefreshReady?.(null);
  }, [refresh, onRefreshReady]);

  return (
    <ReadingStatus
      loading={loading}
      error={error}
      hasData={data !== null}
      loadingText="Reading your numbers…"
      onRetry={retry}
      offline={offline}
      savedAt={savedAt}
    >
      {data ? <NumerologyBody data={data} /> : null}
    </ReadingStatus>
  );
}

function NumerologyBody({ data }: { data: NumerologyDetail }) {
  return (
    <View style={{ gap: space.md }}>
        <RoadPath pinnacles={data.pinnacles} challenges={data.challenges} />

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
        <Footnote text={data.nameNote} />

        <SectionTitle eyebrow="UNDER THE SURFACE" title="Hidden Passion" note={data.hiddenPassion.mechanism} />
        {data.hiddenPassion.content ? (
          <Accordion badge={String(data.hiddenPassion.number)} title={`Hidden Passion ${data.hiddenPassion.number}`} subtitle={data.hiddenPassion.content.theme}>
            <PassionBody c={data.hiddenPassion.content} />
          </Accordion>
        ) : null}

        <SectionTitle eyebrow="WHAT TO BUILD" title="Karmic Lessons" note={data.karmicLessons.mechanism} />
        {data.karmicLessons.items.length === 0 ? (
          <NoteCard text="Every number from 1 to 9 appears in your name, so you have no missing-number lessons. Nothing is absent that has to be built from scratch." />
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
        <NoteCard text={data.interplay} />
    </View>
  );
}
