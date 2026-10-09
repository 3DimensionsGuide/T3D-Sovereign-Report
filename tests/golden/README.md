# Golden-chart tests

Protects the accuracy claim. Two layers:

1. **engines.test.ts** checks the calculators against things that are true regardless of our code: JavaScript's own time-zone maths, the exact moments of the 2024 equinoxes and solstices, the published Rave Mandala, rules every chart must obey, and numbers from an independent Python implementation.
2. **golden.test.ts** locks in 20 reference charts (snapshot.json). If any planet, gate, Type or number changes, the test fails and names it.

## Commands
- `npm test` runs everything.
- `npm run golden:update` rewrites snapshot.json and VERIFY.md. Only do this when you know the new numbers are right.

## Checking against the outside world
Open VERIFY.md, enter each chart on Astro.com and Jovian Archive, and set "match" or "mismatch" in verification.json. The test run prints how many are verified. Until you do this, the snapshot proves the app is consistent, not that it is correct.

The 20 charts are made up (no real people) and cover daylight-saving gaps and overlaps, odd offsets (+5:30, +5:45), the southern hemisphere, high latitude, a leap day and a year boundary.
