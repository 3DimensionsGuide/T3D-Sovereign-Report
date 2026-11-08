/**
 * Corrects the city or country stored on one lead.
 *
 *   node --import tsx dev-tools/fix-lead-city.mjs --id 1 --city "Harbor City"
 *   node --import tsx dev-tools/fix-lead-city.mjs --id 1 --city "Harbor City" --write
 *
 * Without --write it changes nothing and shows what it would do.
 *
 * A misspelled birth city is not only a wrong label: it is what the admin route re-geocodes from,
 * so until it is right, a repair there either fails or finds the wrong place. This checks that the
 * new spelling actually resolves before writing it, so a typo cannot be swapped for another one.
 *
 * It corrects the name only. The coordinates, the time zone and the three engine results are left
 * exactly as they are, and are repaired afterwards by the route that exists for that:
 *
 *   /api/admin/recompute-human-design?id=<id>&secret=<ADMIN_RECOMPUTE_SECRET>&relocate=true
 *   ...&apply=true once the dry run looks right.
 */

import nextEnv from '@next/env';
import postgres from 'postgres';

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd(), true, { info: () => {}, error: () => {} });

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

const id = Number(arg('id'));
const newCity = arg('city');
const newCountry = arg('country');
const write = process.argv.includes('--write');

if (!Number.isInteger(id) || id < 1 || (!newCity && !newCountry)) {
  console.error('Usage: node --import tsx dev-tools/fix-lead-city.mjs --id <n> [--city "Name"] [--country "Name"] [--write]');
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set. Check .env.local.');
  process.exit(1);
}

let where;
try {
  where = new URL(url);
} catch {
  console.error(`DATABASE_URL is not a connection string: ${url}`);
  process.exit(1);
}
console.log(`Database: ${where.hostname}:${where.port || 5432}/${where.pathname.replace('/', '')}\n`);

const client = postgres(url, { max: 1, onnotice: () => {} });

try {
  const rows = await client`SELECT id, email, birth_data FROM leads WHERE id = ${id}`;
  const lead = rows[0];
  if (!lead) {
    console.error(`No lead with id ${id}.`);
    process.exit(1);
  }

  const place = lead.birth_data?.place ?? {};
  const city = newCity ?? place.city;
  const country = newCountry ?? place.country;

  console.log(`Lead ${lead.id}  ${lead.email}`);
  console.log(`  now:  ${place.city}, ${place.country}`);
  console.log(`  to:   ${city}, ${country}\n`);

  if (place.city === city && place.country === country) {
    console.log('Already reads that way. Nothing to do.');
    process.exit(0);
  }

  // Refuse to write a spelling that cannot be found, so one typo is not swapped for another.
  console.log('Checking that the new spelling resolves...');
  // Imported here rather than at the top: the geocoder reaches the database module, which reads
  // DATABASE_URL as it loads, and a static import would run before loadEnvConfig had set it.
  const { resolveGeoAndTimezone } = await import('../src/server/geocoding.ts');
  let geo;
  try {
    geo = await resolveGeoAndTimezone(city, country, lead.birth_data?.date ?? '2000-01-01');
  } catch (error) {
    const why = error instanceof Error ? error.message : 'unknown';
    console.error(`  "${city}, ${country}" could not be resolved: ${why}`);
    console.error('  Nothing was written. Try the spelling GeoNames knows it by.');
    process.exit(1);
  }
  console.log(`  found: ${geo.latitude}, ${geo.longitude}  [${geo.timezone}]`);
  console.log(`  stored place is currently ${place.latitude}, ${place.longitude}  [${place.timezone}]\n`);

  if (!write) {
    console.log('Dry run — nothing written. Add --write to apply the new spelling.');
    console.log('Then repair the coordinates and the chart itself with:');
    console.log(`  /api/admin/recompute-human-design?id=${id}&secret=$ADMIN_RECOMPUTE_SECRET&relocate=true`);
    process.exit(0);
  }

  await client`
    UPDATE leads
    SET birth_data = jsonb_set(
          jsonb_set(birth_data, '{place,city}', ${JSON.stringify(city)}::jsonb),
          '{place,country}', ${JSON.stringify(country)}::jsonb
        ),
        updated_at = now()
    WHERE id = ${id}
  `;

  const after = (await client`SELECT birth_data FROM leads WHERE id = ${id}`)[0].birth_data.place;
  console.log(`Written. The lead now reads ${after.city}, ${after.country}.`);
  console.log('\nIts coordinates and chart are still the old ones. Repair those with:');
  console.log(`  /api/admin/recompute-human-design?id=${id}&secret=$ADMIN_RECOMPUTE_SECRET&relocate=true`);
  console.log('  ...then add &apply=true once the dry run looks right.');
} catch (error) {
  console.error(`Failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
