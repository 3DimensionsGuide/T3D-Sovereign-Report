import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkReportToken, makeReportToken, reportDownloadUrl } from '../../src/server/reportLinks';

const NOW = Date.UTC(2026, 9, 9, 12, 0, 0);

function withSecret<T>(secret: string | undefined, fallback: string | undefined, run: () => T): T {
  const a = process.env.REPORT_LINK_SECRET;
  const b = process.env.STRIPE_WEBHOOK_SECRET;
  if (secret === undefined) delete process.env.REPORT_LINK_SECRET; else process.env.REPORT_LINK_SECRET = secret;
  if (fallback === undefined) delete process.env.STRIPE_WEBHOOK_SECRET; else process.env.STRIPE_WEBHOOK_SECRET = fallback;
  try {
    return run();
  } finally {
    if (a === undefined) delete process.env.REPORT_LINK_SECRET; else process.env.REPORT_LINK_SECRET = a;
    if (b === undefined) delete process.env.STRIPE_WEBHOOK_SECRET; else process.env.STRIPE_WEBHOOK_SECRET = b;
  }
}

const SECRET = 'test-secret-with-enough-length-1234567890';

test('a fresh token for the same order is accepted', () => {
  withSecret(SECRET, undefined, () => {
    const t = makeReportToken(42, 600, NOW);
    assert.equal(checkReportToken(42, t, NOW + 1000), 'ok');
  });
});

test('a token for one order does not open another order', () => {
  withSecret(SECRET, undefined, () => {
    const t = makeReportToken(42, 600, NOW);
    assert.equal(checkReportToken(43, t, NOW), 'invalid');
    assert.equal(checkReportToken(1, t, NOW), 'invalid');
  });
});

test('an expired token is refused', () => {
  withSecret(SECRET, undefined, () => {
    const t = makeReportToken(42, 600, NOW);
    assert.equal(checkReportToken(42, t, NOW + 601_000), 'expired');
    assert.equal(checkReportToken(42, t, NOW + 599_000), 'ok');
  });
});

test('a changed expiry or signature is refused', () => {
  withSecret(SECRET, undefined, () => {
    const t = makeReportToken(42, 600, NOW) as string;
    const [exp, sig] = t.split('.');
    assert.equal(checkReportToken(42, `${Number(exp) + 99999}.${sig}`, NOW), 'invalid');
    const flipped = sig.slice(0, -1) + (sig.endsWith('0') ? '1' : '0');
    assert.equal(checkReportToken(42, `${exp}.${flipped}`, NOW), 'invalid');
  });
});

test('missing and malformed tokens are refused', () => {
  withSecret(SECRET, undefined, () => {
    assert.equal(checkReportToken(42, null, NOW), 'missing');
    assert.equal(checkReportToken(42, '', NOW), 'missing');
    assert.equal(checkReportToken(42, 'abc', NOW), 'malformed');
    assert.equal(checkReportToken(42, '123.zz', NOW), 'malformed');
  });
});

test('a token made with a different secret is refused', () => {
  const t = withSecret(SECRET, undefined, () => makeReportToken(42, 600, NOW));
  withSecret('another-secret-with-enough-length-0987654321', undefined, () => {
    assert.equal(checkReportToken(42, t, NOW), 'invalid');
  });
});

test('with no secret at all nothing is made and nothing is accepted', () => {
  withSecret(undefined, undefined, () => {
    assert.equal(makeReportToken(42, 600, NOW), null);
    assert.equal(checkReportToken(42, 'x', NOW), 'unconfigured');
    assert.equal(reportDownloadUrl('https://example.com', 42, 600), null);
  });
});

test('the webhook secret is used when no dedicated secret is set', () => {
  withSecret(undefined, 'whsec_test_secret_with_enough_length_123', () => {
    const t = makeReportToken(7, 600, NOW);
    assert.ok(t);
    assert.equal(checkReportToken(7, t, NOW), 'ok');
  });
});

test('order numbers that are not whole positive numbers get no token', () => {
  withSecret(SECRET, undefined, () => {
    assert.equal(makeReportToken(0, 600, NOW), null);
    assert.equal(makeReportToken(-3, 600, NOW), null);
    assert.equal(makeReportToken(1.5, 600, NOW), null);
  });
});

test('the download URL carries the order number and a token', () => {
  withSecret(SECRET, undefined, () => {
    const url = reportDownloadUrl('https://example.com/', 5, 600) as string;
    assert.match(url, /^https:\/\/example\.com\/api\/generate-report\?orderId=5&t=\d+\.[0-9a-f]{64}$/);
  });
});
