import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://3dimensions.guide';

/** Public pages can be found. Private ones (checkout, reports, invites, the API) are kept out of search. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/checkout', '/report', '/library', '/update-time', '/i/'] }],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
