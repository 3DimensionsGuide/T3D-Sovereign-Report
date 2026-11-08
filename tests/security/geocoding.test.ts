/**
 * Birth places must never be guessed.
 *
 * resolveGeoAndTimezone used to answer with New York City whenever GEONAMES_USERNAME was missing.
 * The comment above it recorded that this had already written several of T3D's own leads with the
 * wrong coordinates — and a wrong birth place is not a small error: it moves the ascendant, all
 * twelve houses and the Human Design design epoch, and nothing in the finished chart says so.
 *
 * The first test here is the one that matters. The rest hold the shape of the fix in place: one
 * GeoNames call instead of two, a cache that can fail without taking the lookup with it, and
 * routes that turn a failed lookup into something the person can act on rather than a chart.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Pointed at nowhere on purpose: the place cache must be able to fail without stopping anything,
// and these tests prove that by never giving it a database to reach. db/index.ts reads this when
// it is imported, so it is set before the import below.
process.env.DATABASE_URL = 'postgresql://unused:unused@127.0.0.1:1/unused';

// Imported lazily rather than at the top, because these test files are compiled to CommonJS and
// the import has to happen after DATABASE_URL is set above.
type Geocoding = typeof import('../../src/server/geocoding');
let loaded: Geocoding | null = null;
const geocodingModule = async (): Promise<Geocoding> => (loaded ??= await import('../../src/server/geocoding'));

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
/** The file with its comments taken out, so prose about a rule does not read as a breach of it. */
const code = (p: string) => read(p).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const geocoding = code('src/server/geocoding.ts');
const calculate = code('src/app/api/calculate-t3d/route.ts');

function withoutGeoNames<T>(fn: () => T): T {
  const saved = process.env.GEONAMES_USERNAME;
  delete process.env.GEONAMES_USERNAME;
  try {
    return fn();
  } finally {
    if (saved === undefined) delete process.env.GEONAMES_USERNAME;
    else process.env.GEONAMES_USERNAME = saved;
  }
}

// ─── the thing that actually went wrong ──────────────────────────────────────

test('geocoding: with no GeoNames account it refuses, rather than answering New York', async () => {
  const { resolveGeoAndTimezone, PLACE_LOOKUP_UNAVAILABLE } = await geocodingModule();
  await withoutGeoNames(async () => {
    await assert.rejects(
      () => resolveGeoAndTimezone('Paris', 'France', '1990-01-01'),
      (e: Error) => e.message === PLACE_LOOKUP_UNAVAILABLE,
      'a missing account must stop the chart, not substitute a place',
    );
  });
});

