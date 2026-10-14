# App Store review checklist (T3D iPhone app)

Status as of this commit. "Done" = in the app and covered by tests. "Yours" = needs Tyler or Apple's site.

## Done
- Reflection-only wording (not medical, legal or financial advice; does not predict events): About, Method, Premium.
- Age: About says 13 and older. Choose a matching age rating in App Store Connect.
- Delete my data: in About, removes server data and clears the phone (Apple 5.1.1(v)).
- Privacy policy link: About and Premium.
- Subscription screen text: price, trial, automatic renewal, how to cancel, privacy link, Terms link (Apple's standard licence).
- Developer Premium switch only exists in development builds (`__DEV__`).
- Notifications are asked for only after the person turns reminders on.
- Send feedback in About.

## Blockers before you submit to the store (not needed for TestFlight)
1. Real subscriptions. The Subscribe and Restore purchases buttons are switched off ("Subscriptions open soon"). Apple rejects
   placeholder purchase buttons and "coming soon" features, and an app with locked content must let people buy it and restore it.
   Choose either: ship v1 with every feature free and hide the Premium screen, or add in-app purchase (RevenueCat is the usual
   shortcut) and make Restore purchases work. Premium must be decided by the purchase record, not a stored flag.
2. Apple Developer account, App Store Connect app record for `guide.3dimensions.t3d`, subscription products with matching prices.
3. Screenshots, description, keywords, support URL and a privacy policy URL (https://www.3dimensions.guide/privacy).
4. Privacy "nutrition label" answers. Draft, check against the privacy page before submitting:
   - Birth date, time and place: sent to our server to make the chart (used for app functionality).
   - Email: only if the person gives one for a report or code.
   - Usage data: anonymous counts only, no ids, not linked to the person.
   - Diagnostics: crash reports (Sentry).
   - Not collected: contacts, location tracking, advertising data. Tribe members' details and backups stay on the phone.
5. Review notes for Apple: say that no account is needed and that chart calculation needs a network connection.
6. Terms page of our own (lawyer review) to replace Apple's standard licence.
