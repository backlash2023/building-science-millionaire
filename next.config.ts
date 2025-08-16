import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for production deployment
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Image optimization
  images: {
    domains: ['localhost', 'yourdomain.com'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  compress: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
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
        ],
      },
    ];
  },
  
  // Redirects (if needed)
  async redirects() {
    return [];
  },
  
  // Environment variables available to the browser
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
};

export default nextConfig;