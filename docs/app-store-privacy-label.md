# App Store privacy label: answers to enter in App Store Connect

Prepared Oct 2026 for T3D version 1.0 (free app, no in-app purchases yet).
Apple's category names change over time. Check each answer against the live
questionnaire when you fill it in, and have the lawyer review it with the privacy policy.

## "Do you or your third-party partners collect data from this app?"
Yes.

## Data types collected

| Apple category | What | Linked to the person? | Used for tracking? | Purpose |
|---|---|---|---|---|
| Contact Info: Name | first, middle and last name (numerology uses the full name) | Yes | No | App Functionality |
| Contact Info: Email Address | email used to find their chart | Yes | No | App Functionality |
| Other Data Types | birth date, birth time, birth place (typed by the person, not device location) | Yes | No | App Functionality |
| Usage Data: Product Interaction | which screens are opened, as anonymous daily counts (screen name and a number, no person or device attached) | No | No | Analytics |
| Diagnostics: Crash Data | crash and error reports with personal details removed (Sentry) | No | No | App Functionality |
| User Content: Other User Content | optional marketing preference (email me insights) | Yes | No | Developer's Advertising or Marketing, only if they switch it on |

Not collected in version 1.0: precise or coarse device location, contacts, photos,
identifiers (IDFA or device ID), purchases, health data. Screen counts (Round 2 #15) are
listed above as Product Interaction, not linked to the person. Crash reports (Sentry) are
listed above as Crash Data. No performance data is collected (tracing is off). Update this
table again when the subscription (#6) is added, before submitting that build.

## "Do you use data for tracking?"
No. Nothing is shared with advertisers or data brokers, and no tracking SDKs are in the app.

## Server-side processors (explain to the lawyer, may not appear on the label)
Vercel (hosting), Sentry (crash reports, personal details removed before sending), Neon (database), Upstash (short-lived request counters, keyed by IP),
GeoNames (birth city and country lookup), Anthropic (report writing for the website
reports: first name and birth date, see Round 2 #20), Stripe (website payments only),
Resend (email).

## Privacy policy URL
https://www.3dimensions.guide/privacy

## Account deletion
The app has no accounts, but it saves a record on the server. Apple expects in-app
deletion when data is saved this way. "Delete my data" is on My Chart > About & your data.

## Age rating
13+ by our own rule. Answer the age rating questionnaire honestly: astrology content
is "infrequent/mild" at most; there is no user-generated content, no web access beyond
the privacy link, no gambling, and no medical claims. Expect 4+ or 9+. Check the
result, and make sure the minimum age in the policy (13) matches.

## Review notes to give Apple
"T3D is a reflection and entertainment app based on astrology, numerology and Human
Design. It makes no medical, legal or financial claims. No sign-in is required; reviewers
can enter any birth details. The paid report is sold only on our website."
