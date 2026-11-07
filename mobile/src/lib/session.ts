import * as SecureStore from 'expo-secure-store';

/**
 * Where the app's session token is kept.
 *
 * The token is the one secret this app holds, so it does not go in the ordinary saved data
 * (AsyncStorage), which is plain text inside the app's folder and can be read out of an unencrypted
 * backup. It goes in the iPhone's keychain instead.
 *
 * WHEN_UNLOCKED_THIS_DEVICE_ONLY means two things: nothing can read it while the phone is locked,
 * and it never leaves this phone — it is not copied to iCloud and does not come back when a backup
 * is restored onto a different phone. Someone restoring a backup onto a new phone simply signs in
 * again, which the app does by itself from the birth details it already holds.
 *
 * Nothing here ever logs the token.
 */

const KEY = 't3d.sessionToken';

const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

/**
 * A copy in memory so that the common case — every request on a screen — does not hit the keychain
 * each time. `undefined` means "not read yet"; `null` means "read, and there is none".
 */
let cached: string | null | undefined;

/** The saved token, or null when there is none. Never throws: a keychain problem reads as no token. */
export async function getSessionToken(): Promise<string | null> {
  if (cached !== undefined) return cached;
  try {
    cached = (await SecureStore.getItemAsync(KEY, OPTIONS)) ?? null;
  } catch {
    // No keychain here (the web preview, for instance). Hold it in memory for this run only.
    cached = null;
  }
  return cached;
}

/** Saves a freshly minted token. */
export async function setSessionToken(token: string): Promise<void> {
  cached = token;
  try {
    await SecureStore.setItemAsync(KEY, token, OPTIONS);
  } catch {
    // Keeping it in memory still gets this run's requests through; the next launch signs in again.
  }
}

/** Forgets the token — on "delete my data", and on signing out. */
export async function clearSessionToken(): Promise<void> {
  cached = null;
  try {
    await SecureStore.deleteItemAsync(KEY, OPTIONS);
  } catch {
    // Nothing saved, nothing to remove.
  }
}

/**
 * The header every app request carries. Empty when there is no token yet, which the server answers
 * with a 401 that tells the app to sign in and try again.
 */
export async function authHeader(): Promise<Record<string, string>> {
  const token = await getSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Test seam: drops the in-memory copy so the next read goes to the keychain again. */
export function resetSessionCacheForTests(): void {
  cached = undefined;
}
