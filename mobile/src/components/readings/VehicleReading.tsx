import { useEffect, type ComponentProps } from 'react';
import { View } from 'react-native';
import {
  Accordion as BaseAccordion, Block, Bullets, Footnote, NoteCard, ReadingStatus, SectionTitle,
} from '@/components/ReadingBlocks';
import type { Bridge, VehicleDetail } from '@/lib/vehicleTypes';
import { TimeNote } from '@/components/TimeNote';
import { useVehicle } from '@/lib/useVehicle';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, space } from '@/theme/tokens';

/** Accordion in the Vehicle's amber. */
function Accordion(props: Omit<ComponentProps<typeof BaseAccordion>, 'accent'>) {
  return <BaseAccordion accent={colors.vehicle} {...props} />;
}

const TYPE_BADGE: Record<string, string> = {
  Generator: 'G',
  'Manifesting Generator': 'MG',
  Projector: 'P',
  Manifestor: 'M',
  Reflector: 'R',
};

const GROUP_LABEL: Record<string, string> = {
  Individual: 'Individual',
  Collective: 'Collective',
  Tribal: 'Tribal',
  Integration: 'Integration',
};

function bridgeLine(b: Bridge): string {
  return `${b.groupA.join(' + ')}  ↔  ${b.groupB.join(' + ')}`;
}

function BridgeBlock({ b }: { b: Bridge }) {
  return (
    <>
      <Block
        label={b.classification === 'narrow' ? 'A NARROW GAP' : 'A WIDE GAP'}
        text={
          b.classification === 'narrow'
            ? `${bridgeLine(b)}. One gate of a connecting channel is already yours, so you tend to fixate on that one missing quality and blame yourself for not having it.`
            : `${bridgeLine(b)}. No gate of a connecting channel is yours, so the story tends to point outward: why doesn't someone or something supply this?`
        }
      />
      {b.hangingGates.map((h) => (
        <View key={`${h.gate}-${h.partnerGate}`} style={{ gap: space.sm }}>
          <Block
            label={`YOUR BRIDGE GATE ${h.gate}: ${h.ichingName.toUpperCase()}`}
            text={`${h.coreMeaning} It sits in your ${h.center} and pairs with Gate ${h.partnerGate} in the ${h.partnerCenter} to form ${h.channelName}.`}
          />
          <Block label="WHAT OTHERS FEEL AROUND THIS GATE" text={h.experience} />
        </View>
      ))}
    </>
  );
}

