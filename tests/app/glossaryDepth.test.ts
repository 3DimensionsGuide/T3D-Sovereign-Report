import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const source = readFileSync(
  new URL('../../src/lib/app/glossary.ts', import.meta.url).pathname,
  'utf8',
);

/**
 * Every hand-authored glossary entry has to carry a real explanation, because
 * `gateEntry` withholds the body entirely without Premium — a two-line body is
 * what a paying reader is paying for. Entries whose body is a shared
 * `*_MECHANISM` constant are skipped: that prose is checked where it is defined.
 */
const FLOOR_WORDS = 70;

type Entry = { id: string; words: number; paragraphs: number };

function handAuthoredEntries(): Entry[] {
  const out: Entry[] = [];
  for (const chunk of source.split(/\nadd\('/).slice(1)) {
    const id = chunk.slice(0, chunk.indexOf("'"));
    const end = chunk.indexOf('\nadd(');
    const call = end === -1 ? chunk : chunk.slice(0, end);
    const open = call.indexOf('[');
    const close = call.lastIndexOf(']');
    if (open === -1 || close <= open) continue;
    const body = call.slice(open + 1, close);
    if (/^\s*\[?[A-Z][A-Z_]*_MECHANISM\s*\]/.test(body)) continue;
    const paragraphs = (body.match(/^\s*'/gm) ?? []).length;
    out.push({ id, words: body.split(/\s+/).filter(Boolean).length, paragraphs });
  }
  return out;
}

test('the glossary still has its hand-authored entries', () => {
  const entries = handAuthoredEntries();
  assert.ok(
    entries.length >= 45,
    `expected at least 45 hand-authored entries, parsed ${entries.length} — the parser or the file shape changed`,
  );
  assert.equal(new Set(entries.map((e) => e.id)).size, entries.length, 'duplicate entry ids');
});

test('no hand-authored entry falls back to a one-line explanation', () => {
  const thin = handAuthoredEntries()
    .filter((e) => e.words < FLOOR_WORDS)
    .map((e) => `${e.id} (${e.words} words)`);
  assert.deepEqual(
    thin,
    [],
    `these entries are below the ${FLOOR_WORDS}-word floor and read as placeholders:\n  ${thin.join('\n  ')}`,
  );
});

test('every hand-authored entry explains itself in more than one paragraph', () => {
  const flat = handAuthoredEntries()
    .filter((e) => e.paragraphs < 2)
    .map((e) => e.id);
  assert.deepEqual(flat, [], `single-paragraph entries: ${flat.join(', ')}`);
});
