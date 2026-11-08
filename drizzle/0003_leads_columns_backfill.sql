-- Brings a leads table up to what src/server/db/schema.ts expects.
--
-- The local database had been left behind: the opt-in columns were added to production on
-- 9 October and never here, so any query selecting every column failed with
-- 'column "email_opt_in_at" does not exist'. Scripts that name a few columns kept working, which
-- is why it went unnoticed.
--
-- Every statement is IF NOT EXISTS, so this is safe to run against any of the databases, as often
-- as you like. Run it with:
--   node dev-tools/run-sql.mjs drizzle/0003_leads_columns_backfill.sql
-- and check afterwards with:
--   node --import tsx dev-tools/check-schema.mjs

ALTER TABLE leads ADD COLUMN IF NOT EXISTS middle_name text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_opt_in boolean NOT NULL DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_opt_in_at timestamptz;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_opt_in_source text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS opt_in_code_hash text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS opt_in_code_expires_at timestamptz;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS opt_in_code_attempts integer NOT NULL DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS report_purchased boolean NOT NULL DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS session_epoch integer NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS leads_email_idx ON leads (email);
