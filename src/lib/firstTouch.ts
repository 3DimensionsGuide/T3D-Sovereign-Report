/**
 * Where somebody came from, recorded once.
 *
 * Without this there is no way to tell which channel produced a paying customer, which makes
 * every marketing decision a guess and every marketing tool impossible to evaluate. One column
 * on the lead answers it with a join.
 *
 * What is kept is deliberately thin:
 *
 *   - The campaign tags the person's own click put in the address bar (utm_source and friends).
 *   - The *host* of the referring page, never its full URL. A referrer can carry a search query
 *     or the path of somebody's private page, and none of that is needed to know that a visit
 *     came from Instagram.
 *
 * Nothing identifying, no cookie, and nothing about the visitor. It is held in localStorage
 * rather than for the tab alone, so that somebody who finds the site in a post, thinks about it
 * for a week and comes back is still counted to the post rather than to "direct".
 */

/** Keys worth reading out of a URL. Anything else in the address is ignored. */
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const;

/** Hosts that are really one channel, so the numbers do not split across their domains. */
const HOST_CHANNEL: Record<string, string> = {
  'instagram.com': 'instagram',
  'l.instagram.com': 'instagram',
  'tiktok.com': 'tiktok',
  'youtube.com': 'youtube',
  'm.youtube.com': 'youtube',
  'youtu.be': 'youtube',
  'facebook.com': 'facebook',
  'l.facebook.com': 'facebook',
  'reddit.com': 'reddit',
  'out.reddit.com': 'reddit',
  'pinterest.com': 'pinterest',
  'x.com': 'x',
  'twitter.com': 'x',
  't.co': 'x',
  'threads.net': 'threads',
  'threads.com': 'threads',
  'linkedin.com': 'linkedin',
  'lnkd.in': 'linkedin',
  'substack.com': 'substack',
  'google.com': 'search',
  'bing.com': 'search',
  'duckduckgo.com': 'search',
  'search.yahoo.com': 'search',
  'ecosia.org': 'search',
};

export interface FirstTouch {
  /** The channel, normalised: 'instagram', 'search', 'direct', or whatever utm_source said. */
  source: string;
  /** Campaign, medium or referring host — whatever narrows the channel. Empty when there is none. */
  detail: string;
}

/** Trimmed, lowercased and bounded, because this is written to a column and read in a report. */
function clean(value: string, limit = 64): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, limit);
}

/** `www.` dropped, so one site is one row. */
function bareHost(host: string): string {
  return host.toLowerCase().replace(/^www\./, '');
}

/**
 * Works out the channel from a URL's campaign tags and the page that linked here.
 *
 * utm_source wins when it is there: somebody who tagged a link knows better than a referrer
 * header does. Failing that the referring host decides, and a visit with neither — typed in,
 * from a message, from an app that sends no referrer — is 'direct', which is honest about not
 * knowing rather than silently attributing it somewhere.
 */
export function readFirstTouch(url: string, referrer: string, siteHost: string): FirstTouch {
  let params: URLSearchParams;
  try {
    params = new URL(url).searchParams;
  } catch {
    params = new URLSearchParams();
  }

  const tags: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) tags[key] = clean(value);
  }

  let host = '';
  try {
    if (referrer) host = bareHost(new URL(referrer).hostname);
  } catch {
    host = '';
  }
  // A link from one page of the site to another is not a source.
  if (host && host === bareHost(siteHost)) host = '';

  if (tags.utm_source) {
    const detail = [tags.utm_campaign, tags.utm_medium, tags.utm_content].filter(Boolean).join(' · ');
    return { source: tags.utm_source, detail: clean(detail, 120) };
  }

  if (host) {
    const channel = HOST_CHANNEL[host];
    // An unmapped host is its own channel, and the host is already the detail, so it is not
    // repeated: a row reading "substack / substack" says nothing twice.
    return channel ? { source: channel, detail: host } : { source: clean(host), detail: '' };
  }

  return { source: 'direct', detail: '' };
}

/** Where the first touch is kept, named so it is obvious in a storage inspector. */
export const FIRST_TOUCH_KEY = 't3d-first-touch';

/**
 * Reads the stored first touch, writing one from this page if there is none yet.
 *
 * Write-once is the whole point. Overwriting with the latest visit is how attribution becomes a
 * lie: somebody found through a post, came back a week later by typing the address, and the
 * post loses the credit to 'direct'.
 *
 * Returns null where there is no browser storage to speak of — a private window, blocked site
 * data. Attribution is worth having and never worth getting in somebody's way for.
 */
export function rememberFirstTouch(): FirstTouch | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(FIRST_TOUCH_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<FirstTouch>;
      if (typeof parsed.source === 'string' && parsed.source) {
        return { source: parsed.source, detail: typeof parsed.detail === 'string' ? parsed.detail : '' };
      }
    }
    const touch = readFirstTouch(window.location.href, document.referrer, window.location.hostname);
    window.localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(touch));
    return touch;
  } catch {
    // No storage, or it refused. Work it out for this page and keep nothing.
    try {
      return readFirstTouch(window.location.href, document.referrer, window.location.hostname);
    } catch {
      return null;
    }
  }
}
