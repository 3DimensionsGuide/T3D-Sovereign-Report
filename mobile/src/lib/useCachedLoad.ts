import { useCallback, useEffect, useRef, useState } from 'react';
import { ChartRequestError } from '@/lib/api';
import { getCached, readMemory, setCached, writeMemory } from '@/lib/persistentCache';

export const FOREVER = Number.POSITIVE_INFINITY;
export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

interface Options<T> {
  /** Names this reading (chart and day). Null means there is nothing to load yet. */
  key: string | null;
  fetcher: () => Promise<T>;
  /** A saved copy newer than this is used without asking the server. */
  maxAgeMs: number;
}

/**
 * Loads a reading with a saved copy on the phone:
 *  - a saved copy shows at once, even with no signal,
 *  - an old copy is shown while a fresh one loads,
 *  - if the server cannot be reached and a copy exists, the copy stays and `offline` is true.
 */
export function useCachedLoad<T>({ key, fetcher, maxAgeMs }: Options<T>) {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const initial = key ? readMemory<T>(key) : null;
  const [data, setData] = useState<T | null>(initial?.value ?? null);
  const [savedAt, setSavedAt] = useState<number | null>(initial?.savedAt ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(key !== null && initial === null);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);
  const runId = useRef(0);

  const run = useCallback(async (force: boolean, asRefresh: boolean) => {
    const mine = ++runId.current;
    const current = () => mine === runId.current;
    if (!key) {
      setData(null);
      setLoading(false);
      return;
    }
    setError(null);

    let have = readMemory<T>(key);
    if (!have) {
      have = await getCached<T>(key);
      if (!current()) return;
      if (have) writeMemory(key, have);
    }
    if (have) {
      setData(have.value);
      setSavedAt(have.savedAt);
      if (!force && Date.now() - have.savedAt < maxAgeMs) {
        setOffline(false);
        setLoading(false);
        return;
      }
    } else {
      setData(null);
      setSavedAt(null);
    }

    if (asRefresh) setRefreshing(true);
    else if (!have) setLoading(true);
    try {
      const result = await fetcherRef.current();
      if (!current()) return;
      const entry = { value: result, savedAt: Date.now() };
      writeMemory(key, entry);
      void setCached(key, entry);
      setData(result);
      setSavedAt(entry.savedAt);
      setOffline(false);
    } catch (err) {
      if (!current()) return;
      if (have) setOffline(true);
      else setError(err instanceof ChartRequestError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      if (current()) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [key, maxAgeMs]);

  useEffect(() => {
    void run(false, false);
    return () => {
      runId.current += 1;
    };
  }, [run]);

  const retry = useCallback(async () => {
    setLoading(true);
    await run(true, false);
  }, [run]);
  const refresh = useCallback(() => run(true, true), [run]);

  return { data, error, loading, refreshing, offline, savedAt, retry, refresh };
}
