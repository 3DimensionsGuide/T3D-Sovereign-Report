import assert from 'node:assert/strict';
import { test } from 'node:test';
// @ts-expect-error — a plain .mjs dev tool with no type declarations.
import { diffTable, describeNullability } from '../../dev-tools/schemaDiff.mjs';

type Expected = { name: string; notNull: boolean }[];
type Actual = Map<string, { notNull: boolean }>;

const cols = (...entries: [string, boolean][]): Expected =>
  entries.map(([name, notNull]) => ({ name, notNull }));

const db = (...entries: [string, boolean][]): Actual =>
  new Map(entries.map(([name, notNull]) => [name, { notNull }]));

test('a table that matches reports nothing', () => {
  const d = diffTable(cols(['id', true], ['email', false]), db(['id', true], ['email', false]));
  assert.equal(d.missingTable, false);
  assert.deepEqual(d.missing, []);
  assert.deepEqual(d.nullability, []);
  assert.deepEqual(d.extras, []);
});

test('a table the database does not have at all', () => {
  const d = diffTable(cols(['id', true]), null);
  assert.equal(d.missingTable, true);
  // Nothing else is reported: naming its columns as missing too would be noise.
  assert.deepEqual(d.missing, []);
  assert.deepEqual(d.nullability, []);
});

test('a column the schema has and the database does not', () => {
  const d = diffTable(cols(['id', true], ['engine_version', false]), db(['id', true]));
  assert.deepEqual(d.missing, ['engine_version']);
});

/**
 * The case drizzle/0005 creates. Before the migration runs, the schema says leads.email is
 * nullable and the database still has NOT NULL — so an insert without an address fails, at the
 * end of onboarding, after the chart is already calculated. Nothing caught this before.
 */
test('a NOT NULL the migration was meant to drop is reported', () => {
  const d = diffTable(cols(['email', false]), db(['email', true]));
  assert.deepEqual(d.missing, []);
  assert.deepEqual(d.nullability, [{ column: 'email', schema: false, database: true }]);
  assert.equal(
    describeNullability('leads', d.nullability[0]),
    'leads.email (schema says nullable, database says NOT NULL)',
  );
});

test('the other direction is reported too', () => {
  const d = diffTable(cols(['email', true]), db(['email', false]));
  assert.deepEqual(d.nullability, [{ column: 'email', schema: true, database: false }]);
  assert.equal(
    describeNullability('leads', d.nullability[0]),
    'leads.email (schema says NOT NULL, database says nullable)',
  );
});

test('a missing column is not also reported as a nullability mismatch', () => {
  // One fact, one complaint: the column is absent, so its nullability is not a separate finding.
  const d = diffTable(cols(['email', false]), db());
  assert.deepEqual(d.missing, ['email']);
  assert.deepEqual(d.nullability, []);
});

test('a column the database has and the schema does not is an extra, not a problem', () => {
  const d = diffTable(cols(['id', true]), db(['id', true], ['legacy_notes', false]));
  assert.deepEqual(d.extras, ['legacy_notes']);
  assert.deepEqual(d.missing, []);
  assert.deepEqual(d.nullability, []);
});
