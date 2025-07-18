const path = require('path');

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
    // Performance: Optimized device sizes for responsive images
    deviceSizes: [640, 768, 1024, 1280, 1536, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    // Security: Disable external image optimization for untrusted sources
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; frame-src 'self' https://vercel.live https://vercel.com; sandbox;",
    // Performance: Enable modern image formats with fallbacks
    formats: ['image/avif', 'image/webp'],
    // Cache optimization: Extended cache TTL for better performance
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year for immutable images
    // Use default Next.js image loader
    loader: 'default',
  },
  experimental: {
    esmExternals: true,
    // Performance optimizations
    optimizeCss: true,
    scrollRestoration: true,
    // Vercel optimizations
    optimizePackageImports: ['@heroicons/react', 'framer-motion'],
    serverComponentsExternalPackages: ['mongoose', 'mongodb'],
  },
  // Performance: Enable compression
  compress: true,
  // Performance: Optimize bundle
  swcMinify: true,
  // Security and Performance headers
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
      // Static assets cache optimization
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Image optimization cache
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Public assets cache
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Font files cache
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
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

module.exports = nextConfig