/**
 * Human Design gate changes for the Timeline's Vehicle lens (server-side only).
 *
 * The Sun spends about 5 to 6 days in each gate and the Moon about 2 to 3. Each time one of them
 * enters a new gate we measure that gate against the person's own gates, the same way the Today
 * Signal does (see signal.ts):
 *  - the Sun is listed for every gate it enters, tagged electromagnetic, companionship, amplified
 *    or flavor;
 *  - the Moon is listed only on the days it completes one of the person's channels
 *    (electromagnetic), because it changes gate far too often to list every day.
 * These are conditions, never decisions: Strategy and Authority decide.
 */

import {
  DEGREES_PER_GATE,
  GATE_CENTER_MAP,
  GATE_SEQUENCE,
  MANDALA_START_LON,
  UNIQUE_CHANNELS,
  longitudeToGate,
} from '../../server/engines/human_design';
import { contactFor, type Contact, type VehicleGateData } from './signal';

export type GateBody = 'sun' | 'moon';

export interface GateEvent {
  id: string;
  /** Exact moment the body enters the gate, ISO timestamp (UTC). */
  at: string;
  kind: 'gate';
  title: string;
  detail: string;
  body: GateBody;
  nature: 'neutral';
  gate: number;
  /** The line the body is in as it enters. */
  line: number;
  contact: Contact;
  /** The channel involved, as "a-b", when there is one. */
  channel?: string;
  /** When the body leaves the gate, ISO timestamp (UTC). */
  until: string;
}

export interface GateVehicle {
  type: string | null;
  authority: string | null;
  natalGates: readonly number[];
  undefinedCenters: readonly string[];
}

const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);
const MS_PER_DAY = 86_400_000;
const jdToIso = (jd: number): string => new Date(J2000_MS + (jd - 2451545.0) * MS_PER_DAY).toISOString();

const normalize = (deg: number): number => ((deg % 360) + 360) % 360;
const signedDiff = (a: number, b: number): number => ((a - b + 540) % 360) - 180;

const STEP: Record<GateBody, number> = { sun: 0.25, moon: 0.05 };
const WHO: Record<GateBody, string> = { sun: 'Sun', moon: 'Moon' };

function centerName(id: string): string {
  const words = id.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function bisect(f: (jd: number) => number, a: number, b: number): number {
  let lo = a;
  let hi = b;
  const flo = f(lo);
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if ((f(mid) < 0) === (flo < 0)) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

interface Ingress { jd: number; gate: number; line: number }

/** Every moment `body` enters a new gate between startJd and stopJd (the first entry is the first change after startJd). */
function ingresses(body: GateBody, startJd: number, stopJd: number, lonAt: (b: GateBody, jd: number) => number): Ingress[] {
  const out: Ingress[] = [];
  const step = STEP[body];
  let jd = startJd;
  let gate = longitudeToGate(lonAt(body, jd)).gate;
  while (jd < stopJd) {
    const next = jd + step;
    const g = longitudeToGate(lonAt(body, next)).gate;
    if (g !== gate) {
      const boundary = normalize(MANDALA_START_LON + GATE_SEQUENCE.indexOf(g) * DEGREES_PER_GATE);
      const at = bisect((j) => signedDiff(lonAt(body, j), boundary), jd, next);
      const entered = longitudeToGate(lonAt(body, at + 1 / 1440));
      out.push({ jd: at, gate: entered.gate, line: entered.line });
      gate = entered.gate;
    }
    jd = next;
  }
  return out;
}

function sentence(who: string, gate: number, contact: Contact, channel: string | undefined, centerId: string | undefined): string {
  switch (contact) {
    case 'electromagnetic':
      return `Gate ${gate} is the missing half of your Channel ${channel}. While the ${who} is here that channel is lit for you: a spark, not a decision.`;
    case 'companionship':
      return `Gate ${gate} is part of Channel ${channel}, which you already hold: an easy match.`;
    case 'amplified':
      return `Gate ${gate} sits in your open ${centerId ? centerName(centerId) : 'center'}, so its energy is amplified. Do not take it as your own.`;
    default:
      return `Gate ${gate} adds a flavor to what is already steady in you.`;
  }
}

/**
 * The Vehicle events for a date range. `lonAt` returns the body's ecliptic longitude at a Julian day
 * (passed in so this stays testable without the ephemeris).
 */
export function buildGateEvents(
  startJd: number,
  endJd: number,
  vehicle: GateVehicle,
  lonAt: (b: GateBody, jd: number) => number,
): GateEvent[] {
  const data: VehicleGateData = {
    type: vehicle.type,
    authority: vehicle.authority,
    natalGates: vehicle.natalGates,
    undefinedCenters: vehicle.undefinedCenters,
    transit: { sun: 0, moon: 0 },
    channels: UNIQUE_CHANNELS.map((c) => c.gates),
    gateCenter: GATE_CENTER_MAP,
  };
  const events: GateEvent[] = [];
  for (const body of ['sun', 'moon'] as const) {
    // Look a little past the end so the last gate in range still knows when it ends.
    const list = ingresses(body, startJd, endJd + 8, lonAt);
    list.forEach((ing, i) => {
      if (ing.jd >= endJd) return;
      const c = contactFor(WHO[body] as 'Sun' | 'Moon', ing.gate, data, 0);
      if (body === 'moon' && c.kind !== 'electromagnetic') return;
      const next = list[i + 1];
      const until = jdToIso(next ? next.jd : ing.jd + (body === 'sun' ? 5.7 : 2.3));
      const channel = c.channel ?? undefined;
      events.push({
        id: `gate-${body}-${ing.gate}-${Math.round(ing.jd * 1000)}`,
        at: jdToIso(ing.jd),
        kind: 'gate',
        title: c.kind === 'electromagnetic'
          ? `${WHO[body]} enters Gate ${ing.gate}: completes your Channel ${channel}`
          : `${WHO[body]} enters Gate ${ing.gate}`,
        detail: sentence(WHO[body], ing.gate, c.kind, channel, GATE_CENTER_MAP[ing.gate]),
        body,
        nature: 'neutral',
        gate: ing.gate,
        line: ing.line,
        contact: c.kind,
        channel,
        until,
      });
    });
  }
  return events;
}
