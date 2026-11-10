import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFirstTouch } from '../../src/lib/firstTouch';

const SITE = 'www.3dimensions.guide';
const from = (url: string, referrer = '') => readFirstTouch(url, referrer, SITE);

test('a tagged link is credited to its campaign', () => {
  const t = from('https://www.3dimensions.guide/?utm_source=instagram&utm_medium=bio&utm_campaign=launch');
  assert.equal(t.source, 'instagram');
  assert.equal(t.detail, 'launch · bio');
});

test('a tag beats a referrer, because somebody chose to write it', () => {
  // Tagged as a newsletter link but clicked from inside a webmail client. The tag is the truth.
  const t = from('https://www.3dimensions.guide/?utm_source=newsletter', 'https://mail.google.com/mail/u/0/');
  assert.equal(t.source, 'newsletter');
});

test('an untagged visit is credited to the site that linked here', () => {
  assert.equal(from('https://www.3dimensions.guide/', 'https://www.instagram.com/p/abc123/').source, 'instagram');
  assert.equal(from('https://www.3dimensions.guide/', 'https://l.instagram.com/?u=x').source, 'instagram');
  assert.equal(from('https://www.3dimensions.guide/', 'https://t.co/shortlink').source, 'x');
  assert.equal(from('https://www.3dimensions.guide/', 'https://youtu.be/abc').source, 'youtube');
});

test('the search engines are one channel, not five', () => {
  for (const engine of ['google.com', 'bing.com', 'duckduckgo.com', 'search.yahoo.com', 'ecosia.org']) {
    const t = from('https://www.3dimensions.guide/', `https://${engine}/search?q=human+design`);
    assert.equal(t.source, 'search', engine);
    // The engine is still recorded, so "which search engine" stays answerable.
    assert.equal(t.detail, engine);
  }
});

/**
 * A referrer can carry a search query, or the path of somebody's private page. The host alone
 * answers which channel it was, so the rest is never read and never stored.
 */
test('only the referring host is kept, never the path or the query', () => {
  const t = from('https://www.3dimensions.guide/', 'https://www.google.com/search?q=am+i+a+projector&hl=en');
  assert.equal(t.detail, 'google.com');
  assert.ok(!t.detail.includes('projector'), 'the search query reached the record');
  assert.ok(!t.detail.includes('?'), 'a query string reached the record');
  assert.ok(!t.source.includes('/'), 'a path reached the record');
});

test('a visit with nothing to go on is called direct, not guessed at', () => {
  assert.deepEqual(from('https://www.3dimensions.guide/'), { source: 'direct', detail: '' });
  assert.deepEqual(from('https://www.3dimensions.guide/pricing', ''), { source: 'direct', detail: '' });
});

test('moving around the site is not a new source', () => {
  // The commonest way an attribution table fills up with its own domain.
  assert.equal(from('https://www.3dimensions.guide/pricing', 'https://www.3dimensions.guide/').source, 'direct');
  assert.equal(from('https://www.3dimensions.guide/pricing', 'https://3dimensions.guide/library').source, 'direct');
});

test('an unmapped site is its own channel, and is not said twice', () => {
  const t = from('https://www.3dimensions.guide/', 'https://news.ycombinator.com/item?id=1');
  assert.equal(t.source, 'news.ycombinator.com');
  assert.equal(t.detail, '', 'the host is already the source — repeating it says nothing twice');
});

test('www is dropped, so one site is one row', () => {
  assert.equal(from('https://www.3dimensions.guide/', 'https://www.reddit.com/r/humandesign/').source, 'reddit');
  assert.equal(from('https://www.3dimensions.guide/', 'https://reddit.com/r/humandesign/').source, 'reddit');
});

test('values are normalised, so one channel is not three rows', () => {
  const t = from('https://www.3dimensions.guide/?utm_source=%20Instagram%20&utm_campaign=Launch%20%20Week');
  assert.equal(t.source, 'instagram');
  assert.equal(t.detail, 'launch week');
});

test('nothing absurd reaches the column', () => {
  const long = 'x'.repeat(500);
  const t = from(`https://www.3dimensions.guide/?utm_source=${long}&utm_campaign=${long}`);
  assert.ok(t.source.length <= 64, `source was ${t.source.length}`);
  assert.ok(t.detail.length <= 120, `detail was ${t.detail.length}`);
});

test('a malformed address or referrer is survivable', () => {
  // Attribution is worth having and never worth getting in somebody's way for.
  assert.doesNotThrow(() => readFirstTouch('not a url', 'also not a url', SITE));
  assert.equal(readFirstTouch('not a url', '', SITE).source, 'direct');
  assert.equal(from('https://www.3dimensions.guide/', 'javascript:void(0)').source, 'direct');
});
