/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESLint configuration - ignore during build for faster deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript configuration - ignore errors during build for faster deployment
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: false,
    tsconfigPath: './tsconfig.json',
  },
  
  // Image optimization - Fixed deprecated domains config
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
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.blob.core.windows.net',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: false,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    unoptimized: false,
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // Experimental features for better performance
  experimental: {
    scrollRestoration: true,
    // Disable CSS optimization to prevent critters module errors
    optimizeCss: false,
    // Build performance optimization
    esmExternals: 'loose',
  },
  
  // Build optimization for Vercel
  swcMinify: true,
  
  // Memory optimization
  webpack: (config, { dev, isServer }) => {
    // Memory optimization for production builds
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
              priority: 0,
            },
          },
        },
      };
    }
    
    return config;
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate'
          }
        ]
      }
    ]
  },

  // Redirect rules for better SEO
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: false,
      }
    ]
  }
}

module.exports = nextConfig 