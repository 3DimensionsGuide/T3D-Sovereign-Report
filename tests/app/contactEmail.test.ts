import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { PRIVACY_EMAIL, SUPPORT_EMAIL } from '../../src/lib/contact';
import { FEEDBACK_EMAIL } from '../../mobile/src/lib/feedback';

const root = process.cwd();

function filesUnder(dir: string): string[] {
  return readdirSync(join(root, dir), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? filesUnder(`${dir}/${e.name}`)
      : /\.tsx?$/.test(e.name)
        ? [`${dir}/${e.name}`]
        : [],
  );
}

const ADDRESS = /[a-z0-9._-]+@3dimensions\.guide/gi;

test('the addresses are what they claim to be', () => {
  assert.equal(SUPPORT_EMAIL, 'support@3dimensions.guide');
  assert.equal(PRIVACY_EMAIL, 'privacy@3dimensions.guide');
});

/**
 * The address was a bare literal in eleven files, which is how every "contact us" on the site —
 * broken downloads, checkout questions, feedback, a request to correct a birth time — came to
 * point at the privacy address. One place to change means one place to get wrong.
 */
test('no file writes an address out by hand', () => {
  const offenders: string[] = [];
  for (const file of filesUnder('src')) {
    if (file === 'src/lib/contact.ts') continue;
    const text = readFileSync(join(root, file), 'utf8');
    for (const [i, line] of text.split('\n').entries()) {
      if (ADDRESS.test(line)) offenders.push(`${file}:${i + 1}  ${line.trim().slice(0, 80)}`);
      ADDRESS.lastIndex = 0;
    }
  }
  assert.deepEqual(offenders, [], `\n  ${offenders.join('\n  ')}\n`);
});

/**
 * The app is a separate project and cannot import from src/, so it keeps its own copy. That is
 * the one duplication allowed, and this is what stops the two drifting apart.
 */
test('the app and the website agree on the support address', () => {
  assert.equal(FEEDBACK_EMAIL, SUPPORT_EMAIL);
});

test('the app writes no address out by hand either', () => {
  const offenders: string[] = [];
  for (const file of filesUnder('mobile/src')) {
    if (file === 'mobile/src/lib/feedback.ts') continue;
    const text = readFileSync(join(root, file), 'utf8');
    for (const [i, line] of text.split('\n').entries()) {
      if (ADDRESS.test(line)) offenders.push(`${file}:${i + 1}  ${line.trim().slice(0, 80)}`);
      ADDRESS.lastIndex = 0;
    }
  }
  assert.deepEqual(offenders, [], `\n  ${offenders.join('\n  ')}\n`);
});

/**
 * The privacy address is a commitment made in the privacy policy, so it belongs on data requests
 * and nowhere else. Everything a person would call support goes to the support address.
 */
test('the privacy address is used only for data requests', () => {
  // Each of these is about data, which is the only thing the privacy address is for. A file
  // joins this list because its text is a data request — not because the test complained.
  const allowed = new Set([
    'src/app/privacy/page.tsx',
    'src/lib/report/section7/Page43DataNotes.tsx',
    // Names both addresses: deleting your data and policy questions go to privacy, and
    // everything about an order, a report or the app goes to support.
    'src/app/terms/page.tsx',
  ]);
  const users: string[] = [];
  for (const file of filesUnder('src')) {
    if (file === 'src/lib/contact.ts') continue;
    if (readFileSync(join(root, file), 'utf8').includes('PRIVACY_EMAIL')) users.push(file);
  }
  for (const file of users) {
    assert.ok(
      allowed.has(file),
      `${file} uses the privacy address. If it is not a data request, it wants SUPPORT_EMAIL.`,
    );
  }
  // And the places that must keep it, keep it.
  for (const file of allowed) assert.ok(users.includes(file), `${file} no longer uses PRIVACY_EMAIL`);
});

test('the places people actually ask for help point at support', () => {
  for (const file of [
    'src/app/checkout/page.tsx',
    'src/app/report/ReportClient.tsx',
    'src/app/api/generate-report/route.ts',
    'src/app/update-time/page.tsx',
    'src/components/home/FAQ.tsx',
    'src/components/navigation/Footer.tsx',
    'src/lib/email/sendReportEmail.ts',
    // Uses both, so it has to be checked for the support one too — a terms page that sent
    // order questions to the privacy address would be the original problem written down.
    'src/app/terms/page.tsx',
  ]) {
    assert.match(readFileSync(join(root, file), 'utf8'), /SUPPORT_EMAIL/, file);
  }
});
