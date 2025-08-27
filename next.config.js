/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // Exclude firebase-admin from client bundle and optimize bundle splitting
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'firebase-admin': false,
        'firebase-admin/app': false,
        'firebase-admin/auth': false,
        'firebase-admin/firestore': false,
      };

      // Optimize bundle splitting for better performance
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            // Framework bundle (React, Next.js)
            framework: {
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              name: 'framework',
              chunks: 'all',
              priority: 40,
              enforce: true,
            },
            // Vendor libraries bundle
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              chunks: 'all',
              priority: 30,
              minChunks: 2,
            },
            // Newsletter components bundle
            newsletter: {
              test: /[\\/]src[\\/]components[\\/](Newsletter|newsletter)/,
              name: 'newsletter',
              chunks: 'async',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Newsletter hooks and utilities bundle
            newsletterUtils: {
              test: /[\\/]src[\\/](hooks|lib)[\\/].*newsletter/,
              name: 'newsletter-utils',
              chunks: 'async',
              priority: 19,
              reuseExistingChunk: true,
            },
            // UI components bundle (shared across features)
            uiComponents: {
              test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
              name: 'ui-components',
              chunks: 'async',
              priority: 18,
              reuseExistingChunk: true,
            },
            // Application forms bundle
            applicationForms: {
              test: /[\\/]src[\\/]components[\\/].*[Ff]orm/,
              name: 'application-forms',
              chunks: 'async',
              priority: 17,
              reuseExistingChunk: true,
            },
            // Analytics and performance bundle
            analytics: {
              test: /[\\/]src[\\/](lib|components)[\\/].*(analytics|performance)/,
              name: 'analytics',
              chunks: 'async',
              priority: 16,
              reuseExistingChunk: true,
            },
            // Common utilities bundle
            common: {
              test: /[\\/]src[\\/]lib[\\/]/,
              name: 'common',
              chunks: 'async',
              priority: 15,
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
        },
      };

      // Add performance optimizations
      config.resolve.alias = {
        ...config.resolve.alias,
        // Optimize React imports
        'react': 'react',
        'react-dom': 'react-dom',
      };

      // Bundle analyzer (enable with ANALYZE=true)
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: '../bundle-analyzer-report.html',
          })
        );
      }
    }

    // Server-side optimizations
    if (isServer) {
      // Optimize server bundle size
      config.externals = config.externals || [];
      config.externals.push({
        'utf8-validate': 'commonjs utf8-validate',
        'bufferutil': 'commonjs bufferutil',
      });
    }

    return config;
  },

  // Allow builds to proceed even with ESLint errors but check TypeScript
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false,
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Enhanced security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com",
              "frame-src 'self' https://www.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; '),
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig
