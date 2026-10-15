/**
 * T3D Root Layout — Design Polish · Surgical Upgrade
 * Fonts: Playfair Display (display) + DM Sans (body/UI)
 */
import type { Metadata, Viewport } from 'next';
import './globals.css';
import VideoBackground from '@/components/VideoBackground';
import RefBeacon from '@/components/RefBeacon';

export const metadata: Metadata = {
  title: {
    default: 'The 3 Dimensions — Align Your Vehicle. Follow Your Road. Obey The Signals.',
    template: '%s | The 3 Dimensions',
  },
  description:
    'Enter your birth details and see your Human Design Type, Life Path number and birth chart. T3D reads Human Design, Numerology and Astrology together, so you can decide with more clarity.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://3dimensions.guide'),
  applicationName: 'The 3 Dimensions',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'The 3 Dimensions',
    title: 'The 3 Dimensions: your vehicle, your road, your timing',
    description:
      'Human Design, Numerology and Astrology, calculated from your birth details and read together. Free to start.',
    url: '/',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The 3 Dimensions: your vehicle, your road, your timing',
    description:
      'Human Design, Numerology and Astrology, calculated from your birth details and read together. Free to start.',
  },
};

// Plain facts about the site for search engines. Nothing here is a claim about results.
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://3dimensions.guide/#organization',
      name: 'The 3 Dimensions',
      alternateName: 'T3D',
      url: 'https://3dimensions.guide',
      logo: 'https://3dimensions.guide/logos/T3D_seal.png',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://3dimensions.guide/#website',
      url: 'https://3dimensions.guide',
      name: 'The 3 Dimensions',
      description: 'Human Design, Numerology and Astrology, calculated from your birth details and read together.',
      publisher: { '@id': 'https://3dimensions.guide/#organization' },
      inLanguage: 'en',
    },
  ],
};

export const viewport: Viewport = {
  themeColor: '#0D0D0E',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/*
          UPGRADE 1 — Typography Overhaul
          Playfair Display → H1/H2 headlines (display font)
          DM Sans → all body text, labels, UI elements
        */}
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,300;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <a href="#main" className="skip-link">Skip to main content</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
  <VideoBackground />
        <RefBeacon />
        {children}
      </body>
    </html>
  );
}
