import { success, warn } from '@/lib/haptics';
import { useToastStore } from '@/store/useToastStore';

/**
 * Instant, plain-words confirmation that an action worked or did not.
 * Say what happened in the same verb the button used: "Save to my log" gives "Saved to your log".
 */
export const toast = {
  success(text: string): void {
    success();
    useToastStore.getState().show('success', text);
  },
  error(text: string): void {
    warn();
    useToastStore.getState().show('error', text);
  },
};
