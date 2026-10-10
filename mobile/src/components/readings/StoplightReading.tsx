import { useEffect, type ComponentProps } from 'react';
import { View } from 'react-native';
import {
  Accordion as BaseAccordion, Block, Bullets, Footnote, NoteCard, ReadingStatus, SectionTitle,
} from '@/components/ReadingBlocks';
import type { BigThreeLens, NatalAspects, NodesReading, StoplightDetail, StoplightPlanet } from '@/lib/stoplightTypes';
import { ElementBalance, StoplightCompare } from '@/components/readings/StoplightCompare';
import { useStoplight } from '@/lib/useStoplight';
import { yearQuote } from '@/lib/skyText';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, space } from '@/theme/tokens';

/** Accordion in the Stoplight's crimson. */
function Accordion(props: Omit<ComponentProps<typeof BaseAccordion>, 'accent'>) {
  return <BaseAccordion accent={colors.stoplight} {...props} />;
}

const SIGN_GLYPH: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const PLANET_GLYPH: Record<string, string> = {
  mercury: '☿', venus: '♀', mars: '♂', jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
};

function BigThree({ lens, prefix }: { lens: BigThreeLens; prefix: string }) {
  return (
    <>
      <Accordion
        badge={SIGN_GLYPH[lens.sun.sign] ?? '☉'}
        title={`${prefix} Sun in ${lens.sun.sign}`}
        subtitle={`${lens.sun.formatted} · ${lens.sun.element}, ${lens.sun.modality}`}
        defaultOpen={prefix === 'Tropical'}
      >
        <Block label="YOUR CORE ORIENTATION" text={lens.sun.orientation} />
        <Bullets label="YOU MAY RECOGNIZE THIS WHEN…" items={lens.sun.recognize} />
        <Block label="WATCH FOR" text={lens.sun.watchFor} />
        <Block label={`WHERE IT SHINES: ${lens.sun.arenaName.toUpperCase()} (HOUSE ${lens.sun.house})`} text={lens.sun.arena} />
      </Accordion>
      <Accordion
        badge={SIGN_GLYPH[lens.moon.sign] ?? '☽'}
        title={`${prefix} Moon in ${lens.moon.sign}`}
        subtitle={`${lens.moon.formatted} · ${lens.moon.element}, ${lens.moon.modality}`}
      >
        <Block label="WHAT YOU NEED EMOTIONALLY" text={lens.moon.text} />
      </Accordion>
      <Accordion
        badge={SIGN_GLYPH[lens.rising.sign] ?? '↑'}
        title={`${prefix} Rising in ${lens.rising.sign}`}
        subtitle={`${lens.rising.formatted} · ${lens.rising.element}, ${lens.rising.modality}`}
      >
        <Block label="HOW OTHERS MEET YOU" text={lens.rising.text} />
      </Accordion>
    </>
  );
}

const FEEL_WORD: Record<string, string> = {
  easy: 'Flows easily',
  challenging: 'Creates friction',
  blend: 'Blends together',
};

function NodesSection({ nodes }: { nodes: NodesReading }) {
  return (
    <>
      <SectionTitle eyebrow="YOUR LUNAR NODES" title="Where you grow, where you rest" note={nodes.intro} />
      {nodes.note ? <NoteCard text={nodes.note} /> : null}
      <Accordion
        badge="☊"
        title={`North Node in ${nodes.north.sign}`}
        subtitle={`${nodes.north.formatted}${nodes.north.house ? ` · house ${nodes.north.house}` : ''}`}
      >
        <Block label="THE DIRECTION OF GROWTH" text={nodes.growth} />
        {nodes.houseGrowth ? <Block label={`WHERE IT SHOWS UP (HOUSE ${nodes.north.house})`} text={nodes.houseGrowth} /> : null}
      </Accordion>
      <Accordion
        badge="☋"
        title={`South Node in ${nodes.south.sign}`}
        subtitle={`${nodes.south.formatted}${nodes.south.house ? ` · house ${nodes.south.house}` : ''}`}
      >
        <Block label="WHAT FEELS FAMILIAR" text={nodes.familiar} />
        {nodes.houseFamiliar ? <Block label={`WHERE IT SHOWS UP (HOUSE ${nodes.south.house})`} text={nodes.houseFamiliar} /> : null}
        <Block label="HOLDING THE BALANCE" text={nodes.balance} />
      </Accordion>
      <Footnote text={nodes.closing} />
    </>
  );
}

