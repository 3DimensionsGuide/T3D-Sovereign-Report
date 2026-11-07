-- App session tokens (src/server/appTokens.ts) carry the lead's session number, so that raising
-- that number invalidates every token already handed out for the lead. Existing rows start at 1.
--
-- Run once against the database:
--   psql "$DATABASE_URL" -f drizzle/0001_app_session_epoch.sql
--
-- Safe to run more than once.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS session_epoch integer NOT NULL DEFAULT 1;
