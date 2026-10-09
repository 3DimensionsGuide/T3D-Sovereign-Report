import * as Sentry from '@sentry/react-native';

/**
 * Crash reporting. Turns on only when EXPO_PUBLIC_SENTRY_DSN is set, so nothing is sent
 * from a computer or build that does not have it. Personal data is stripped before sending:
 * no user, no request details, no breadcrumbs, and email addresses are redacted from messages.
 */

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const redact = (text: string): string => text.replace(EMAIL, '[email]');

export function scrubEvent(event: Sentry.ErrorEvent): Sentry.ErrorEvent {
  if (event.request) {
    delete event.request.data;
    delete event.request.cookies;
    delete event.request.headers;
    delete event.request.query_string;
  }
  delete event.user;
  if (event.message) event.message = redact(event.message);
  for (const ex of event.exception?.values ?? []) {
    if (ex.value) ex.value = redact(ex.value);
  }
  return event;
}

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

export const crashReportingOn = Boolean(dsn);

export function initCrashReporting(): void {
  if (!dsn) return;
  Sentry.init({
    dsn,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    attachScreenshot: false,
    beforeSend: scrubEvent,
    beforeBreadcrumb: () => null,
  });
}

export function sendTestCrashReport(): void {
  Sentry.captureException(new Error('T3D test error from the app (test address: test@example.com)'));
}

export const wrapRoot = Sentry.wrap;
