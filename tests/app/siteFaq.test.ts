import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FAQ_ITEMS, faqJsonLd } from '../../src/components/home/FAQ';
import { PRODUCT_DISPLAY } from '../../src/lib/products/catalog';

const read = (p: string) => readFileSync(p, 'utf8');

test('the FAQ answers the questions people ask first, with no invented promises', () => {
  const all = FAQ_ITEMS.map((i) => `${i.q} ${i.a}`).join(' ').toLowerCase();
  for (const topic of ['prediction', 'accurate', 'birth time', 'free', 'private', 'at least 13']) assert.ok(all.includes(topic), topic);
  assert.doesNotMatch(all, /refund|money-back|guarantee|app store|testflight|\$\d/);
  assert.ok(FAQ_ITEMS.length >= 6);
});

test('search engines read the same questions and answers people see', () => {
  const ld = faqJsonLd();
  assert.equal(ld['@type'], 'FAQPage');
  assert.equal(ld.mainEntity.length, FAQ_ITEMS.length);
  assert.equal(ld.mainEntity[0].acceptedAnswer.text, FAQ_ITEMS[0].a);
});

test('the FAQ uses real disclosure elements and keeps keyboard focus visible', () => {
  const src = read('src/components/home/FAQ.tsx');
  const css = read('src/app/globals.css');
  assert.match(src, /<details/);
  assert.match(src, /<summary/);
  assert.match(css, /\.faq-summary:focus-visible/);
  assert.match(css, /min-height: 56px/);
});

test('both new sections are on the homepage and in the navigation', () => {
  assert.match(read('src/app/page.tsx'), /<WhatsInside \/>[\s\S]*<FAQ \/>/);
  assert.match(read('src/components/navigation/Nav.tsx'), /href: '\/#faq',\s+label: 'FAQ'/);
  assert.match(read('src/components/navigation/Footer.tsx'), /'\/#faq'/);
});

test('product cards use plain words, not bracket tags or shouted labels', () => {
  for (const p of Object.values(PRODUCT_DISPLAY)) {
    assert.doesNotMatch(p.eyebrow, /[\[\]]/);
    for (const i of p.includes) assert.notEqual(i.label, i.label.toUpperCase());
  }
});
