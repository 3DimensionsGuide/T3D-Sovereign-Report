/**
 * The daily Signal for the T3D app (server-side only).
 *
 * Three lamps, one per lens, plus one overall lamp. Each lamp is Go, Slow or Pause.
 * These are CONDITIONS, never decisions: the T3D rule is that transits and numerology
 * are weather and every decision goes through Strategy and Authority.
 *
 * Where each rule comes from (T3D PHILOSOPHER knowledge base):
 *  - Road: the Personal Day number's own pace. 1, 3, 5, 8 = act now / flow; 2, 4, 6 = prepare and build;
 *    7, 9 = pause and reflect. Master numbers use their foundation number (11 = 2, 22 = 4, 33 = 6).
 *  - Vehicle: the transiting Sun and Moon gates against the person's own gates and centers.
 *    A transit gate that completes one of your channels is an electromagnetic spark; a gate on a
 *    channel you already hold is companionship; a full transit channel against a single natal gate
 *    is a compromise (the framework's main friction point); a gate landing in an undefined center is
 *    amplified roughly twofold and invites Not-Self. Emotional Authority has "no truth in the now",
 *    and a Reflector samples the Moon over a ~28-day cycle, so both are never shown a plain Go.
 *  - Stoplight: the tightest sky contact. Friction is Slow. Friction inside the framework's peak
 *    window (1 degree or less) is Pause. Flow, neutral or a quiet sky is Go.
 *  - Overall: the sources give NO rule for combining lenses, so this is a plain tally
 *    (Go 0, Slow 1, Pause 2): 0 to 1 is Go, 2 to 3 is Slow, 4 or more is Pause.
 */

export type LampState = 'go' | 'slow' | 'pause';

export interface Lamp {
  state: LampState;
  /** One plain line saying why this lamp shows what it shows. */
  reason: string;
}

export interface DailySignal {
  overall: Lamp;
  vehicle: Lamp | null;
  road: Lamp;
  stoplight: Lamp;
}

const POINTS: Record<LampState, number> = { go: 0, slow: 1, pause: 2 };

const ROAD_STATE: Record<number, LampState> = {
  1: 'go', 2: 'slow', 3: 'go', 4: 'slow', 5: 'go', 6: 'slow', 7: 'pause', 8: 'go', 9: 'pause',
};

const ROAD_PACE: Record<LampState, string> = {
  go: 'a day that favors action and expression',
  slow: 'a day that favors preparing, building and tending',
  pause: 'a day that favors reflecting, finishing and releasing',
};

export function roadLamp(
  personal: { number: number; root?: number | null; label: string },
): Lamp {
  const base = personal.root ?? personal.number;
  const state = ROAD_STATE[base] ?? 'slow';
  const shown = personal.root ? `${personal.number}/${personal.root}` : String(personal.number);
  return { state, reason: `Personal Day ${shown}, ${personal.label}: ${ROAD_PACE[state]}.` };
}

export interface SkyContact {
  nature: 'flow' | 'friction' | 'neutral';
  peak: boolean;
}

export function stoplightLamp(top: SkyContact | null, title: string | null): Lamp {
  if (!top) return { state: 'go', reason: 'The sky is quiet: no close contacts to your chart.' };
  const what = title ?? 'The tightest sky contact';
  if (top.nature === 'friction' && top.peak) {
    return { state: 'pause', reason: `${what} is at its peak with friction. Give it room.` };
  }
  if (top.nature === 'friction') {
    return { state: 'slow', reason: `${what} carries some friction. Go carefully.` };
  }
  if (top.nature === 'flow') return { state: 'go', reason: `${what} carries an easy current.` };
  return { state: 'go', reason: `${what} blends energies without pushing against you.` };
}

export interface VehicleGateData {
  type: string | null;
  authority: string | null;
  /** Every gate the person has activated, from either epoch. */
  natalGates: readonly number[];
  /** Centers the person has undefined (white). */
  undefinedCenters: readonly string[];
  /** The gates the Sun and the Moon are in right now. */
  transit: { sun: number; moon: number };
  /** All 36 channels as gate pairs. */
  channels: ReadonlyArray<readonly [number, number]>;
  /** Gate number to center name. */
  gateCenter: Readonly<Record<number, string>>;
}

export type Contact = 'electromagnetic' | 'companionship' | 'compromise' | 'amplified' | 'flavor';

export interface GateContact {
  who: 'Sun' | 'Moon';
  gate: number;
  kind: Contact;
  /** The channel involved, as "a-b", when there is one. */
  channel: string | null;
}

const channelName = (a: number, b: number): string => `${Math.min(a, b)}-${Math.max(a, b)}`;

