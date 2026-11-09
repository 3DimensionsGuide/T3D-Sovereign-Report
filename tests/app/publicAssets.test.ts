import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const root = process.cwd();

function sourceText(): string {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(join(root, dir), { withFileTypes: true })) {
      if (e.isDirectory()) walk(`${dir}/${e.name}`);
      else if (/\.(tsx?|css|json|md)$/.test(e.name)) files.push(`${dir}/${e.name}`);
    }
  };
  walk('src');
  return files.map((f) => readFileSync(join(root, f), 'utf8')).join('\n');
}

const LOGOS = 'public/logos';

/**
 * The mobile app has had this check for its own assets; the website had none, and three logo
 * files sat in public/ referenced by nothing — 2.7MB of them, deployed on every build, including
 * a 2.2MB hero image no page had ever used.
 */
test('every logo in public ships because something uses it', () => {
  const code = sourceText();
  const unused = readdirSync(join(root, LOGOS)).filter((f) => !code.includes(f));
  assert.deepEqual(
    unused,
    [],
    `\n  Unused, and deployed anyway:\n    ${unused.join('\n    ')}\n` +
      `  Either use it or remove it — git keeps the file either way.\n`,
  );
});

test('the logos folder has not quietly grown', () => {
  // Not a style rule: public/ is served as-is and every byte is in the deployment. A new logo
  // that pushes this over wants a second look at its size, not a bigger number here.
  const bytes = readdirSync(join(root, LOGOS))
    .map((f) => statSync(join(root, LOGOS, f)).size)
    .reduce((a, b) => a + b, 0);
  const mb = bytes / 1024 / 1024;
  assert.ok(mb < 4, `public/logos is ${mb.toFixed(1)}MB`);
});
