const path = require('path');
const { withSentryConfig } = require('@sentry/nextjs');

// Bundle analyzer için
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Determine strictness based on environment
  // In CI/Vercel builds we enforce lint and type-check errors to fail the build
  eslint: {
    ignoreDuringBuilds: !(process.env.CI === 'true' || process.env.VERCEL === '1'),
  },
  typescript: {
    ignoreBuildErrors: !(process.env.CI === 'true' || process.env.VERCEL === '1'),
  },
  // Vercel optimizations
  webpack: (config) => {
    // Path aliases için webpack alias ekleme
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/models': path.resolve(__dirname, 'src/models'),
      '@/types': path.resolve(__dirname, 'src/types'),
    };
    
    // Vercel için MongoDB optimizasyonu
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
    ],
    // Security: Limit image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Security: Disable external image optimization for untrusted sources
    dangerouslyAllowSVG: false,
    // Performance: Enable image optimization
    formats: ['image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  experimental: {
    // Keep minimal experiments to avoid chunking issues on Windows builds
    scrollRestoration: true,
    // Enable instrumentation for Sentry
    instrumentationHook: true,
  },
  // Performance: Enable compression
  compress: true,
  // Performance: Optimize bundle
  swcMinify: true,
  // Security headers are applied via middleware for single-source of truth
  // Security: Disable powered by header
  poweredByHeader: false,
  // Security: Disable server-side includes
  trailingSlash: false,
}

// Sentry configuration
const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin
  silent: process.env.NODE_ENV === 'production',
  hideSourceMaps: true,
  widenClientFileUpload: true,
};

module.exports = withSentryConfig(
  withBundleAnalyzer(nextConfig),
  sentryWebpackPluginOptions
);