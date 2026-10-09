/**
 * Removes anything personal from an error report before it leaves our server.
 * Sentry gets the error, the file and line, and the time. It does not get request
 * bodies, headers, cookies, IP addresses, or any email address that ended up in a message.
 */

import type { ErrorEvent } from '@sentry/nextjs';

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

export function redact(text: string): string {
  return text.replace(EMAIL, '[email]');
}

export function scrubEvent(event: ErrorEvent): ErrorEvent {
  if (event.request) {
    delete event.request.data;
    delete event.request.cookies;
    delete event.request.headers;
    delete event.request.query_string;
  }
  delete event.user;
  delete event.server_name;
  if (event.message) event.message = redact(event.message);
  for (const ex of event.exception?.values ?? []) {
    if (ex.value) ex.value = redact(ex.value);
  }
  return event;
}
