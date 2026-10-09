/**
 * Runs once when the server starts. Turns on crash reporting (Sentry) when SENTRY_DSN is set.
 * With no SENTRY_DSN nothing is sent, so this is safe on any computer.
 * Personal data is stripped by scrubEvent before anything leaves the server.
 */

import * as Sentry from '@sentry/nextjs';
import { scrubEvent } from '@/lib/sentryScrub';

export async function register(): Promise<void> {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn || process.env.NEXT_RUNTIME !== 'nodejs') return;
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development',
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    // Collect nothing about the person: no user, cookies, headers, request bodies, query
    // strings, database values or the values of local variables in a stack trace.
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      databaseQueryData: false,
      queues: false,
      stackFrameVariables: false,
      genAI: { inputs: false, outputs: false },
      graphQL: { document: false, variables: false },
    },
    tracesSampleRate: 0,
    // Set SENTRY_DEBUG=1 to print what Sentry is doing in the Terminal.
    debug: process.env.SENTRY_DEBUG === '1',
    beforeSend: scrubEvent,
    beforeBreadcrumb: () => null,
  });
}

export const onRequestError = Sentry.captureRequestError;
