import { useMeetTriadStore } from '@/store/useMeetTriadStore';

/**
 * Whether this person has Premium. Until subscriptions exist this is the developer preview switch
 * (off for everyone). When purchases arrive, only this hook changes.
 */
export function usePremium(): boolean {
  return useMeetTriadStore((s) => s.premium);
}
