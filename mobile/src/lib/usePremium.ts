import { SUBSCRIPTIONS_OPEN } from '@/lib/premium';
import { useMeetTriadStore } from '@/store/useMeetTriadStore';

/**
 * Whether this person has Premium. Version 1 has every feature free, so this is true for everyone until
 * SUBSCRIPTIONS_OPEN is turned on. After that it is the developer preview switch until purchases arrive,
 * when only this hook changes.
 */
export function usePremium(): boolean {
  const stored = useMeetTriadStore((s) => s.premium);
  return !SUBSCRIPTIONS_OPEN || stored;
}
