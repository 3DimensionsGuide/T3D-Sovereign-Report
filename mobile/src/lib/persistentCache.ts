import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Readings kept on the phone so they open instantly and still show with no signal.
 * Every entry remembers when it was saved. Entries are named by chart and day, so one
 * person's saved copy is never shown for another chart or another day.
 */

const PREFIX = 't3d-cache-v1:';
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

export interface CacheEntry<T> {
  value: T;
  savedAt: number;
}

const memory = new Map<string, CacheEntry<unknown>>();

export function readMemory<T>(key: string): CacheEntry<T> | null {
  return (memory.get(key) as CacheEntry<T> | undefined) ?? null;
}

export function writeMemory<T>(key: string, entry: CacheEntry<T>): void {
  memory.set(key, entry);
}

export async function getCached<T>(key: string): Promise<CacheEntry<T> | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (typeof parsed?.savedAt !== 'number' || !('value' in parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function setCached<T>(key: string, entry: CacheEntry<T>): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // A full or unavailable disk only means no saved copy; the app still works.
  }
}

/** Removes every saved reading (used by "Delete my data"). */
export async function clearAllCached(): Promise<void> {
  memory.clear();
  try {
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX));
    if (keys.length) await AsyncStorage.multiRemove(keys);
  } catch {
    // Nothing more to do.
  }
}

/** Drops saved readings older than two weeks, so old days do not pile up. */
export async function pruneCache(now: number = Date.now()): Promise<void> {
  try {
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX));
    const old: string[] = [];
    for (const k of keys) {
      const raw = await AsyncStorage.getItem(k);
      let savedAt = 0;
      try { savedAt = (JSON.parse(raw ?? '{}') as { savedAt?: number }).savedAt ?? 0; } catch { savedAt = 0; }
      if (now - savedAt > MAX_AGE_MS) old.push(k);
    }
    if (old.length) await AsyncStorage.multiRemove(old);
  } catch {
    // Nothing more to do.
  }
}