function AspectsSection({ aspects }: { aspects: NatalAspects }) {
  return (
    <>
      <SectionTitle eyebrow="PLANETS IN CONVERSATION" title="Aspects in your chart" note={aspects.intro} />
      {aspects.note ? <NoteCard text={aspects.note} /> : null}
      {aspects.items.map((a) => (
        <Accordion
          key={a.line}
          badge={a.tight ? '◎' : '○'}
          title={a.line}
          subtitle={`${FEEL_WORD[a.feel] ?? a.feel} · ${a.orb.toFixed(1)}° from exact${a.tight ? ' · very tight' : ''}`}
        >
          <Block label="THE THEME" text={a.theme} />
          <Block label="HOW IT TENDS TO FEEL" text={a.text} />
        </Accordion>
      ))}
      <Footnote text={aspects.closing} />
    </>
  );
}

function PlanetCard({ p }: { p: StoplightPlanet }) {
  return (
    <Accordion
      badge={PLANET_GLYPH[p.key] ?? '●'}
      title={`${p.placement}${p.retrograde ? ' ℞' : ''}`}
      subtitle={p.houseName && p.group !== 'outer' ? `${p.houseName} (house ${p.house})` : p.houseName}
    >
      <Block label="WHAT IT IS BUILT TO DO" text={p.theme} />
      <Block label="THE GIFT" text={p.gift} />
      <Block label="WHEN IT IS OUT OF BALANCE" text={p.friction} />
    </Accordion>
  );
}

