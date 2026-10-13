/**
 * What the Sun's gate(s) mean for the person today, for the top of the Timeline's Vehicle lens (server-side only).
 *
 * The Sun changes gate every five to six days, so a day has one gate, or two when the Sun crosses a boundary
 * that day (the gate it leaves, then the gate it enters). Each gate is read three ways:
 *  - what the gate is: its I Ching name, core meaning and center (from the practitioner reference);
 *  - how it meets this chart: the same contact rule the Today Signal uses (signal.ts);
 *  - what to do with it: a short line for that kind of contact, then the person's own Strategy and Authority.
 * Conditions, never decisions: Strategy and Authority decide.
 */

import { GATE_CENTER_MAP, UNIQUE_CHANNELS, longitudeToGate } from '@/server/engines/human_design';
import { GATE_KEYNOTES } from '@/lib/report/section3/gate-content';
import { pickAuthorityContent, pickTypeContent } from '@/lib/app/transitCard';
import { contactFor, type Contact, type VehicleGateData } from '@/lib/app/signal';
import { GATE_READINGS } from '@/lib/app/gateReadings';
import { centerName, ingresses, jdToIso, sentence, type GateVehicle } from '@/lib/app/gateEvents';

export interface GateToday {
  gate: number;
  /** The line the Sun is in as the day starts, or as it enters the gate. */
  line: number;
  name: string;
  meaning: string;
  center: string;
  /** When the Sun enters this gate today (ISO, UTC); null when it was already here at the start of the day. */
  from: string | null;
  /** When the Sun leaves this gate (ISO, UTC). */
  until: string;
  contact: Contact;
  channel: string | null;
  /** How the gate meets this chart, in one sentence. */
  meets: string;
  /** What to do with it for this kind of contact, in one or two sentences. */
  advice: string;
  /** This gate's own reading: what the Sun brings through it, where it tips over, and a piece of guidance. */
  reading: { theme: string; shadow: string; guidance: string };
}

/** How many days past today carry their own gate reading. */
export const GATE_DAYS_AHEAD = 14;

/** The Sun's gate(s) for one day after today; `dayIndex` counts days from today (1 is tomorrow). */
export interface GateDay {
  dayIndex: number;
  gates: GateToday[];
}

export interface GateTodayResult {
  gates: GateToday[];
  /** The person's own Strategy and Authority practice, which decide. Null when their Type or Authority is not known. */
  strategy: string | null;
  authority: string | null;
}

const ADVICE: Record<Contact, (channel: string | null) => string> = {
  electromagnetic: (ch) =>
    `A spark of Channel ${ch} comes alive that you cannot light on your own. Enjoy the extra current and let it colour the day, but do not treat it as a decision.`,
  companionship: () =>
    'Familiar ground: this repeats something you already hold, so what feels natural today is really yours. A good day for steady work you would do anyway.',
  compromise: (ch) =>
    `Channel ${ch} is made between the sky and you, but you hold only one of its gates. Go carefully and do not take a push from outside as your own.`,
  amplified: () =>
    'This lands in a center you leave open, so it can feel stronger than it is. Notice it, and do not mistake it for your own wanting.',
  flavor: () =>
    'A light tint on what is already steady in you. Nothing needs to change: carry on from your own Strategy.',
};

/**
 * `startJd` is the start of the person's day. `lonAt` returns the Sun's ecliptic longitude at a Julian day
 * (passed in so this stays testable without the ephemeris).
 */
export function buildGateToday(
  startJd: number,
  vehicle: GateVehicle,
  lonAt: (b: 'sun' | 'moon', jd: number) => number,
): GateTodayResult {
  const data: VehicleGateData = {
    type: vehicle.type,
    authority: vehicle.authority,
    natalGates: vehicle.natalGates,
    undefinedCenters: vehicle.undefinedCenters,
    transit: { sun: 0, moon: 0 },
    channels: UNIQUE_CHANNELS.map((c) => c.gates),
    gateCenter: GATE_CENTER_MAP,
  };
  const make = (gate: number, line: number, from: number | null, until: number): GateToday | null => {
    const k = GATE_KEYNOTES[gate];
    const r = GATE_READINGS[gate];
    if (!k || !r) return null;
    const c = contactFor('Sun', gate, data, 0);
    const channel = c.channel ?? null;
    return {
      gate,
      line,
      name: k.ichingName,
      meaning: k.coreMeaning,
      center: centerName(k.center),
      from: from === null ? null : jdToIso(from),
      until: jdToIso(until),
      contact: c.kind,
      channel,
      meets: sentence('Sun', gate, c.kind, channel ?? undefined, GATE_CENTER_MAP[gate]),
      advice: ADVICE[c.kind](channel),
      reading: { theme: r.theme, shadow: r.shadow, guidance: r.guidance },
    };
  };

  const now = longitudeToGate(lonAt('sun', startJd));
  // The Sun's next gate changes after the start of the day: the first is when it leaves this gate.
  const changes = ingresses('sun', startJd, startJd + 14, lonAt);
  const gates: GateToday[] = [];
  const first = make(now.gate, now.line, null, changes[0] ? changes[0].jd : startJd + 5.7);
  if (first) gates.push(first);
  const entering = changes[0];
  if (entering && entering.jd < startJd + 1) {
    const second = make(entering.gate, entering.line, entering.jd, changes[1] ? changes[1].jd : entering.jd + 5.7);
    if (second) gates.push(second);
  }

  const type = pickTypeContent(vehicle.type);
  const auth = pickAuthorityContent(vehicle.authority);
  return {
    gates,
    strategy: type ? `Strategy (${type.type}): ${type.strategyPractice}` : null,
    authority: auth ? `Authority (${auth.authority}): ${auth.doList[0]}.` : null,
  };
}
