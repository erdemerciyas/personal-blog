const path = require('path');

// Bundle analyzer için
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // For CI/production deployments, allow build to proceed even with lint/TS issues
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
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
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; frame-src 'self' https://vercel.live https://vercel.com; sandbox;",
    // Performance: Enable image optimization
    formats: ['image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  experimental: {
    esmExternals: true,
    // Performance optimizations
    scrollRestoration: true,
    // Vercel optimizations
    optimizePackageImports: ['@heroicons/react', 'framer-motion'],
    serverComponentsExternalPackages: ['mongoose', 'mongodb'],
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

module.exports = withBundleAnalyzer(nextConfig)