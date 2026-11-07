import type { ChartDrawingData } from '@/charts/chartTypes';
import { requestChartData } from '@/lib/api';
import { ONE_DAY_MS, useCachedLoad } from '@/lib/useCachedLoad';

/** Drawing data for a chart. A saved copy opens instantly and works with no signal. */
export function useChartData(leadId: number | undefined) {
  const result = useCachedLoad<ChartDrawingData>({
    key: leadId ? `chartdata|${leadId}` : null,
    fetcher: () => requestChartData(),
    maxAgeMs: ONE_DAY_MS,
  });
  return result;
}
