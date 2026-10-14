/**
 * Heads-up notifications built from the person's own Timeline: the Sun entering a gate, the Moon completing
 * one of their channels, the Moon changing sign. They are scheduled on the phone itself, so no server and no
 * account is involved. Each one states a fact about the sky and never says anything about the person's day.
 * Pure, with no imports, so tests can use it directly.
 */
export type AlertKind = 'gate' | 'moonChannel' | 'moonSign';

export interface AlertPrefs {
  gate: boolean;
  moonChannel: boolean;
  moonSign: boolean;
}

export interface PlannedAlert {
  /** Stable, so the same event always has the same id. Always starts with "alert-". */
  id: string;
  kind: AlertKind;
  /** When to show it, in epoch milliseconds, already moved out of quiet hours. */
  atMs: number;
  title: string;
  body: string;
}

/** The slice of the Timeline result the alerts read. */
export interface AlertSource {
  gateToday?: { gates: { gate: number; name: string; from: string | null }[]; moon?: AlertMoonChannel[] };
  gateDays?: { gates: { gate: number; name: string; from: string | null }[]; moon?: AlertMoonChannel[] }[];
  moonDays?: { segments: { sign: string; house: number; from: string | null }[] }[];
}
interface AlertMoonChannel { gate: number; channel: string; channelName: string; from: string | null }

/** The most this adds to the phone's pending list; iOS keeps at most 64 in all, and the daily reminder uses one. */
export const MAX_ALERTS = 40;
/** Nothing is shown between these local hours; an alert that falls inside waits until the morning. */
export const QUIET_START_HOUR = 22;
export const QUIET_END_HOUR = 7;

export const NO_ALERTS: AlertPrefs = { gate: false, moonChannel: false, moonSign: false };

export function anyAlertOn(p: AlertPrefs): boolean {
  return p.gate || p.moonChannel || p.moonSign;
}

/** Moves a time that falls in quiet hours to the end of them (07:00 local). */
export function outOfQuietHours(ms: number): number {
  const d = new Date(ms);
  const h = d.getHours();
  if (h >= QUIET_END_HOUR && h < QUIET_START_HOUR) return ms;
  const next = new Date(d);
  if (h >= QUIET_START_HOUR) next.setDate(next.getDate() + 1);
  next.setHours(QUIET_END_HOUR, 0, 0, 0);
  return next.getTime();
}

function ordinal(n: number): string {
  const v = n % 100;
  const suffix = v >= 11 && v <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th';
  return `${n}${suffix}`;
}

/** The upcoming alerts for the chosen categories, earliest first, with no repeats and never in the past. */
export function planAlerts(source: AlertSource | null | undefined, prefs: AlertPrefs, nowMs: number): PlannedAlert[] {
  if (!source || !anyAlertOn(prefs)) return [];
  const out = new Map<string, PlannedAlert>();
  const add = (kind: AlertKind, iso: string | null, key: string, title: string, body: string) => {
    if (!iso) return;
    const raw = Date.parse(iso);
    if (!Number.isFinite(raw)) return;
    const atMs = outOfQuietHours(raw);
    if (atMs <= nowMs + 30_000) return;
    const id = `alert-${kind}-${key}-${new Date(raw).toISOString()}`;
    if (!out.has(id)) out.set(id, { id, kind, atMs, title, body });
  };

  const days = [
    ...(source.gateToday ? [source.gateToday] : []),
    ...(source.gateDays ?? []),
  ];
  for (const day of days) {
    if (prefs.gate) {
      for (const g of day.gates) {
        add('gate', g.from, String(g.gate), `The Sun enters Gate ${g.gate}`, `${g.name}. Open Today to see how it meets your chart.`);
      }
    }
    if (prefs.moonChannel) {
      for (const m of day.moon ?? []) {
        add(
          'moonChannel', m.from, `${m.channel}`, `The Moon completes Channel ${m.channel}`,
          `${m.channelName ? `${m.channelName}. ` : ''}A spark, not a decision. Open Today for the reading.`,
        );
      }
    }
  }
  if (prefs.moonSign) {
    for (const day of source.moonDays ?? []) {
      for (const s of day.segments) {
        add('moonSign', s.from, s.sign, `The Moon moves into ${s.sign}`, `It now moves through your ${ordinal(s.house)} house.`);
      }
    }
  }
  return [...out.values()].sort((a, b) => a.atMs - b.atMs).slice(0, MAX_ALERTS);
}