/** How one transit gate meets the person's chart. */
export function contactFor(who: 'Sun' | 'Moon', gate: number, data: VehicleGateData, other: number): GateContact {
  const natal = new Set(data.natalGates);
  const mine = data.channels.filter((c) => c[0] === gate || c[1] === gate);

  // The transit Sun and Moon together make a full channel against a single natal gate: compromise.
  for (const c of mine) {
    const partner = c[0] === gate ? c[1] : c[0];
    if (partner === other && natal.has(gate) !== natal.has(partner)) {
      return { who, gate, kind: 'compromise', channel: channelName(c[0], c[1]) };
    }
  }
  // Supplying the missing half of a channel the person holds one gate of: electromagnetic.
  for (const c of mine) {
    const partner = c[0] === gate ? c[1] : c[0];
    if (natal.has(partner) && !natal.has(gate)) {
      return { who, gate, kind: 'electromagnetic', channel: channelName(c[0], c[1]) };
    }
  }
  // Repeating a gate of a channel the person already has in full: companionship.
  for (const c of mine) {
    if (natal.has(c[0]) && natal.has(c[1])) {
      return { who, gate, kind: 'companionship', channel: channelName(c[0], c[1]) };
    }
  }
  // Landing in an undefined center: amplified.
  const center = data.gateCenter[gate];
  if (center && data.undefinedCenters.includes(center)) {
    return { who, gate, kind: 'amplified', channel: null };
  }
  return { who, gate, kind: 'flavor', channel: null };
}

const KIND_SENTENCE: Record<Contact, (c: GateContact) => string> = {
  electromagnetic: (c) => `The ${c.who} is in Gate ${c.gate}, which completes your Channel ${c.channel}: a spark, not a decision.`,
  companionship: (c) => `The ${c.who} is in Gate ${c.gate}, part of Channel ${c.channel}, which you already hold: an easy match.`,
  compromise: (c) => `The Sun and Moon together make Channel ${c.channel} and you hold only one of its gates: a compromise, so go carefully.`,
  amplified: (c) => `The ${c.who} is in Gate ${c.gate}, in a center you leave open: its energy is amplified, so do not take it as your own.`,
  flavor: (c) => `The ${c.who} is in Gate ${c.gate}, adding a flavor to what is already steady in you.`,
};

/** Reflectors (Lunar authority) and Emotional authority are never shown a plain Go. */
function capReason(authority: string | null, type: string | null): string | null {
  if (type === 'Reflector' || authority === 'Lunar') {
    return 'As a Reflector you sample the Moon across its full cycle of about 28 days before big choices.';
  }
  if (authority === 'Emotional') {
    return 'Emotional Authority has no truth in the now: let your wave settle before you decide.';
  }
  return null;
}

export function vehicleLamp(data: VehicleGateData): Lamp {
  const contacts = [
    contactFor('Sun', data.transit.sun, data, data.transit.moon),
    contactFor('Moon', data.transit.moon, data, data.transit.sun),
  ];
  const compromise = contacts.find((c) => c.kind === 'compromise');
  const ease = contacts.find((c) => c.kind === 'electromagnetic' || c.kind === 'companionship');
  const amplified = contacts.find((c) => c.kind === 'amplified');

  let state: LampState = 'go';
  let lead: GateContact = contacts[1]!;
  if (compromise) {
    state = 'slow';
    lead = compromise;
  } else if (amplified && !ease) {
    state = 'slow';
    lead = amplified;
  } else if (ease) {
    lead = ease;
  }

  const cap = capReason(data.authority, data.type);
  if (cap && state === 'go') {
    return { state: 'slow', reason: `${KIND_SENTENCE[lead.kind](lead)} ${cap}` };
  }
  return { state, reason: KIND_SENTENCE[lead.kind](lead) };
}

export function overallLamp(lamps: ReadonlyArray<Lamp>): Lamp {
  const sum = lamps.reduce((s, l) => s + POINTS[l.state], 0);
  const state: LampState = sum >= 4 ? 'pause' : sum >= 2 ? 'slow' : 'go';
  const names = { go: 'Go', slow: 'Slow', pause: 'Pause' } as const;
  const counts = (s: LampState) => lamps.filter((l) => l.state === s).length;
  const parts = (['go', 'slow', 'pause'] as const)
    .filter((s) => counts(s) > 0)
    .map((s) => `${counts(s)} ${names[s].toLowerCase()}`);
  return {
    state,
    reason: `${lamps.length} lenses read: ${parts.join(', ')}. These are conditions, not a decision. Your Strategy and Authority decide.`,
  };
}

export function buildDailySignal(input: {
  personal: { number: number; root?: number | null; label: string };
  top: SkyContact | null;
  topTitle: string | null;
  vehicle: VehicleGateData | null;
}): DailySignal {
  const road = roadLamp(input.personal);
  const stoplight = stoplightLamp(input.top, input.topTitle);
  const vehicle = input.vehicle ? vehicleLamp(input.vehicle) : null;
  const overall = overallLamp([road, stoplight, ...(vehicle ? [vehicle] : [])]);
  return { overall, vehicle, road, stoplight };
}
