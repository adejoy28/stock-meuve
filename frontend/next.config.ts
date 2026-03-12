import type { NextConfig } from 'next'
const withPWA = require('next-pwa')({
  dest: 'public',              // Service worker output location
  register: true,              // Auto-register service worker
  skipWaiting: true,           // Activate new SW immediately on update
  disable: process.env.NODE_ENV === 'development',  // Disable in dev
  fallbacks: {
    document: '/offline',      // Show /offline page when network fails
  },
  buildExcludes: [/middleware-manifest\.json$/],
})

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    optimizeCss: true,
  },
  images: {
    unoptimized: true,
  },
}

export default withPWA(nextConfig)