test('geocoding: New York is not written down anywhere as a fallback', () => {
  // The old placeholder, to the digit. If it ever comes back, so does the bug.
  assert.ok(!geocoding.includes('40.7128'), 'the New York latitude is back in geocoding.ts');
  assert.ok(!geocoding.includes('-74.0060'), 'the New York longitude is back in geocoding.ts');
  assert.ok(!/return \{ latitude: [\d.]+, longitude: -?[\d.]+/.test(geocoding), 'a hard-coded place is being returned');
});

test('geocoding: the two failure kinds are distinct and say different things', async () => {
  const { PLACE_LOOKUP_UNAVAILABLE, PLACE_NOT_FOUND } = await geocodingModule();
  assert.notEqual(PLACE_LOOKUP_UNAVAILABLE, PLACE_NOT_FOUND);
  // Worth retrying vs. worth correcting — the routes answer them differently.
  assert.match(calculate, /message === PLACE_NOT_FOUND[\s\S]{0,260}status: 400/);
  assert.match(calculate, /message === PLACE_LOOKUP_UNAVAILABLE[\s\S]{0,260}status: 503/);
  // Neither sentinel may reach the person as-is.
  assert.ok(!/error: PLACE_(NOT_FOUND|LOOKUP_UNAVAILABLE)/.test(calculate));
});

// ─── the cache ───────────────────────────────────────────────────────────────

test('geocoding: the same place typed differently is one cache entry', async () => {
  const { placeCacheKey } = await geocodingModule();
  const want = 'paris|france';
  for (const [city, country] of [
    ['Paris', 'France'], ['paris', 'france'], ['  Paris  ', ' France '],
    ['PARIS', 'France'], ['Paris', 'FRANCE'],
  ] as const) {
    assert.equal(placeCacheKey(city, country), want, `${city}, ${country}`);
  }
  assert.equal(placeCacheKey('New  York', 'United   States'), 'new york|united states', 'inner spacing collapses');
});

test('geocoding: different places stay different, accents included', async () => {
  const { placeCacheKey } = await geocodingModule();
  const keys = [
    placeCacheKey('Paris', 'France'),
    placeCacheKey('Paris', 'United States'),   // Paris, Texas
    placeCacheKey('Sao Paulo', 'Brazil'),
    placeCacheKey('São Paulo', 'Brazil'),      // a different question to ask GeoNames
  ];
  assert.equal(new Set(keys).size, keys.length, 'two different places share a cache key');
});

test('geocoding: a cache that is down is a cache that is empty, not an error', () => {
  // Both halves swallow their own failures; neither may throw into the lookup.
  const reader = geocoding.slice(geocoding.indexOf('async function readCachedPlace'), geocoding.indexOf('async function cachePlace'));
  const writer = geocoding.slice(geocoding.indexOf('async function cachePlace'), geocoding.indexOf('interface GeoNamesPlace'));
  for (const [name, body] of [['readCachedPlace', reader], ['cachePlace', writer]] as const) {
    assert.match(body, /try \{/, name);
    assert.match(body, /catch \(error: unknown\) \{/, name);
  }
  assert.match(reader, /return null;/);
  // A place is written once and read thereafter; writing must not be able to produce duplicates.
  assert.match(geocoding, /onConflictDoUpdate/);
});

test('geocoding: the cache table is in the schema and in a migration, and they agree', () => {
  const schema = read('src/server/db/schema.ts');
  assert.match(schema, /export const places = pgTable\(\s*'places'/);
  assert.match(schema, /uniqueIndex\('places_query_idx'\)/);

  const sql = read('drizzle/0002_places_cache.sql');
  assert.match(sql, /CREATE TABLE IF NOT EXISTS places/);
  assert.match(sql, /CREATE UNIQUE INDEX IF NOT EXISTS places_query_idx/);
  for (const column of ['query', 'label', 'latitude', 'longitude', 'timezone']) {
    assert.ok(schema.includes(`'${column}'`), `schema is missing ${column}`);
    assert.match(sql, new RegExp(`\\b${column}\\b`), `migration is missing ${column}`);
  }
});

// ─── what a lookup costs ─────────────────────────────────────────────────────

test('geocoding: a chart costs one GeoNames call, not two', () => {
  const resolve = geocoding.slice(geocoding.indexOf('async function geocodeFromGeoNames'), geocoding.indexOf('export async function resolveGeoAndTimezone'));
  assert.equal((resolve.match(/await fetch\(/g) ?? []).length, 1, 'more than one call per lookup');
  // style=FULL carries the time zone back with the coordinates, so searching for a place by name
  // needs no second call. timezoneJSON still exists in this file, for resolveTimezoneAt — asking
  // what zone a known point is in is a different question, and not one that can be got wrong.
  assert.ok(!resolve.includes('timezoneJSON'), 'the name search is calling the second endpoint again');
  assert.match(geocoding, /export async function resolveTimezoneAt/);
  assert.match(resolve, /searchParams\.set\('style', 'FULL'\)/);
});

test('geocoding: a search is restricted to populated places', () => {
  // Without this a search can land on a mountain or a river of the same name, and it also makes
  // the server agree with the candidates the app offered the person to confirm.
  assert.equal((geocoding.match(/searchParams\.set\('featureClass', 'P'\)/g) ?? []).length, 2);
});

test('geocoding: a slow lookup gives up rather than holding a calculation open', () => {
  assert.match(geocoding, /const LOOKUP_TIMEOUT_MS = \d+/);
  // Three places reach GeoNames: a name search, the candidates list, and a zone for a point.
  // Every one of them has to be able to give up.
  const reaches = (geocoding.match(/await fetch\(/g) ?? []).length;
  assert.equal(reaches, 3);
  for (const guard of [/new AbortController\(\)/g, /signal: controller\.signal/g, /clearTimeout\(timer\)/g]) {
    assert.equal((geocoding.match(guard) ?? []).length, reaches, String(guard));
  }
});

// ─── a place the person already confirmed is not looked up again ─────────────

test('calculate: coordinates are tested for being numbers, not for being truthy', () => {
  // Longitude 0 runs through Greenwich and latitude 0 along the equator. A falsy test threw away a
  // confirmed place on either line and looked it up again, which could land somewhere else.
  assert.ok(!/if \(!latitude \|\| !longitude \|\| !timezone\)/.test(calculate), 'the falsy test is back');
  assert.match(calculate, /typeof place\.latitude === 'number' && Number\.isFinite\(place\.latitude\)/);
  assert.match(calculate, /typeof place\.longitude === 'number' && Number\.isFinite\(place\.longitude\)/);
  assert.match(calculate, /const haveCoordinates =/);
  assert.match(calculate, /: await resolveGeoAndTimezone\(place\.city, place\.country, body\.birthDate\)/);
});

// ─── when the browser already knows where the place is ──────────────────────
//
// The website's autocomplete asked Google for the place's name and threw away its coordinates,
// then had the server search for that name in a different database. Google knew exactly where
// "Harbor City, California" was; GeoNames, given the string "Harbor City, United States",
// answered Benton Harbor, Michigan. The coordinates are now kept, and a point on the Earth has
// exactly one time zone, so nothing is searched for by name at all.

const form = code('src/components/calculator/CalculatorForm.tsx');

test('geocoding: a time zone is refused for coordinates that are not on the Earth', async () => {
  const { resolveTimezoneAt, PLACE_NOT_FOUND } = await geocodingModule();
  const impossible: [number, number][] = [
    [91, 0], [-91, 0], [0, 181], [0, -181], [NaN, 0], [0, NaN], [Infinity, 0],
  ];
  for (const [lat, lng] of impossible) {
    await assert.rejects(
      () => resolveTimezoneAt(lat, lng),
      (e: Error) => e.message === PLACE_NOT_FOUND,
      `${lat}, ${lng}`,
    );
  }
});

test('geocoding: a time zone lookup needs an account too, and never invents one', async () => {
  const { resolveTimezoneAt, PLACE_LOOKUP_UNAVAILABLE } = await geocodingModule();
  await withoutGeoNames(async () => {
    await assert.rejects(
      () => resolveTimezoneAt(33.79002, -118.29785),
      (e: Error) => e.message === PLACE_LOOKUP_UNAVAILABLE,
    );
  });
});

test('geocoding: a coordinate cache key cannot collide with a place name', () => {
  // Place names are "city|country"; coordinates are "@lat,lng". Nothing a person can type into
  // the city box produces a key beginning with @ followed by two numbers.
  assert.match(geocoding, /const key = `@\$\{round\(latitude\)\},\$\{round\(longitude\)\}`/);
  assert.match(geocoding, /Math\.round\(n \* 1000\) \/ 1000/);
});

test('calculate: coordinates are used when present, and the name only when they are not', () => {
  // The zone comes off the coordinates when the browser did not send one.
  assert.match(calculate, /timezone: haveZone \? place\.timezone! : await resolveTimezoneAt\(place\.latitude!, place\.longitude!\)/);
  // Searching by name is the last resort, not the default.
  assert.match(calculate, /: await resolveGeoAndTimezone\(place\.city, place\.country, body\.birthDate\)/);
});

test('calculator: the autocomplete asks Google where the place is', () => {
  assert.match(form, /fields: \['address_components','name','geometry\.location'\]/);
  assert.match(form, /place\.geometry\?\.location\?\.lat\?\.\(\)/);
});

test('calculator: editing the place by hand abandons the picked coordinates', () => {
  // Otherwise a chart is calculated for the place that was picked, not the one now in the box.
  // What else that branch clears is tests/app/calculatorPlace.test.ts's business; here it only
  // has to be true that editing a place field drops the coordinates.
  assert.match(form, /if \(field === 'city' \|\| field === 'state' \|\| field === 'country'\)[\s\S]{0,120}next\.placeAt = null;/);
  assert.match(form, /placeAt: null/);
});

test('calculator: the coordinates are sent with the birth place', () => {
  assert.match(form, /\.\.\.\(data\.placeAt \?\? \{\}\)/);
});
