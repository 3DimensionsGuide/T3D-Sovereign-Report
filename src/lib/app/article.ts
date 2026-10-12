/**
 * "a" or "an" for the word that follows. Numbers are read aloud, so 8, 11 and 18 take "an".
 * Pure and dependency-free so server code and tests can use it directly.
 */
export function withArticle(word: string | number): string {
  const w = String(word).trim();
  if (!w) return '';
  if (/^\d+$/.test(w)) {
    const n = Number(w);
    const an = n === 8 || n === 11 || n === 18 || (n >= 80 && n <= 89);
    return `${an ? 'an' : 'a'} ${w}`;
  }
  return `${/^[aeiou]/i.test(w) ? 'an' : 'a'} ${w}`;
}
