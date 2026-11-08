-- Birth places already looked up, so GeoNames is asked once per place rather than once per chart.
-- See src/server/geocoding.ts. Nothing personal is stored: a row is a city name and where it is.
--
-- Run once against the database:
--   node dev-tools/run-sql.mjs drizzle/0002_places_cache.sql
--
-- Safe to run more than once.
CREATE TABLE IF NOT EXISTS places (
  id         serial PRIMARY KEY,
  query      text NOT NULL,
  label      text NOT NULL,
  latitude   double precision NOT NULL,
  longitude  double precision NOT NULL,
  timezone   text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS places_query_idx ON places (query);
