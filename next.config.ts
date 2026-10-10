import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Empty turbopack config silences the webpack/turbopack conflict warning
  turbopack: {},
};

export default nextConfig;
