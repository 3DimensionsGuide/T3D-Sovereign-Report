import { requestToday, type SkyPosition } from '@/lib/api';
import { useLocalDate } from '@/lib/useLocalDate';
import { useCachedLoad } from '@/lib/useCachedLoad';

const HOUR_MS = 60 * 60 * 1000;

/**
 * Where the planets are right now, for the wheel's "Now" ring. Saved on the phone for an hour.
 * `data` stays null when the server is older than the app and sends no positions, so the toggle stays hidden.
 */
export function useSkyNow(leadId: number | undefined, email: string | undefined) {
  const day = useLocalDate();
  const result = useCachedLoad<{ positions: SkyPosition[] | null }>({
    key: leadId && email ? `skynow|${leadId}|${day}` : null,
    fetcher: async () => {
      const today = await requestToday(leadId as number, email as string);
      return { positions: today.positions && today.positions.length ? today.positions : null };
    },
    maxAgeMs: HOUR_MS,
  });
  return { positions: result.data?.positions ?? null, loading: result.loading };
}
