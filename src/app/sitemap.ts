import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://3dimensions.guide';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${SITE}/`, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE}/pricing`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
