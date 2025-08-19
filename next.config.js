/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin']
  },
  webpack: (config, { isServer }) => {
    // Exclude functions directory from build
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/functions/**', '**/node_modules/**']
    }
    return config
  },
  images: {
    domains: ['storage.googleapis.com'],
    formats: ['image/webp', 'image/avif']
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
