/**
 * Rate limiting for API routes.
 *
 *   const limited = await limitRequest(request, 'calculate');
 *   if (limited) return limited;
 *
 * Counters are kept in Upstash Redis when UPSTASH_REDIS_REST_URL and
 * UPSTASH_REDIS_REST_TOKEN are set (the Vercel Marketplace also names them
 * KV_REST_API_URL and KV_REST_API_TOKEN). Without them, counters are kept in memory,
 * which is weaker because every server keeps its own count.
 *
 * If the counter service has a problem, requests are allowed through (and logged).
 * A broken limiter should never take the app down.
 */

import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import {
  BUCKETS, MemoryStore, checkLimit, clientId, isBlockedForGuessing, recordGuess,
  type BucketName, type CounterStore,
} from '@/server/rateLimitCore';

class UpstashStore implements CounterStore {
  constructor(private readonly redis: Redis) {}

  async hit(key: string, windowSec: number): Promise<number> {
    // Start the counter with an expiry only if it does not exist yet, then add one.
    const results = await this.redis.pipeline().set(key, 0, { nx: true, ex: windowSec }).incr(key).exec();
    return Number(results[1]);
  }

  async peek(key: string): Promise<number> {
    return Number((await this.redis.get<number>(key)) ?? 0);
  }
}

let store: CounterStore | null = null;
let warned = false;

function getStore(): CounterStore {
  if (store) return store;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) {
    store = new UpstashStore(new Redis({ url, token }));
  } else {
    if (!warned && process.env.NODE_ENV === 'production') {
      console.warn('[Rate limit] Upstash is not configured; using per-server memory counters (weaker).');
      warned = true;
    }
    store = new MemoryStore();
  }
  return store;
}

function tooMany(retryAfterSec: number): NextResponse {
  return NextResponse.json(
    { success: false, error: 'Too many requests. Please wait a little while and try again.' },
    { status: 429, headers: { 'Retry-After': String(Math.max(1, retryAfterSec)), 'Cache-Control': 'no-store' } },
  );
}

/** Counts this request. Returns a 429 response to send back when the caller is over the limit, otherwise null. */
export async function limitRequest(request: Request, bucket: BucketName): Promise<NextResponse | null> {
  try {
    const s = getStore();
    const id = clientId(request.headers);
    if (bucket === 'app' && (await isBlockedForGuessing(s, id))) return tooMany(BUCKETS.authFail.windowSec);
    const result = await checkLimit(s, bucket, id);
    return result.allowed ? null : tooMany(result.retryAfterSec);
  } catch (error: unknown) {
    console.error('[Rate limit] Counter problem; allowing the request:', error instanceof Error ? error.message : 'unknown');
    return null;
  }
}

/** Call when a leadId and email pair did not match. Repeated misses block the caller from the app routes for a while. */
export async function noteAccessFailure(request: Request): Promise<void> {
  try {
    await recordGuess(getStore(), clientId(request.headers));
  } catch (error: unknown) {
    console.error('[Rate limit] Could not record a failed guess:', error instanceof Error ? error.message : 'unknown');
  }
}
