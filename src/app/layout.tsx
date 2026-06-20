import type { Metadata, Viewport } from 'next';
import './globals.css';

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
  themeColor: '#121214',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..600;1,9..144,400..500&family=Hanken+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
