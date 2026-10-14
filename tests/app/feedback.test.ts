import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { feedbackUrl, FEEDBACK_EMAIL } from '../../mobile/src/lib/feedback';

const page = readFileSync('mobile/src/app/your-data.tsx', 'utf8');

test('feedback link is a mail draft with the app and phone version only', () => {
  const url = feedbackUrl('1.0.0', 'ios 18.2');
  assert.ok(url.startsWith(`mailto:${FEEDBACK_EMAIL}?subject=`));
  const body = decodeURIComponent(url.split('&body=')[1]!);
  assert.match(body, /T3D 1\.0\.0 · ios 18\.2/);
  assert.doesNotMatch(url, /birth|chart=|token/i);
});

test('About has a Send feedback button with a fallback if Mail is missing', () => {
  assert.match(page, /label="Send feedback"/);
  assert.match(page, /Linking\.openURL\(url\)\.catch/);
  assert.match(page, /Could not open Mail/);
});
