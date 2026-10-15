import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';

const read = (p: string) => readFileSync(p, 'utf8');

test('shared links get a picture, a title and a description', () => {
  const layout = read('src/app/layout.tsx');
  assert.match(layout, /openGraph: \{[\s\S]*type: 'website'/);
  assert.match(layout, /card: 'summary_large_image'/);
  assert.match(layout, /canonical: '\//);
  for (const f of ['src/app/opengraph-image.png', 'src/app/twitter-image.png']) {
    assert.ok(existsSync(f) && statSync(f).size > 20000, f);
    const header = readFileSync(f).subarray(0, 24);
    assert.equal(header.readUInt32BE(16), 1200, `${f} width`);
    assert.equal(header.readUInt32BE(20), 630, `${f} height`);
  }
  assert.match(read('src/app/opengraph-image.alt.txt'), /seal/);
});

test('search engines get structured facts and nothing that promises results', () => {
  const layout = read('src/app/layout.tsx');
  assert.match(layout, /application\/ld\+json/);
  assert.match(layout, /'@type': 'Organization'/);
  assert.match(layout, /'@type': 'WebSite'/);
  assert.doesNotMatch(layout, /aggregateRating|review|AggregateOffer/);
});

test('robots and sitemap list public pages and keep private ones out', () => {
  const robots = read('src/app/robots.ts');
  for (const p of ['/api/', '/checkout', '/report', '/library', '/update-time', '/i/']) assert.ok(robots.includes(`'${p}'`), p);
  assert.match(robots, /sitemap: `\$\{SITE\}\/sitemap\.xml`/);
  const map = read('src/app/sitemap.ts');
  for (const p of ['/`', '/pricing`', '/privacy`']) assert.ok(map.includes(p), p);
  assert.doesNotMatch(map, /checkout|report|library|update-time/);
});

test('private pages are marked noindex and page titles do not repeat the site name', () => {
  for (const f of ['src/app/library/page.tsx', 'src/app/update-time/page.tsx', 'src/app/report/page.tsx', 'src/app/checkout/layout.tsx']) {
    assert.match(read(f), /robots: \{ index: false, follow: false \}/, f);
  }
  for (const f of ['pricing', 'privacy', 'library', 'update-time']) {
    assert.doesNotMatch(read(`src/app/${f}/page.tsx`), /title: '[^']*(T3D|The 3 Dimensions)/, f);
  }
});
