import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // `sweph` (the Transits engine's ephemeris binding) needs the same
  // treatment as `swisseph` below and for the same reason: both resolve
  // their compiled `.node` binary at require-time by reading their own
  // `__dirname`, and Turbopack/webpack rewrite that when the package gets
  // bundled instead of required from node_modules as-is — which breaks
  // the binary lookup even though the right prebuild is sitting right
  // there on disk (confirmed directly: node-gyp-build throws "No native
  // build was found" with `loaded from: /ROOT/node_modules/sweph`, a
  // bundler-rewritten path that was never a real directory).
  serverExternalPackages: ['swisseph', 'sweph'],
  // The compiled swisseph.node / sweph.node binaries are loaded
  // dynamically by each addon's own loader code, which Next.js's
  // automatic file-tracing doesn't reliably detect. This forces them into
  // any API route's deployed function bundle so they're actually present
  // at runtime. sweph ships one prebuild per platform+arch under
  // prebuilds/ (unlike swisseph's single build/Release/ output), so the
  // glob has to reach all of them rather than just the current machine's.
  outputFileTracingIncludes: {
    '/api/**': [
      './node_modules/swisseph/build/Release/*.node',
      './node_modules/sweph/prebuilds/**/*.node',
    ],
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