function VehicleBody({ data }: { data: VehicleDetail }) {
  const conscious = data.gates.filter((g) => g.epoch === 'personality');
  const unconscious = data.gates.filter((g) => g.epoch === 'design');
  const gateRow = (g: VehicleDetail['gates'][number]) =>
    `${g.planet} · Gate ${g.gate}.${g.line} ${g.ichingName}: ${g.coreMeaning}`;

  return (
    <View style={{ gap: space.md }}>
      <TimeNote scope="vehicle" />
      {data.type ? (
        <>
          <SectionTitle eyebrow="YOUR MACHINERY" title="Type" note="How your energy is built to work, and what it feels like when you are on or off track." />
          <Accordion badge={TYPE_BADGE[data.type.name] ?? '◆'} title={data.type.name} subtitle={`Strategy: ${data.type.strategy}`} defaultOpen>
            <Block label="IN PLAIN LANGUAGE" text={data.type.plain} />
            <Block label="WHEN YOU ARE ALIGNED" text={`Signature: ${data.type.signature}`} />
            <Block label="WHEN YOU ARE OFF TRACK" text={`Not-self: ${data.type.notSelf}`} />
            <Bullets label="YOU MAY RECOGNIZE THIS WHEN…" items={data.type.recognize} />
            <Block label="WATCH FOR" text={data.type.watchFor} />
            <Block label="TRY THIS" text={data.type.tryThis} />
            <Block label="YOUR STRATEGY IN PRACTICE" text={data.type.strategyPractice} />
            <Bullets label="THE NOT-SELF VOICE" items={data.type.notSelfVoice} />
          </Accordion>
        </>
      ) : null}

      {data.authority ? (
        <>
          <SectionTitle eyebrow="HOW YOU DECIDE" title="Authority" note="The one place your real decisions come from. Everything else, including the sky, is information." />
          <Accordion badge="◆" title={data.authority.name} subtitle={data.authority.mechanism}>
            <Block label="HOW IT WORKS" text={data.authority.mechanism} />
            <Block label="THE FALSE URGENCY" text={data.authority.falseUrgency} />
            <Block label="HOW IT GETS OVERRIDDEN" text={data.authority.distortion} />
            <Bullets label="DO" items={data.authority.doList} />
            <Bullets label="DON'T" items={data.authority.doNotList} />
            <Block label={`RESET: ${data.authority.reset.title.toUpperCase()}`} text={data.authority.reset.instruction} />
          </Accordion>
        </>
      ) : null}

      {data.profile ? (
        <>
          <SectionTitle eyebrow="YOUR ROLE" title="Profile" note="The two lines that describe how you learn and how you meet the world." />
          <Accordion badge={data.profile.value} title={`Profile ${data.profile.value}`} subtitle={data.profile.role}>
            <Block label="IN PLAIN LANGUAGE" text={data.profile.plain} />
            <Block label="YOUR NATURAL ROLE" text={data.profile.role} />
            <Block label="HOW YOU LEARN FROM OTHERS" text={data.profile.socialPattern} />
            <Block label="YOU AND VISIBILITY" text={data.profile.visibility} />
          </Accordion>
        </>
      ) : null}

      <SectionTitle eyebrow="YOUR WIRING" title="Definition" note="How your defined Centers connect to each other." />
      <Accordion
        badge={String(data.definition.circuitCount)}
        title={`${data.definition.type}${data.definition.type === 'No Definition' ? '' : ' Definition'}`}
        subtitle={data.definition.groups.map((g) => g.join(' + ')).join('   |   ') || 'Every Center is open'}
      >
        <Block label="WHAT IT MEANS" text={data.definition.meaning} />
        {data.definition.bridges.map((b) => (
          <BridgeBlock key={bridgeLine(b)} b={b} />
        ))}
      </Accordion>

      <SectionTitle eyebrow="YOUR CENTERS" title="Defined: your steady strengths" note="These are consistent in you. People often lean on you for them." />
      {data.centers.defined.length === 0 ? (
        <NoteCard text="No Center is defined in your design. Everything in you is open and responsive, which is the Reflector configuration." />
      ) : (
        data.centers.defined.map((c) => (
          <Accordion key={c.id} badge="●" title={`${c.name} (defined)`} subtitle={c.title}>
            <Block label={c.title.toUpperCase()} text={c.description} />
          </Accordion>
        ))
      )}

      <SectionTitle eyebrow="YOUR CENTERS" title="Open: where you take in the world" note="These are not weaknesses. They amplify what is around you, and over time they become your wisdom." />
      {data.centers.open.length === 0 ? (
        <NoteCard text="All nine Centers are defined in your design, so none of them is open." />
      ) : (
        data.centers.open.map((c) => (
          <Accordion key={c.id} badge="○" title={`${c.name} (open)`} subtitle={c.title}>
            <Block label="WHAT GETS AMPLIFIED" text={c.sensitivity} />
            <Block label="THE WISDOM IT BUILDS" text={c.wisdom} />
            <Block label="A KINDER READ" text={c.notDefect} />
          </Accordion>
        ))
      )}

      <SectionTitle eyebrow="YOUR CURRENTS" title="Circuitry" note="Which family of channels shapes you most." />
      <Accordion
        badge={data.circuits.dominant === 'None' || data.circuits.dominant === 'Even' ? '◇' : (GROUP_LABEL[data.circuits.dominant] ?? data.circuits.dominant).slice(0, 3).toUpperCase()}
        title={data.circuits.dominant === 'None' ? 'No channels' : data.circuits.dominant === 'Even' ? 'Balanced circuits' : `${data.circuits.dominant} circuitry`}
        subtitle={data.circuits.keynote}
        defaultOpen
      >
        <Block label="WHAT IT MEANS" text={data.circuits.passage} />
      </Accordion>
      {data.circuits.channels.length ? (
        <Accordion badge={String(data.circuits.channels.length)} title="Your channels" subtitle="Each one joins two Centers into a steady, lifelong current.">
          <Bullets
            label="CHANNELS"
            items={data.circuits.channels.map(
              (c) => `${c.name} (${c.gates[0]}–${c.gates[1]}) · ${c.from} to ${c.to}${c.group ? ` · ${c.group}${c.subCircuit && c.subCircuit !== c.group ? `, ${c.subCircuit}` : ''}` : ''}`,
            )}
          />
        </Accordion>
      ) : null}

      <SectionTitle eyebrow="YOUR ACTIVATIONS" title="Gates" note="The individual themes lit up at your birth. Conscious is what you know about yourself; unconscious is what others see in you." />
      {conscious.length ? (
        <Accordion badge={String(conscious.length)} title="Conscious gates (Personality)" subtitle="Calculated from your birth moment.">
          <Bullets label="GATE BY PLANET" items={conscious.map(gateRow)} />
        </Accordion>
      ) : null}
      {unconscious.length ? (
        <Accordion badge={String(unconscious.length)} title="Unconscious gates (Design)" subtitle="Calculated from about 88 days before birth.">
          <Bullets label="GATE BY PLANET" items={unconscious.map(gateRow)} />
        </Accordion>
      ) : null}

      <SectionTitle eyebrow="YOUR PURPOSE" title="Incarnation Cross" note={data.cross.name || undefined} />
      <Accordion badge={data.cross.family.split(' ').map((w) => w[0]).join('')} title={`${data.cross.family} cross`} subtitle={data.cross.keynote}>
        <Block label="WHAT THIS GEOMETRY MEANS" text={data.cross.passage} />
        {data.cross.gates.map((g) => (
          <Block
            key={g.role}
            label={`${g.role.toUpperCase()}: GATE ${g.gate}`}
            text={`${g.ichingName ? `${g.ichingName}. ` : ''}${g.coreMeaning} ${g.blurb}`}
          />
        ))}
      </Accordion>

      {data.godhead ? (
        <>
          <SectionTitle eyebrow="YOUR ARCHETYPE" title="Godhead" note={data.godhead.mechanism} />
          <Accordion badge={data.godhead.name.slice(0, 2).toUpperCase()} title={data.godhead.name} subtitle={data.godhead.archetype}>
            <Block label={`QUARTER OF ${data.godhead.quarter.toUpperCase()}`} text={data.godhead.quarterTheme} />
            <Block label="THE KEYNOTE" text={data.godhead.keynote} />
            <Block label="THE LIGHT" text={data.godhead.light} />
            <Block label="THE SHADOW" text={data.godhead.shadow} />
          </Accordion>
        </>
      ) : null}

      {data.variables ? (
        <>
          <SectionTitle eyebrow="YOUR BODY'S SETTINGS" title="Variables" note={data.variables.mechanism} />
          {data.variables.items.map((v) => (
            <Accordion key={v.key} badge={v.arrow === 'Left' ? '◀' : '▶'} title={`${v.title}: ${v.arrow}, ${v.name}`} subtitle={v.meaning}>
              <Block label="WHAT IT MEANS FOR YOU" text={v.meaning} />
            </Accordion>
          ))}
        </>
      ) : null}

      <Footnote text="This reading explains your design. Decisions still go through your Strategy and Authority." />
    </View>
  );
}

export function VehicleReading({ onRefreshReady }: { onRefreshReady?: (r: { run: () => Promise<void> } | null) => void }) {
  const profile = useT3DStore((s) => s.profile);
  const chart = useT3DStore((s) => s.chart);
  const { data, error, loading, retry, offline, savedAt, refresh } = useVehicle(chart?.leadId, profile?.email.trim());

  useEffect(() => {
    onRefreshReady?.({ run: refresh });
    return () => onRefreshReady?.(null);
  }, [refresh, onRefreshReady]);

  return (
    <ReadingStatus
      loading={loading}
      error={error}
      hasData={data !== null}
      loadingText="Reading your design…"
      onRetry={retry}
      offline={offline}
      savedAt={savedAt}
    >
      {data ? <VehicleBody data={data} /> : null}
    </ReadingStatus>
  );
}
