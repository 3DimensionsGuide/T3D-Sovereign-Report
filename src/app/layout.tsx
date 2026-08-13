/**
 * T3D Root Layout — Design Polish · Surgical Upgrade
 * Fonts: Playfair Display (display) + DM Sans (body/UI)
 */
import type { Metadata, Viewport } from 'next';
import './globals.css';
import VideoBackground from '@/components/VideoBackground';

export const metadata: Metadata = {
  title: {
    default: 'The 3 Dimensions — Align Your Vehicle. Follow Your Road. Obey The Signals.',
    template: '%s | The 3 Dimensions',
  },
  description:
    'T3D draws Human Design, Numerology, and Astrology into one sovereign navigation system.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://3dimensions.guide'),
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
  <VideoBackground />
        {children}
      </body>
    </html>
  );
}
