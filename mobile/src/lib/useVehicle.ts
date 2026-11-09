import { requestVehicle } from '@/lib/api';
import type { VehicleDetail } from '@/lib/vehicleTypes';
import { ONE_DAY_MS, useCachedLoad } from '@/lib/useCachedLoad';

/** A saved copy opens instantly and works with no signal; it refreshes in the background after a day. */
export function useVehicle(leadId: number | undefined, birthTimeKnown: boolean) {
  const result = useCachedLoad<VehicleDetail>({
    // birthTimeKnown is in the key, not just the request: the two readings differ, and a copy
    // saved before a birth time was added must not be served afterwards as though it had one.
    key: leadId ? `vehicle|${leadId}|${birthTimeKnown ? 'time' : 'notime'}` : null,
    fetcher: () => requestVehicle(birthTimeKnown),
    maxAgeMs: ONE_DAY_MS,
  });
  return result;
}
