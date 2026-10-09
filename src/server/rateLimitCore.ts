/**
 * Rate limiting: the plain logic, with no outside packages, so it can be tested.
 *
 * Each request is counted against a key (bucket + the caller's address) in a fixed time
 * window. When the count passes the limit, the request is refused until the window ends.
 * The counters live in a store: Upstash Redis in production (shared by every server),
 * or plain memory (per server, a weaker fallback).
 */

export interface CounterStore {
  /** Adds one to the counter for `key` and returns the new count. A new counter lives for `windowSec`. */
  hit(key: string, windowSec: number): Promise<number>;
  /** Current count for `key`, without adding to it. */
  peek(key: string): Promise<number>;
}

export interface BucketRule {
  limit: number;
  windowSec: number;
}

export const BUCKETS = {
  /** Reading routes used by the app. */
  app: { limit: 120, windowSec: 60 },
  /** Wrong leadId and email pairs. Past this, the caller is blocked from the app routes. */
  authFail: { limit: 15, windowSec: 15 * 60 },
  /** Creating a chart (writes a database row and looks up the place). */
  calculate: { limit: 10, windowSec: 60 * 60 },
  /** The first-launch preview (date only, nothing saved). */
  preview: { limit: 30, windowSec: 10 * 60 },
  /** Looking up a birth city. */
  place: { limit: 40, windowSec: 10 * 60 },
  /** Starting a checkout. */
  checkout: { limit: 10, windowSec: 60 * 60 },
  /** Asking for a download link after paying. */
  reportLink: { limit: 20, windowSec: 10 * 60 },
  /** Downloading a report (builds a PDF). */
  download: { limit: 20, windowSec: 10 * 60 },
  /** Admin tools. */
  admin: { limit: 10, windowSec: 60 * 60 },
} as const satisfies Record<string, BucketRule>;

export type BucketName = keyof typeof BUCKETS;

export interface LimitResult {
  allowed: boolean;
  retryAfterSec: number;
}

/** Counters held in memory. Used for tests and as a fallback when Upstash is not set up. */
export class MemoryStore implements CounterStore {
  private readonly counters = new Map<string, { count: number; expiresAt: number }>();

  constructor(private readonly now: () => number = Date.now) {}

  private live(key: string): { count: number; expiresAt: number } | undefined {
    const entry = this.counters.get(key);
    if (entry && entry.expiresAt <= this.now()) {
      this.counters.delete(key);
      return undefined;
    }
    return entry;
  }

  async hit(key: string, windowSec: number): Promise<number> {
    const entry = this.live(key);
    if (entry) {
      entry.count += 1;
      return entry.count;
    }
    if (this.counters.size > 5000) this.sweep();
    this.counters.set(key, { count: 1, expiresAt: this.now() + windowSec * 1000 });
    return 1;
  }

  async peek(key: string): Promise<number> {
    return this.live(key)?.count ?? 0;
  }

  private sweep(): void {
    const t = this.now();
    for (const [k, v] of this.counters) if (v.expiresAt <= t) this.counters.delete(k);
  }
}

const keyFor = (bucket: BucketName, id: string) => `t3d:rl:${bucket}:${id}`;

/** Counts one request. Allowed while the count is within the bucket's limit. */
export async function checkLimit(store: CounterStore, bucket: BucketName, id: string): Promise<LimitResult> {
  const rule: BucketRule = BUCKETS[bucket];
  const count = await store.hit(keyFor(bucket, id), rule.windowSec);
  return count <= rule.limit ? { allowed: true, retryAfterSec: 0 } : { allowed: false, retryAfterSec: rule.windowSec };
}

/** True when this caller has made too many wrong leadId and email guesses recently. */
export async function isBlockedForGuessing(store: CounterStore, id: string): Promise<boolean> {
  return (await store.peek(keyFor('authFail', id))) >= BUCKETS.authFail.limit;
}

/** Records one wrong leadId and email pair for this caller. */
export async function recordGuess(store: CounterStore, id: string): Promise<void> {
  await store.hit(keyFor('authFail', id), BUCKETS.authFail.windowSec);
}

/** The caller's address, as set by Vercel in front of the app. */
export function clientId(headers: { get(name: string): string | null }): string {
  const forwarded = headers.get('x-forwarded-for');
  const first = forwarded?.split(',')[0]?.trim();
  const candidate = first || headers.get('x-real-ip')?.trim() || '';
  return /^[0-9a-fA-F:.]{3,45}$/.test(candidate) ? candidate : 'unknown';
}
