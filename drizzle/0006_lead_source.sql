-- Where a lead came from, so "which channel produced paying customers" is a join rather than a guess.
--
-- Until now nothing recorded it. There is no analytics anywhere in the app — app_events counts
-- events by day with nobody attached, deliberately — so a purchase could not be traced to the post,
-- search or link that produced it. That makes every marketing decision unmeasurable and every
-- marketing tool impossible to evaluate.
--
-- Two columns, both nullable. Null means the lead arrived before this existed, or came through a
-- path that carries no source at all, which is honest about not knowing rather than quietly
-- attributing it somewhere.
--
--   source        the channel: 'instagram', 'search', 'direct', or whatever utm_source said
--   source_detail the campaign, medium or referring host — whatever narrows it
--
-- What is NOT stored: anything identifying, any cookie, and never a full referrer URL. A referrer
-- can carry a search query or the path of somebody's private page, and the host alone answers the
-- question. See src/lib/firstTouch.ts.
--
-- Written once per lead. A returning visitor keeps their original source — overwriting with the
-- latest visit is how attribution becomes a lie, because somebody who found the site in a post and
-- came back a week later by typing the address would lose the credit to 'direct'. The route uses
-- COALESCE so a lead that has none yet can gain one, and a lead that has one never changes.
--
-- leads_source_idx makes the grouping cheap: the report this exists for is a count per source.
--
-- Run once against the database:
--   node dev-tools/run-sql.mjs drizzle/0006_lead_source.sql
--
-- Safe to run more than once.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source_detail text;

CREATE INDEX IF NOT EXISTS leads_source_idx ON leads (source);
