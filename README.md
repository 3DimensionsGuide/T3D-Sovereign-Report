# 3dimensions.guide

T3D — The 3 Dimensions. A birth chart read through three systems at once:

- **The Vehicle** — Human Design. The machinery, and where it runs on its own power.
- **The Road** — Numerology. The trajectory and its timing.
- **The Stoplight** — Astrology. The conditions outside, and when they change.

Two front ends share one set of calculation engines: the website at `3dimensions.guide`, which
sells a 44-page PDF report, and an iPhone app under `mobile/`.

---

## Getting started

```bash
npm install
npm run dev            # the website at http://localhost:3000

cd mobile && npm install && npx expo start
```

`.env.local` holds the secrets and is not committed. The website needs, at minimum:

| | |
|---|---|
| `DATABASE_URL` | Postgres. Local development points at a local database, not production. |
| `APP_SESSION_SECRET` | Signs the app's session tokens. Falls back to `REPORT_LINK_SECRET` or `STRIPE_WEBHOOK_SECRET`. |
| `GEONAMES_USERNAME` | Place and time-zone lookup. Without it, place checks fail loudly rather than guessing. |
| `EPHE_PATH` | Swiss Ephemeris data files. |

Then, as each feature needs them: `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`,
`RESEND_API_KEY` and `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`,
`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for rate limiting, `SENTRY_DSN`,
`ADMIN_RECOMPUTE_SECRET`, `INVITE_LINK_SECRET`, `REPORT_LINK_SECRET`.

`NEON_DATABASE_URL` is production, and only the read-only tools accept it.

The app needs `EXPO_PUBLIC_API_BASE_URL` (defaults to the live site) and optionally
`EXPO_PUBLIC_SENTRY_DSN`.

---

## Checking the work

```bash
npm test               # typechecks both projects, then runs every test
npm run typecheck      # just the typecheck, website and app
npm run lint
npm run audit:language # house voice: no directive wording, no promises that are not true
```

`pretest` runs the typecheck, so `npm test` fails fast on a type error in either project rather
than running the suite against code that does not compile.

**Tests must be run on macOS.** `swisseph` ships a native binary, so eight test files — the
golden snapshots and anything that calculates a real chart — cannot load it anywhere else. A
Linux shell will report those eight as failures whatever the state of the code.

Tests live in three folders, and the names say what they hold: `tests/golden/` pins calculated
output against known charts, `tests/security/` covers authentication and access, `tests/app/`
covers everything else.

---

## The database

There is no migration tool. Migrations are hand-written, idempotent SQL in `drizzle/`, applied
one at a time:

```bash
node dev-tools/run-sql.mjs drizzle/0005_leads_email_nullable.sql
node --import tsx dev-tools/check-schema.mjs            # local
node --import tsx dev-tools/check-schema.mjs --prod     # production, read-only
```

`run-sql.mjs` deliberately refuses `--prod`. Writing to production is done by hand in the Neon
SQL editor, including the `_migrations` row that `run-sql.mjs` would otherwise write for you —
otherwise `check-schema` keeps reporting a migration as never run.

`check-schema.mjs` compares the database against `src/server/db/schema.ts` and names what differs,
including nullability. It reads and never writes.

---

## The engines

`src/server/engines/` holds the three calculations. They run server-side only: the formulas are
the product, and the client is sent results rather than the means to compute them.

`ENGINE_VERSION` in `src/server/engines/version.ts` is stamped on every stored chart, and a test
compares a fingerprint of the engine sources against a recorded one. When it fails it is asking a
question, and the answer is a judgement:

- A stored number could now come out differently → **bump `ENGINE_VERSION`**, then update the
  fingerprint.
- A comment, a rename, a move, a type → **leave the version alone**, update the fingerprint only.

`src/server/engines/mandala.ts` holds the Rave Mandala on its own, so asking which gate a
longitude falls in does not mean loading the ephemeris binary.

---

## Things worth knowing before changing anything

**No birth time means noon.** Anything that moves fast enough to cross a boundary in twelve
hours is then a guess, and the app says so. `src/lib/app/timeCertainty.ts` works out what is
actually unsettled, per body. A Profile is never settled without a birth time; the Moon's gate
never is either.

**An email address is never a credential.** The app authenticates with a signed session token,
minted only for the row a calculation writes. `tests/security/appAuth.test.ts` enforces that no
route trades an address for a chart, and it is stricter, not looser, about the one route that
stores one.

**A place is confirmed, never guessed.** Both the website and the app look a city up and show the
candidates back before anything is calculated. Geocoding fails loudly rather than returning
somewhere plausible.

**Addresses come from `src/lib/contact.ts`.** Support, privacy and the sending identity are three
different things and a test keeps them apart.

**The house voice is checked.** `npm run audit:language` catches directive wording and promises
the product does not keep. The readings describe mechanics; they do not instruct.

---

## Layout

```
src/app/            website routes, and the API the app talks to under api/app/
src/components/     website UI
src/server/         engines, database, authentication, geocoding — never reaches the client
src/lib/            shared logic: report content, the app's readings, the glossary
mobile/             the iPhone app (Expo, React Native)
drizzle/            hand-written migrations
dev-tools/          database and audit scripts
docs/               checklists that need a person: App Store review, privacy labels, accessibility
tests/              golden, security, app
```

---

## Deployment

The website deploys to Vercel from `main`. Apply any new migration to production **before**
deploying the code that needs it — a database ahead of its code is harmless, the reverse is a 500.

The app ships through TestFlight and the App Store; `docs/app-store-review-checklist.md` and
`docs/app-store-privacy-label.md` cover what review asks for, and
`docs/accessibility-device-pass.md` is the pass that needs a real phone.
