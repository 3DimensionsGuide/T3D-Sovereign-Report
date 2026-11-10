/**
 * Product analytics, kept to what a decision actually needs.
 *
 * The question this exists to answer is narrow: of the people who open the calculator, how many
 * finish, how many tick the box, and how many buy. Without it the funnel is invisible and there
 * is no way to tell a change that helped from one that did not.
 *
 * Three rules it holds to, which are not PostHog's defaults:
 *
 *   1. A person is identified by their lead id and never by their email address. The id is
 *      meaningless outside our own database, so nothing here can be joined back to a person by
 *      anyone else.
 *   2. person_profiles is 'identified_only', so somebody who reads the site and leaves creates no
 *      person record at all. Only completing a calculation does.
 *   3. Nothing from the chart goes in. No birth date, time or place, no results, no name. The
 *      events below carry counts and labels, which is everything the funnel needs.
 *
 * With no key set it does nothing, silently. That is the right failure: analytics is never worth
 * an error in front of somebody reading their chart.
 */

import posthog from 'posthog-js';

/** The funnel, start to finish. Named for what happened, not for where the code is. */
export type AnalyticsEvent =
  | 'calculator_opened'
  | 'calculator_step_done'
  | 'chart_shown'
  | 'optin_ticked'
  | 'checkout_opened'
  | 'purchase_completed'
  | 'walkthrough_requested';

type Props = Record<string, string | number | boolean | undefined>;

let started = false;

function key(): string | undefined {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY || undefined;
}

/** True once analytics is actually running, so callers never have to check the key themselves. */
function live(): boolean {
  return started && typeof window !== 'undefined';
}

/** Called once, from the app shell. Safe to call again; safe with no key. */
export function startAnalytics(): void {
  if (started || typeof window === 'undefined') return;
  const token = key();
  if (!token) return;
  try {
    posthog.init(token, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      // Nobody becomes a person record by reading the site. Only a finished calculation does.
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
      // The address bar can carry campaign tags and, on the report page, an order id. None of
      // that belongs in an analytics payload.
      sanitize_properties: (properties) => {
        const safe = { ...properties };
        for (const field of ['$current_url', '$referrer', '$pathname', '$initial_current_url']) {
          const value = safe[field];
          if (typeof value === 'string') safe[field] = stripQuery(value);
        }
        return safe;
      },
    });
    started = true;
  } catch {
    // A blocked script, a private window. Nothing here is worth a broken page.
  }
}

/** Path only: a query string on this site carries campaign tags and order ids. */
export function stripQuery(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url.split('?')[0]?.split('#')[0] ?? url;
  }
}

export function track(event: AnalyticsEvent, props: Props = {}): void {
  if (!live()) return;
  try {
    posthog.capture(event, props);
  } catch {
    // Counting is optional.
  }
}

/**
 * Ties the events of this browser to a lead, by id.
 *
 * The id and nothing else. An email address here would put a way of finding a named person into
 * a third party's records, which is the thing the rest of this file exists to avoid.
 */
export function identifyLead(leadId: number): void {
  if (!live() || !Number.isInteger(leadId) || leadId < 1) return;
  try {
    posthog.identify(String(leadId));
  } catch {
    // Counting is optional.
  }
}
