import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    optimizeCss: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
