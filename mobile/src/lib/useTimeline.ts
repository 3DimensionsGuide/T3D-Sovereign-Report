import { useCallback, useEffect, useState } from 'react';
import { ChartRequestError, requestTimeline } from '@/lib/api';
import type { TimelineResult } from '@/lib/timelineTypes';

/** The person's own calendar date on this phone, as YYYY-MM-DD. */
export function localDateString(now: Date = new Date()): string {
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${m}-${d}`;
}

const cache = new Map<string, TimelineResult>();

export function useTimeline(leadId: number | undefined, email: string | undefined, days = 60) {
  const [data, setData] = useState<TimelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (force: boolean) => {
      if (!leadId || !email) return;
      const localDate = localDateString();
      const key = `${leadId}|${localDate}|${days}`;
      if (!force) {
        const hit = cache.get(key);
        if (hit) {
          setData(hit);
          return;
        }
      }
      setError(null);
      try {
        const result = await requestTimeline(leadId, email, {
          localDate,
          tzOffsetMinutes: new Date().getTimezoneOffset(),
          days,
        });
        cache.set(key, result);
        setData(result);
      } catch (err) {
        setError(err instanceof ChartRequestError ? err.message : 'Something went wrong. Please try again.');
      }
    },
    [leadId, email, days],
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    load(false).finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  }, [load]);

  const retry = useCallback(async () => {
    setLoading(true);
    await load(true);
    setLoading(false);
  }, [load]);

  return { data, error, loading, refreshing, refresh, retry };
}
