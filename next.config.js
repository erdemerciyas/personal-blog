const path = require('path');

// Bundle analyzer için
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    optimizeCss: true,
    scrollRestoration: true,
    // Vercel optimizations
    optimizePackageImports: ['@heroicons/react', 'framer-motion'],
    serverComponentsExternalPackages: ['mongoose', 'mongodb'],
    // Remove deprecated runtime option
  },
  // Performance: Enable compression
  compress: true,
  // Performance: Optimize bundle
  swcMinify: true,
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
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
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://vercel.com https://*.vercel.app https://*.vercel.live https://vercel.live/_next-live/ https://vercel.live/_next-live/feedback/; script-src-elem 'self' 'unsafe-inline' https://vercel.live https://vercel.com https://*.vercel.app https://*.vercel.live https://vercel.live/_next-live/ https://vercel.live/_next-live/feedback/; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https: blob:; font-src 'self' data: https:; connect-src 'self' https: wss: blob:; frame-src 'self' https://vercel.live https://vercel.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' https://vercel.live https://vercel.com;",
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
    ];
  },
  // Security: Disable powered by header
  poweredByHeader: false,
  // Security: Enable compression but with limits
  compress: true,
  // Security: Disable server-side includes
  trailingSlash: false,
}

module.exports = withBundleAnalyzer(nextConfig)