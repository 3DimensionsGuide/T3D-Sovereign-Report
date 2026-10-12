import assert from 'node:assert/strict';
import { test } from 'node:test';
import { withArticle } from '../../src/lib/app/article';
import { buildEntry, type ChartContext } from '../../src/lib/app/glossary';

test('words and numbers take the right article', () => {
  assert.equal(withArticle('Expression'), 'an Expression');
  assert.equal(withArticle('opposition'), 'an opposition');
  assert.equal(withArticle('square'), 'a square');
  assert.equal(withArticle('Foundations'), 'a Foundations');
  assert.equal(withArticle(8), 'an 8');
  assert.equal(withArticle(11), 'an 11');
  assert.equal(withArticle(22), 'a 22');
  assert.equal(withArticle(''), '');
});

test('the closest-aspect line says "an opposition"', () => {
  const ctx = {
    tropical: {
      sun: { longitude: 10, formatted: "10°00' Aries" },
      moon: { longitude: 190, formatted: "10°00' Libra" },
      houses: { ascendant: 5, mc: 275 },
    },
  } as unknown as ChartContext;
  assert.match(buildEntry('astro:planet:sun', ctx)?.yours ?? '', /is an opposition to Moon/);
});
