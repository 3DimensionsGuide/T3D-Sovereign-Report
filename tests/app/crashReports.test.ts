import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ErrorEvent } from '@sentry/nextjs';
import { redact, scrubEvent } from '../../src/lib/sentryScrub';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

test('crash reports: email addresses are redacted from messages', () => {
  assert.equal(redact('no chart for tyler@example.com found'), 'no chart for [email] found');
});

test('crash reports: request details, user and server name are removed', () => {
  const event = {
    type: undefined,
    message: 'failed for a.b+c@mail.co',
    request: { url: 'https://x/api', data: { birthDate: '1990-01-01' }, cookies: { a: 'b' }, headers: { cookie: 'x' }, query_string: 'email=a@b.co' },
    user: { email: 'a@b.co', ip_address: '1.2.3.4' },
    server_name: 'host',
    exception: { values: [{ type: 'Error', value: 'bad input from me@x.io' }] },
  } as unknown as ErrorEvent;
  const out = scrubEvent(event);
  assert.equal(out.request?.data, undefined);
  assert.equal(out.request?.cookies, undefined);
  assert.equal(out.request?.headers, undefined);
  assert.equal(out.request?.query_string, undefined);
  assert.equal(out.user, undefined);
  assert.equal(out.server_name, undefined);
  assert.equal(out.message, 'failed for [email]');
  assert.equal(out.exception?.values?.[0]?.value, 'bad input from [email]');
});

test('crash reports: the server collects no personal data and sends nothing without a DSN', () => {
  const src = read('src/instrumentation.ts');
  for (const rule of ['userInfo: false', 'cookies: false', 'httpHeaders: false', 'httpBodies: []', 'urlQueryParams: false', 'databaseQueryData: false', 'stackFrameVariables: false']) {
    assert.ok(src.includes(rule), rule);
  }
  assert.match(src, /if \(!dsn/);
  assert.match(src, /beforeSend: scrubEvent/);
});

test('crash reports: the app sends nothing without a DSN and drops breadcrumbs, user and requests', () => {
  const src = read('mobile/src/lib/sentry.ts');
  assert.match(src, /if \(!dsn\) return/);
  assert.match(src, /sendDefaultPii: false/);
  assert.match(src, /beforeSend: scrubEvent/);
  assert.match(src, /beforeBreadcrumb: \(\) => null/);
  assert.match(src, /delete event\.user/);
});

test('the test crash route and button exist only for development', () => {
  assert.match(read('src/app/api/sentry-test/route.ts'), /devOnlyGuard\(\)/);
  assert.match(read('mobile/src/app/your-data.tsx'), /__DEV__ && crashReportingOn/);
});