function StoplightBody({ data }: { data: StoplightDetail }) {
  const personal = data.planets.filter((p) => p.group === 'personal');
  const social = data.planets.filter((p) => p.group === 'social');
  const outer = data.planets.filter((p) => p.group === 'outer');

  return (
    <View style={{ gap: space.md }}>
      {data.timeNote ? <NoteCard text={data.timeNote} /> : null}

      <SectionTitle eyebrow="AT A GLANCE" title="Two lenses, side by side" note="Most Western charts use the tropical lens. Some traditions use sidereal, which is based on the visible stars." />
      <StoplightCompare tropical={data.tropical} sidereal={data.sidereal} />
      <SectionTitle eyebrow="YOUR BALANCE" title="Elements in your Big Three" />
      <ElementBalance lens={data.tropical} />

      <SectionTitle eyebrow="YOUR SKY AT BIRTH" title="Your Big Three" note={data.lensNote} />
      <BigThree lens={data.tropical} prefix="Tropical" />

      <SectionTitle eyebrow="A SECOND LENS" title="Sidereal Big Three" note={data.siderealNote} />
      <BigThree lens={data.sidereal} prefix="Sidereal" />

      <SectionTitle eyebrow="HOW THEY WORK TOGETHER" title="Your core pattern" />
      <Accordion badge="☉☽" title={data.sunMoon.label} subtitle="Sun and Moon together">
        <Block label="THE TENSION" text={data.sunMoon.tension} />
        <Block label="THE RESOURCE" text={data.sunMoon.resource} />
        <Block label="A PRACTICE" text={data.sunMoon.practice} />
      </Accordion>
      <Accordion badge="◍" title={data.elements.label} subtitle="Element blend of your Sun, Moon and Rising">
        <Block label="PACING" text={data.elements.pacing} />
        <Block label="HOW YOU HANDLE CHANGE" text={data.elements.change} />
        <Block label="EMOTION" text={data.elements.emotion} />
        <Block label="THE GIFT" text={data.elements.gift} />
        <Block label="THE FRICTION" text={data.elements.friction} />
      </Accordion>
      <Accordion badge="◇" title={data.modality.label} subtitle="Modality blend of your Sun, Moon and Rising">
        <Block label="WHAT IT MEANS" text={data.modality.description} />
      </Accordion>

      <SectionTitle eyebrow="YOUR CHART RULER" title={data.ruler.ruler} note={data.ruler.arena} />
      <Accordion badge="♛" title={`Ruled by ${data.ruler.ruler}`} subtitle={data.ruler.arena}>
        <Block label="WHAT IT MEANS" text={data.ruler.description} />
      </Accordion>

      <SectionTitle eyebrow="YOUR PLANETS" title="Mercury, Venus, Mars" note={data.mechanisms.personal} />
      {personal.map((p) => <PlanetCard key={p.key} p={p} />)}

      <SectionTitle eyebrow="YOUR PLANETS" title="Jupiter and Saturn" note={data.mechanisms.social} />
      {social.map((p) => <PlanetCard key={p.key} p={p} />)}

      <SectionTitle eyebrow="YOUR PLANETS" title="Uranus, Neptune, Pluto" note={data.mechanisms.outer} />
      {outer.map((p) => <PlanetCard key={p.key} p={p} />)}

      {data.nodes ? <NodesSection nodes={data.nodes} /> : null}
      {data.aspects && data.aspects.items.length > 0 ? <AspectsSection aspects={data.aspects} /> : null}

      <SectionTitle
        eyebrow="YOUR TIMING"
        title="Where you are in time"
        note="Two classical timing tools, read as weather and not as predictions."
      />
      <Accordion
        badge={data.timeLord.planet.slice(0, 2)}
        title={`Time Lord: ${data.timeLord.planet}`}
        subtitle={`${data.timeLord.startYear} to ${data.timeLord.endYear} · about ${data.timeLord.yearsRemaining} years left`}
        defaultOpen
        now
      >
        <Block label="THE THEME OF THIS PERIOD" text={data.timeLord.tagline} />
        <Block label="IN THIS PERIOD" text={data.timeLord.quote} />
        {data.timeLord.paragraphs.map((t, i) => (
          <Block key={t} label={i === 0 ? 'WHAT THIS LOOKS LIKE' : 'HOW IT PLAYS OUT'} text={t} />
        ))}
        <Block label="WATCH FOR" text={data.timeLord.watchFor} />
        {data.timeLord.next ? <Block label="NEXT" text={`After ${data.timeLord.planet} comes ${data.timeLord.next}.`} /> : null}
      </Accordion>
      <Accordion
        badge={String(data.lordOfYear.house)}
        title={`Lord of the Year: ${data.lordOfYear.lord}`}
        subtitle={`Age ${data.lordOfYear.age} · ${data.lordOfYear.houseName} (house ${data.lordOfYear.house})`}
        defaultOpen
        now
      >
        <Block label="YOUR YEAR'S ARENA" text={data.lordOfYear.houseTheme} />
        <Block label="THE SIGN ON THIS HOUSE" text={`${data.lordOfYear.sign}, ruled by ${data.lordOfYear.lord}.`} />
        <Block label="ITS RULER" text={data.lordOfYear.lordQuote ? yearQuote(data.lordOfYear.lordQuote) : data.lordOfYear.lordQuote} />
      </Accordion>

      <SectionTitle
        eyebrow="READING IT WELL"
        title="Four common mix-ups"
        note="The sky can describe conditions. It cannot make the decision."
      />
      {data.mixups.map((m) => (
        <Accordion key={m.confusion} badge="!" title={m.confusion}>
          <Block label="WHAT IT SOUNDS LIKE" text={m.signal} />
          <Block label="HOW TO RECALIBRATE" text={m.recalibrate} />
        </Accordion>
      ))}

      <Footnote text="This reading describes your sky. Decisions still go through your Strategy and Authority." />
    </View>
  );
}

export function StoplightReading({ onRefreshReady }: { onRefreshReady?: (r: { run: () => Promise<void> } | null) => void }) {
  const profile = useT3DStore((s) => s.profile);
  const chart = useT3DStore((s) => s.chart);
  const { data, error, loading, retry, offline, savedAt, refresh } = useStoplight(
    chart?.leadId,
    profile?.email.trim(),
    profile?.birthTimeKnown !== false,
  );

  useEffect(() => {
    onRefreshReady?.({ run: refresh });
    return () => onRefreshReady?.(null);
  }, [refresh, onRefreshReady]);

  return (
    <ReadingStatus
      loading={loading}
      error={error}
      hasData={data !== null}
      loadingText="Reading your sky…"
      onRetry={retry}
      offline={offline}
      savedAt={savedAt}
    >
      {data ? <StoplightBody data={data} /> : null}
    </ReadingStatus>
  );
}
