/**
 * The comparison behind dev-tools/check-schema.mjs, kept apart from it so it can be tested
 * without a database. check-schema.mjs does the connecting and the printing; this decides what
 * counts as a difference.
 *
 * Nullability is in here because that drift is the quiet kind. A missing column fails the first
 * query that names it. A column the schema believes is optional while the database still has
 * NOT NULL fails only on the insert that leaves it out — which, for leads.email, is at the end
 * of onboarding, after the chart has already been calculated.
 */

/**
 * @param {{name: string, notNull: boolean}[]} expected  columns the schema declares
 * @param {Map<string, {notNull: boolean}>|null} actual   columns the database has, or null if
 *                                                        the table is not there at all
 * @returns {{missingTable: boolean, missing: string[], nullability: {column: string, schema: boolean, database: boolean}[], extras: string[]}}
 */
export function diffTable(expected, actual) {
  if (!actual) {
    return { missingTable: true, missing: [], nullability: [], extras: [] };
  }

  const missing = expected.filter((c) => !actual.has(c.name)).map((c) => c.name);

  // Only for columns both sides have. A column that is missing is already reported as missing,
  // and saying its nullability is wrong as well would be two complaints about one fact.
  const nullability = expected
    .filter((c) => actual.has(c.name) && actual.get(c.name).notNull !== c.notNull)
    .map((c) => ({ column: c.name, schema: c.notNull, database: actual.get(c.name).notNull }));

  // In the database and not in the schema: an old column nobody removed. Not a fault, but worth
  // seeing, so it is reported separately and does not count as a problem.
  const extras = [...actual.keys()].filter((name) => !expected.some((c) => c.name === name));

  return { missingTable: false, missing, nullability, extras };
}

/** How a nullability mismatch is worded, so the script and its test cannot drift apart. */
export function describeNullability(table, entry) {
  const word = (notNull) => (notNull ? 'NOT NULL' : 'nullable');
  return `${table}.${entry.column} (schema says ${word(entry.schema)}, database says ${word(entry.database)})`;
}
