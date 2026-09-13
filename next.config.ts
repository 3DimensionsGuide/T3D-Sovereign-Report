import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['swisseph'],
  // The compiled swisseph.node binary is loaded dynamically by the
  // addon's own loader code, which Next.js's automatic file-tracing
  // doesn't reliably detect. This forces it into any API route's
  // deployed function bundle so it's actually present at runtime.
  outputFileTracingIncludes: {
    '/api/**': ['./node_modules/swisseph/build/Release/*.node'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options',        value: 'DENY'    },
        ],
      },
    ];
  },
};

export default nextConfig;
