/**
 * Back up and restore what lives only on this phone: check-ins, decisions, My Tribe, and the Meet your Triad notes.
 * The backup is one block of text the person keeps (in Notes, an email to themselves, Files). It is never sent to us.
 * Pure code (no React), so it can be tested.
 */

/** The saved keys that belong in a backup, with the plain name shown to the person. */
export const BACKUP_KEYS: Readonly<Record<string, string>> = {
  't3d-daylog-v1': 'Daily check-ins',
  't3d-practice-v1': 'Practice and decisions',
  't3d-partner-v1': 'My Tribe',
  't3d-meet-triad-v1': 'Meet your Triad',
};

const HEADER = 'T3D-BACKUP-1';
const MAX_CHARS = 2_000_000;

/** A short check value that catches a backup that was cut off or edited by accident. Not a security feature. */
export function checksum(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export type Entries = Record<string, string>;

/** `raw` holds each key's saved text, or null when nothing is saved under it. */
export function buildBackup(raw: Record<string, string | null>, now = new Date()): string {
  const data: Entries = {};
  for (const key of Object.keys(BACKUP_KEYS)) {
    const v = raw[key];
    if (typeof v === 'string' && v.length > 0) data[key] = v;
  }
  const body = JSON.stringify({ v: 1, at: now.toISOString(), data });
  return `${HEADER} ${body} #${checksum(body)}`;
}

export type ParsedBackup =
  | { ok: true; entries: Entries; at: string; names: string[] }
  | { ok: false; reason: string };

export function parseBackup(text: string): ParsedBackup {
  const t = text.trim();
  if (t.length > MAX_CHARS) return { ok: false, reason: 'That is too large to be a T3D backup.' };
  if (!t.startsWith(`${HEADER} `)) return { ok: false, reason: 'This does not look like a T3D backup. It should start with T3D-BACKUP-1.' };
  const cut = t.lastIndexOf(' #');
  if (cut < 0) return { ok: false, reason: 'The backup looks cut off at the end. Paste the whole block.' };
  const body = t.slice(HEADER.length + 1, cut);
  if (checksum(body) !== t.slice(cut + 2)) return { ok: false, reason: 'The backup looks cut off or changed. Paste the whole block again.' };
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return { ok: false, reason: 'The backup could not be read. Paste the whole block again.' };
  }
  const obj = parsed as { v?: unknown; at?: unknown; data?: unknown };
  if (obj.v !== 1 || typeof obj.data !== 'object' || obj.data === null) return { ok: false, reason: 'This backup is from a different version of T3D.' };
  const entries: Entries = {};
  for (const [key, value] of Object.entries(obj.data as Record<string, unknown>)) {
    if (!(key in BACKUP_KEYS) || typeof value !== 'string') continue;
    try {
      const inner = JSON.parse(value) as { state?: unknown };
      if (typeof inner.state !== 'object' || inner.state === null) continue;
    } catch {
      continue;
    }
    entries[key] = value;
  }
  const keys = Object.keys(entries);
  if (keys.length === 0) return { ok: false, reason: 'There is nothing in this backup to restore.' };
  return { ok: true, entries, at: typeof obj.at === 'string' ? obj.at : '', names: keys.map((k) => BACKUP_KEYS[k]!) };
}
