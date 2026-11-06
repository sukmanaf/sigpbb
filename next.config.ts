import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Empty turbopack config silences the webpack/turbopack conflict warning
  output: 'standalone',
  turbopack: {},
  experimental: {
    // Cache FS Turbopack di dev menulis GB data ke disk (bikin laptop lag).
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
